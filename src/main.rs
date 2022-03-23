use once_cell::sync::Lazy;
use std::{env, error::Error as StdError, fmt::Display};
use tracing_unwrap::ResultExt;

pub use poise::serenity_prelude as serenity;

pub mod commands;

pub struct Data;

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

/// Display your or another user's account creation date
#[poise::command(prefix_command, slash_command, track_edits)]
async fn age(
  ctx: Context<'_>,
  #[description = "Selected user"] user: Option<serenity::User>,
) -> Result<(), Error> {
  let user = user.as_ref().unwrap_or_else(|| ctx.author());
  ctx
    .say(format!(
      "{}'s account was created at {}",
      user.name,
      user.created_at()
    ))
    .await?;

  Ok(())
}

#[tokio::main]
async fn main() {
  dotenv::dotenv().ok();

  tracing_subscriber::fmt().without_time().pretty().init();

  poise::Framework::build()
    .token(&*TOKEN)
    .user_data_setup(move |ctx, _ready, _framework| {
      Box::pin(async move {
        let application_commands =
          poise::builtins::create_application_commands(&commands::get_commands());

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

        Ok(Data)
      })
    })
    .options(poise::FrameworkOptions {
      commands: commands::get_commands(),
      ..Default::default()
    })
    .run()
    .await
    .unwrap_or_log();
}
