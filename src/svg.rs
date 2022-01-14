use resvg::render;
use tiny_skia::Pixmap;
use usvg::{FitTo, Options, Tree};

pub const DEFAULT_FONT_SIZE: u8 = 8;

#[derive(Clone, Debug)]
pub struct SVG {
  pub font_size: u8,
  pub width: u16,
  pub chars: u8,
  pub data: String,
}

impl SVG {
  pub fn builder(font_size: Option<u8>) -> Self {
    Self {
      font_size: font_size.unwrap_or(DEFAULT_FONT_SIZE),
      width: 0,
      chars: 0,
      data: String::new(),
    }
  }

  pub fn add_emoji<T: AsRef<str>>(mut self, href: T) -> Self {
    self.data.push_str(&format!(
      "<image class=\"emoji in-svg\" x=\"{}\" y=\"10\" height=\"32\" width=\"32\" href=\"{}\" />",
      self.width,
      href.as_ref()
    ));

    self.width += 32;

    self
  }

  pub fn add_text<T: AsRef<str>>(mut self, text: T) -> Self {
    self.data.push_str(&format!(
      "<text class=\"text in-svg\" x=\"{}\" y=\"8\">{}</text>",
      self.width,
      text.as_ref()
    ));

    self.width += (text.as_ref().len() as u8 * (self.font_size / 2)) as u16;

    self
  }

  pub fn add_styles<T: AsRef<str>>(mut self, styles: T) -> Self {
    self.data = format!("<style>{}</style> {}", styles.as_ref(), self.data);

    self
  }

  pub fn build(self) -> Built {
    let svg = format!(
      "
<svg viewBox=\"0 0 {} 20\" xmlns=\"http://www.w3.org/2000/svg\">
  <style>
    .in-svg {{
      font-family: \"Trebuchet MS\" !important;
      font-size: {}px !important;
    }}
  </style>
  
{}
</svg>
",
      100 + self.width,
      self.font_size,
      self.data
    );

    let mut pixmap = Pixmap::new(self.width as u32, 50).unwrap();

    render(
      &Tree::from_str(
        &svg,
        &Options {
          font_family: "Trebuchet MS".to_string(),
          font_size: self.font_size as f64,
          ..Options::default()
        }
        .to_ref(),
      )
      .expect("Failed to create a tree"),
      FitTo::Original,
      pixmap.as_mut(),
    );

    Built { svg, pixmap }
  }
}

pub struct Built {
  pub svg: String,
  pub pixmap: Pixmap,
}
