use crate::command_prelude::*;

#[poise::command(slash_command)]
pub(crate) async fn error(
  _ctx: Context<'_>,
  #[description = "The error to emit"]
  #[autocomplete = "autocomplete"]
  _error: String,
) -> Result<()> {
  // let error = match error.as_str() {
  //   "InvalidEmoji" => Error::InvalidEmoji("<:invalid:1234>".to_owned()),
  //   "None" => Error::None("some none option".to_owned()),
  //   _ => unreachable!(),
  // };

  // Err(Box::new(error))
  Ok(())
}

async fn autocomplete(
  _ctx: Context<'_>,
  _partial: String,
) -> impl Iterator<Item = poise::AutocompleteChoice<String>> {
  ["InvalidEmoji", "None"].into_iter().map(|err| {
    let err = err.to_owned();

    poise::AutocompleteChoice {
      name: err.clone(),
      value: err,
    }
  })
}
