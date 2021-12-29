pub mod svg;

use dotenv::dotenv;
use std::error::Error;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error + Send + Sync>> {
    dotenv().ok();

    println!(
        "{}",
        svg::generate(
            format!(
                "Hello {}",
                svg::emoji("https://emoji.gg/assets/emoji/7759-wtfsunglasses.png")
            ),
            None
        )
    );

    Ok(())
}
