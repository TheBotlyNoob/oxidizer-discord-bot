use std::{
  env,
  error::Error,
  fs,
  time::{SystemTime, UNIX_EPOCH},
};

pub fn init() -> Result<(), Box<dyn Error + Send + Sync>> {
  let dir =
    env::var("CARGO_MANIFEST_DIR").unwrap_or(env::current_dir()?.to_string_lossy().to_string());

  fs::create_dir_all(format!("{}/logs", dir,))?;

  simplelog::CombinedLogger::init(vec![
    simplelog::TermLogger::new(
      simplelog::LevelFilter::Debug,
      simplelog::Config::default(),
      simplelog::TerminalMode::Mixed,
      simplelog::ColorChoice::Auto,
    ),
    simplelog::WriteLogger::new(
      simplelog::LevelFilter::Debug,
      simplelog::Config::default(),
      fs::File::create(format!(
        "{}/logs/{}.log",
        dir,
        SystemTime::now().duration_since(UNIX_EPOCH)?.as_millis()
      ))
      .unwrap(),
    ),
  ])
  .expect("Failed to start simplelog");

  Ok(())
}
