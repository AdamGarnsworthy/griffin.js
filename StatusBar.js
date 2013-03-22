function StatusBar(wrapper){
	this.wrapperID = wrapper;
	this.titleID = 'experimentTitle';
	this.runInfoID = 'runInfo';

	var that = this;

	//deploy tooltip:
    this.tooltip = new Tooltip('LeftSidebarBKG', 'leftSidebarTTipText', 'leftSidebarTTCanv', 'leftSidebarTT', this.wrapperID, [], []);
    this.tooltip.obj = that;
    //tooltip actually attaches to a canvas - attach it to the background canvas, but then pull the event listners up to the top-level div:
    document.getElementById(this.wrapperID).onmousemove = document.getElementById('LeftSidebarBKG').onmousemove
    document.getElementById(this.wrapperID).onmouseout = document.getElementById('LeftSidebarBKG').onmouseout

    //experiment title
    insertDOM('h2', this.titleID, '', 'margin-top:25px; font-family: "Orbitron", sans-serif;', this.wrapperID, '', 'Experiment Title')

    //run info
	insertDOM('p', this.runInfoID, '', 'margin-top:10px; margin-left:auto; margin-right:auto; padding-left:5%; padding-right:5%; text-align:center; font-size:16px;', this.wrapperID, '', 'Run Info');

    //Alarm Service
    window.AlarmServices = new AlarmService('leftSidebar', 'leftSidebarDetail');

    this.update = function(){
    	//experiment title
    	this.expTitle = 'Offline Demo Experiment'; 
        //this.expTitle = ODBGet('/Experiment/Name') + ' Experiment';
    	document.getElementById(this.titleID).innerHTML = this.expTitle;

    	//run #
    	var runInfo = 'Run #1337'; 
        //var runInfo = 'Run # '+ODBGet('/Runinfo/Run number');

    	//run state
    	runInfo += ': ';
    	var runstate = 3; 
        //var runstate = ODBGet('/Runinfo/State');
    	if(runstate == 1) runInfo += 'Stopped';
    	else if(runstate == 2) runInfo += 'Paused';
    	else if (runstate == 3) runInfo += 'Live';
    	else runInfo += 'State Unknown';

    	//restart?  TODO
    	this.restart = '???';

    	//data dir:
    	this.dataDir = '/dummy/directory/path/' 
        //this.dataDir = ODBGet('/Logger/Data dir')

    	//run time
    	var startInfo = 'Start: ';
    	startInfo += '00:00:00 January 1, 1970'
        //startInfo += ODBGet('/Runinfo/Start time');
    	var elapsed;
    	if(runstate == 1){
    		elapsed = 'Stop: '
    		elapsed += '00:00:00 January 1, 1970'; 
            //elapsed += ODBGet('Runinfo/Stop time');
    	} else {
    		elapsed = 'Up: ';
    		var binaryStart = 0; 
            //var binaryStart = ODBGet('Runinfo/Start time binary');
    		var date = new Date(); 
    		var now = date.getTime() / 1000;
    		var uptime = now - binaryStart;
    		var hours = Math.floor(uptime / 3600);
    		var minutes = Math.floor( (uptime%3600)/60 );
    		var seconds = Math.floor(uptime%60);
    		elapsed += hours + ' h, ' + minutes + ' m, ' + seconds +' s'
  		}

        //run comment
        var comment = 'No Comment'//ODBGet('/Experiment/Run Parameters/Comment');



  		document.getElementById(this.runInfoID).innerHTML = runInfo + '<br>' + startInfo + '<br>' + elapsed + '<br><br>' + comment;

    };

    this.findCell = function(event){
    	return 1;
    };

    this.defineText = function(cell){
        var toolTipContent = '<br>';
        var nextLine;
        var longestLine = 0;
        var cardIndex;
        var i;

        nextLine = '<u>Run Config Details</u>'
        //keep track of the longest line of text:
        longestLine = Math.max(longestLine, this.tooltip.context.measureText(nextLine).width)
        toolTipContent += nextLine + '<br><br>';

        nextLine = 'Restart: ' + this.restart 
        //keep track of the longest line of text:
        longestLine = Math.max(longestLine, this.tooltip.context.measureText(nextLine).width)
        toolTipContent += nextLine + '<br>';

        nextLine = 'Data dir: ' + this.dataDir
        //keep track of the longest line of text:
        longestLine = Math.max(longestLine, this.tooltip.context.measureText(nextLine).width)
        toolTipContent += nextLine + '<br>';

        document.getElementById(this.tooltip.ttTextID).innerHTML = toolTipContent;

        //return length of longest line:
        return longestLine;
    };

    this.update();
}