pub mod general;
pub mod moderation;

pub static COMMANDS: fn() -> Vec<poise::Command<crate::Data, crate::Error>> = || {
  vec![
    general::ping(),
    moderation::ban(),
    general::add_reaction_role(),
  ]
};
