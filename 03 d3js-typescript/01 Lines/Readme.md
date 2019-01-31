# Intro

# Steps

- We are going to start form _00 boilerplate_.

- Install the packages.

```bash
npm install
```

- Let's create a file that will hold the graphic data.

_./src/d3/linechart.data.ts_

```typescript
// Average data, Málaga temperature year 2018.
export const avgTemp = [14, 13, 14, 16, 19, 25, 29, 29, 27, 21, 17, 17];
export const minTemp = [11, 10, 11, 13, 16, 21, 24, 25, 23, 17, 14, 14];
export const maxTemp = [17, 16, 17, 19, 23, 27, 31, 31, 28, 23, 19, 19];

export interface TempStat {
  id: string;
  name: string;
  values: number[];
}

export const malagaStats: TempStat[] = [
  {
    id: "avg",
    name: "Average Temp",
    values: [14, 13, 14, 16, 19, 25, 29, 29, 27, 21, 17, 17],
  },
  {
    id: "min",
    name: "Min Temp",
    values: [11, 10, 11, 13, 16, 21, 24, 25, 23, 17, 14, 14],
  },
  {
    id: "max",
    name: "Max Temp",
    values: [17, 16, 17, 19, 23, 27, 31, 31, 28, 23, 19, 19],
  },
];
```

- Let's create a _linechart.d3.ts_ file, let's add selections:

_./src/d3/linechart.d3.ts_

```typescript
import { select } from "d3-selection";

const d3 = { select };
```

- Let's create a card to enclose the chart

_./src/d3/linechart.d3.ts_

```diff
import { select } from 'd3-selection';

const d3 = { select };

+ const card = d3.select("#root")
+    .append("div")
+      .attr("class", "card");
```

- Let's import this file into the main application entry point and check that a card is displayed.

_./src/app.ts_

```diff
import "./app.scss";

// Import here your D3 visualizations.
- import "./d3/title.d3";
+ import "./d3/linechart.d3";
```

- Let's make a quick check and ensure the card
  is being displayed.

```bash
npm start
```

- Le'ts create an _svg_ entry inside the card, and let's
  setup a _width_ and _height_

_./src/d3/linechart.d3.ts_

```diff
 const card = d3.select("#root")
    .append("div")
      .attr("class", "card");

const svg = card
  .append("svg")
+     .attr("width", "100%")
+     .attr("height", "100%");
  ;
```

- Now let's define a internal coordinate system.

```diff
+ const width= 500;
+ const height = 300;

const svg = card
  .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
+   .attr("viewBox", `0 0 ${width} ${height}`);
```

- Let's import now the data.

_./src/d3/linechart.d3.ts_

```diff
import { select } from 'd3-selection';
+ import {avgTemp} from './linechart.data'
```

- Next step is to import scales:

_./src/d3/linechart.d3.ts_

```diff
import { select } from 'd3-selection';
+ import { scaleLinear} from 'd3-scale';
import {avgTemp} from './linechart.data'

- const d3 = { select };
+ const d3 = { select, linear };
```

- Now let's create an X scale that will map months (0..11) to pixels,
  and y scale that will map temperatures to pixels:

_./src/d3/linechart.d3.ts_

```diff
+ import {extent} from 'd3-array';

// (...)
- const d3 = { select };
+ const d3 = { select, scaleLinear, extent };

const card = d3.select("#root")
    .append("div")
      .attr("class", "card")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`);

+ // Define scales
+ const xScale = d3.scaleLinear()
+   .domain([0, 11]) // data input, months, 0..11
+   .range([0, width]) // pixels

+ const YScale = d3.scaleLinear()
+    .domain(d3.extent(avgTemp))  // Temperatures, extent calculates min and max from array
+    .range([height, 0]) // pixels, must upside down, Y (0,0) in SVG is upper corner
```

- Now let's define the chart line.

_./src/d3/linechart.d3.ts_

```diff
+ import {line} from 'd3-shape';

- const d3 = { select, scaleLinear, extent };
+ const d3 = { select, scaleLinear, extent, line };

// (...)
const yScale = d3
  .scaleLinear()
  .domain(d3.extent(avgTemp)) // Temperatures, extent calculates min and max from array
  .range([height, 0]); // pixels, must upside down, Y (0,0) in SVG is upper corner

+ const lineCreateor = d3.line<number>()
+  .x((d, i) => xScale(i))  // data and array index, x Axis is month
+  .y(d => yScale(d));
```

- It's time to draw the line, let's append the following code
  we are gong to append new data.

_./src/d3/linechart.d3.ts_

```javascript
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
```

- Now we got the basic chart, the lines are cut for
  some values, let's add some padding.

The approach to follow, si to update values on the viewBox
definition.

- Let's define a padding:

_./src/d3/linechart.d3.ts_

```diff
const width = 500;
const height = 300;

+ const padding = 50;
```

- We will keep the widht and height for the line creator, but we will
  add a padding on the left / top side, and to make the same on right / bottom
  we need to add the padding twice (original offset added, plus left / bottom padding).

_./src/d3/linechart.d3.ts_

```diff
// Let's paint the line
const svg = card
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
-  .attr("viewBox", `0 0 ${width} ${height}`);
+  .attr("viewBox", `${-padding} ${-padding} ${width + 2 * padding} ${height + 2 * padding}`);
```

- Time to add the X/Y axis.

Let's add the imports to manage _axis_.

_./src/d3/linechart.d3.ts_

```diff
import { select } from "d3-selection";
import { scaleLinear } from "d3-scale";
import {line} from 'd3-shape';
import { avgTemp } from "./linechart.data";
import { extent } from "d3-array";
+ import { axisBottom, axisLeft} from 'd3-axis';

// ...

- const d3 = { select, scaleLinear, extent, line };
+ const d3 = { select, scaleLinear, extent, line, axisBottom, axisLeft };

```

```diff
svg
.append("path")
.datum(avgTemp)
  .attr("d", lineCreator)
  .attr("fill", "none")
  .attr("stroke-width", "5px")
  .attr("stroke", "black");
  ;

+ const axisGroup = svg.append('g');

+ // Y Axis: call axisLeft helper and pass the scale
+ axisGroup.append('g')
+   .call(d3.axisLeft(yScale))
+
+ // X axis:

+ axisGroup.append('g')
+    .call(d3.axisBottom((xScale)))
```

- If we run this, we can see that we are getting the Y axis on
  top instead that on bottom, why? because Y coordinates starts having zero
  on top, we have to sum up the height of the line chart to the X
  axis.

  I order to do that we will get benefit of the group that we have
  created, we will add a trasnslation transform.

```diff
// X axis:
axisGroup.append('g')
+ .attr('transform', `translate(0, ${height})`)
  .call(d3.axisBottom((xScale)))
```

Now we get the X axis in the right place.

