PACES.prototype = Object.create(Subsystem.prototype);

function PACES(){
    //detector name, self-pointing pointer, pull in the Subsystem template, 
    //establish a databus and create a global-scope pointer to this object:
    this.name = 'PACES';
    var that = this;
    Subsystem.call(this);
    this.dataBus = new PACESDS();
    //make a pointer at window level back to this object, so we can pass by reference to the nav button onclick
    window.PACESpointer = that;

    //member variables///////////////////////////////////




    
	this.HVcanvasID = 'PACESHVCanvas'; 	        //ID of canvas to draw HV view
    this.RateCanvasID = 'PACESrateCanvas';      //ID of canvas to draw rate / threshold view

           




    //insert & scale canvas//////////////////////////////////////////////////////////////////////////////////////
    //HV view
    insertDOM('canvas', this.HVcanvasID, 'monitor', 'top:' + ($('#SubsystemLinks').height()*1.25 + 5) +'px;', this.monitorID, '', '')
    this.HVcanvas = document.getElementById(this.HVcanvasID);
    this.HVcontext = this.HVcanvas.getContext('2d');
    this.HVcanvas.setAttribute('width', this.canvasWidth);
    this.HVcanvas.setAttribute('height', this.canvasHeight);
    //Rate view
    insertDOM('canvas', this.RateCanvasID, 'monitor', 'top:' + ($('#SubsystemLinks').height()*1.25 + 5) +'px;', this.monitorID, '', '')
    this.RateCanvas = document.getElementById(this.RateCanvasID);
    this.RateContext = this.RateCanvas.getContext('2d');
    this.RateCanvas.setAttribute('width', this.canvasWidth);
    this.RateCanvas.setAttribute('height', this.canvasHeight);



    //set up tooltip:
    this.RateTooltip = new Tooltip(this.RateCanvasID, 'PACESTipText', 'PACESTT', this.monitorID, window.parameters.PACESprefix, window.parameters.PACESpostfix);
    this.HVTooltip =  new Tooltip(this.HVcanvasID, 'PACESTipTextHV', 'PACESTTHV', this.monitorID, window.parameters.PACESprefix, window.parameters.PACESpostfix);
    this.RateTooltip.obj = that;
    this.HVTooltip.obj = that;
    this.tooltip = this.RateTooltip;

    //drawing parameters
    this.centerX = this.canvasWidth/2;
    this.centerY = this.canvasHeight*0.45;
    this.arrayRadius = this.canvasHeight*0.3;
    this.SiLiRadius = this.canvasHeight*0.1;

    //establish data buffers////////////////////////////////////////////////////////////////////////////
    this.HVcolor = [];
    this.oldHVcolor = [];
    this.thresholdColor = [];
    this.oldThresholdColor = [];
    this.rateColor = [];
    this.oldRateColor = [];

    //member functions///////////////////////////////////////////////////////////////////
    //decide which view to transition to when this object is navigated to
    this.view = function(){
        if(window.subdetectorView == 0)
            return this.HVcanvasID;
        else if(window.subdetectorView == 1 || window.subdetectorView == 2)
            return this.RateCanvasID;
    }

    this.draw = function(frame){

    	var i;
    	this.RateContext.strokeStyle = '#999999'

        //Thresholds & Rate view///////////////////////////////////////
        //once for the display canvas....
    	for(i=0; i<5; i++){

    		this.RateContext.save();
    		this.RateContext.translate(this.centerX, this.centerY);
    		this.RateContext.rotate(i*Math.PI*72/180);

            if(window.subdetectorView == 1) this.RateContext.fillStyle = interpolateColor(parseHexColor(this.oldThresholdColor[2*i]), parseHexColor(this.thresholdColor[2*i]), frame/this.nFrames);
            else if(window.subdetectorView == 2) this.RateContext.fillStyle = interpolateColor(parseHexColor(this.oldRateColor[2*i]), parseHexColor(this.rateColor[2*i]), frame/this.nFrames);
    		this.RateContext.beginPath();
    		this.RateContext.arc(0, -this.arrayRadius, this.SiLiRadius, 0, Math.PI);
    		this.RateContext.closePath();
            this.RateContext.fill();
    		this.RateContext.stroke();

            if(window.subdetectorView == 1) this.RateContext.fillStyle = interpolateColor(parseHexColor(this.oldThresholdColor[2*i+1]), parseHexColor(this.thresholdColor[2*i+1]), frame/this.nFrames);
            else if(window.subdetectorView == 2) this.RateContext.fillStyle = interpolateColor(parseHexColor(this.oldRateColor[2*i+1]), parseHexColor(this.rateColor[2*i+1]), frame/this.nFrames);
            this.RateContext.beginPath();
            this.RateContext.arc(0, -this.arrayRadius, this.SiLiRadius, Math.PI, 0);
            this.RateContext.closePath();
            this.RateContext.fill();
            this.RateContext.stroke();

    		this.RateContext.restore();
    	}
        //...and again for the tooltip encoding
        for(i=0; i<5; i++){
            this.TTcontext.save();
            this.TTcontext.translate(this.centerX, this.centerY);
            this.TTcontext.rotate(i*Math.PI*72/180);

            this.TTcontext.fillStyle = 'rgba('+(2*i)+','+(2*i)+','+(2*i)+',1)';
            this.TTcontext.beginPath();
            this.TTcontext.arc(0, -this.arrayRadius, this.SiLiRadius, 0, Math.PI);
            this.TTcontext.closePath();
            this.TTcontext.fill();

            this.TTcontext.fillStyle = 'rgba('+(2*i+1)+','+(2*i+1)+','+(2*i+1)+',1)';
            this.TTcontext.beginPath();
            this.TTcontext.arc(0, -this.arrayRadius, this.SiLiRadius, Math.PI, 0);
            this.TTcontext.closePath();
            this.TTcontext.fill();

            this.TTcontext.restore();

        }

        //HV view///////////////////////////////////////////
        for(i=0; i<5; i++){
            this.HVcontext.fillStyle = interpolateColor(parseHexColor(this.oldHVcolor[i]), parseHexColor(this.HVcolor[i]), frame/this.nFrames);
            this.HVcontext.save();
            this.HVcontext.translate(this.centerX, this.centerY);
            this.HVcontext.rotate(i*Math.PI*72/180);
            this.HVcontext.beginPath();
            this.HVcontext.arc(0, -this.arrayRadius, this.SiLiRadius, 0, 2*Math.PI);
            this.HVcontext.closePath();
            this.HVcontext.fill();
            this.HVcontext.stroke();
            this.HVcontext.restore();
        }

        if(frame==this.nFrames || frame==0) {
            //scale
            this.drawScale(this.HVcontext);
            this.drawScale(this.RateContext);
        }
    };

    this.findCell = function(x, y){
        var imageData = this.TTcontext.getImageData(x,y,1,1);
        var index = -1;
        if(imageData.data[0] == imageData.data[1] && imageData.data[0] == imageData.data[2]) index = imageData.data[0];
        //different behvior for rate VS. HV views:
        if(window.onDisplay == this.RateCanvasID || index == -1)
            return index;
        else if(window.onDisplay == this.HVcanvasID)
            return Math.floor(index/2);
    };

    this.defineText = function(cell){
        var toolTipContent = '<br>';
        var nextLine;
        var longestLine = 0;
        var cardIndex;
        var i;

        nextLine = 'Channel '+cell;

        //keep track of the longest line of text:
        longestLine = Math.max(longestLine, this.tooltip.context.measureText(nextLine).width)
        toolTipContent += nextLine;

        document.getElementById(this.tooltip.ttTextID).innerHTML = toolTipContent;

        //return length of longest line:
        return longestLine;
    };

    this.update = function(){
        var i;

        //get new data
        this.fetchNewData();

        //parse the new data into colors
        for(i=0; i<this.dataBus.HV.length; i++){
            this.oldHVcolor[i] = this.HVcolor[i];
            this.HVcolor[i] = this.parseColor(this.dataBus.HV[i], 'PACES');
        }
        for(i=0; i<this.dataBus.thresholds.length; i++){
            this.oldThresholdColor[i] = this.thresholdColor[i];
            this.thresholdColor[i] = this.parseColor(this.dataBus.thresholds[i], 'PACES');
        }

        for(i=0; i<this.dataBus.rate.length; i++){
            this.oldRateColor[i] = this.rateColor[i];
            this.rateColor[i] = this.parseColor(this.dataBus.rate[i], 'PACES');
        }

        this.tooltip.update();
        this.displaySwitch();
    };


    //decide which display version to show:
    this.displaySwitch = function(){
        //handle putting the right canvas on top:
        if(window.subdetectorView == 0){
            if($('#'+this.RateCanvasID).css('opacity') > 0){
                swapCanv(this.HVcanvasID, this.RateCanvasID);
                this.tooltip = this.HVTooltip;
            }
        } else{
            if($('#'+this.HVcanvasID).css('opacity') > 0){
                swapCanv(this.RateCanvasID, this.HVcanvasID);
                this.tooltip = this.RateTooltip;
            }
        }

    };

    this.fetchNewData = function(){
        var i;

        //dummy data:
        for(i=0; i<5; i++){
            this.dataBus.HV[i] = Math.random();
        }
        for(i=0; i<10; i++){
            this.dataBus.thresholds[i] = Math.random();
            this.dataBus.rate[i] = Math.random();
        }

    };

    //do an initial populate:
    this.update();
}