'use strict';

var votingMap;

d3.xhr('data/edited.svg','image/svg+xml',function(error, svgData){

	var svgContainer = document.querySelector('.svg-container');
	svgContainer.innerHTML = svgData.response;
	console.log(svgContainer.offsetWidth + ' ' + svgContainer.offsetHeight);
	votingMap = new MapConvertor();
	votingMap.initialise();

	(function mapZoom(){

		var width = 380;
		var height = 570;

		var activeElement = d3.select(null);
		var svg = d3.select('svg').attr('width', svgContainer.offsetWidth).attr('height', svgContainer.offsetHeight);
		var allG = d3.selectAll('svg g').attr('transform','translate(0,0)scale(0.5)');
		var allPaths = d3.selectAll('svg path');

		var zoom = d3.behavior.zoom();

		var zoomed = 	function() {
			var translate = d3.event.translate;
			var scale = d3.event.scale;
			allG.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
			allPaths.style("stroke-width", 0.3 / scale);
		};

		var clicked = function() {
			if(d3.event.toElement === svg[0][0]){
				svg.transition().duration(500).call(zoom.translate([0, 0]).scale(0.5).event);
				votingMap.clearSelection();
			}
		}

		var doubleClicked = function() {
			if(d3.event.toElement !== svg[0][0]){
				if(activeElement === d3.select(d3.event.toElement)){
					activeElement = d3.select(null);
					return svg.transition().duration(500).call(zoom.translate([0, 0]).scale(0.5).event);
				}
				activeElement = d3.select(d3.event.toElement);
				var boundingRect = d3.event.target.getBBox();

				var scale = 0.5 / Math.max(boundingRect.width / width, boundingRect.height / height);
				var translate = [width / 2 - scale * boundingRect.x, height / 2 - scale * boundingRect.y];

				svg.transition().duration(500).call(zoom.translate(translate).scale(scale).event);
			} else {
				activeElement = d3.select(null);
			}
		}

		svg.call(zoom.translate([0, 0]).scale(0.5).scaleExtent([0.5, 9]).on("zoom", zoomed));
		svg.on('click', clicked);
		svg.on('dblclick', doubleClicked);

	})();

});



