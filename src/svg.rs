use resvg::render;
use tiny_skia::Pixmap;
use usvg::{FitTo, Options, Tree};

#[derive(Clone, Debug)]
pub(crate) struct SVG {
  pub(crate) font_size: u8,
  pub(crate) width: u16,
  pub(crate) chars: u8,
  svg: String,
}

impl SVG {
  pub(crate) fn builder(font_size: Option<u8>) -> Self {
    Self {
      font_size: font_size.unwrap_or(16),
      width: 0,
      chars: 0,
      svg: String::new(),
    }
  }

  pub(crate) fn add_emoji<T: AsRef<str>>(mut self, href: T) -> Self {
    self.svg.push_str(&format!(
      "  <image class=\"emoji in-svg\" x=\"{}\" y=\"10\" height=\"32\" width=\"32\" href=\"{}\" />\n",
      self.width,
      href.as_ref()
    ));

    self.width += 32;

    self
  }

  pub(crate) fn add_text<T: AsRef<str>>(mut self, text: T) -> Self {
    self.svg.push_str(&format!(
      "  <text class=\"text in-svg\" x=\"{}\" y=\"31\">{}</text>\n",
      self.width,
      text.as_ref()
    ));

    self.width += (text.as_ref().len() as u8 * self.font_size) as u16;

    self
  }

  pub(crate) fn add_styles<T: AsRef<str>>(mut self, styles: T) -> Self {
    self.svg = format!(
      "
<style>
  {}
</style>

{}
    ",
      styles.as_ref(),
      self.svg
    );

    self
  }

  pub(crate) fn build(self) -> (String, Pixmap) {
    let svg = format!(
      "
<svg viewBox=\"0 0 {} 50\" xmlns=\"http://www.w3.org/2000/svg\">
{}
</svg>
",
      self.width, self.svg
    );

    let mut original_pixmap = Pixmap::new(self.width as u32, 50).unwrap();

    let mut_pixmap = original_pixmap.as_mut();

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
      mut_pixmap,
    );

    (svg, mut_pixmap.to_owned())
  }
}
