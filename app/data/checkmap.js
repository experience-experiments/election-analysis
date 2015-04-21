var fs = require('fs');

var lookup = require('./2010.json');

fs.readFile("edited.svg", "utf-8", function(err, data) {

	var pathIds = data.match(/[^g] id="[^"]+"/g).map(function(item){
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

	console.log('From SVG: ' + missingIds.length + ', From JSON: ' + missingDataIds.length);
	for(var i in missingIds){
		console.log(missingIds[i] + ', ' + missingDataIds[i]);
	}

});
