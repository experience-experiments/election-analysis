var fs = require('fs');
//use this as node editsvg.js > edited.svg
var lookup = require('./2010.json');

fs.readFile("2010UKElectionMap.svg", "utf-8", function(err, data) {
	"use strict";
	var text = data;

	//remove partial paths for zoomed in views
	text = text.replace(/\s*M\s[56]\d\d\.[^,]+,[89]\d\.[^"]*z/g, 'z');
	text = text.replace(/\s*M\s[6]\d\d\.[^,]+,[1234]\d\d\.[^"]*z/g, 'z');
	text = text.replace(/\s*M\s[5][^0]\d\.[^,]+,[1234]\d\d\.[^"]*z/g, 'z');
	text = text.replace(/\s*M\s59\d\.[^,]+,44\d\.[^"]*"/g, '"');
	text = text.replace(/\s*M\s[6]\d\d\.[^,]+,[5]\d\d\.[^"]*z/g, 'z');
	text = text.replace(/\s*M\s[789]\d\d\.[^"]*z/g, 'z');
	text = text.replace(/\s*M\s[789]\d\d\.[^"]*"/g, '"');


	//set the new svg width
	text = text.replace(/width="1020"/g, 'width="690"');

	//remove metadata
	text = text.replace('<!-- Created with Inkscape (http://www.inkscape.org/) -->','');
	text = text.replace('xmlns:svg="http://www.w3.org/2000/svg" ','');

	//wrap isle of wight path into a g element
	text = text.replace(/<\/g>\s*<path d="/g,'</g>\n\t<g id="isle-of-wight">\n\t\t<path d="');
	text = text.replace(/<g id="west-sussex">/g,'\t</g>\n\t<g id="west-sussex">');

	//unwrap the g element for england
	text = text.replace(/<g id="england">/g,'');
	text = text.replace(/<\/g>\s*<\/g>/g,'</g>');


	//remove the dashed rectangles and other elements i.e. <g id="cruft">
	text = text.replace(/<g id="cruft[\s\S]*<\/g>/g,'');

	//simplify default embedded styles
	var newStyles = '\n\t<style type="text/css">\n \
		.seat {\n \
			stroke: #999;\n \
			stroke-width: 0.3;\n \
			fill: #eee;\n \
		}\n\n \
		.countyboundary {\n \
			stroke: #999;\n \
			stroke-width: 0.3;\n \
			fill: none;\n \
		}\n\t</style>\n';

	text = text.replace(/<style[\s\S]*<\/style>/g, newStyles + '\n' + '');


	//Fix invalid constituency id's
	var pathIds = data.match(/[^g] id="[^"]+"/g).map(function(item){
		return item.replace(/[^g] id="/,'').replace('"','');
	});

	var fixDirection = function(pathId, direction){
		var exempt = ['East_Ham', 'East_Kilbride__Strathaven_and_Lesmahagow', 'East_Lothian', 'West_Bromwich_East', 'West_Bromwich_West', 'West_Ham','South_Holland_and_The_Deepings','South_Ribble','South_Shields'];
		if(exempt.indexOf(pathId) === -1){
			if(pathId.indexOf(direction + '_') === 0){
				text = text.replace('"' + pathId + '"', '"' + pathId.substring(direction.length + 1) + '_' + direction + '"');
			}
		}
	};


	for(var i in pathIds){
		fixDirection(pathIds[i],'North_East');
		fixDirection(pathIds[i],'South_East');
		fixDirection(pathIds[i],'North_West');
		fixDirection(pathIds[i],'South_West');
		fixDirection(pathIds[i],'Central');
		fixDirection(pathIds[i],'Mid');
		fixDirection(pathIds[i],'East');
		fixDirection(pathIds[i],'West');
		fixDirection(pathIds[i],'North');
		fixDirection(pathIds[i],'South');

		if(pathIds[i].indexOf('The_') === 0){
			text = text.replace('"' + pathIds[i] + '"', '"' + pathIds[i].substring(4) + '__The"');
		}
		if(pathIds[i].indexOf('City_of_') === 0){
			text = text.replace('"' + pathIds[i] + '"', '"' + pathIds[i].substring(8) + '__City_of"');
		}
	}

	text = text.replace(/Birmingham__/g, 'Birmingham_');
	text = text.replace(/Brighton__/g, 'Brighton_');
	text = text.replace(/Ealing__/g, 'Ealing_');
	text = text.replace(/Southampton__/g, 'Southampton_');
	text = text.replace(/Enfield__/g, 'Enfield_');
	text = text.replace(/Sheffield__/g, 'Sheffield_');
	text = text.replace(/Lewisham__/g, 'Lewisham_');
	text = text.replace(/Kingston-upon-Hull/g, 'Hull');
	text = text.replace(/Weston-super-Mare/g,'Weston-Super-Mare');
	text = text.replace(/Newcastle-upon-Tyne/g,'Newcastle_upon_Tyne');
	text = text.replace(/Torridge_and_West_Devon/g,'Devon_West_and_Torridge');
	text = text.replace(/Holland_and_the_Deepings_South/g,'South_Holland_and_The_Deepings');

	pathIds = text.match(/[^g] id="[^"]+"/g).map(function(item){
		return item.replace(/[^g] id="/,'').replace('"','');
	});

	var missingIds = pathIds.filter(function(pathId){
		if(!lookup.hasOwnProperty(pathId)){
			return true;
		}
		return false;
	}).sort();

	var missingDataIds = [];
	for(var dataId in lookup){
		if(pathIds.indexOf(dataId) === -1 && dataId !== 'unknown'){
			missingDataIds.push(dataId);
		}
	}

	for(i in missingIds){
		text = text.replace(missingIds[i], missingDataIds[i]);
	}


	//print out the result
	console.log(text);
});
