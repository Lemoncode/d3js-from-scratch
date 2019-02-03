import { mouse, extent, event } from "d3";
import { select } from "d3-selection";
import { geoConicConformalSpain } from "d3-composite-projections";
import { geoPath } from "d3-geo";
import { interpolateReds } from "d3-scale-chromatic";
import { scaleSqrt } from "d3-scale";
import { json } from "d3-fetch";
import { zoom } from "d3-zoom";
import { range, ticks } from "d3-array";
import { presimplify, simplify, feature } from "topojson";
import { Topology, GeometryCollection, Objects } from 'topojson-specification';
import { Feature, Geometry } from 'geojson';
import { defineGlowEffect } from './effects.d3';
const styles = require("./styles.scss");


// (*) Lets define a width and height for the SVG user space
// coordinate system (viewBox), also a padding to avoid
// overflows.
const width = 960;  
const height = 460;
const padding = 20;

// (*) Lets add a card for our map.
const card = select("#root")
  .append("div")
    .attr("class", "card");

// (*) Also lets add a reserved div for a tooltip.
const tooltip = select("#root")
  .append("div")
    .style("display", "none")
    .style("position", "absolute")
    .style("padding", "10px")
    .style("border-radius", "3px")
    .style("background-color", "black")
    .style("color", "white")
    .style("opacity", "0.7");

// (*) Now the SVG canvas with the viewBox.
const svg = card
  .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `${-padding} ${-padding} ${width + 2*padding} ${height + 2*padding}`);

// And we define a special effect: a glow effect
// to highlight regions on hover.
const glowUrl = defineGlowEffect(svg.append("defs"));

// (*) Lets prepare a group to be zoomable. And a group for a
// legend, out of the zoom.
const zoomGroup = svg
  .append("g");
const legendGroup = svg
  .append("g");

// Also, lets create a couple of groups whithin the zoom to
// group regions and municipalities in different sections.
const municipalitiesGroup = zoomGroup
  .append("g");
const regionsGroup = zoomGroup
  .append("g");

// Now the zoom logic binded to the svg.
const zoomCreator = zoom()
  .scaleExtent([1, 15])
  .on("zoom", onZoom);

svg.call(zoomCreator);

// And de onZoom callback.
function onZoom() {
  zoomGroup
    .attr("transform", event.transform);
}

// (*) Lets use a custom projection for Spain that will allow
// us to represent Canary Islands closer to Iberian Peninsula.
// We need the package "npm i d3-composite-projections".
const projection = geoConicConformalSpain()
  .translate([width/2, height/2]);

// And then a path creator based on that projection.
const pathCreator = geoPath()
  .projection(projection);


// (*) Let's load the needed data with an async helper.
// **** WARNING **** Remember to change webpack rule to use
// file-loader for all these data extensions.
Promise.all([
  json(require("../data/municipalities.topojson")),
  json(require("../data/regions.topojson"))
]).then(onDataReady as (value) => void);

// (*) Prior to define the onDataReady function callback
// we will need typings here to specify the structure of the
// expected regions and municipalities entities.
interface Municipality {
  name: string;
  rate: number;
};

interface MunicipalityData extends Objects {
  municipios: GeometryCollection<Municipality>;
}

interface Region {};

interface RegionData extends Objects {
  ccaa: GeometryCollection<Region>;
}

