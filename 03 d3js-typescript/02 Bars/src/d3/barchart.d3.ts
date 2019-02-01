import { select, selectAll } from "d3-selection";
import 'd3-transition';
import { scaleBand, scaleLinear } from "d3-scale";
import { randomData, startRealTimeDataV1 } from "./barchart.data";

const d3 = {
  select, selectAll, scaleBand, scaleLinear 
};

const width = 500;
const height = 300;
const padding = 50;

// Creamos la tarjeta.
const card = select("#root")
  .append("div")
    .attr("class", "card");

// Creamos el 'lienzo' svg.
const svg = card
  .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `${-padding} ${-padding} ${width + 2*padding} ${height + 2*padding}`);

const scaleYPos = d3.scaleLinear()
  .domain([0, 1])
  .range([height, 0]);

// In Domain (bars) we don't have continuous values, we have to identify the bands, like in ordinal scale
// we could return [0,1,2,3...20], we will do that wiht a map
const scaleXPos = d3.scaleBand<number>()
  .domain(randomData.map((d,i) => i))
  .range([0, width]) // use RangeRound to get pixel perfect layout
  .paddingInner(0.05); // space between bars, wathout! percentages values, range number 0..1

const barGroup = svg
  .append('g');

barGroup
.selectAll('rect')
.data(randomData)
.enter()
.append("rect")
  .attr("x", (d,i) => scaleXPos(i))
  .attr("y", d => scaleYPos(d))
  .attr("width", scaleXPos.bandwidth())
  .attr("height", d => height - scaleYPos(d))
  .attr("fill", "url(#barGradient)");

const dataUpdated = (newData : number[]) => {
  // Update pattern
  barGroup
    .selectAll('rect')
    .data(newData)
      .transition()
      .duration(750)        
      .attr("y", d => scaleYPos(d))
      .attr("height", d => height - scaleYPos(d))
} 

startRealTimeDataV1(dataUpdated);


// OPTIONAL
// Gradient fill for the bars.
const gradient = svg
.append("defs")
  .append("linearGradient")
    .attr("id", "barGradient")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", "0")
    .attr("y1", height)
    .attr("x2", "0")
    .attr("y2", "0");
gradient
.append("stop")
  .attr("offset", "0")
  .attr("stop-color", "#185a9d");
gradient
.append("stop")
  .attr("offset", "80%")
  .attr("stop-color", "#43cea2");
gradient
.append("stop")
  .attr("offset", "100%")
  .attr("stop-color", "#43cea2");

