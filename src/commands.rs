pub(crate) mod general;
pub(crate) mod moderation;
pub(crate) mod owner;

pub(crate) static COMMANDS: fn() -> Vec<poise::Command<crate::Data, crate::Error>> = || {
  vec![
    general::ping(),
    moderation::ban(),
    general::add_reaction_role(),
    owner::error(),
  ]
};
