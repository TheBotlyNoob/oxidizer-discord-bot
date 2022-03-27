use crate::command_prelude::*;

/// Check if the bot is alive
#[poise::command(slash_command)]
pub(crate) async fn ping(ctx: Context<'_>) -> Result<()> {
    let mut storage = ctx.data().guild_storage.lock().await;
    let storage = storage
        .get_mut(&ctx.guild_id().ok_or(error!(GuildWasNone))?)
        .unwrap_or_else(|| unreachable!());

    storage
        .write(
            "123123123123".into(),
            crate::DataValues::A((0..2000).map(|_| "1".to_owned()).collect()),
        )
        .await?;

    ctx.send(|m| {
        m.embed(|e| {
            e.title("Pong!")
                .image("https://c.tenor.com/PJ4-hzHhDyEAAAAC/hi-hey.gif")
                .color(crate::serenity::Colour::from_rgb(80, 200, 120))
        })
    })
    .await?;

    Ok(())
}
