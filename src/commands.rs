pub mod general;
pub mod moderation;

pub static COMMANDS: &[fn() -> poise::Command<crate::Data, crate::Error>] = &[general::ping];

pub fn get_commands() -> Vec<poise::Command<crate::Data, crate::Error>> {
  COMMANDS.iter().map(|f| f()).collect()
}