// AndHere is the function.
function onDataReady([mData, rData]: [Topology<MunicipalityData>, Topology<RegionData>]) {
  // (*) Data management.
  // Presimplify to prepare data structure to simplify. It adds a weight
  // to each coordinate. When simplifying, we just drop coordinates by
  // filtering with a weight threshold.
  presimplify(mData);
  simplify(mData, 0.5);

  // (!) I found a 'bug' in topojson-specification typings
  // that will prevent TS from infering properties in a
  // geometry.properities object. To prevent that:
  /* Replace in index.d.ts line 112:
      export interface NullObject<P extends Properties = {}> extends GeometryObjectA<P> {
        type: null;
      }
  */
  
  // (*) Lets implement a scale to assign color to
  // each municipality based on its population density.
  // This time, instead of manually setting the domain,
  // let's compute it dynamically from the data.
  const densities = mData.objects.municipios.geometries.map(g => (g.properties.rate));
  const densityExtent = extent(densities);
  const densityScale = scaleSqrt().exponent(1/6)
    .domain(densityExtent)
    .range([0, 1]);
  const colorScale = (density: number) => interpolateReds(densityScale(density || 0));

  // (*) Lets implement the ENTER pattern for each new municipality 
  // to be represented with a SVG path joined to its datum.
  // First, we need to extract the corresponding feature collection.
  const municipalities = feature(mData, mData.objects.municipios);

  municipalitiesGroup.selectAll("path")
    .data(municipalities.features, (d: Feature<Geometry, Municipality>) => d.properties.name)
    .enter()
    .append("path")
      .attr("d", pathCreator)
      .attr("fill", d => colorScale(d.properties.rate))
      // .style("stroke", "white")  // Painting the strokes will hit performance
      // .style("stroke-width", "0.5px")
      // Finally, lets bind some mouse events to show a tooltip with info.
      .on("mouseenter", onMouseEnter)
      .on("mousemove", onMouseMove)
      .on("mouseleave", onMouseLeave);
  

  // (*) You can find below the event handlers implementation

  // OnMouseEnter we will show the tooltip and hightlight the municipality.
  function onMouseEnter(d: Feature<Geometry, Municipality>) {
    tooltip
      .style("display", "block")
      .html(`
        <p><b>Municipality</b>: ${d.properties.name}</p>
        <p><b>Pop. Density</b>: ${d.properties.rate ? d.properties.rate.toLocaleString() : "N/D"} per km2</p>
      `);
    
    select(this)
      .raise()
      .attr("filter", glowUrl);
  };

  // OnMouseMove lets update the tooltip position.
  function onMouseMove() {
    const [mx, my] = mouse(document.body);

    tooltip
      .style("left", `${mx + 10}px`)
      .style("top", `${my + 10}px`);
  };

  // OnMouseLeave just hide the tooltip.
  function onMouseLeave() {
    tooltip
      .style("display", "none");
    
    select(this)
      .attr("filter", undefined);
  }

  // ************************************************************************************
  // (*) OPTIONAL - ¿Exercise? - Add a legend
  const numPatches = 10;
  const patchesData = Array(numPatches).fill(0).map((p,i) => densityScale.invert(i/(numPatches-1)))
  const patchesHeight = 20;
  const patchesWidth = 80;
  const legendMargin = 20;

  // Setup legend group position to lower right corner by using a transform-translate.
  legendGroup
    .attr("transform", `translate(${width - patchesWidth - legendMargin}, ${height - (patchesHeight * numPatches) - legendMargin})`)
  
  // Enter pattern for patches. Each patch will have a group.
  const patches = legendGroup.selectAll("rect")
    .data(patchesData)
    .enter()
    .append("g")
      .attr("transform", (d, i) => `translate(0, ${patchesHeight * i})`)
  patches.append("rect")
    .attr("width", patchesWidth)
    .attr("height", patchesHeight)
    .attr("fill", colorScale)
  patches.append("text")
    .attr("transform", "translate(15)")
    .attr("alignment-baseline", "text-before-edge")
    .attr("fill", "white")
    .text(d => Math.round(d).toLocaleString())

      
  // ************************************************************************************
  // (*) OPTIONAL - ¿Exercise? - Add CCAA.
  // Add Autonomous Communities in the map, just to group the 
  // municipalities into regions. We have already loaded the file
  // regions.topojson and have created a SVG group for that, just
  // draw it in the map with D3.

  const regions = feature(rData, rData.objects.ccaa);
  console.log(regions)
  regionsGroup.selectAll("path")
    .data(regions.features)
    .enter()
    .append("path")
      .attr("d", pathCreator)
      .attr("fill", "none")
      .style("stroke", "white")
      .style("stroke-width", "1px");
}
