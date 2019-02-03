import { mouse } from "d3";
import { select } from "d3-selection";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { interpolateBlues } from "d3-scale-chromatic";
import { scaleSqrt } from "d3-scale";
import { json } from "d3-fetch";
import { FeatureCollection, Geometry, Feature } from 'geojson';

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

// (*) Now the SVG canvas with the viewBox.
const svg = card
  .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `${-padding} ${-3*padding} ${width + 2*padding} ${height + 4*padding}`);

// Main title.
const mainTitle = svg
  .append("g")
    .attr("transform", `translate(${width / 2}, ${-1.5 * padding})`)
    .append("text")
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .attr("font-size", "2rem")
      .text("Historic Population")

// Also, lets create a group whithin the svg to group 
// all the countries inside.
const countriesGroup = svg
  .append("g");

// (*) Lets create a projection for our map. Since we want
// to represent the whole world, a good choice for small-scale
// maps is natural Earth projection.
const projection = geoNaturalEarth1()
  .translate([width/2, height/2]);

// And then a path creator based on that projection.
const pathCreator = geoPath()
  .projection(projection);

// (*) Lets implement a useful scale to assign color to
// countries based on its population.
const populationLogScale = scaleSqrt().exponent(1/6)
  .domain([0, 1500000000])
  .range([0, 1]);
const colorScale = (population: number) => population ?
  interpolateBlues(populationLogScale(population)) : "pink";

// (*) Let's load the needed data. This time we will use an
// async helper borrowed from Promise. We are requiring local
// files using require() for webpack to provide us with the right
// path. 
Promise.all([
  json(require("../data/countries.geojson")),
  json(require("../data/population.stats.json"))
]).then(startChart as (value) => void);

// (*) And the function callback to handle that loaded data.
// We will need typings here to specify the structure of the
// expected country entities and population records.
interface CountryProps {
  name: string;
  population: number;
};

interface PopulationRecord {
  "Country Code": string;
  "Country Name": string;
  "Value": number;
  "Year": number;
}

// Here is the function.
function startChart([countries, population]: [FeatureCollection<Geometry, CountryProps>, PopulationRecord[]]) {
  // Utility function to lookup population by year and country.
  const populationLookupFunction = createPopulationLookup(population);
  
  // First paint, just countries with no population data.
  enterPattern(countries);

  // Now, lets simulate population data is changing over time.
  // 1 year = 1 second.
  const totalYears = 56;
  let yearIndex = 0;
  setInterval(() => {
    const year = 1960 + yearIndex++ % totalYears;
    updatePattern(year, countries, populationLookupFunction);
  }, 1000);
}

const createPopulationLookup = (population: PopulationRecord[]) =>
  (year: number, countryName: string) => {
    const record = population.find(record =>
      record["Country Name"] === countryName && record["Year"] === year);
    return record ? record["Value"] : undefined;
}

const enterPattern = (countries: FeatureCollection<Geometry, CountryProps>) => {
  countriesGroup.selectAll("path")
    .data(countries.features, (d: Feature<Geometry, CountryProps>) => d.properties.name)
    .enter()
    .append("path")
      .attr("d", pathCreator)
      .attr("fill", d => colorScale(d.properties.population))
      .style("stroke", "white")
      .style("stroke-width", "0.5px");
}

const updatePattern = (
  year: number,
  countries: FeatureCollection<Geometry, CountryProps>,
  getPopulation: (year: number, countryName: string) => number,
) => {
  mainTitle.text(`Year ${year.toLocaleString()}`);

  countriesGroup.selectAll("path")
    .data(countries.features, (d: Feature<Geometry, CountryProps>) => d.properties.name)
      .attr("fill", d => colorScale(getPopulation(year, d.properties.name)))
}
