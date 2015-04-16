var fs = require('fs');
//use this as node editsvg.js > edited.svg

fs.readFile("constituencies2010.svg", "utf-8", function(err, data) {
	var data = data.replace(/\s*M\s[56]\d\d\.[^,]+,[89]\d\..*z/g, 'z');
	data = data.replace(/\s*M\s[6]\d\d\.[^,]+,[1234]\d\d\..*z/g, 'z');
	data = data.replace(/\s*M\s[5][^0]\d\.[^,]+,[1234]\d\d\..*z/g, 'z');
	data = data.replace(/\s*M\s59\d\.[^,]+,44\d\..*"/g, '"');
	data = data.replace(/\s*M\s[6]\d\d\.[^,]+,[5]\d\d\..*z/g, 'z');
	data = data.replace(/\s*M\s[789]\d\d\..*z/g, 'z');
	data = data.replace(/\s*M\s[789]\d\d\..*"/g, '"');
	data = data.replace(/width="1020"/g, 'width="690"');

	console.log(data);
});
