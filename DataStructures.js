//Each detector will have its own data structure for ferrying information 
//from the ODB (or elsewhere) to the instance of the monitoring service
//for that detector.  Also, each detector will have a key map which matches
//monitoring service array indices to detector element name, and to ODB
//index.

HVDS = function(rows, cols){
	var i,j;
	//data arrays:
	this.channelName = [];
    this.demandVoltage = [];
    this.reportVoltage = [];
    this.reportCurrent = [];
    this.demandVrampUp = [];
    this.demandVrampDown = [];
    this.reportTemperature = [];
    this.channelMask = [];
    this.alarmStatus = [];
    this.rampStatus = [];
    this.voltLimit = [];
    this.currentLimit = [];
    for(i=0; i<rows; i++){
    	this.channelName[i] = [];
        this.demandVoltage[i] = [];
        this.reportVoltage[i] = [];
        this.reportCurrent[i] = [];
        this.demandVrampUp[i] = [];
        this.demandVrampDown[i] = [];
        this.reportTemperature[i] = [];
        this.channelMask[i] = [];
        this.alarmStatus[i] = [];
        this.rampStatus[i] = [];
        this.voltLimit[i] = [];
        this.currentLimit[i] = [];
        for(j=0;j<cols;j++){
        	this.alarmStatus[i][j] = [];
        }
    }
}

HVBarDS = function(){
    this.barChartData = [];
    this.barChartAlarms = [];
}

SHARCDS = function(){
	//data arrays:
	this.HV = [];
	this.thresholds = [];
	this.rate = [];

	//key map
	//todo
}

HPGeDS = function(){
	//data arrays:
	this.summaryHPGeHV = [];
	this.summaryHPGethreshold = [];
	this.summaryHPGerate = [];
	this.summaryBGOHV = [];
	this.summaryBGOthreshold = [];
	this.summaryBGOrate = [];

	this.detailHPGeHV = [];
	this.detailHPGethreshold = [];
	this.detailHPGerate = [];
	this.detailBGOHV = [];
	this.detailBGOthreshold = [];
	this.detailBGOrate = [];

}

DESCANTDS = function(){
	var i,j;

	//data arrays:
	this.HV = [];
	this.thresholds = [];
	this.rate = [];

	//ODB paths & keys for each type of info:
	this.HVpath = 'some/path';
	this.thresholdsPath = 'need/a/function';
	this.ratePath = 'to/determine/these';

	//key map
	this.key = [];
	for(i=0; i<70; i++){
		this.key[i] = [];
		//generate names
		if(i<10)
			this.key[i][0] = 'DSC0' +i+ 'XN00X';
		else
			this.key[i][0] = 'DSC' +i+ 'XN00X';
	}

}

PACESDS = function(){
	//data arrays:
	this.HV = [];
	this.thresholds = [];
	this.rate = [];

	//key map
	//todo
}

DANTEDS = function(){
	//data arrays:
	this.HV = [];
	this.thresholds = [];
	this.rate = [];

	//key map
	//todo
}

BAMBINODS = function(mode){
	//data arrays:
	this.HV = [];
	this.thresholds = [];
	this.rate = [];

	//key map
	/*
	this.key = [];
	if(mode == 'S2'){

	} else if(mode == 'S3'){

	}
	*/
}

SCEPTARDS = function(){
	//data arrays:
	this.HV = [];
	this.thresholds = [];
	this.rate = [];

	//key map
	this.key = [];
	for(i=0; i<20; i++){
		this.key[i] = [];
		//generate names
		if(i<10)
			this.key[i][0] = 'SEP0'+i+'XN00X';
		else
			this.key[i][0] = 'SEP'+i+'XN00X';
	}	
	this.key[20] = [];
	this.key[20][0] = 'ZDS01XN00X';
}

