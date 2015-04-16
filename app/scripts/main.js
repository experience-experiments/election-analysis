function mapConvertor() {
	mapConvertor.isSVGLoaded();
	mapConvertor.numberOfUndefinedMapItems = 0;
	
	mapConvertor.twentyTenPercentageResult = {'con':36.1,'lab':29.1,'libdem':23,'other':11.9};
	mapConvertor.previousPercentageState = {};
	mapConvertor.setTwentyTenResults();
	mapConvertor.updateRangeValues();
};

mapConvertor.setTwentyTenResults = function() {
	for (party in mapConvertor.twentyTenPercentageResult) {
		mapConvertor.previousPercentageState[party] = document.getElementById(party + '_rangeinput').value = mapConvertor.twentyTenPercentageResult[party];
	}	
};

mapConvertor.recalculateSeats = function(node) {	
	
	for (party in mapConvertor.twentyTenPercentageResult) {
		mapConvertor[party + '_rangeinput'] = document.getElementById(party + '_rangeinput').value;
	}	
	
	mapConvertor.reCalculateTo100percent(node.id); 
	mapConvertor.updateRangeValues();

	mapConvertor.updateVotes();

};


mapConvertor.updateVotes = function() {
	var increaseInVotes = 0,
		voteDiffs = {},
		aSeat;
		otherParties = [];

	// calculate the percentage changes
	for (party in mapConvertor.twentyTenPercentageResult) {
		console.log('party ' + party + ' ' + mapConvertor.twentyTenPercentageResult[party] + ' ' + mapConvertor.previousPercentageState[party]);
		voteDiffs[mapConvertor.partyCodeLookup(party)] = (Number(mapConvertor.previousPercentageState[party]) / Number(mapConvertor.twentyTenPercentageResult[party]) ) ;		
		console.log('result: ' + voteDiffs[mapConvertor.partyCodeLookup(party)]);
	}	

	// copy other difference and create the other parties
	for (aSeat in this.mapSeatLookup) break;
	
	otherParties = this.getOtherParties(aSeat);
	
	for (var i = 0; i < otherParties.length; i++) {
		//console.log(otherParties[i]);
		voteDiffs[otherParties[i]] = voteDiffs['other'];
	}

	delete voteDiffs['other']; // not a valid party anymore


	for (constituency in this.mapSeatLookup){	
		
		//if (constituency === 'Brighton Pavilion') {

		for (voteDiffParty in voteDiffs) {
			
			//console.log('Difference in vote ' + voteDiffParty + ' ' + voteDiffs[voteDiffParty]);

			//console.log('Before: constituency ' + constituency + ' ' + voteDiffParty + ' votes ' + this.mapSeatLookup[constituency].result[voteDiffParty] );
			adjustedVotes = Math.round( (this.mapSeatLookup[constituency].result[voteDiffParty] * voteDiffs[voteDiffParty] ) );

			//console.log('votes for ' + voteDiffParty + ' would change to ' + adjustedVotes);

			this.mapSeatLookup[constituency].result[voteDiffParty + '_adjusted'] = adjustedVotes; 			
			//console.log('after: constituency ' + constituency + ' ' + voteDiffParty + ' votes ' + this.mapSeatLookup[constituency].result[voteDiffParty + '_adjusted'] );
			
		}
		this.calculateSeatColor(this.mapSeatLookup[constituency].result);	

		//}
	}


};

mapConvertor.getOtherParties = function(aSeat) {
	var otherParties = [];
	for (partyCode in this.mapSeatLookup[aSeat].result) {
		//TODO now add to VoteDiffs each of the valid party names.
		if (partyCode.indexOf('_adjusted') < 0 
			&& this.isValidParty(partyCode) 
			&& this.isNotAMainParty(partyCode)) {
			//console.log(partyCode + ' ' + this.isNotAMainParty(partyCode) );
			otherParties.push(partyCode)
		}		
	} 
	return otherParties;
};

mapConvertor.reCalculateTo100percent = function(value_changed) {	
	value_changed = value_changed.replace(/\_.+/,'');
	var amountChanged = mapConvertor[value_changed + '_rangeinput'] - this.previousPercentageState[value_changed];
	amountChanged = amountChanged / 3; // 3 is the number of other other parties to share adjustment accross

	// set the changed value to the state store 
	this.previousPercentageState[value_changed] = mapConvertor[value_changed + '_rangeinput'];

	for (party in mapConvertor.twentyTenPercentageResult) {
		if (value_changed !== party) {
			this.previousPercentageState[party] = this.previousPercentageState[party] - amountChanged;
			document.getElementById(party + '_rangeinput').value = this.previousPercentageState[party]		
		}
	}
};


