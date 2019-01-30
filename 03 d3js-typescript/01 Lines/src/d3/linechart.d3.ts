import { select } from "d3-selection";
import { scaleLinear } from "d3-scale";
import {line} from 'd3-shape';
import { avgTemp } from "./linechart.data";
import { extent } from "d3-array";

const d3 = { select, scaleLinear, extent, line };

const width = 500;
const height = 300;

const card = d3
  .select("#root")
  .append("div")
  .attr("class", "card")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("viewBox", `0 0 ${width} ${height}`);

const svg = card
  .append("svg");

const xScale = d3
  .scaleLinear()
  .domain([0, 11]) // data input, months, 0..11
  .range([0, width]); // pixels

const yScale = d3
  .scaleLinear()
  .domain(d3.extent(avgTemp)) // Temperatures, extent calculates min and max from array
  .range([height, 0]); // pixels, must upside down, Y (0,0) in SVG is upper corner

const lineCreator = d3
  .line<number>()
  .x((d, i) => xScale(i)) // data and array index, x Axis is month
  .y(d => yScale(d));

// let's paint the line, we are going to add a single array, later
// on we will got for a more ellaborated solution
// We pass data
// path, attribute "d" each point in the path
svg
.append("path")
.datum(avgTemp)
  .attr("d", lineCreator)
  .attr("fill", "none")
  .attr("stroke-width", "5px")
  .attr("stroke", "black");
  ;

