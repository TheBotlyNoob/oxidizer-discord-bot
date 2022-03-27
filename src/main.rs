#![feature(iter_intersperse)]

use once_cell::sync::Lazy;
use poise::futures_util::future::join_all;
use poise::serenity_prelude::GuildId;
use serde::{Deserialize, Serialize};
use std::{
    collections::BTreeMap,
    env,
    error::Error as StdError,
    fmt::{Debug, Display, Formatter, Result as FmtResult},
};
use tokio::sync::Mutex;
use tracing_unwrap::{OptionExt, ResultExt};

pub(crate) use poise::serenity_prelude as serenity;

pub(crate) mod commands;

pub(crate) static TESTING: Lazy<bool> =
    Lazy::new(|| env::var("TESTING").is_ok() || cfg!(debug_assertions));

pub(crate) static TOKEN: Lazy<String> = Lazy::new(|| {
    env::var("DISCORD_TOKEN").expect_or_log("Expected `DISCORD_TOKEN` in the environment.")
});

pub(crate) static GUILD_ID: Lazy<serenity::GuildId> = Lazy::new(|| {
    serenity::GuildId::from(
        env::var("GUILD_ID")
            .expect_or_log("Expected `GUILD_ID` in the environment.")
            .parse::<u64>()
            .expect_or_log("Expected `GUILD_ID` to be a number."),
    )
});

#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();

    tracing_subscriber::fmt().without_time().pretty().init();

    poise::Framework::build()
        .token(&*TOKEN)
        .user_data_setup(move |ctx, _ready, _framework| {
            Box::pin(async move {
                let application_commands =
                    poise::builtins::create_application_commands(&commands::COMMANDS());

                if *TESTING {
                    for command_id in ctx
                        .http
                        .get_guild_application_commands(*GUILD_ID.as_u64())
                        .await
                        .expect_or_log("Error getting application commands")
                    {
                        ctx.http
                            .delete_guild_application_command(
                                *GUILD_ID.as_u64(),
                                *command_id.id.as_u64(),
                            )
                            .await
                            .expect_or_log("Error deleting global application command");
                    }

                    for command_id in ctx
                        .http
                        .get_global_application_commands()
                        .await
                        .expect_or_log("Error getting application commands")
                    {
                        ctx.http
                            .delete_global_application_command(*command_id.id.as_u64())
                            .await
                            .expect_or_log("Error deleting global application command");
                    }

                    GUILD_ID
                        .set_application_commands(&ctx.http, |b| {
                            *b = application_commands;
                            b
                        })
                        .await?;
                } else {
                    serenity::ApplicationCommand::set_global_application_commands(&ctx.http, |b| {
                        *b = application_commands;
                        b
                    })
                    .await?;
                }

                Ok(Data::new())
            })
        })
        .options(poise::FrameworkOptions {
            commands: commands::COMMANDS(),
            pre_command: |ctx| {
                Box::pin(async move {
                    let mut guild_storage = ctx.data().guild_storage.lock().await;

                    if let Some(guild_storage) =
                        guild_storage.get_mut(&ctx.guild_id().unwrap_or_log())
                    {
                        guild_storage
                            .get_latest_from_channel()
                            .await
                            .unwrap_or_log();
                    } else {
                        guild_storage.insert(
                            ctx.guild_id().unwrap_or_log(),
                            serenity_guild_storage::Storage::new(
                                ctx.guild().unwrap(),
                                Box::new(unsafe { to_owned(ctx.discord()) }),
                            )
                            .await
                            .unwrap_or_log(),
                        );
                    }
                })
            },
            on_error: |err| {
                Box::pin(async move {
                    use poise::FrameworkError::*;
                    match err {
                        Listener { event, error } => {
                            tracing::error!(?error, "on {:#?}", event);
                        }
                        Command { error, ctx } => {
                            tracing::error!(?error, "error on a command");

                            let owners =
                                join_all(ctx.framework().options().owners.iter().map(|o| async {
                                    o.to_user(cache_http(&ctx)).await.unwrap_or_log().tag()
                                }))
                                .await
                                .join(", ");

                            ctx.send(|m| {
                                m.embed(|e| {
                                    e.title("Error")
                                        .description(format!("```rust\n{:#?}\n```", error))
                                        .footer(|f| {
                                            f.text(format!("Please DM my owners at: {}", owners))
                                        })
                                })
                                .ephemeral(true)
                            })
                            .await
                            .unwrap_or_log();
                        }
                        _ => tracing::error!(?err),
                    }
                })
            },
            ..Default::default()
        })
        .run()
        .await
        .unwrap_or_log();
}

