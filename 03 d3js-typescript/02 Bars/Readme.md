# Intro

# Steps

- We are going to start form _00 boilerplate_.

- Install the packages.

```bash
npm install
```

- Let's create a file that will hold the graphic data, we will generate random data and simulta real time updates.

_./src/d3/barchart.data.ts_

```typescript
// Data array generator (random numbers)
const randomArrayGenerator = n => Array.from({length: n}, () => Math.random());

// Otra forma podría ser Array(n).fill(0).map(n => Math.random());


// Singleton, initialize random data (20 elements)
export let randomData = randomArrayGenerator(20);

// Create a mechanism to update random data each second,
// simulate a real time data source, we just return a callback 
// to subscribe on data changes
export const startRealTimeDataV1 = (onDataChange: () => void) => {
  setInterval(() => {
    randomData = randomArrayGenerator(20);
    onDataChange && onDataChange();
  }, 1000);
}

export const startRealTimeDataV2 = (onDataChange: (data: any[]) => void) => {
  setInterval(() => {
    const n = Math.random() * 10 + 10;  // [10, 20]
    onDataChange && onDataChange(randomArrayGenerator(n));
  }, 1500);
}
```

- Let's start with the chart it self: 
  - We will add the widht and height (like in sample on). 
  - Let's add a card.
  - Let's add the d3 namespace.
  - Le't define the viewbox

_./src/barchart.d3.ts_

```typescript
import { select, selectAll } from "d3-selection";
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
```

- Let's add the import to the app.ts.

_./src/app.ts_

```diff
import "./app.scss";

// Import here your D3 visualizations.
- import "./d3/title.d3";
+ import "./d3/barchart.d3";
```

- Now let's paint a bar per random number entry we get (each datum will be associated to each bar, we will make use of enter and update).
We will create first the scales, let's start with the Y scale

```typescript
const scaleYPos = scaleLinear() 
  .domain([0,1])
  .range([height, 0]);
```

- For the scale X we wil make use of _scaleBand_ (https://github.com/d3/d3-scale#band-scales)

```typescript
// In Domain (bars) we don't have continuous values, we have to identify the bands, like in ordinal scale
// we could return [0,1,2,3...20], we will do that wiht a map
const scaleXPos = d3.scaleBand<number>()
  .domain(randomData.map((d,i) => i))
  .range([0, width]) // use RangeRound to get pixel perfect layout
  .paddingInner(0.05); // space between bars, wathout! percentages values, range number 0..1
```

- Let's start creating the bar char it self

- First we will create a bar group

```typescript
const barGroup = svg
  .append('g');
```

- Now let's append the new bars (we are going to pain all the bars just the first time).

```typescript
barGroup
  .selectAll('rect')
  .data(randomData)
  .enter()
  .append("rect")
    .attr("x", (d,i) => scaleXPos(i))
    .attr("y", d => scaleYPos(d))
    .attr("width", scaleXPos.bandwidth())
    .attr("height", d => height - scaleYPos()) // Remember Y coord start top on 0
```