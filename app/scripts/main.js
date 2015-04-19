'use strict';
var electionAnalyser = function(d3, MapConvertor){
	var votingMap = new MapConvertor(d3);
	votingMap.initialise();

	var transform = function(e) {
		return "translate(" + x(e.translate[0]) + "," + y(e.translate[1]) + ")scale(" + e.scale + ")";
	};

	var zoom = 	function() {
		d3.selectAll('svg g').attr("transform", transform(d3.event));
	};

	var svg = d3.select('svg');
	var width = svg.attr('width');
	var height = svg.attr('height');

	var x = d3.scale.linear().domain([0, width]);
	var y = d3.scale.linear().domain([0, height]);

	svg.call(d3.behavior.zoom().x(x).y(y).scaleExtent([1, 8]).on("zoom", zoom));

};

electionAnalyser(window.d3, window.MapConvertor);
