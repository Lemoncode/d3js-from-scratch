import { select } from "d3-selection";
import { scaleLinear, scaleTime, scaleOrdinal } from "d3-scale";
import { schemeAccent, schemeCategory10 } from "d3-scale-chromatic";
import { line } from "d3-shape";
import { malagaStats, TempStat } from "./linechart.data";
import { axisBottom, axisLeft } from "d3-axis";
import { extent } from "d3-array";
import { accessSync } from "fs";

const d3 = {
  select,
  scaleLinear,
  scaleTime,
  extent,
  line,
  axisBottom,
  axisLeft,
  scaleOrdinal,
  schemeAccent,
  schemeCategory10,
};

const width = 500;
const height = 300;
const padding = 50;

const card = d3
  .select("#root")
  .append("div")
  .attr("class", "card");

const svg = card
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("viewBox", `${-padding} ${-padding} ${width + 2 * padding} ${height + 2 * padding}`);

const xScale = d3
  .scaleTime()
  .domain([new Date(2018, 0), new Date(2018, 11)]) // Range Jan to Dec 2019
  .range([0, width]); // pixels

const yScale = d3
  .scaleLinear()
  .domain(d3.extent(malagaStats.reduce((acc, s) => acc.concat(s.values), [])))
  .range([height, 0]);

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
                        .domain(['min', '', 'avg', 'max']);
;

const lineCreator = d3
  .line<number>()
  .x((d, i) => xScale(new Date(2018, i))) // data and array index, x Axis is month
  .y(d => yScale(d));

// let's paint the line, we are going to add a single array, later
// on we will got for a more ellaborated solution
// We pass data
// path, attribute "d" each point in the path
svg
  .selectAll("path")
  .data(malagaStats, (d: TempStat) => d.id)
  .enter()
  .append("path")
  .attr("d", d => lineCreator(d.values))
  .attr("fill", "none")
  .attr("stroke-width", "3px")
  .attr("stroke", d => colorScale(d.id));

const axisGroup = svg.append("g");

// Y Axis: call axisLeft helper and pass the scale
axisGroup.append("g").call(d3.axisLeft(yScale));

// X axis:
axisGroup
  .append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(d3.axisBottom(xScale));
