'use strict';

var votingMap;


d3.xhr('data/edited.svg','image/svg+xml',function(error, svgData){

	document.querySelector('.panel-body').innerHTML = svgData.response;
	votingMap = new MapConvertor();
	votingMap.initialise();

	(function mapZoom(){

		var svg = d3.select('svg');
		var allG = d3.selectAll('svg g');
		var allPaths = d3.selectAll('svg path');
		var width = 380;
		var height = 570;
		svg.attr('width', width);
		svg.attr('height', height);
		allG.attr("transform", "scale(0.5)");

		var x = d3.scale.linear().domain([0, width]);
		var y = d3.scale.linear().domain([0, height]);

		var transform = function(e) {
			return "translate(" + x(e.translate[0]) + "," + y(e.translate[1]) + ")scale(" + e.scale + ")";
		};

		var zoom = 	function() {
			allG.attr("transform", transform(d3.event));
			allPaths.style("stroke-width", 0.3 / d3.event.scale);
		};

		svg.call(d3.behavior.zoom().x(x).y(y).scale(0.5).scaleExtent([0.5, 9]).on("zoom", zoom));

	})();

});



