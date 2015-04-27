'use strict';

var CONSTANTS = {
	IMAGE_WIDTH: 690,
	IMAGE_HEIGHT: 996,
	TRANSITION_DURATION: 500,
	MIN_SCALE: 0.5,
	MAX_SCALE: 9,
	BOUNDING_BOX_FACTOR: 0.8
};

var scenarios = {
	'results2010':{'tory': 36.1, 'labour': 29.0, 'libdem': 23.0, 'snp': 1.7, 'pc': 0.6, 'green': 1.0, ukip: 3.1, 'other': 5.5},
	'ukipInsurgence': {'tory': 23.9, 'labour': 25.4, 'libdem': 6.9, 'snp': 2.5, 'pc': 0.7, 'green': 7.9, 'ukip': 27.5, 'other': 5.2}
};

d3.xhr('data/edited.svg','image/svg+xml',function(error, svgData){

	var svgContainer = document.querySelector('.svg-container');
	svgContainer.innerHTML = svgData.response;

	var tooltip = d3.select("#tooltip");
	var mouse = {x:0,y:0};

	var width = svgContainer.offsetWidth;
	var height = svgContainer.offsetHeight;
	var defaultScale = Math.min(width / CONSTANTS.IMAGE_WIDTH, height / CONSTANTS.IMAGE_HEIGHT);
	var scaledWidth = CONSTANTS.IMAGE_WIDTH * defaultScale;
	var defaultTranslate = [(width - scaledWidth) > 0 ? (width - scaledWidth)/2 : 0, 0];
	console.log('Svg container: ' + width + ', ' + height + '. Scale: ' + defaultScale + '. Translate: ' + defaultTranslate);

	var electionProjector = new ElectionProjector('data/2010.json');
	electionProjector.initialise(scenarios.results2010);

	var selectedEl = null;
	var svgEl = document.querySelector('svg');

	var svg = d3.select('svg').attr('width', width).attr('height', height);
	var allG = d3.selectAll('svg g').attr('transform','translate(' + defaultTranslate[0] + ',' + defaultTranslate[1] + ')scale('+defaultScale+')');
	var allPaths = d3.selectAll('svg path');

	//add change handlers
	Array.prototype.forEach.call(document.querySelectorAll('.controls input'), function(el){
		el.addEventListener('change',function(){
			electionProjector.recalculateSeats(el);
		});
	});

	document.getElementById('scenario-selector').addEventListener('change',function(e){
		for(var i in scenarios){
			if(i === e.target.value){
				document.querySelector('.' + i).classList.remove('hidden');
			} else {
				document.querySelector('.' + i).classList.add('hidden');
			}
		}
		resetMap();
		electionProjector.setProjection(scenarios[e.target.value]);
		electionProjector.updateVotes();
		electionProjector.updateTotalNumberOfSeats();
	});

	document.getElementById('reset').addEventListener('click',electionProjector.resetPercentages.bind(electionProjector), false);
	document.addEventListener('mousemove',function(e){
	        mouse = {
	            x: e.pageX-(e.clientX - e.offsetX),
	            y: e.pageY-(e.clientY - e.offsetY)
	        };
	});

	var zoomed = function() {
		var translate = d3.event.translate;
		var scale = d3.event.scale;
		allG.attr("transform", "translate(" + translate[0] + "," + translate[1] + ")scale(" + scale + ")");
		allPaths.style("stroke-width", 0.2 / scale);
	};

	var resetMap = function() {
		selectElement(null);
		svg.transition().duration(CONSTANTS.TRANSITION_DURATION).call(zoom.translate(defaultTranslate).scale(defaultScale).event);
		electionProjector.clearSelection();
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

		var scale = CONSTANTS.BOUNDING_BOX_FACTOR / Math.max(boundingRect.width / width, boundingRect.height / height);
		var translate = [width / 2 - scale * (boundingRect.x + boundingRect.width / 2), height / 2 - scale * (boundingRect.y + boundingRect.height / 2)];

		svg.transition().duration(CONSTANTS.TRANSITION_DURATION).call(zoom.translate(translate).scale(scale).event);
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
					zoomToBoundingBox(selectedEl.parentNode);
					electionProjector.constituencyClickHandler.bind(selectedEl)();

				}
			}
		}
	};

	var mouseOver = function() {
		
		if(d3.event.target.id){
			tooltip.html(d3.event.target.id);
	      	tooltip.style("opacity", "1");
	      	tooltip.style("left", -20+mouse.x+"px");
	      	tooltip.style("top", (-55+mouse.y)+"px");
	      }else{
	      	tooltip.style("opacity", "0");
      	 	tooltip.style("left", (-20000+mouse.x)+"px");
	      }
				
	};
	var mouseOut = function() {
		
		 tooltip.style("opacity", "0");
      	 tooltip.style("left", (-20000+mouse.x)+"px");

	};


	var resized = function(){
		width = svgContainer.offsetWidth;
		height = svgContainer.offsetHeight;
		defaultScale = Math.min(width / CONSTANTS.IMAGE_WIDTH, height / CONSTANTS.IMAGE_HEIGHT);
		scaledWidth = CONSTANTS.IMAGE_WIDTH * defaultScale;
		defaultTranslate = [(width - scaledWidth) > 0 ? (width - scaledWidth)/2 : 0, 0];

		svg.attr("width", width).attr("height", height);
		resetMap();
	};

	var zoom = d3.behavior.zoom();
	svg.call(zoom.translate(defaultTranslate).scale(defaultScale).scaleExtent([CONSTANTS.MIN_SCALE, CONSTANTS.MAX_SCALE]).on("zoom", zoomed));
	svg.on('click', clicked);
	svg.on('mouseover', mouseOver);
	svg.on('mouseout', mouseOut);
	window.onresize = resized;

	function addDragHandlers(progressContainers) {
		progressContainers.find('.handle').mousedown(function (downEvent) {
			var handleEl = downEvent.target;
			var fullBar = window.jQuery(handleEl.parentNode.parentNode);
			var input = fullBar.siblings('.input').find('input');
			var bar = window.jQuery(handleEl.parentNode);

			var maxWidth = fullBar.outerWidth() - handleEl.offsetWidth;
			console.log("fullBar.outerWidth() = "+fullBar.outerWidth());
			console.log("handleEl.offsetWidth= "+handleEl.offsetWidth);
			maxWidth = 2.0*100; //Mathieu override: we now use static width for progresses bar
			var currentPercentage = bar.outerWidth() / maxWidth;

			var trackObj = fullBar.offset();
			trackObj.width = fullBar.get(0).offsetWidth;
			trackObj.height = fullBar.get(0).offsetHeight;

			function finishDrag(){
				console.log('finish drag');
				progressContainers.unbind("mousemove");
				progressContainers.unbind("mouseup");
				fullBar.removeClass('dragging');
				bar.removeClass('active');
			}

			function isOutOfBounds(e){
				return (e.pageX < trackObj.left ||
					e.pageX > (trackObj.left + trackObj.width) ||
					e.pageY < trackObj.top ||
					e.pageY > (trackObj.top + trackObj.height)
				);
			}

			progressContainers.mousemove(function (moveEvent) {
				fullBar.addClass('dragging');
				bar.addClass('active');

				//if(isOutOfBounds(moveEvent)){
				//	finishDrag();
				//}

				var handleWidth = 10;
				var diffPercentage = ( -handleWidth+ moveEvent.pageX - downEvent.pageX) / (maxWidth -handleWidth);
				if(Math.abs(diffPercentage) > 0.01){
					var newPercentage = ((currentPercentage + diffPercentage) * 100).toFixed(1);
					if(newPercentage > -10 && newPercentage < 99){
						newPercentage = Math.max(0,newPercentage);
						//bar.css('width', 'calc(' +newPercentage + '% + 10px)');
						//Mathieu override: using fixed width for progress bar
						bar.css('width', (newPercentage*2.0+10) + ' px)');
						input.val(newPercentage);
						electionProjector.recalculateSeats(input.get(0));
					}
				}

			});


			$(window).mouseup(finishDrag);
			//progressContainers.parent.mouseup(finishDrag);

		});
	}

	addDragHandlers(window.jQuery('.progress'));

});



