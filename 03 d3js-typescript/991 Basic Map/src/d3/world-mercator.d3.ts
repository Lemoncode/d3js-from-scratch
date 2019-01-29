import { select } from "d3-selection";
import { geoMercator, geoPath, GeoPermissibleObjects } from "d3-geo";
import { json } from "d3-fetch";

// Lets define a width and height for the SVG user space
// coordinate system (viewBox), also a padding to avoid
// overflows.
const width = 960;  
const height = 880;
const padding = 20;

// 1. Lets add a card for our map.
const card = select("#root")
  .append("div")
    .attr("class", "card");

// 2. Now the SVG canvas with the viewBox.
const svg = card
  .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `${-padding} ${-padding} ${width + 2*padding} ${height + 2*padding}`);

// 3. Lets create a projection, which basically is a math
// function to develop a 3D surface into a flat surface.
// In practice, it transforms geographic coordinates into
// projected coordinates. There are plenty of different 
// projections, and depending on our target application,
// we will select one or another. A good general purpose
// projection is spherical mercator (used extensively by
// web map providers such as Google Maps) also known as 
// webMercator or pseudoMercator. Another one extended
// is equirectangular AKA Platee-Carree.
const mercatorProjection = geoMercator()
  .translate([width/2, height/2]);

// 4. A path in SVG is described in a very specific manner.
// Lets use a utility provided by d3 to create the proper
// SVG coordinates for a path from user space coordinates.
const pathCreator = geoPath()
  .projection(mercatorProjection);

// 4a. Finally, lets paint our path in the svg by loading
// locally the world geojson.
const worldData = require("../data/world.geojson");
svg.append("path")
  .attr("d", pathCreator(worldData));

// 4b. As alternative, we can load the data remotely:
// const url = "http://enjalot.github.io/wwsd/data/world/world-110m.geojson";
// json<GeoPermissibleObjects>(url).then(geojson =>
//   svg.append("path")
//     .attr("d", pathCreator(geojson))
// );