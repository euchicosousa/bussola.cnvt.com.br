import Color from "color";

const BASE_COLOR = "#22c55e"; // This should ideally come from constants

export function getTextColor(bgColor: string, opacity = 0) {
  const color =
    bgColor !== BASE_COLOR
      ? Color(bgColor).contrast(Color("white")) > 2
        ? Color("white").fade(opacity)
        : Color(bgColor).darken(0.5).desaturate(0.5).fade(opacity)
      : Color("white").fade(opacity);

  return (opacity ? color : color).hex();
}

export function getBussolaSize(size: string) {
  return {
    xs: "h-4 min-h-4",
    sm: "h-6 min-h-6",
    md: "h-8 min-h-8",
    lg: "h-12 min-h-12",
    xl: "h-16 min-h-16",
  }[size];
}