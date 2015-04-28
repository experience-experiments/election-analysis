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
	'ukipInsurgence': {'tory': 23.9, 'labour': 25.4, 'libdem': 6.9, 'snp': 2.5, 'pc': 0.7, 'green': 7.9, 'ukip': 27.5, 'other': 5.2},
	'snpRout': {'tory': 23.9, 'labour': 25.4, 'libdem': 6.9, 'snp': 2.5, 'pc': 0.7, 'green': 7.9, 'ukip': 27.5, 'other': 5.2},
	'riseOfTheNutters': {'tory': 23.9, 'labour': 25.4, 'libdem': 6.9, 'snp': 2.5, 'pc': 0.7, 'green': 7.9, 'ukip': 27.5, 'other': 5.2},
	'libdemsWinAMajority': {'tory': 23.9, 'labour': 25.4, 'libdem': 6.9, 'snp': 2.5, 'pc': 0.7, 'green': 7.9, 'ukip': 27.5, 'other': 5.2},
	'edsRedsWin': {'tory': 23.9, 'labour': 25.4, 'libdem': 6.9, 'snp': 2.5, 'pc': 0.7, 'green': 7.9, 'ukip': 27.5, 'other': 5.2},
	'daveDefiesDoubters': {'tory': 23.9, 'labour': 25.4, 'libdem': 6.9, 'snp': 2.5, 'pc': 0.7, 'green': 7.9, 'ukip': 27.5, 'other': 5.2}
};

