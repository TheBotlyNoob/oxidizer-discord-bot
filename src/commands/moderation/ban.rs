use crate::command_prelude::*;

#[poise::command(slash_command)]
pub(crate) async fn ban(
    ctx: Context<'_>,
    #[description = "The user to ban"] user: serenity::Member,
    #[description = "How much of the message history to delete in days (default is 1)"]
    #[autocomplete = "autocomplete"]
    delete_messages: Option<u32>,
    #[description = "Why you want to ban the user"] reason: Option<String>,
) -> Result<()> {
    let reason = reason.unwrap_or_else(|| "(No reason given)".to_owned());

    ctx.guild_id()
        .ok_or(error!(GuildWasNone))?
        .ban_with_reason(
            &ctx.discord().http,
            &user,
            delete_messages.unwrap_or(1) as u8,
            &reason,
        )
        .await?;

    user.user
        .direct_message(cache_http(&ctx), |m| {
            m.add_embed(|e| {
                e.color(serenity::Color::RED)
                    .title(format!(
                        "Banned from {} by {}",
                        ctx.guild_id()
                            .unwrap_or_log()
                            .name(&ctx.discord().cache)
                            .unwrap_or_log(),
                        ctx.author().name
                    ))
                    .description(format!("because {}", reason))
            })
        })
        .await?;

    Ok(())
}

async fn autocomplete(
    _ctx: Context<'_>,
    _partial: u32,
) -> impl Iterator<Item = poise::AutocompleteChoice<u32>> {
    [
        ("Don't delete any", 0),
        ("Previous 1 day", 1),
        ("Previous 7 days", 7),
    ]
    .into_iter()
    .map(|(name, value)| poise::AutocompleteChoice {
        name: name.to_owned(),
        value,
    })
}