SPICEDS = function(){
	var i;

	//data arrays:
	this.HV = [];
	this.thresholds = [];
	this.rate = [];

	//key map
	this.key = [];
	for(i=0; i<120; i++){
		this.key[i] = [];
		//generate names
		if(i<10)
			this.key[i][0] = 'SPI00XN00'+i;
		else if(i<100)
			this.key[i][0] = 'SPI00XN0'+i;
		else 
			this.key[i][0] = 'SPI00XN'+i;
	}
}

/*
TIPDS = function(){
	var i, j;

	//data arrays:
	this.CsIHV = [];
	this.CsIthresholds = [];
	this.CsIrate = [];

	this.summaryHPGeHV = [];
	this.summaryHPGethreshold = [];
	this.summaryHPGerate = [];
	this.summaryBGOHV = [];
	this.summaryBGOthreshold = [];
	this.summaryBGOrate = [];

	this.detailHPGeHV = [];
	this.detailHPGethreshold = [];
	this.detailHPGerate = [];
	this.detailBGOHV = [];
	this.detailBGOthreshold = [];
	this.detailBGOrate = [];
	
	//key map, format: key[griffin.js index number][pointer]
	//index 0-23: CsI wall elements TPW001P00X - TPW023P00X
	//index 24-35: HPGe crystal summaries, GBWR x3
	//index 36-47: BGO summaries, GBWR x3
	//index 48-55: HPGe detail (rate view), G(a)G(b)B(a)B(b)W(a)W(b)R(a)R(b) clover 0
	//index 56-59: BGO back detail (rate view), GBRW clover 0
	//index 60-67: BGO side detail (rate view), G(a)G(b)B(a)B(b)W(a)W(b)R(a)R(b) clover 0
	//index 68-75: BGO front detail (rate view), G(a)G(b)B(a)B(b)W(a)W(b)R(a)R(b) clover 0
	//index 76-103: As 48-75, for clover 1
	//index 104-131: As 48-75, for clover 2
	//index 132-135: HPGe detail (HV), GBWR clover 0
	//index 136-143: BGO back detail (HV), G(a)G(b)B(a)B(b)W(a)W(b)R(a)R(b) clover 0
	//index 144-159: BGO side detail (HV), G(a)G(b)B(a)B(b)W(a)W(b)R(a)R(b) clover 0
	//index 160-175: BGO front detail (HV), G(a)G(b)B(a)B(b)W(a)W(b)R(a)R(b) clover 0
	//index 176-219: As 132-175, for clover 1
	//index 220-263: As 132-175, for clover 2

	//pointer == 0: Greg's name
	//pointer == 1: index in scalar rate json object
	//pointer == 2: FSCP index
	this.key = [];
	for(i=0; i<264; i++)
		this.key[i] = [];
	//generate names//////////////////////////////////////
	//CsI wall:
	this.key[0][0]  = 'TPW011P00X';
	this.key[1][0]  = 'TPW012P00X';
	this.key[2][0]  = 'TPW013P00X';
	this.key[3][0]  = 'TPW014P00X';
	this.key[4][0]  = 'TPW015P00X';
	this.key[5][0]  = 'TPW010P00X';
	this.key[6][0]  = 'TPW002P00X';
	this.key[7][0]  = 'TPW003P00X';
	this.key[8][0]  = 'TPW004P00X';
	this.key[9][0]  = 'TPW016P00X';
	this.key[10][0] = 'TPW009P00X';
	this.key[11][0] = 'TPW001P00X';
	this.key[12][0] = 'TPW005P00X';
	this.key[13][0] = 'TPW017P00X';
	this.key[14][0] = 'TPW024P00X';
	this.key[15][0] = 'TPW008P00X';
	this.key[16][0] = 'TPW007P00X';
	this.key[17][0] = 'TPW006P00X';
	this.key[18][0] = 'TPW018P00X';
	this.key[19][0] = 'TPW023P00X';
	this.key[20][0] = 'TPW022P00X';
	this.key[21][0] = 'TPW021P00X';
	this.key[22][0] = 'TPW020P00X';
	this.key[23][0] = 'TPW019P00X';		

	//HPGe + BGO summaries: todo
	//HPGe + BGO rate detail:
	var color = ['G', 'B', 'W', 'R'];
	var half = ['A', 'B'];
	var chIndex;
	for(j=0; j<3; j++){
		//HPGe
		for(i=0; i<8; i++){
			chIndex = 48+28*j+i;
			this.key[chIndex][0] = 'GRG0'+ (j+1) + color[Math.floor(i/2)] + 'N00' + half[i%2];
		}
		//BGO
		for(i=0; i<20; i++){
			chIndex = 56+28*j+i;
			if(i<4) this.key[chIndex][0] = 'GRS0' + (j+1) + color[i] + 'XXXX'
			else this.key[chIndex][0] = 'GRS0' + (j+1) + color[Math.floor((i-4)/2)%4] + 'XXXX'
		}

	}
	//HPGe + BGO HV detail: todo

	//figure out where this name is sitting in the JSON scalar rate array and in the FSCP table
    //alert(window.JSONPstore['scalar'][91]['fName'])
	for(i=0; i<this.key.length; i++){
		this.key[i][1] = -1;
		this.key[i][2] = -1;
		if(window.JSONPstore['scalar']){
	        for(j=0; j<window.JSONPstore['scalar'].length; j++){
    	        if(window.JSONPstore['scalar'][j].fName == this.key[i][0])
        	      	this.key[i][1] = j;
        	}
        }
        if(window.JSONPstore['parameters']){
	        for(j=0; j<window.codex.Name.length; j++){
    	    	if(window.codex.Name[j] == this.key[i][0])
        			this.key[i][2] = j;
        	}
        }

    }
    
}
*/

