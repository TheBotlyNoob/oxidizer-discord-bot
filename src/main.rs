use once_cell::sync::Lazy;
use std::{env, future::Future, pin::Pin};
use tracing_unwrap::ResultExt;

use serenity::{
  async_trait,
  builder::CreateApplicationCommands,
  model::{
    gateway::Ready,
    id::GuildId,
    interactions::{
      application_command::{ApplicationCommand, ApplicationCommandInteraction},
      Interaction,
    },
  },
  prelude::*,
};

pub mod commands;

use tracing::{error, info};

pub static USE_GUILD_COMMANDS: Lazy<bool> =
  Lazy::new(|| env::var("TESTING").is_ok() || cfg!(debug_assertions));
pub static DISCORD_TOKEN: Lazy<String> = Lazy::new(|| {
  env::var("DISCORD_TOKEN").expect_or_log("Expected `DISCORD_TOKEN` in the environment.")
});
pub static GUILD_ID: Lazy<GuildId> = Lazy::new(|| {
  GuildId::from(
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

struct Handler;

#[async_trait]
impl EventHandler for Handler {
  async fn interaction_create(&self, ctx: Context, interaction: Interaction) {
    if let Interaction::ApplicationCommand(input) = interaction {
      if let Some(handler) = commands::COMMANDS.iter().find_map(|command| {
        if command.0 == input.data.name.as_str() {
          Some(command.2)
        } else {
          None
        }
      }) {
        (handler)(ctx, input, &()).await;
      }
    }
  }

  async fn ready(&self, ctx: Context, ready: Ready) {
    info!("{} is connected!", ready.user.name);

    let create_commands: fn(&mut CreateApplicationCommands) -> &mut CreateApplicationCommands =
      |commands| {
        for command in commands::COMMANDS {
          (command.1)(commands);
        }

        commands
      };

    if *USE_GUILD_COMMANDS {
      GUILD_ID
        .set_application_commands(&ctx.http, create_commands)
        .await
        .expect_or_log("Error setting guild commands.");
    } else {
      ApplicationCommand::set_global_application_commands(&ctx.http, create_commands)
        .await
        .expect_or_log("Error setting global commands.");
    }
  }
}

#[tokio::main]
async fn main() {
  dotenv::dotenv().ok();

  tracing_subscriber::fmt().without_time().pretty().init();

  // Build our client.
  let mut client = Client::builder(&*DISCORD_TOKEN)
    .event_handler(Handler)
    .application_id(*APPLICATION_ID)
    .await
    .expect_or_log("Error creating client");

  if *USE_GUILD_COMMANDS {
    for command_id in client
      .cache_and_http
      .http
      .get_guild_application_commands(*GUILD_ID.as_u64())
      .await
      .expect_or_log("Error getting application commands")
    {
      client
        .cache_and_http
        .http
        .delete_guild_application_command(*GUILD_ID.as_u64(), *command_id.id.as_u64())
        .await
        .expect_or_log("Error deleting global application command");
    }

    for command_id in client
      .cache_and_http
      .http
      .get_global_application_commands()
      .await
      .expect_or_log("Error getting application commands")
    {
      client
        .cache_and_http
        .http
        .delete_global_application_command(*command_id.id.as_u64())
        .await
        .expect_or_log("Error deleting global application command");
    }
  }

  // Finally, start a single shard, and start listening to events.
  //
  // Shards will automatically attempt to reconnect, and will perform
  // exponential backoff until it reconnects.
  if let Err(why) = client.start().await {
    error!("Client error: {:?}", why);
  }
}

pub type AddCommandHandler = fn(&mut CreateApplicationCommands) -> &mut CreateApplicationCommands;
pub type CommandHandler =
  for<'a> fn(Context, ApplicationCommandInteraction, &'a ()) -> DynFuture<'a, ()>;

pub type DynFuture<'a, T> = Pin<Box<dyn Future<Output = T> + 'a + Send>>;

pub type Command = (&'static str, AddCommandHandler, CommandHandler);
