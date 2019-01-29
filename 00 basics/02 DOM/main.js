// DOM API
var element = document.getElementById('some-id');
// <li id="some-id">Unique element</li>
var plenght = document.getElementsByTagName('p').length;
// 4
var reds = document.getElementsByClassName('red');
// [<p class="red">Red paragraph</p>]
console.log(reds[0].innerText);
// "Red paragraph"

// D3 Selection API
var one = d3.select('p').size(); // select() only finds one
// 1
var many = d3.selectAll('p').size(); // selectAll() finds all
// 4
var reds = d3.selectAll('.red');
// [ > Array[1] ]
console.log(reds.text());
// "Red paragraph"
