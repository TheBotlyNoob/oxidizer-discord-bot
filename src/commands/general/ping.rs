/// Check if the bot is alive
#[poise::command(slash_command)]
pub async fn ping(ctx: crate::Context<'_>) -> Result<(), crate::Error> {
  ctx
    .send(|m| {
      m.embed(|e| {
        e.title("Pong!")
          .image("https://c.tenor.com/PJ4-hzHhDyEAAAAC/hi-hey.gif")
          .color(crate::serenity::Colour::from_rgb(80, 200, 120))
      })
    })
    .await?;

  Ok(())
}
