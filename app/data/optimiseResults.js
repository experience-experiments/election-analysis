var convertedJson = require('./convertcsv.json');

function convertToId(constituencyName){
	return constituencyName.replace(/[\s,]/g,'_').replace(/&/g,'and').replace(/[()]/g,'');
}

var mapped = [];

for(var i in convertedJson){
	var item = convertedJson[i];
	for(var attr in item){
		if(item[attr] === null){
			delete item[attr];
		}
	}
	mapped[convertToId(item["Constituency Name"])] = item;
}



console.log(mapped);
