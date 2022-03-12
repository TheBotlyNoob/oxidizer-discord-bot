use serenity::{
  client::Context,
  model::interactions::{
    application_command::ApplicationCommandInteraction, InteractionResponseType,
  },
};

use tracing::error;

pub static COMMAND_DATA: (&str, super::AddCommandHandler, super::CommandHandler) = (
  "ping",
  |commands| {
    commands
      .create_application_command(|command| command.name("ping").description("A ping command"))
  },
  handle_command,
);

fn handle_command(
  ctx: Context,
  command: ApplicationCommandInteraction,
  _: &(),
) -> super::DynFuture<'_, ()> {
  Box::pin(async move {
    if let Err(why) = command
      .create_interaction_response(&ctx.http, |response| {
        response
          .kind(InteractionResponseType::ChannelMessageWithSource)
          .interaction_response_data(|message| {
            message
              .create_embed(|embed| embed.image("https://c.tenor.com/sm4dtXGkfnoAAAAC/catpong.gif"))
          })
      })
      .await
    {
      error!("Cannot respond to slash command: {}", why);
    }
  })
}
