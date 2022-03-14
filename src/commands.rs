pub mod general;
pub mod moderation;

pub static COMMANDS: &[crate::Command] = &[general::ping::COMMAND, moderation::ban::COMMAND];
