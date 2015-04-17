var convertedJson = require('./convertcsv.json');

function convertToId(constituencyName){
	return constituencyName.replace(/[\s,]/g,'_').replace(/&/g,'and').replace(/[()]/g,'');
}

var constituencyMap = {};

for(var i in convertedJson){
	var item = convertedJson[i];

	for(var attr in item){
		if(item[attr] === null){
			delete item[attr];
		}
	}
	delete item['Election Year'];

	var id = convertToId(item['Constituency Name']);
	if(id === ''){
		id = 'unknown';
		item['Constituency Name'] = 'Unknown';
	}

	constituencyMap[id] = item;
}

console.log(JSON.stringify(constituencyMap));
