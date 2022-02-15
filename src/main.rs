use dotenv::dotenv;
use std::{env, error::Error};

use serenity::{
  async_trait,
  model::{
    gateway::Ready,
    id::GuildId,
    interactions::{
      application_command::{
        ApplicationCommand, ApplicationCommandInteractionDataOptionValue,
        ApplicationCommandOptionType,
      },
      Interaction, InteractionResponseType,
    },
  },
  prelude::*,
};

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error + Send + Sync>> {
  dotenv()?;

  tracing_subscriber::fmt::fmt()
    .pretty()
    .without_time()
    .init();

  let token = env::var("DISCORD_TOKEN").expect(
    "Expected the bot's token to be in the `.env` or in the `DISCORD_TOKEN` environment variable",
  );

  // The Application Id is usually the Bot User Id.
  let application_id = env::var("APPLICATION_ID")
    .expect("expected the bot's Application ID to be in the `.env` or in the `APPLICATION_ID` environment variable")
    .parse::<u64>()
    .expect("application id is not a valid id");

  // Build our client.
  let mut client = Client::builder(token)
    .event_handler(Handler)
    .application_id(application_id)
    .await
    .expect("Error creating client");

  if let Err(why) = client.start().await {
    tracing::error!("Client error: {:?}", why);
  }

  Ok(())
}

struct Handler;

#[async_trait]
impl EventHandler for Handler {
  async fn interaction_create(&self, ctx: Context, interaction: Interaction) {
    if let Interaction::ApplicationCommand(command) = interaction {
      let content = match command.data.name.as_str() {
        "ping" => "Hey, I'm alive!".to_string(),
        "id" => {
          let options = command
            .data
            .options
            .get(0)
            .expect("Expected user option")
            .resolved
            .as_ref()
            .expect("Expected user object");

          if let ApplicationCommandInteractionDataOptionValue::User(user, _member) = options {
            format!("{}'s id is {}", user.tag(), user.id)
          } else {
            "Please provide a valid user".to_string()
          }
        }
        _ => "not implemented :(".to_string(),
      };

      if let Err(why) = command
        .create_interaction_response(&ctx.http, |response| {
          response
            .kind(InteractionResponseType::ChannelMessageWithSource)
            .interaction_response_data(|message| message.content(content))
        })
        .await
      {
        tracing::error!("Cannot respond to slash command: {why}");
      }
    }
  }

  async fn ready(&self, ctx: Context, ready: Ready) {
    tracing::info!("{} is connected!", ready.user.name);

    let guild_id = GuildId(
      env::var("GUILD_ID")
        .expect("Expected GUILD_ID in environment")
        .parse()
        .expect("GUILD_ID must be an integer"),
    );

    let commands = GuildId::set_application_commands(&guild_id, &ctx.http, |commands| {
      commands
        .create_application_command(|command| command.name("ping").description("A ping command"))
        .create_application_command(|command| {
          command
            .name("id")
            .description("Get a user id")
            .create_option(|option| {
              option
                .name("id")
                .description("The user to lookup")
                .kind(ApplicationCommandOptionType::User)
                .required(true)
            })
        })
        .create_application_command(|command| {
          command
            .name("welcome")
            .description("Welcome a user")
            .create_option(|option| {
              option
                .name("user")
                .description("The user to welcome")
                .kind(ApplicationCommandOptionType::User)
                .required(true)
            })
            .create_option(|option| {
              option
                .name("message")
                .description("The message to send")
                .kind(ApplicationCommandOptionType::String)
                .required(true)
                .add_string_choice(
                  "Welcome to our cool server! Ask me if you need help",
                  "pizza",
                )
                .add_string_choice("Hey, do you want a coffee?", "coffee")
                .add_string_choice(
                  "Welcome to the club, you're now a good person. Well, I hope.",
                  "club",
                )
                .add_string_choice(
                  "I hope that you brought a controller to play together!",
                  "game",
                )
            })
        })
        .create_application_command(|command| {
          command
            .name("numberinput")
            .description("Test command for number input")
            .create_option(|option| {
              option
                .name("int")
                .description("An integer from 5 to 10")
                .kind(ApplicationCommandOptionType::Integer)
                .required(true)
            })
            .create_option(|option| {
              option
                .name("number")
                .description("A float from -3.3 to 234.5")
                .kind(ApplicationCommandOptionType::Number)
                .required(true)
            })
        })
    })
    .await;

    tracing::info!(
      "I now have the following guild slash commands: {:#?}",
      commands
    );

    let guild_command =
      ApplicationCommand::create_global_application_command(&ctx.http, |command| {
        command
          .name("wonderful_command")
          .description("An amazing command")
      })
      .await;

    tracing::info!(
      "I created the following global slash command: {:#?}",
      guild_command
    );
  }
}
