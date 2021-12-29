pub mod svg;

use dotenv::dotenv;
use std::error::Error;
use svg::SVG;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error + Send + Sync>> {
  dotenv().ok();

  println!(
    "{}",
    SVG::builder(None)
      .add_text("Hello, Wolrd")
      .add_emoji(
        "https://scitechdaily.com/images/New-Hubble-Image-of-the-Large-Magellanic-Cloud.jpg"
      )
      .build()
      .0
  );

  Ok(())
}
