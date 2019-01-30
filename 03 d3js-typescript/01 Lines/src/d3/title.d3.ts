import { select } from "d3-selection";

// Lets add a card in our root node.
const card = select("#root")
  .append("div")
    .attr("class", "card");

// This card will contain a title for our visualization.
card
  .append("h1")
    .text("Basic Map with D3.js");