mapConvertor.updateRangeValues = function() {
	for (party in mapConvertor.twentyTenPercentageResult) {
		document.getElementById(party + '_rangevalue').value = Math.ceil(mapConvertor.previousPercentageState[party] * 10) / 10;
	}
};


// Below is for loading the map and associated data
mapConvertor.isSVGLoaded = function() {
	this.loadData();
};

mapConvertor.loadData = function() {
	 
	d3.json("data/SeatLookup.json", function(mapSeats) {
		mapConvertor.mapSeatLookup = {};
		for (var i = 0; i < mapSeats.length; i++) {
			mapConvertor.mapSeatLookup[mapSeats[i].Constituency] = {'seatId':mapSeats[i].Seat,result:{}}; 
		}
	});
	
	d3.json("data/convertcsv.json", function(seats) {
		for (var i = 0; i < seats.length; i++) {
			mapConvertor.storeVotesPerConstituency(seats[i]);
			mapConvertor.calculateSeatColor(seats[i]);
		}
	});
};

mapConvertor.storeVotesPerConstituency = function(seat) {
	
	// store in an adjusted variable as well
	for (party in seat) {
		if (this.isValidParty(party)) {
			seat[party + '_adjusted'] = seat[party];
		}
	}
	if ( this.mapSeatLookup[seat["Constituency Name"]] ) {
		this.mapSeatLookup[seat["Constituency Name"]].result = seat; 	
	}
};

mapConvertor.isNotAMainParty = function(partyCode) {
	var mainParties = ['Con','Lab','LD'];

	return (mainParties.indexOf(partyCode) > -1) ? false:true;
}

mapConvertor.isValidParty = function(party) {
	var notValidParties = ['Press Association Reference','Constituency Name','Region','Election Year','Electorate','Votes'];
	return (notValidParties.indexOf(party) > -1) ? false: true;
};



mapConvertor.calculateSeatColor = function(seat) {
	var winner = {party:null,votes:0};
	var mapSeat = this.getMapSeat(seat["Constituency Name"]);

	for (party in seat) {
		if (winner.votes < seat[party + '_adjusted']  
			&& this.isValidParty(party)) {
			winner.party = party;
			winner.votes = seat[party + '_adjusted'];
		}
	}
	
	this.setSeatColor(mapSeat,winner.party);
	this.setConstituencyName(mapSeat,seat["Constituency Name"]);
	this.setClickHandlers();
};

mapConvertor.setConstituencyName = function(ref,constituency) {
	if (!ref) {
		this.numberOfUndefinedMapItems++;
		//console.log(mapConvertor.numberOfUndefinedMapItems + ' ' + ref + ' ' + constituency);
	}

	d3.select('#' + ref).attr('constituency',constituency);
};

mapConvertor.setClickHandlers = function() {
	d3.selectAll('path').on('click',mapConvertor.constituencyClickHandler)
};


mapConvertor.setSeatColor = function(ref, party) {	
	var style = this.setStyle(party);

 	d3.select('#' + ref)
		.attr('class',style + ' seat');
};

mapConvertor.getMapSeat = function(constituency) {
	if ( this.mapSeatLookup[constituency] ) {
		return this.mapSeatLookup[constituency].seatId;
	} else {
		return;
	}
};

mapConvertor.partyCodeLookup = function(party) {
	switch(party) {
		case 'con':
			return 'Con';
			break;
		case 'lab':
			return 'Lab';
			break;
		case 'libdem':
			return 'LD';
			break;
		default:
			return 'other';		
	} 

};

mapConvertor.setStyle = function(party) {
	var styles = {'Lab':'labour','Con':'tory','LD':'libdem','SNP':'snp','Grn':'grn','PC':'pc','Respect':'respect','SDLP':'sdlp','PC':'pc','DUP':'dup','UUP':'uup','SF':'sf','UKIP':'ukip'};
	//todo handle the independent styles

	return styles?styles[party] : 'unknown';
};

mapConvertor.constituencyClickHandler = function() {
	var votes;
	
	if (!this.getAttribute('constituency')) {
		console.log(this.getAttribute('id') + ' - no constituency set ');

		return;
	}
	//console.log(mapConvertor.mapSeatLookup[this.getAttribute('constituency')].result['Con_adjusted']);	
	console.log(this.getAttribute('constituency'));

	for(party in mapConvertor.mapSeatLookup[this.getAttribute('constituency')].result) {
		votes = mapConvertor.mapSeatLookup[this.getAttribute('constituency')].result[party];

		// if (votes > 1 && mapConvertor.isValidParty(party))
		// 	console.log(party + ' ' + votes);
	}


	// for(attribute in this.attributes) {
	// 	console.log(this.attributes[attribute].getAttribute('constituency') );
	// 	if (this.attributes[attribute] === 'constituency') {
	// 		console.log('hello');
	// 	}
	// }

};

var votingMap = new mapConvertor();

