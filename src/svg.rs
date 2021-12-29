pub fn generate(text: String, style: Option<String>) -> String {
    format!(
        "
<svg viewBox=\"0 0 240 50\" xmlns=\"http://www.w3.org/2000/svg\">
  <style>
    @import url(https://cdn.jsdelivr.net/gh/tonsky/FiraCode@4/distr/fira_code.css);

    * {{
        font-family: \"Fira Code\", monospace;
        position: absolute;
    }}

    {}
  </style>

  <text x=\"1\" y=\"31\" >
    {}
  </text>
</svg>
",
        style.unwrap_or(String::new()),
        text
    )
}

pub fn emoji<T: AsRef<str>>(emoji: T) -> String {
    format!(
        "
</text>
  <image href=\"{}\" height=\"32\" width=\"32\" />
<text x=\"1\" y=\"31\" >",
        emoji.as_ref()
    )
}
