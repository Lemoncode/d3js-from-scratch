import { select } from "d3-selection";
import { geoEquirectangular, geoPath } from "d3-geo";
import { json } from "d3-fetch";
import { FeatureCollection } from 'geojson';

// (*)Lets define a width and height for the SVG user space
// coordinate system (viewBox), also a padding to avoid
// overflows.
const width = 960;  
const height = 460;
const padding = 20;

// (*) Lets add a card for our map.
const card = select("#root")
  .append("div")
    .attr("class", "card");

// (*) Now the SVG canvas with the viewBox.
const svg = card
  .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `${-padding} ${-padding} ${width + 2*padding} ${height + 2*padding}`);

// (*) Lets create a projection, which basically is a math
// function to develop a 3D surface into a flat surface.
// In practice, it transforms geographic coordinates into
// projected coordinates. There are plenty of different 
// projections, and depending on our target application,
// we will select one or another. A good general purpose
// projection is spherical mercator (used extensively by
// web map providers such as Google Maps) also known as 
// webMercator or pseudoMercator. Another one extended
// is equirectangular AKA Platee-Carree.
const plateeProjection = geoEquirectangular()
  .translate([width/2, height/2]);

// (*) A path in SVG is described in a very specific manner.
// Lets use a utility provided by d3 to create the proper
// SVG coordinates for a path from user space coordinates.
const pathCreator = geoPath()
  .projection(plateeProjection);

// (*) Finally, lets paint our path in the svg by loading
// locally the world geojson.
json<FeatureCollection>(require("../data/world.geojson")).then((worldData => 
  svg.append("path")
    .attr("d", pathCreator(worldData))
));