TIPDS = function(){
	var i, j, name, key;

	this.CsIwall = {};
	for(i=1; i<25; i++){
		var name = (i<10) ? 'TPW00'+i+'P00X' : 'TPW0'+i+'P00X';
		this.CsIwall[name] = {
			'HV'		: 0,
			'threshold' : 500,
			'rate' 		: 100*i,

			'oldHVcolor' : '#000000',
			'HVcolor'	 : '#000000',
			'oldThresholdColor' : '#000000',
			'thresholdColor' : '#000000',
			'oldRateColor' : '#000000',
			'rateColor' : '#000000'	
		}
	}
	this.CsIwall['TPW011P00X']['index'] = 0;
	this.CsIwall['TPW012P00X']['index'] = 1;
	this.CsIwall['TPW013P00X']['index'] = 2;
	this.CsIwall['TPW014P00X']['index'] = 3;
	this.CsIwall['TPW015P00X']['index'] = 4;
	this.CsIwall['TPW010P00X']['index'] = 5;
	this.CsIwall['TPW002P00X']['index'] = 6;
	this.CsIwall['TPW003P00X']['index'] = 7;
	this.CsIwall['TPW004P00X']['index'] = 8;
	this.CsIwall['TPW016P00X']['index'] = 9;
	this.CsIwall['TPW009P00X']['index'] = 10;
	this.CsIwall['TPW001P00X']['index'] = 11;
	this.CsIwall['TPW005P00X']['index'] = 12;
	this.CsIwall['TPW017P00X']['index'] = 13;
	this.CsIwall['TPW024P00X']['index'] = 14;
	this.CsIwall['TPW008P00X']['index'] = 15;
	this.CsIwall['TPW007P00X']['index'] = 16;
	this.CsIwall['TPW006P00X']['index'] = 17;
	this.CsIwall['TPW018P00X']['index'] = 18;
	this.CsIwall['TPW023P00X']['index'] = 19;
	this.CsIwall['TPW022P00X']['index'] = 20;
	this.CsIwall['TPW021P00X']['index'] = 21;
	this.CsIwall['TPW020P00X']['index'] = 22;
	this.CsIwall['TPW019P00X']['index'] = 23;

	//invert the above index map for TT lookup
	this.CsIwallTTmap = []
	for(key in this.CsIwall){
		this.CsIwallTTmap[this.CsIwall[key].index] = key;
	}

	this.colorQuads = ['G', 'B', 'R', 'W'];
	this.HPGe = {};
	//loop over HPGe
	for(i=1; i<4; i++){
		this.HPGe['GRG0'+i] = {};
		//loop over quadrents
		for(j=0; j<4; j++){
			this.HPGe['GRG0'+i]['GRG0'+i+this.colorQuads[j]+'N00A'] = {
				'HV'		: 0,
				'threshold' : 500,
				'rate'		: 1000,

				'oldHVcolor' : '#000000',
				'HVcolor'	 : '#000000',
				'oldThresholdColor' : '#000000',
				'thresholdColor' : '#000000',
				'oldRateColor' : '#000000',
				'rateColor' : '#000000'				
			}
			this.HPGe['GRG0'+i]['GRG0'+i+this.colorQuads[j]+'N00B'] = {
				'HV'		: 0,
				'threshold' : 500,
				'rate'		: 1000,

				'oldHVcolor' : '#000000',
				'HVcolor'	 : '#000000',
				'oldThresholdColor' : '#000000',
				'thresholdColor' : '#000000',
				'oldRateColor' : '#000000',
				'rateColor' : '#000000'				
			}
		}


	}

	this.summary = {};
	//loop over HPGe
	for(i=1; i<4; i++){
		this.summary['GRG0'+i] = {};
		for(j=0; j<4; j++){
			this.summary['GRG0'+i]['GRG0'+i+this.colorQuads[j]] = {
				'clover' : i,
				'quadrant' : j,
				'index' : 100 + i*8 + j,

				'HV'		: 0,
				'threshold' : 500,
				'rate'		: 1000,

				'oldHVcolor' : '#000000',
				'HVcolor'	 : '#000000',
				'oldThresholdColor' : '#000000',
				'thresholdColor' : '#000000',
				'oldRateColor' : '#000000',
				'rateColor' : '#000000'					
			}
		}
	}

	//invert summary indices for TT map:

}


