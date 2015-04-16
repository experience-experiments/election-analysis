(function(){
	function mapConvertor() {

		this.numberOfUndefinedMapItems = 0;
		this.twentyTenPercentageResult = {'con':36.1,'lab':29.1,'libdem':23,'other':11.9};
		this.previousPercentageState = {};
		this.elements = [];

	};

	mapConvertor.prototype.init = function(){
		this.loadData();
		this.setTwentyTenResults();
		this.updateRangeValues();
	};


	mapConvertor.prototype.setTwentyTenResults = function() {
		for (var party in this.twentyTenPercentageResult) {
			this.previousPercentageState[party] = document.getElementById(party + '_rangeinput').value = this.twentyTenPercentageResult[party];
		}
	};

	mapConvertor.prototype.recalculateSeats = function(node) {

		for (var party in this.twentyTenPercentageResult) {
			this.elements[party + '_rangeinput'] = document.getElementById(party + '_rangeinput').value;
		}

		this.reCalculateTo100percent(node.id);
		this.updateRangeValues();

		this.updateVotes();

	};


	mapConvertor.prototype.updateVotes = function() {
		var increaseInVotes = 0,
			voteDiffs = {},
			aSeat;
		var otherParties = [];

		// calculate the percentage changes
		for (var party in this.twentyTenPercentageResult) {
			console.log('party ' + party + ' ' + this.twentyTenPercentageResult[party] + ' ' + this.previousPercentageState[party]);
			voteDiffs[this.partyCodeLookup(party)] = (Number(this.previousPercentageState[party]) / Number(this.twentyTenPercentageResult[party]) ) ;
			console.log('result: ' + voteDiffs[this.partyCodeLookup(party)]);
		}

		// copy other difference and create the other parties
		for (aSeat in this.mapSeatLookup) break;

		otherParties = this.getOtherParties(aSeat);

		for (var i = 0; i < otherParties.length; i++) {
			//console.log(otherParties[i]);
			voteDiffs[otherParties[i]] = voteDiffs['other'];
		}

		delete voteDiffs['other']; // not a valid party anymore


		for (var constituency in this.mapSeatLookup){

			//if (constituency === 'Brighton Pavilion') {

			for (var voteDiffParty in voteDiffs) {

				//console.log('Difference in vote ' + voteDiffParty + ' ' + voteDiffs[voteDiffParty]);

				//console.log('Before: constituency ' + constituency + ' ' + voteDiffParty + ' votes ' + this.mapSeatLookup[constituency].result[voteDiffParty] );
				var adjustedVotes = Math.round( (this.mapSeatLookup[constituency].result[voteDiffParty] * voteDiffs[voteDiffParty] ) );

				//console.log('votes for ' + voteDiffParty + ' would change to ' + adjustedVotes);

				this.mapSeatLookup[constituency].result[voteDiffParty + '_adjusted'] = adjustedVotes;
				//console.log('after: constituency ' + constituency + ' ' + voteDiffParty + ' votes ' + this.mapSeatLookup[constituency].result[voteDiffParty + '_adjusted'] );

			}
			this.calculateSeatColor(this.mapSeatLookup[constituency].result);

			//}
		}


	};

	mapConvertor.prototype.getOtherParties = function(aSeat) {
		var otherParties = [];
		for (var partyCode in this.mapSeatLookup[aSeat].result) {
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

	mapConvertor.prototype.reCalculateTo100percent = function(value_changed) {
		value_changed = value_changed.replace(/\_.+/,'');
		var amountChanged = this.elements[value_changed + '_rangeinput'] - this.previousPercentageState[value_changed];
		amountChanged = amountChanged / 3; // 3 is the number of other other parties to share adjustment accross

		// set the changed value to the state store
		this.previousPercentageState[value_changed] = this.elements[value_changed + '_rangeinput'];

		for (var party in this.twentyTenPercentageResult) {
			if (value_changed !== party) {
				this.previousPercentageState[party] = this.previousPercentageState[party] - amountChanged;
				document.getElementById(party + '_rangeinput').value = this.previousPercentageState[party]
			}
		}
	};


	mapConvertor.prototype.updateRangeValues = function() {
		for (var party in this.twentyTenPercentageResult) {
			document.getElementById(party + '_rangevalue').value = Math.ceil(this.previousPercentageState[party] * 10) / 10;
		}
	};

	mapConvertor.prototype.loadData = function() {

		d3.json("data/SeatLookup.json", function(mapSeats) {
			this.mapSeatLookup = {};
			for (var i = 0; i < mapSeats.length; i++) {
				this.mapSeatLookup[mapSeats[i].Constituency] = {'seatId':mapSeats[i].Seat,result:{}};
			}
		}.bind(this));

		d3.json("data/convertcsv.json", function(seats) {
			for (var i = 0; i < seats.length; i++) {
				this.storeVotesPerConstituency(seats[i]);
				this.calculateSeatColor(seats[i]);
			}
		}.bind(this));
	};

	mapConvertor.prototype.storeVotesPerConstituency = function(seat) {

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

	mapConvertor.prototype.isNotAMainParty = function(partyCode) {
		var mainParties = ['Con','Lab','LD'];

		return (mainParties.indexOf(partyCode) > -1) ? false:true;
	}

	mapConvertor.prototype.isValidParty = function(party) {
		var notValidParties = ['Press Association Reference','Constituency Name','Region','Election Year','Electorate','Votes'];
		return (notValidParties.indexOf(party) > -1) ? false: true;
	};



	mapConvertor.prototype.calculateSeatColor = function(seat) {
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

	mapConvertor.prototype.setConstituencyName = function(ref,constituency) {
		if (!ref) {
			this.numberOfUndefinedMapItems++;
		}

		d3.select('#' + ref).attr('constituency',constituency);
	};

	mapConvertor.prototype.setClickHandlers = function() {
		d3.selectAll('path').on('click',this.constituencyClickHandler)
	};


	mapConvertor.prototype.setSeatColor = function(ref, party) {
		var style = this.setStyle(party);

		d3.select('#' + ref)
			.attr('class',style + ' seat');
	};

	mapConvertor.prototype.getMapSeat = function(constituency) {
		if ( this.mapSeatLookup[constituency] ) {
			return this.mapSeatLookup[constituency].seatId;
		} else {
			return;
		}
	};

	mapConvertor.prototype.partyCodeLookup = function(party) {
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

	mapConvertor.prototype.setStyle = function(party) {
		var styles = {'Lab':'labour','Con':'tory','LD':'libdem','SNP':'snp','Grn':'grn','PC':'pc','Respect':'respect','SDLP':'sdlp','PC':'pc','DUP':'dup','UUP':'uup','SF':'sf','UKIP':'ukip'};
		//todo handle the independent styles

		return styles?styles[party] : 'unknown';
	};

	mapConvertor.prototype.constituencyClickHandler = function() {
		var votes;

		if (!this.getAttribute('constituency')) {
			console.log(this.getAttribute('id') + ' - no constituency set ');

			return;
		}

		console.log(this.getAttribute('constituency'));

		for(var party in this.mapSeatLookup[this.getAttribute('constituency')].result) {
			votes = this.mapSeatLookup[this.getAttribute('constituency')].result[party];
		}

	};

	if(!window.mapConvertor){
		window.mapConvertor = mapConvertor;
	}
	return mapConvertor;
})();

