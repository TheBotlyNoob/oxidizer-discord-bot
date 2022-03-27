use crate::command_prelude::*;
use once_cell::sync::Lazy;
use poise::futures_util::StreamExt;
use serenity::ReactionType;

static REGEX: Lazy<regex::Regex> = Lazy::new(|| regex::Regex::new(r"^<:.*?:(\d*?)>").unwrap());

/// Add a reaction role to a message.
#[poise::command(slash_command, rename = "reaction-roles")]
pub(crate) async fn add_reaction_role(
    ctx: Context<'_>,
    #[description = "The message to add the reaction role to"] message_id: String,
    #[description = "The emoji to react with (can be a unicode emoji or an emoji name)"]
    emoji: String,
    #[description = "The role to add"] role_id: String,
) -> Result<()> {
    let guild = ctx.guild().ok_or(error!(GuildWasNone))?;
    let message_id = message_id.parse::<u64>()?;
    let role_id = role_id.parse::<u64>()?;

    let emoji = match REGEX.captures(&emoji) {
        Some(captures) => {
            let emoji = &guild.emojis[&serenity::EmojiId::from(captures[1].parse::<u64>()?)];

            ReactionType::Custom {
                animated: emoji.animated,
                id: emoji.id,
                name: Some(emoji.name.clone()),
            }
        }
        None if emoji.len() == 4 => ReactionType::Unicode(emoji),
        None => return Err(Box::new(error!(InvalidEmoji, emoji))),
    };

    ctx.channel_id()
        .message(&*ctx.discord().http, serenity::MessageId::from(message_id))
        .await?
        .react(cache_http(&ctx), emoji.clone())
        .await?;

    let role = guild.roles.get(&serenity::RoleId::from(role_id)).unwrap();
    while let Some(reaction_action) = ctx
        .channel_id()
        .await_reactions(&ctx.discord().shard)
        .message_id(message_id)
        .removed(true)
        .build()
        .next()
        .await
    {
        match &*reaction_action {
            serenity::ReactionAction::Added(reaction) if reaction.emoji == emoji => {
                let user = reaction.user(cache_http(&ctx)).await?;

                let mut member = guild.member(&ctx.discord().http, user.id).await?;
                if member.roles.contains(&role.id) {
                    continue;
                }

                member.add_role(&ctx.discord().http, role.id).await?;
            }
            serenity::ReactionAction::Removed(reaction) if reaction.emoji == emoji => {
                let user = reaction.user(cache_http(&ctx)).await?;

                let mut member = guild.member(&ctx.discord().http, user.id).await?;
                if !member.roles.contains(&role.id) {
                    continue;
                }

                member.remove_role(&ctx.discord().http, role.id).await?;
            }
            _ => (),
        }
    }

    Ok(())
}
