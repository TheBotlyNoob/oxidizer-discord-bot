use serenity::{
  builder::CreateApplicationCommands, client::Context,
  model::interactions::application_command::ApplicationCommandInteraction,
};
use std::{future::Future, pin::Pin};

pub mod ping;

pub type AddCommandHandler = fn(&mut CreateApplicationCommands) -> &mut CreateApplicationCommands;
pub type CommandHandler =
  for<'a> fn(Context, ApplicationCommandInteraction, &'a ()) -> DynFuture<'a, ()>;

pub type DynFuture<'a, T> = Pin<Box<dyn Future<Output = T> + 'a + Send>>;

pub static COMMANDS: &[(&str, AddCommandHandler, CommandHandler)] = &[ping::COMMAND_DATA];
