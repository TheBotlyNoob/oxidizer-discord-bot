use once_cell::sync::Lazy;
use poise::serenity_prelude::GuildId;
use std::{collections::BTreeMap, env, error::Error as StdError, fmt::Display};
use tokio::sync::Mutex;
use tracing_unwrap::{OptionExt, ResultExt};

pub use poise::serenity_prelude as serenity;

pub mod commands;

pub struct Data {
  pub guild_storage: Mutex<BTreeMap<GuildId, serenity_guild_storage::Storage<String>>>,
}

#[derive(Debug)]
pub struct NoneError;
impl<T> From<Option<T>> for NoneError {
  fn from(_: Option<T>) -> Self {
    NoneError
  }
}
impl Display for NoneError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "None")
  }
}
impl StdError for NoneError {}

pub type Error = Box<dyn StdError + Send + Sync>;
pub type Context<'a> = poise::Context<'a, Data, Error>;

pub static TESTING: Lazy<bool> =
  Lazy::new(|| env::var("TESTING").is_ok() || cfg!(debug_assertions));

pub static TOKEN: Lazy<String> = Lazy::new(|| {
  env::var("DISCORD_TOKEN").expect_or_log("Expected `DISCORD_TOKEN` in the environment.")
});

pub static GUILD_ID: Lazy<serenity::GuildId> = Lazy::new(|| {
  serenity::GuildId::from(
    env::var("GUILD_ID")
      .expect_or_log("Expected `GUILD_ID` in the environment.")
      .parse::<u64>()
      .expect_or_log("Expected `GUILD_ID` to be a number."),
  )
});

pub static APPLICATION_ID: Lazy<u64> = Lazy::new(|| {
  env::var("APPLICATION_ID")
    .expect_or_log("Expected `APPLICATION_ID` in the environment.")
    .parse()
    .expect_or_log("Expected `APPLICATION_ID` to be a number.")
});

#[tokio::main]
async fn main() {
  dotenv::dotenv().ok();

  tracing_subscriber::fmt().without_time().pretty().init();

  poise::Framework::build()
    .token(&*TOKEN)
    .user_data_setup(move |ctx, _ready, _framework| {
      Box::pin(async move {
        let application_commands =
          poise::builtins::create_application_commands(&commands::COMMANDS());

        if *TESTING {
          for command_id in ctx
            .http
            .get_guild_application_commands(*GUILD_ID.as_u64())
            .await
            .expect_or_log("Error getting application commands")
          {
            ctx
              .http
              .delete_guild_application_command(*GUILD_ID.as_u64(), *command_id.id.as_u64())
              .await
              .expect_or_log("Error deleting global application command");
          }

          for command_id in ctx
            .http
            .get_global_application_commands()
            .await
            .expect_or_log("Error getting application commands")
          {
            ctx
              .http
              .delete_global_application_command(*command_id.id.as_u64())
              .await
              .expect_or_log("Error deleting global application command");
          }

          GUILD_ID
            .set_application_commands(&ctx.http, |b| {
              *b = application_commands;
              b
            })
            .await?;
        } else {
          serenity::ApplicationCommand::set_global_application_commands(&ctx.http, |b| {
            *b = application_commands;
            b
          })
          .await?;
        }

        Ok(Data {
          guild_storage: Mutex::new(BTreeMap::new()),
        })
      })
    })
    .options(poise::FrameworkOptions {
      commands: commands::COMMANDS(),
      pre_command: |ctx| {
        Box::pin(async move {
          let mut guild_storage = ctx.data().guild_storage.lock().await;

          if let Some(guild_storage) = guild_storage.get_mut(&ctx.guild_id().unwrap_or_log()) {
            guild_storage
              .get_latest_from_channel()
              .await
              .unwrap_or_log();
          } else {
            guild_storage.insert(
              ctx.guild_id().unwrap_or_log(),
              serenity_guild_storage::Storage::new(
                ctx.guild().unwrap(),
                Box::new(to_owned(ctx.discord())),
              )
              .await
              .unwrap_or_log(),
            );
          }
        })
      },
      ..Default::default()
    })
    .run()
    .await
    .unwrap_or_log();
}

pub fn cache_http<'a>(ctx: &Context<'a>) -> impl serenity::CacheHttp + 'a {
  (&ctx.discord().cache, &*ctx.discord().http)
}

fn to_owned<T>(x: &T) -> T {
  unsafe { std::ptr::read(x as *const _) }
}

#[derive(Debug)]
pub struct StringError(String);
impl Display for StringError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{}", self.0)
  }
}
impl StdError for StringError {}
