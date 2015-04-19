'use strict';

var votingMap = new MapConvertor();
votingMap.initialise();

(function mapZoom(){

	var svg = d3.select('svg');
	var allG = d3.selectAll('svg g');
	var allPaths = d3.selectAll('svg path');
	var width = svg.attr('width');
	var height = svg.attr('height');

	var x = d3.scale.linear().domain([0, width]);
	var y = d3.scale.linear().domain([0, height]);

	var transform = function(e) {
		return "translate(" + x(e.translate[0]) + "," + y(e.translate[1]) + ")scale(" + e.scale + ")";
	};

	var zoom = 	function() {
		allG.attr("transform", transform(d3.event));
		allPaths.style("stroke-width", 0.5 / d3.event.scale);
	};

	svg.call(d3.behavior.zoom().x(x).y(y).scaleExtent([1, 9]).on("zoom", zoom));

})();
