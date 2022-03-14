use serenity::{
  client::Context,
  model::interactions::{
    application_command::{
      ApplicationCommandInteraction, ApplicationCommandInteractionDataOptionValue,
      ApplicationCommandOptionType,
    },
    InteractionApplicationCommandCallbackDataFlags, InteractionResponseType,
  },
};

use tracing::error;
use tracing_unwrap::{OptionExt, ResultExt};

pub static COMMAND: crate::Command = (
  "ping",
  |commands| {
    commands.create_application_command(|command| {
      command
        .name("ban")
        .description("Ban a user with a reason")
        .create_option(|option| {
          option
            .kind(ApplicationCommandOptionType::User)
            .required(true)
            .name("member")
            .description("The member to ban")
        })
        .create_option(|option| {
          option
            .kind(ApplicationCommandOptionType::String)
            .required(false)
            .name("reason")
            .description("The reason for the ban")
        })
    })
  },
  handle_command,
);

fn handle_command(
  ctx: Context,
  command: ApplicationCommandInteraction,
  _: &(),
) -> crate::DynFuture<'_, ()> {
  Box::pin(async move {
    let user = command
      .data
      .options
      .get(0)
      .expect_or_log("Expected user object")
      .resolved
      .as_ref()
      .expect_or_log("Expected user object");

    let reason = command
      .data
      .options
      .get(1)
      .and_then(|reason| reason.resolved.as_ref())
      .and_then(|reason| {
        if let ApplicationCommandInteractionDataOptionValue::String(reason) = reason {
          Some(reason.as_str())
        } else {
          None
        }
      });

    if let ApplicationCommandInteractionDataOptionValue::User(user, _member) = user {
      ctx
        .cache
        .guild(
          *command
            .guild_id
            .expect_or_log("Expected a `guild_id`")
            .as_u64(),
        )
        .await
        .expect("Expected a guild")
        .ban_with_reason(
          (&ctx.cache, &*ctx.http),
          user,
          0,
          if let Some(reason) = reason {
            reason
          } else {
            ""
          },
        )
        .await
        .expect_or_log("Expected to be able to ban the user");

      // DM the banned user with the reason, and the moderator who banned them
      user.direct_message((&ctx.cache, &*ctx.http), || ())

      // If the user is invalid, respond with an error
    } else if let Err(why) = command
      .create_interaction_response((&ctx.cache, &*ctx.http), |response| {
        response
          .kind(InteractionResponseType::ChannelMessageWithSource)
          .interaction_response_data(|message| {
            message
              .flags(InteractionApplicationCommandCallbackDataFlags::EPHEMERAL)
              .content("Invalid user")
          })
      })
      .await
    {
      error!("Cannot respond to slash command: {}", why);

      return;
    } else {
      return;
    }

    if let Err(why) = command
      .create_interaction_response((&ctx.cache, &*ctx.http), |response| {
        response
          .kind(InteractionResponseType::Pong)
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
