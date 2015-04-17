(function(){
	function mapConvertor() {

		this.visibleParties = ["Con","Lab","LD"];

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
		var voteDiffs = {};

		for (var party in this.twentyTenPercentageResult) {
			console.log('party ' + party + ' ' + this.twentyTenPercentageResult[party] + ' ' + this.previousPercentageState[party]);
			voteDiffs[this.partyCodeLookup(party)] = (Number(this.previousPercentageState[party]) / Number(this.twentyTenPercentageResult[party]) ) ;
			console.log('result: ' + voteDiffs[this.partyCodeLookup(party)]);
		}

		var otherParties = this.getOtherParties();

		for (var i = 0; i < otherParties.length; i++) {
			voteDiffs[otherParties[i]] = voteDiffs['other'];
		}

		delete voteDiffs['other']; // not a valid party anymore

		for (var id in this.seats){
			var constituency = this.seats[id];
			for (var voteDiffParty in voteDiffs) {
				var adjustedVotes = Math.round( (constituency[voteDiffParty] * voteDiffs[voteDiffParty] ) );
				constituency[voteDiffParty + '_adjusted'] = adjustedVotes;
			}
			this.calculateSeatColor(constituency);
		}
	};

	mapConvertor.prototype.getOtherParties = function() {
		var allParties = ["AC","AD","AGS","APNI","APP","AWL","AWP","BB","BCP","Bean","Best","BGPV","BIB","BIC","Blue","BNP","BP Elvis","C28","Cam Soc","CG","Ch M","Ch P","CIP","CITY","CNPG","Comm","Comm L","Con","Cor D","CPA","CSP","CTDP","CURE","D Lab","D Nat","DDP","DUP","ED","EIP","EPA","FAWG","FDP","FFR","Grn","GSOT","Hum","ICHC","IEAC","IFED","ILEU","Impact","Ind1","Ind2","Ind3","Ind4","Ind5","IPT","ISGB","ISQM","IUK","IVH","IZB","JAC","Joy","JP","Lab","Land","LD","Lib","Libert","LIND","LLPB","LTT","MACI","MCP","MEDI","MEP","MIF","MK","MPEA","MRLP","MRP","Nat Lib","NCDV","ND","New","NF","NFP","NICF","Nobody","NSPS","PBP","PC","Pirate","PNDP","Poet","PPBF","PPE","PPNV","Reform","Respect","Rest","RRG","RTBP","SACL","Sci","SDLP","SEP","SF","SIG","SJP","SKGP","SMA","SMRA","SNP","Soc","Soc Alt","Soc Dem","Soc Lab","South","Speaker","SSP","TF","TOC","Trust","TUSC","TUV","UCUNF","UKIP","UPS","UV","VCCA","Vote","Wessex Reg","WRP","You","Youth","YRDPL"];
		return allParties.filter(function(item){
			return this.visibleParties.indexOf(item) === -1;
		}.bind(this));
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

	mapConvertor.prototype.convertToId = function(constituencyName) {
		return constituencyName.replace(/[\s,]/g,'_').replace(/&/g,'and').replace(/[()]/g,'');
	};

	mapConvertor.prototype.loadData = function() {

		d3.json("data/2010.json", function(seats) {
			this.seats = seats;
			for(var id in seats) {
				this.storeVotesPerConstituency(seats[id]);
				this.calculateSeatColor(seats[id]);
			}
		}.bind(this));
	};

	mapConvertor.prototype.storeVotesPerConstituency = function(seat) {

		// store in an adjusted variable as well
		for (var party in seat) {
			if (this.isValidParty(party)) {
				seat[party + '_adjusted'] = seat[party];
			}
		}

	};

	mapConvertor.prototype.isNotAMainParty = function(partyCode) {
		var mainParties = ['Con','Lab','LD'];
		return !(mainParties.indexOf(partyCode) > -1);
	};

	mapConvertor.prototype.isValidParty = function(party) {
		var notValidParties = ['Press Association Reference','Constituency Name','Region','Election Year','Electorate','Votes'];
		return !(notValidParties.indexOf(party) > -1);
	};

	mapConvertor.prototype.calculateSeatColor = function(seat) {
		var winner = {party:null, votes:0};

		var mapSeat = d3.select('#' + this.convertToId(seat['Constituency Name']));

		for (var party in seat) {
			if (winner.votes < seat[party + '_adjusted'] && this.isValidParty(party)) {
				winner.party = party;
				winner.votes = seat[party + '_adjusted'];
			}
		}

		this.setSeatColor(mapSeat, winner.party);
		mapSeat.on('click',this.constituencyClickHandler);
	};

	mapConvertor.prototype.setSeatColor = function(ref, party) {
		var style = this.setStyle(party);
		ref.attr('class', style + ' seat');
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
		return styles?styles[party] : 'unknown';
	};

	mapConvertor.prototype.constituencyClickHandler = function() {
		var id = this.getAttribute('id');
		console.log(id + ': ' + this.seats[id]);
	};

	if(!window.mapConvertor){
		window.mapConvertor = mapConvertor;
	}
	return mapConvertor;
})();