pub(crate) fn cache_http<'a>(ctx: &Context<'a>) -> impl serenity::CacheHttp + 'a {
    (&ctx.discord().cache, &*ctx.discord().http)
}

pub(crate) unsafe fn to_owned<T>(x: &T) -> T {
    std::ptr::read(x as *const _)
}

#[derive(Debug)]
pub(crate) enum ErrorKind {
    InvalidEmoji(String),
    GuildWasNone,
}
impl Display for ErrorKind {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InvalidEmoji(s) => write!(f, "An invalid emoji was given: {s}"),
            Self::GuildWasNone => write!(f, "A Guild was none"),
        }
    }
}
impl StdError for ErrorKind {}

#[derive(Debug)]
pub(crate) struct Error {
    location: Option<String>,
    kind: ErrorKind,
}
impl Display for Error {
    fn fmt(&self, f: &mut Formatter<'_>) -> FmtResult {
        write!(
            f,
            "{}{}",
            self.kind,
            if let Some(ref location) = self.location {
                format!(" at {}", location)
            } else {
                String::new()
            }
        )
    }
}
impl StdError for Error {
    fn source(&self) -> Option<&(dyn StdError + 'static)> {
        Some(&self.kind)
    }
}

#[macro_export]
macro_rules! error {
  ($err:ident) => {
    $crate::Error {
      kind: $crate::ErrorKind::$err,
      location: ::std::option::Option::Some(::std::format!(
        "{}:{}:{}",
        ::std::file!(),
        ::std::line!(),
        ::std::column!()
      )),
    }
  };
  ($err:ident, $($arg:tt)*) => {
    $crate::Error {
      kind: $crate::ErrorKind::$err($($arg)*),
      location: ::std::option::Option::Some(::std::format!(
        "{}:{}:{}",
        ::std::file!(),
        ::std::line!(),
        ::std::column!()
      )),
    }
  };
}

#[derive(Debug, PartialEq, Eq, Ord, PartialOrd, Serialize, Deserialize)]
pub(crate) enum DataValues {
    A(String),
}

pub(crate) struct Data {
    pub(crate) guild_storage:
        Mutex<BTreeMap<GuildId, serenity_guild_storage::Storage<String, DataValues>>>,
}

impl Data {
    pub(crate) fn new() -> Self {
        Self {
            guild_storage: Mutex::new(BTreeMap::new()),
        }
    }
}

impl Default for Data {
    fn default() -> Self {
        Self::new()
    }
}

impl Debug for Data {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Data {{ guild_storage: {{ ... }} }}")
    }
}

pub(crate) type DynError = Box<dyn StdError + Send + Sync>;
pub(crate) type Context<'a> = poise::Context<'a, Data, DynError>;
pub(crate) type Result<T> = std::result::Result<T, DynError>;

#[allow(unused_imports)]
mod command_prelude {
    pub(crate) use crate::{
        cache_http, error, to_owned, Context, DynError, Error, ErrorKind, Result,
    };
    pub(crate) use poise::futures_util::{future::join_all, Stream, StreamExt};
    pub(crate) use poise::serenity_prelude as serenity;
    pub(crate) use std::result::Result as StdResult;
    pub(crate) use tracing_unwrap::{OptionExt, ResultExt};
}