DAQDS = function(){
	//data arrays:
	this.master = [];
	this.collectorGroups = [];
	this.collectorLinks = [];
	this.collectors = [];
	this.digitizerGroupSummaryLinks = [];
	this.digitizerSummaries = [];
	this.digitizerGroupLinks = [];
	this.digitizerLinks = [];
	this.digitizers = [];

	/*
	key map, format: key[griffin.js index number] = array containing parsed FSPC keys from masterCodex for this node, down to digitizer level

	FSPC key array packed like [master key, collector key, digitizer key];
	note that the master node only has a master key, collector nodes only have master + collector keys etc, so length of array
	corresponds to type of node.  Example: FSPC = 0x0700604 -> ['0x0XXXXXX', '0x07XXXXX', '0x07006XX']

	griffin.js index counts from 0: first master -> collectors -> digitizer summary nodes -> digitizers, next master... etc 
	*/

	this.key = [];
	var Fkey, Skey, Pkey, Ckey;
	var i = 0;
	var j = 0;
	for(Fkey in window.codex.DAQmap){
		this.key[i] = [Fkey];
		i++;
		for(Skey in window.codex.DAQmap[Fkey]){
			this.key[i] = [Fkey, Skey];
			i++;
			j++
		}
		i += j //leave an index for a summary node to go with each collector node
		j = 0;
		//now count through digitizers, starting with the first collector:
		for(Skey in window.codex.DAQmap[Fkey]){
			for(Pkey in window.codex.DAQmap[Fkey][Skey]){
				this.key[i] = [Fkey, Skey, Pkey];
				i++;
				/*
				for(Ckey in window.codex.DAQmap[Fkey][Skey][Pkey]){
					this.key[i] = [Fkey, Skey, Pkey, Ckey];
					i++;
				}
				*/
			}
		}
	}

}



















