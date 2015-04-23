(function(){
	'use strict';

	var seats;
	var selectedId = null;

	function ElectionProjector() {

		this.visibleParties = ["Con","Lab","LD"];

		this.twentyTenPercentageResult = {'con':36.1,'lab':29.1,'libdem':23,'other':11.9};
		this.previousPercentageState = {};
		this.elements = [];

	}

	ElectionProjector.prototype.initialise = function(){
		this.loadData();
		this.setTwentyTenResults();
		this.updateTotalNumberOfSeats();

	};

	ElectionProjector.prototype.resetPercentages = function(){
		this.setTwentyTenResults();
		this.updateVotes();
		this.updateTotalNumberOfSeats();
	};

	ElectionProjector.prototype.setTwentyTenResults = function() {
		for (var party in this.twentyTenPercentageResult) {
			this.previousPercentageState[party] = document.getElementById(party + '_rangeinput').value = this.twentyTenPercentageResult[party];
		}
	};

	ElectionProjector.prototype.recalculateSeats = function(node) {

		for (var party in this.twentyTenPercentageResult) {
			this.elements[party + '_rangeinput'] = document.getElementById(party + '_rangeinput').value;
		}

		this.reCalculateTo100percent(node.id);

		this.updateVotes();
		this.updateTotalNumberOfSeats();

	};

	ElectionProjector.prototype.updateVotes = function() {
		var voteDiffs = {};

		for (var party in this.twentyTenPercentageResult) {
			voteDiffs[this.partyCodeLookup(party)] = (Number(this.previousPercentageState[party]) / Number(this.twentyTenPercentageResult[party]) ) ;
		}

		var otherParties = this.getOtherParties();

		for (var i = 0; i < otherParties.length; i++) {
			voteDiffs[otherParties[i]] = voteDiffs.other;
		}

		delete voteDiffs.other; // not a valid party anymore

		for (var id in seats){
			var constituency = seats[id];
			for (var voteDiffParty in voteDiffs) {
				if(constituency.hasOwnProperty(voteDiffParty)){
					constituency[voteDiffParty + '_adjusted'] = Math.round( (constituency[voteDiffParty] * voteDiffs[voteDiffParty] ) );
				}
			}
			this.calculateSeatColor(constituency);
		}
	};

	ElectionProjector.prototype.getOtherParties = function() {
		var allParties = ["AC","AD","AGS","APNI","APP","AWL","AWP","BB","BCP","Bean","Best","BGPV","BIB","BIC","Blue","BNP","BP Elvis","C28","Cam Soc","CG","Ch M","Ch P","CIP","CITY","CNPG","Comm","Comm L","Con","Cor D","CPA","CSP","CTDP","CURE","D Lab","D Nat","DDP","DUP","ED","EIP","EPA","FAWG","FDP","FFR","Grn","GSOT","Hum","ICHC","IEAC","IFED","ILEU","Impact","Ind1","Ind2","Ind3","Ind4","Ind5","IPT","ISGB","ISQM","IUK","IVH","IZB","JAC","Joy","JP","Lab","Land","LD","Lib","Libert","LIND","LLPB","LTT","MACI","MCP","MEDI","MEP","MIF","MK","MPEA","MRLP","MRP","Nat Lib","NCDV","ND","New","NF","NFP","NICF","Nobody","NSPS","PBP","PC","Pirate","PNDP","Poet","PPBF","PPE","PPNV","Reform","Respect","Rest","RRG","RTBP","SACL","Sci","SDLP","SEP","SF","SIG","SJP","SKGP","SMA","SMRA","SNP","Soc","Soc Alt","Soc Dem","Soc Lab","South","Speaker","SSP","TF","TOC","Trust","TUSC","TUV","UCUNF","UKIP","UPS","UV","VCCA","Vote","Wessex Reg","WRP","You","Youth","YRDPL"];
		return allParties.filter(function(item){
			return this.visibleParties.indexOf(item) === -1;
		}.bind(this));
	};

	ElectionProjector.prototype.reCalculateTo100percent = function(valueChanged) {
		valueChanged = valueChanged.replace(/\_.+/,'');
		var amountChanged = this.elements[valueChanged + '_rangeinput'] - this.previousPercentageState[valueChanged];
		amountChanged = amountChanged / 3; // 3 is the number of other other parties to share adjustment accross

		// set the changed value to the state store
		this.previousPercentageState[valueChanged] = this.elements[valueChanged + '_rangeinput'];

		for (var party in this.twentyTenPercentageResult) {
			if (valueChanged !== party) {
				this.previousPercentageState[party] = this.previousPercentageState[party] - amountChanged;
				document.getElementById(party + '_rangeinput').value = this.previousPercentageState[party].toFixed(1);
			}
		}
	};

	ElectionProjector.prototype.convertToId = function(constituencyName) {
		return constituencyName.replace(/[\s,]/g,'_').replace(/&/g,'and').replace(/[()]/g,'');
	};

	ElectionProjector.prototype.loadData = function() {

		d3.json("data/2010.json", function(constituencies) {
			seats = constituencies;
			for(var id in seats) {
				this.storeVotesPerConstituency(seats[id]);
				this.calculateSeatColor(seats[id]);
			}
		}.bind(this));
	};

	ElectionProjector.prototype.storeVotesPerConstituency = function(constituency) {

		// store in an adjusted variable as well
		for (var party in constituency) {
			if (this.isValidParty(party)) {
				constituency[party + '_adjusted'] = constituency[party];
			}
		}

	};

	ElectionProjector.prototype.isValidParty = function(party) {
		var notValidParties = ['Press Association Reference','Constituency Name','Region','Election Year','Electorate','Votes'];
		return notValidParties.indexOf(party) === -1;
	};

	ElectionProjector.prototype.calculateSeatColor = function(constituency) {
		var winner = {party:null, votes:0};

		var mapSeat = d3.select('#' + this.convertToId(constituency['Constituency Name']));

		for (var party in constituency) {
			if (winner.votes < constituency[party + '_adjusted'] && this.isValidParty(party)) {
				winner.party = party;
				winner.votes = constituency[party + '_adjusted'];
			}
		}

		this.setSeatColor(mapSeat, winner.party);
		//mapSeat.on('click',this.constituencyClickHandler);
	};

	ElectionProjector.prototype.setSeatColor = function(ref, party) {
		var style = this.setStyle(party);
		ref.attr('class', style + ' seat');
	};

	ElectionProjector.prototype.partyCodeLookup = function(party) {
		switch (party) {
		case 'con':
			return 'Con';
		case 'lab':
			return 'Lab';
		case 'libdem':
			return 'LD';
		default:
			return 'other';
		}
	};

	ElectionProjector.prototype.updateTotalNumberOfSeats = function(){
		var elems = document.querySelectorAll('.legend li');
		for(var i in elems){
			if(typeof elems[i] === 'object'){
				var adjustedSeatCount = document.querySelectorAll('svg g *.' + elems[i].className + '.seat').length;
				elems[i].querySelector('span.badge').innerHTML = adjustedSeatCount;
			}
		}

	};

	ElectionProjector.prototype.setStyle = function(party) {
		var styles = {'Lab':'labour','Con':'tory','LD':'libdem','SNP':'snp','Grn':'green','Respect':'respect','SDLP':'sdlp','PC':'pc','DUP':'dup','UUP':'uup','SF':'sf','UKIP':'ukip'};
		return styles?styles[party] : 'unknown';
	};

	ElectionProjector.prototype.constituencyClickHandler = function() {

		selectedId = this.getAttribute('id');
		//var selectedSeat = seats[selectedId];

		/*
		var tableEl = document.querySelector('.detail table');
		var nameEl = tableEl.querySelector('th');
		var tbodyEl = tableEl.querySelector('tbody');

		if(selectedSeat){
			tableEl.classList.remove('hidden');
			nameEl.innerHTML = selectedSeat['Constituency Name'];
			tbodyEl.innerHTML = '';

			var votes = [];
			for(var i in selectedSeat){
				if(selectedSeat.hasOwnProperty(i) && i.indexOf('adjusted') > -1){
					votes.push(i);
				}
			}
			var sorted = votes.sort(function(a, b){
				return selectedSeat[a] <= selectedSeat[b];
			});

			for(var j in sorted){
				tbodyEl.innerHTML += '<tr><td>' + sorted[j].substring(0, sorted[j].indexOf('adjusted') - 1) + '</td><td>' + selectedSeat[sorted[j]] + '</td></tr>';
			}

		} else {
			console.log('No seat found for ' + selectedId + ': ' + JSON.stringify(selectedSeat));
		}
		 */

	};

	ElectionProjector.prototype.clearSelection = function(){
		//var tableEl = document.querySelector('.detail table');
		//tableEl.classList.add('hidden');
	};

	if(!window.ElectionProjector){
		window.ElectionProjector = ElectionProjector;
	}
	return ElectionProjector;
})();
