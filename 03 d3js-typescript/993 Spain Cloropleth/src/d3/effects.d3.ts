export const defineGlowEffect = (defsSelection) => {
  const id = "glow"
  const stdDeviation = 0.55;
  const colorMatrix = "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0";
  
  const filter = defsSelection.append("filter")
    .attr("id", id)
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%")
  filter.append("feColorMatrix")
    .attr("type", "matrix")
    .attr("values", colorMatrix);
  filter.append("feGaussianBlur")
      // .attr("in", "SourceGraphics")
    .attr("stdDeviation", stdDeviation)
    .attr("result", "coloredBlur");
  const feMerge = filter.append("feMerge")
    feMerge.append("feMergeNode")
      .attr("in", "coloredBlur");
    feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");

  return `url(#${id})`;
}


