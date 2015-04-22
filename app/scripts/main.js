'use strict';

var votingMap;

d3.xhr('data/edited.svg','image/svg+xml',function(error, svgData){

	var svgContainer = document.querySelector('.svg-container');
	svgContainer.innerHTML = svgData.response;

	votingMap = new MapConvertor();
	votingMap.initialise();

	var selectedEl = null;
	var svgEl = document.querySelector('svg');


	var width = svgContainer.offsetWidth;
	var height = svgContainer.offsetHeight;
	var defaultScale = Math.min(width / 690, height / 996);
	var defaultTranslate = [0, 0];
	console.log('Svg container: ' + width + ', ' + height + '. Default zoom level: ' + defaultScale);


	var svg = d3.select('svg').attr('width', svgContainer.offsetWidth).attr('height', svgContainer.offsetHeight);
	var allG = d3.selectAll('svg g').attr('transform','translate(0,0)scale('+defaultScale+')');
	var allPaths = d3.selectAll('svg path');

	var zoomed = function() {
		var translate = d3.event.translate;
		var scale = d3.event.scale;
		allG.attr("transform", "translate(" + translate[0] + "," + translate[1] + ")scale(" + scale + ")");
		allPaths.style("stroke-width", 0.1 / scale);
	};

	var resetMap = function() {
		selectElement(null);
		svg.transition().duration(500).call(zoom.translate(defaultTranslate).scale(defaultScale).event);
		votingMap.clearSelection();
	};

	var selectElement = function(newElement){
		if(newElement){
			if(selectedEl){
				selectedEl.classList.remove('selected');
			}
			selectedEl = d3.event.target;
			selectedEl.classList.add('selected');
			svgEl.classList.add('selected');
		} else {
			if(selectedEl){
				selectedEl.classList.remove('selected');
				svgEl.classList.remove('selected');
			}
			selectedEl = null;
		}
	};

	var zoomToBoundingBox = function(el){

		//noinspection JSUnresolvedFunction
		var boundingRect = el.getBBox();

		var scale = 0.5 / Math.max(boundingRect.width / width, boundingRect.height / height);
		var translate = [width / 2 - scale * (boundingRect.x + boundingRect.width / 2), height / 2 - scale * (boundingRect.y + boundingRect.height / 2)];

		svg.transition().duration(500).call(zoom.translate(translate).scale(scale).event);
	};

	var clicked = function() {
		//noinspection JSUnresolvedVariable
		if(!d3.event.defaultPrevented){
			if(d3.event.target === svgEl){
				resetMap();
			} else {
				if(selectedEl === d3.event.target){
					resetMap();
				} else {
					selectElement(d3.event.target);
					zoomToBoundingBox(selectedEl);
					votingMap.constituencyClickHandler.bind(selectedEl)();
				}
			}
		}
	};

	var zoom = d3.behavior.zoom();
	svg.call(zoom.translate(defaultTranslate).scale(defaultScale).scaleExtent([0.5, 9]).on("zoom", zoomed));
	svg.on('click', clicked);

	function updateWindow(){
		width = svgContainer.offsetWidth;
		height = svgContainer.offsetHeight;
		defaultScale = Math.min(width / 690, height / 996);
		defaultTranslate = [0,0];
		console.log('Svg container: ' + width + ', ' + height + '. Default zoom level: ' + defaultScale);

		svg.attr("width", width).attr("height", height);
		resetMap();
	}
	window.onresize = updateWindow;

});



