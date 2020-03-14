import * as d3 from "d3";

// DOM API
var element = document.getElementById("some-id");
// <li id="some-id">Unique element</li>
console.log(element);

var plength = document.getElementsByTagName("p").length;
// 4
console.log(plength);

var reds = document.getElementsByClassName("red");
// [<p class="red">Red paragraph</p>]
console.log(reds[0].innerHTML);
// "Red paragraph"

// D3 Selection API
var one = d3.select("p").size(); // select() only finds one
console.log(one);

// 1
var many = d3.selectAll("p").size(); // selectAll() finds all
console.log(many);

// 4
var redElements = d3.selectAll(".red");
// [ > Array[1] ]
console.log(redElements.text());
// "Red paragraph"

var clickMe = document.getElementById("click-me");
clickMe.onclick = function() {
  if (this.style.backgroundColor) {
    this.style.backgroundColor = "";
  } else {
    this.style.backgroundColor = "red";
  }
};
