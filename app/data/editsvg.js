var fs = require('fs');
//use this as node editsvg.js > edited.svg

fs.readFile("2010UKElectionMap.svg", "utf-8", function(err, data) {
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
			stroke: black;\n \
			stroke-width: 0.5;\n \
			fill: #eee;\n \
		}\n\n \
		.countyboundary {\n \
			stroke: black;\n \
			stroke-width: 1;\n \
			fill: none;\n \
		}\n\t</style>\n';

	text = text.replace(/<style[\s\S]*<\/style>/g, newStyles + '\n' + '');

	//print out the result
	console.log(text);
});
