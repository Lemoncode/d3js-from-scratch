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
// Generador de datos aleatorios en formato de array de n posiciones.
const randomArrayGenerator = n => Array.from({length: n}, () => Math.random());

// Otra forma podría ser Array(n).fill(0).map(n => Math.random());


// Singleton inicializado con datos aleatorios. Array de 20 posiciones.
export let randomData = randomArrayGenerator(20);

// Creamos un mecanismo para modifcar estos datos aleatorios cada segundo.
// Simula una fuente de datos 'real-time'. Permitimos la suscripción de un
// callback para informar a la visualización de que hubo modificaciones.
export const startRealTimeDataV1 = (onDataChange: (newData) => void) => {
  setInterval(() => {
    randomData = randomArrayGenerator(20);
    onDataChange && onDataChange(randomData);
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

- Let's add a nice gradiente to the bars.

```typescript
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
```

- And use it in our bar chart

```diff
barGroup
.selectAll('rect')
.data(randomData)
.enter()
.append("rect")
  .attr("x", (d,i) => scaleXPos(i))
  .attr("y", d => scaleYPos(d))
  .attr("width", scaleXPos.bandwidth())
  .attr("height", d => height - scaleYPos(d))
+  .attr("fill", "url(#barGradient)");
```

- If we refresh the browser we can see that data is changed, now let's go
for real time updates. By default the mode to update is 'update' (enter is insert)

```typescript
const dataUpdated = (newData : number[]) => {
  // Update pattern
  barGroup
    .selectAll('rect')
    .data(newData)
      .attr("y", d => scaleYPos(d))
      .attr("height", d => height - scaleYPos(d))
} 

startRealTimeDataV1(dataUpdated);
```

- now we got the graphic changing in real time, but... couldn't it be nice to add 
a transition for the values?

```typescript
```