var votingMap = new mapConvertor();

votingMap.init();

var svg = d3.select('svg');
var width = svg.attr('width');
var height = svg.attr('height');


var x = d3.scale.linear()
	.domain([0, width]);

var y = d3.scale.linear()
	.domain([0, height]);


svg.call(d3.behavior.zoom().x(x).y(y).scaleExtent([1, 8]).on("zoom", zoom));


function zoom() {
	d3.selectAll('svg g').attr("transform", transform(d3.event));
}

function transform(e) {
	return "translate(" + x(e.translate[0]) + "," + y(e.translate[1]) + ")scale(" + e.scale + ")";
}