d3.xhr('data/edited.svg','image/svg+xml',function(error, svgData){

	var svgContainer = document.querySelector('.svg-container');
	svgContainer.innerHTML = svgData.response;

	var tooltipEl = d3.select("#tooltip");
	var mouseTracker = {x:0,y:0};

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

	var scenariosEl = document.getElementById('scenario-selector');
	var resetEl = document.getElementById('reset');

	var svg = d3.select('svg').attr('width', width).attr('height', height);
	var allG = d3.selectAll('svg g').attr('transform','translate(' + defaultTranslate[0] + ',' + defaultTranslate[1] + ')scale('+defaultScale+')');
	var allPaths = d3.selectAll('svg path');

	//add change handlers
	Array.prototype.forEach.call(document.querySelectorAll('.controls input'), function(el){
		el.addEventListener('change',function(){
			electionProjector.recalculateSeats(el);
		});
	});

	resetEl.addEventListener('click',function(){
		resetEl.classList.add('hidden');
		electionProjector.resetPercentages.bind(electionProjector)();
	}, false);


	document.addEventListener('mousemove', function (e) {
		mouseTracker = {
			x: e.pageX ,
			y: e.pageY 
		};
	});

	d3.select(svgContainer).selectAll('button').data(['in','out'])
		.enter().append('button')
		.html(function(d){return d === 'in'?'+':'-';})
		.attr('id', function(d){return d;})
		.on('click', function(d){
			var scale = Number(zoom.scale());
			var translate = [width / 2 - scale * (CONSTANTS.IMAGE_WIDTH/2), height / 2 - scale * (CONSTANTS.IMAGE_HEIGHT/2)];

			if(d === 'in'){
				scale = Math.floor(scale) + 1;
			} else {
				scale = Math.floor(scale) - 1;
			}
			if(scale >= CONSTANTS.MIN_SCALE && scale <= CONSTANTS.MAX_SCALE){
				svg.call(zoom.translate(translate).scale(scale).event);
			}
		});


	var zoomed = function() {
		var translate = d3.event.translate;
		var scale = d3.event.scale;
		allG.attr("transform", "translate(" + translate[0] + "," + translate[1] + ")scale(" + scale + ")");
		allPaths.style("stroke-width", 0.2 / scale);
	};

	var resetMap = function() {
		selectElement(null);
		svg.transition().ease('quad').duration(CONSTANTS.TRANSITION_DURATION).call(zoom.translate(defaultTranslate).scale(defaultScale).event);
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

		svg.transition().ease('quad').duration(CONSTANTS.TRANSITION_DURATION).call(zoom.translate(translate).scale(scale).event);
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

	var mouseOver = function () {
		if (d3.event.target.id) {
			tooltipEl.html(electionProjector.getConstituencyName(d3.event.target.id));
			tooltipEl.style("opacity", "1");
			tooltipEl.style("left", -20 + mouseTracker.x + "px");
			tooltipEl.style("top", (-55 + mouseTracker.y) + "px");
		} else {
			tooltipEl.style("opacity", "0");
			tooltipEl.style("left", (-20000 + mouseTracker.x) + "px");
		}
	};
	var mouseOut = function () {
		tooltipEl.style("opacity", "0");
		tooltipEl.style("left", (-20000 + mouseTracker.x) + "px");
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

	var switchScenario = function(scenarioId){
		for(var id in scenarios){
			var el = document.querySelector('article.' + id);
			if(el && id === scenarioId){
				el.classList.remove('hidden');
				history.pushState(null, null, '#' + id);
			} else if(el){
				el.classList.add('hidden');
			}
		}
		resetMap();
		electionProjector.setProjection(scenarios[scenarioId]);
		electionProjector.updateVotes();
		electionProjector.updateTotalNumberOfSeats();
		resetEl.classList.add('hidden');
	};


	if(window.location.hash){
		scenariosEl.value = window.location.hash.substring(1);
		switchScenario(window.location.hash.substring(1));
	}

	scenariosEl.addEventListener('change',function(e){
		switchScenario(e.target.value);
	});

	window.addEventListener('popstate', function(){
		if(window.location.hash){
			scenariosEl.value = window.location.hash.substring(1);
			switchScenario(window.location.hash.substring(1));
		}
	});

	function addDragHandlers(progressContainers) {

		progressContainers.parent('.party-row').mousemove(function (moveEvent) {
			console.log(moveEvent.target);
			var rowEl = this;
			if(!moveEvent.target.classList.contains('progress')){
				tooltipEl.html(rowEl.id);
				tooltipEl.style("opacity", "1");
				tooltipEl.style("left", -20 + mouseTracker.x + "px");
				tooltipEl.style("top", (-55 + mouseTracker.y) + "px");
			}
		});
		progressContainers.parent('.party-row').mouseout(function () {
			tooltipEl.style("opacity", "0");
			tooltipEl.style("left", (-20000 + mouseTracker.x) + "px");
		});

		progressContainers.find('.handle').mousedown(function (downEvent) {
			var handleEl = downEvent.target;
			var fullBar = window.jQuery(handleEl.parentNode.parentNode);
			var input = fullBar.siblings('.input').find('input');
			var bar = window.jQuery(handleEl.parentNode);

			var maxWidth = fullBar.outerWidth() - handleEl.offsetWidth;
			maxWidth = 2.0*100; //Mathieu override: we now use static width for progresses bar
			var currentPercentage = bar.outerWidth() / maxWidth;

			var trackObj = fullBar.offset();
			trackObj.width = fullBar.get(0).offsetWidth;
			trackObj.height = fullBar.get(0).offsetHeight;

			function finishDrag(){
				progressContainers.unbind("mousemove");
				progressContainers.unbind("mouseup");
				fullBar.removeClass('dragging');
				bar.removeClass('active');
			}

			progressContainers.mousemove(function (moveEvent) {
				fullBar.addClass('dragging');
				bar.addClass('active');

				var handleWidth = 10;
				var diffPercentage = ( -handleWidth+ moveEvent.pageX - downEvent.pageX) / (maxWidth -handleWidth);
				if(Math.abs(diffPercentage) > 0.01){
					var newPercentage = ((currentPercentage + diffPercentage) * 100).toFixed(1);
					if(newPercentage > -10 && newPercentage < 99){
						newPercentage = Math.max(0,newPercentage);

						//Mathieu override: using fixed width for progress bar
						bar.css('width', (newPercentage*2.0+10) + ' px)');
						input.val(newPercentage);
						electionProjector.recalculateSeats(input.get(0));
						resetEl.classList.remove('hidden');
					}
				}

			});

			window.jQuery(window).mouseup(finishDrag);

		});
	}

	addDragHandlers(window.jQuery('.progress'));

});



