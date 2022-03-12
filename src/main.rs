use once_cell::sync::Lazy;
use std::env;

use serenity::{
  async_trait,
  builder::CreateApplicationCommands,
  model::{
    gateway::Ready,
    id::GuildId,
    interactions::{application_command::ApplicationCommand, Interaction},
  },
  prelude::*,
};

pub mod commands;

pub const USE_GUILD_COMMANDS: bool = cfg!(debug_assertions);
pub static DISCORD_TOKEN: Lazy<String> =
  Lazy::new(|| env::var("DISCORD_TOKEN").expect("Expected `DISCORD_TOKEN` in the environment."));
pub static GUILD_ID: Lazy<GuildId> = Lazy::new(|| {
  GuildId::from(
    env::var("GUILD_ID")
      .expect("Expected `GUILD_ID` in the environment.")
      .parse::<u64>()
      .expect("Expected `GUILD_ID` to be a number."),
  )
});
pub static APPLICATION_ID: Lazy<u64> = Lazy::new(|| {
  env::var("APPLICATION_ID")
    .expect("Expected `APPLICATION_ID` in the environment.")
    .parse()
    .expect("Expected `APPLICATION_ID` to be a number.")
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
    println!("{} is connected!", ready.user.name);

    let create_commands: fn(&mut CreateApplicationCommands) -> &mut CreateApplicationCommands =
      |commands| {
        for command in commands::COMMANDS {
          (command.1)(commands);
        }

        commands
      };

    let commands = if USE_GUILD_COMMANDS {
      GUILD_ID
        .set_application_commands(&ctx.http, create_commands)
        .await
    } else {
      ApplicationCommand::set_global_application_commands(&ctx.http, create_commands).await
    };

    println!("I now have the following slash commands: {:#?}", commands);

    // let guild_command =
    //   ApplicationCommand::create_global_application_command(&ctx.http, |command| {
    //     command
    //       .name("wonderful_command")
    //       .description("An amazing command")
    //   })
    //   .await;

    // println!(
    //   "I created the following global slash command: {:#?}",
    //   guild_command
    // );
  }
}

#[tokio::main]
async fn main() {
  dotenv::dotenv().ok();

  // Build our client.
  let mut client = Client::builder(&*DISCORD_TOKEN)
    .event_handler(Handler)
    .application_id(*APPLICATION_ID)
    .await
    .expect("Error creating client");

  #[cfg(debug_assertions)]
  {
    for command_id in client
      .cache_and_http
      .http
      .get_guild_application_commands(*GUILD_ID.as_u64())
      .await
      .expect("Error getting application commands")
    {
      client
        .cache_and_http
        .http
        .delete_guild_application_command(*GUILD_ID.as_u64(), *command_id.id.as_u64())
        .await
        .expect("Error deleting global application command");
    }

    for command_id in client
      .cache_and_http
      .http
      .get_global_application_commands()
      .await
      .expect("Error getting application commands")
    {
      client
        .cache_and_http
        .http
        .delete_global_application_command(*command_id.id.as_u64())
        .await
        .expect("Error deleting global application command");
    }
  }

  // Finally, start a single shard, and start listening to events.
  //
  // Shards will automatically attempt to reconnect, and will perform
  // exponential backoff until it reconnects.
  if let Err(why) = client.start().await {
    println!("Client error: {:?}", why);
  }
}
