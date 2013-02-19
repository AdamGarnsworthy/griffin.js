function HPGE(monitor, enableBGO){

	this.monitorID = monitor;		                //div ID of wrapper div
	this.canvasID = 'HPGECanvas'; 			        //ID of canvas to draw top level TIGRESS view on
	this.detailCanvasID = 'HPGEdetailCanvas';		//ID of canvas to draw single HPGE view on
    this.enableBGO = enableBGO;                     //are BGO suppressors present?
    this.linkWrapperID = 'SubsystemLinks';          //ID of div wrapping subsystem navigation links
    this.sidebarID = 'SubsystemSidebar';           //ID of right sidebar for this object
    this.topNavID = 'SubsystemsButton';             //ID of top level nav button

    var that = this;
    //make a pointer at window level back to this object, so we can pass by reference to the nav button onclick
    window.HPGEpointer = that;

    //establish animation parameters////////////////////////////////////////////////////////////////////
    this.FPS = 30;
    this.duration = 0.5;
    this.nFrames = this.FPS*this.duration;

    //insert navigation/////////////////////////////////////////////////////////////////////////////////
    var newButton = document.createElement('button');
    newButton.setAttribute('id', 'HPGElink');
    newButton.setAttribute('class', 'navLink');
    newButton.setAttribute('type', 'button');
    newButton.setAttribute('onclick', "javascript:swapFade('HPGECanvas', 'HPGElink', window.HPGEpointer)");
    document.getElementById(this.linkWrapperID).appendChild(newButton);
    document.getElementById('HPGElink').innerHTML = 'HPGE';

    //insert & scale canvas//////////////////////////////////////////////////////////////////////////////////////
    this.monitor = document.getElementById(monitor);
    this.canvasWidth = 0.48*$(this.monitor).width();
    this.canvasHeight = 0.8*$(this.monitor).height();
    //top level
    var newCanvas = document.createElement('canvas');
    newCanvas.setAttribute('id', this.canvasID);
    newCanvas.setAttribute('class', 'monitor');
    newCanvas.setAttribute('style', 'top:' + ($('#SubsystemLinks').height()*1.25 + 5) +'px;')
    newCanvas.setAttribute('width', this.canvasWidth);
    newCanvas.setAttribute('height', this.canvasHeight);
    document.getElementById(monitor).appendChild(newCanvas);
    this.canvas = document.getElementById(this.canvasID);
    this.context = this.canvas.getContext('2d');
    //detail level
    newCanvas = document.createElement('canvas');
    newCanvas.setAttribute('id', this.detailCanvasID);
    newCanvas.setAttribute('class', 'monitor');
    newCanvas.setAttribute('style', 'top:' + ($('#SubsystemLinks').height()*1.25 + 5) +'px;')
    newCanvas.setAttribute('width', this.canvasWidth);
    newCanvas.setAttribute('height', this.canvasHeight);
    document.getElementById(monitor).appendChild(newCanvas);
    this.detailCanvas = document.getElementById(this.detailCanvasID);
    this.detailContext = this.detailCanvas.getContext('2d');

    //drawing parameters
    this.centerX = this.canvasWidth/2;
    this.centerY = this.canvasHeight/2;

    //summary view
    this.BGOouter = 0.08*this.canvasWidth;
    this.BGOinner = 2/3*this.BGOouter;
    if(this.enableBGO == 1)
        this.HPGEside = 0.4*this.BGOouter;
    else 
        this.HPGEside = this.BGOouter;
    //establish coords of each detector summary; start array index at 1 to correspond to actual detector numbering in TIGRESS:
    this.firstRow = this.canvasHeight*0.05;
    this.secondRow = this.canvasHeight*0.2;
    this.thirdRow = this.canvasHeight*0.35;
    this.fourthRow = this.canvasHeight*0.5;
    this.firstCol = this.canvasWidth*0.185;
    this.secondCol = this.canvasWidth*0.285;
    this.thirdCol = this.canvasWidth*0.385;
    this.fourthCol = this.canvasWidth*0.585;
    this.fifthCol = this.canvasWidth*0.685;
    this.sixthCol = this.canvasWidth*0.785;
    this.summaryCoord = [];
    this.summaryCoord[1] = [this.thirdCol, this.secondRow];
    this.summaryCoord[2] = [this.fourthCol, this.firstRow];
    this.summaryCoord[3] = [this.fourthCol, this.thirdRow];
    this.summaryCoord[4] = [this.thirdCol, this.fourthRow];
    this.summaryCoord[5] = [this.secondCol, this.secondRow];
    this.summaryCoord[6] = [this.secondCol, this.firstRow];
    this.summaryCoord[7] = [this.fifthCol, this.firstRow];
    this.summaryCoord[8] = [this.fifthCol, this.secondRow];
    this.summaryCoord[9] = [this.fifthCol, this.thirdRow];
    this.summaryCoord[10] = [this.fifthCol, this.fourthRow];
    this.summaryCoord[11] = [this.secondCol, this.fourthRow];
    this.summaryCoord[12] = [this.secondCol, this.thirdRow];
    this.summaryCoord[13] = [this.firstCol, this.secondRow];
    this.summaryCoord[14] = [this.sixthCol, this.firstRow];
    this.summaryCoord[15] = [this.sixthCol, this.thirdRow];
    this.summaryCoord[16] = [this.firstCol, this.fourthRow];

    //detail view
    this.lineWeight = 1;
    this.crystalSide = this.canvasWidth*0.1;
    this.suppressorWidth = this.canvasWidth*0.03;
    this.suppressorSpacing = this.canvasWidth*0.04;
    this.frontBGOinnerWidth = 2*this.crystalSide + 2*this.suppressorSpacing;
    this.frontBGOouterWidth = this.frontBGOinnerWidth + 2*this.suppressorWidth;
    this.backBGOinnerWidth = this.frontBGOouterWidth + 2*this.suppressorSpacing;
    this.backBGOouterWidth = this.backBGOinnerWidth + 2*this.suppressorWidth;
    this.sideBGOinnerWidth = this.backBGOouterWidth + 2*this.suppressorSpacing;
    this.sideBGOouterWidth = this.sideBGOinnerWidth + 2*this.suppressorWidth;
    this.sideSpacer = 20;


    //Member functions/////////////////////////////////////////////////////////////////////////////////

    this.draw = function(frame){
        var i;
        this.context.fillStyle = 'rgba(0,0,0,1)';
        for(i=1; i<17; i++){
            if(this.enableBGO == 1) this.BGOsummary(this.summaryCoord[i][0], this.summaryCoord[i][1]);
            this.HPGEsummary(this.summaryCoord[i][0], this.summaryCoord[i][1]);
        }

        this.context.clearRect(0,0.65*this.canvasHeight,this.canvasWidth,0.35*this.canvasHeight);
        this.context.fillStyle = '#999999';
        this.context.font="24px 'Orbitron'";
        this.context.fillText('North Hemisphere', 0.325*this.canvasWidth - this.context.measureText('North Hemisphere').width/2, 0.7*this.canvasHeight);
        this.context.fillText('South Hemisphere', 0.725*this.canvasWidth - this.context.measureText('North Hemisphere').width/2, 0.7*this.canvasHeight);
    };

    this.drawDetail = function(mode){

        var split;
    	this.detailContext.lineWidth = this.lineWeight;

        if(mode == 'rate')
            split = false;
        else if(mode == 'HV')
            split = true;
 
        if(split){
            this.crystal(this.centerX - this.crystalSide, this.centerY - this.crystalSide, '#00FF00');
            this.crystal(this.centerX + this.lineWeight, this.centerY - this.crystalSide, '#0000FF');
            this.crystal(this.centerX - this.crystalSide, this.centerY + this.lineWeight, '#FF0000');
            this.crystal(this.centerX + this.lineWeight, this.centerY + this.lineWeight, '#FFFFFF');

        } else{
        	//cores
        	this.crystalCore(this.centerX - 2/3*this.crystalSide, this.centerY-2/3*this.crystalSide, '#00FF00');
        	this.crystalCore(this.centerX + 1/3*this.crystalSide + this.lineWeight, this.centerY-2/3*this.crystalSide, '#0000FF');
        	this.crystalCore(this.centerX - 2/3*this.crystalSide, this.centerY+1/3*this.crystalSide + this.lineWeight, '#FF0000');
        	this.crystalCore(this.centerX + 1/3*this.crystalSide + this.lineWeight, this.centerY+1/3*this.crystalSide + this.lineWeight, '#FFFFFF');
    	    //front segs
            this.drawL(0, this.crystalSide/6, 1/3*this.crystalSide, this.centerX - 5*this.crystalSide/6, this.centerY - 5*this.crystalSide/6, '#00FF00');
            this.drawL(Math.PI/2, this.crystalSide/6, 1/3*this.crystalSide, this.centerX - this.crystalSide/6, this.centerY - 5*this.crystalSide/6, '#00FF00');
            this.drawL(Math.PI, this.crystalSide/6, 1/3*this.crystalSide, this.centerX - this.crystalSide/6, this.centerY - this.crystalSide/6, '#00FF00');
            this.drawL(3*Math.PI/2, this.crystalSide/6, 1/3*this.crystalSide, this.centerX - 5*this.crystalSide/6, this.centerY - this.crystalSide/6, '#00FF00');

            this.drawL(0, this.crystalSide/6, 1/3*this.crystalSide, this.centerX + this.crystalSide/6 + this.lineWeight, this.centerY - 5*this.crystalSide/6, '#0000FF');
            this.drawL(Math.PI/2, this.crystalSide/6, 1/3*this.crystalSide, this.centerX + 5*this.crystalSide/6 + this.lineWeight, this.centerY - 5*this.crystalSide/6, '#0000FF');
            this.drawL(Math.PI, this.crystalSide/6, 1/3*this.crystalSide, this.centerX + 5*this.crystalSide/6 + this.lineWeight, this.centerY - this.crystalSide/6, '#0000FF');
            this.drawL(3*Math.PI/2, this.crystalSide/6, 1/3*this.crystalSide, this.centerX + this.crystalSide/6 + this.lineWeight, this.centerY - this.crystalSide/6, '#0000FF');

            this.drawL(0, this.crystalSide/6, 1/3*this.crystalSide, this.centerX + this.crystalSide/6 + this.lineWeight, this.centerY + this.crystalSide/6 + this.lineWeight, '#FFFFFF');
            this.drawL(Math.PI/2, this.crystalSide/6, 1/3*this.crystalSide, this.centerX + 5*this.crystalSide/6 + this.lineWeight, this.centerY + this.crystalSide/6 + this.lineWeight, '#FFFFFF');
            this.drawL(Math.PI, this.crystalSide/6, 1/3*this.crystalSide, this.centerX + 5*this.crystalSide/6 + this.lineWeight, this.centerY + 5*this.crystalSide/6 + this.lineWeight, '#FFFFFF');
            this.drawL(3*Math.PI/2, this.crystalSide/6, 1/3*this.crystalSide, this.centerX + this.crystalSide/6 + this.lineWeight, this.centerY + 5*this.crystalSide/6 + this.lineWeight, '#FFFFFF');

            this.drawL(0, this.crystalSide/6, 1/3*this.crystalSide, this.centerX - 5*this.crystalSide/6, this.centerY + this.crystalSide/6 + this.lineWeight, '#FF0000');
            this.drawL(Math.PI/2, this.crystalSide/6, 1/3*this.crystalSide, this.centerX - this.crystalSide/6, this.centerY + this.crystalSide/6 + this.lineWeight, '#FF0000');
            this.drawL(Math.PI, this.crystalSide/6, 1/3*this.crystalSide, this.centerX - this.crystalSide/6, this.centerY + 5*this.crystalSide/6 + this.lineWeight, '#FF0000');
            this.drawL(3*Math.PI/2, this.crystalSide/6, 1/3*this.crystalSide, this.centerX - 5*this.crystalSide/6, this.centerY + 5*this.crystalSide/6 + this.lineWeight, '#FF0000');

            //back segs
            this.drawL(0, this.crystalSide/6, this.crystalSide/2, this.centerX - this.crystalSide, this.centerY - this.crystalSide, '#00FF00');
            this.drawL(Math.PI/2, this.crystalSide/6, this.crystalSide/2, this.centerX, this.centerY - this.crystalSide, '#00FF00');
            this.drawL(Math.PI, this.crystalSide/6, this.crystalSide/2, this.centerX, this.centerY, '#00FF00');
            this.drawL(3*Math.PI/2, this.crystalSide/6, this.crystalSide/2, this.centerX - this.crystalSide, this.centerY, '#00FF00');        

            this.drawL(0, this.crystalSide/6, this.crystalSide/2, this.centerX + this.lineWeight, this.centerY - this.crystalSide, '#0000FF');
            this.drawL(Math.PI/2, this.crystalSide/6, this.crystalSide/2, this.centerX + this.crystalSide + this.lineWeight, this.centerY - this.crystalSide, '#0000FF');
            this.drawL(Math.PI, this.crystalSide/6, this.crystalSide/2, this.centerX + this.crystalSide + this.lineWeight, this.centerY, '#0000FF');
            this.drawL(3*Math.PI/2, this.crystalSide/6, this.crystalSide/2, this.centerX + this.lineWeight, this.centerY, '#0000FF');

            this.drawL(0, this.crystalSide/6, this.crystalSide/2, this.centerX + this.lineWeight, this.centerY + this.lineWeight, '#FFFFFF');
            this.drawL(Math.PI/2, this.crystalSide/6, this.crystalSide/2, this.centerX + this.crystalSide + this.lineWeight, this.centerY + this.lineWeight, '#FFFFFF');
            this.drawL(Math.PI, this.crystalSide/6, this.crystalSide/2, this.centerX + this.crystalSide + this.lineWeight, this.centerY + this.crystalSide + this.lineWeight, '#FFFFFF');
            this.drawL(3*Math.PI/2, this.crystalSide/6, this.crystalSide/2, this.centerX + this.lineWeight, this.centerY + this.crystalSide + this.lineWeight, '#FFFFFF');

            this.drawL(0, this.crystalSide/6, this.crystalSide/2, this.centerX - this.crystalSide, this.centerY + this.lineWeight, '#FF0000');
            this.drawL(Math.PI/2, this.crystalSide/6, this.crystalSide/2, this.centerX, this.centerY + this.lineWeight, '#FF0000');
            this.drawL(Math.PI, this.crystalSide/6, this.crystalSide/2, this.centerX, this.centerY + this.crystalSide + this.lineWeight, '#FF0000');
            this.drawL(3*Math.PI/2, this.crystalSide/6, this.crystalSide/2, this.centerX - this.crystalSide, this.centerY + this.crystalSide + this.lineWeight, '#FF0000');
        }

        //front suppressors
        this.drawHalfL(-Math.PI/2, this.suppressorWidth, this.frontBGOouterWidth/2, this.centerX - this.frontBGOinnerWidth/2, this.centerY - this.frontBGOinnerWidth/2, 'left', split, '#00FF00');
        this.drawHalfL(0, this.suppressorWidth, this.frontBGOouterWidth/2, this.centerX - this.frontBGOinnerWidth/2, this.centerY - this.frontBGOinnerWidth/2, 'right', split, '#00FF00');

        this.drawHalfL(0, this.suppressorWidth, this.frontBGOouterWidth/2, this.centerX + this.frontBGOinnerWidth/2 + this.lineWeight, this.centerY - this.frontBGOinnerWidth/2, 'left', split, '#0000FF');
        this.drawHalfL(Math.PI/2, this.suppressorWidth, this.frontBGOouterWidth/2, this.centerX + this.frontBGOinnerWidth/2 + this.lineWeight, this.centerY - this.frontBGOinnerWidth/2, 'right', split, '#0000FF');

        this.drawHalfL(Math.PI/2, this.suppressorWidth, this.frontBGOouterWidth/2, this.centerX + this.frontBGOinnerWidth/2 + this.lineWeight, this.centerY + this.frontBGOinnerWidth/2 + this.lineWeight, 'left', split, '#FFFFFF');
        this.drawHalfL(Math.PI, this.suppressorWidth, this.frontBGOouterWidth/2, this.centerX + this.frontBGOinnerWidth/2 + this.lineWeight, this.centerY + this.frontBGOinnerWidth/2 + this.lineWeight, 'right', split, '#FFFFFF');

        this.drawHalfL(Math.PI, this.suppressorWidth, this.frontBGOouterWidth/2, this.centerX - this.frontBGOinnerWidth/2, this.centerY + this.frontBGOinnerWidth/2 + this.lineWeight, 'left', split, '#FF0000');
        this.drawHalfL(3*Math.PI/2, this.suppressorWidth, this.frontBGOouterWidth/2, this.centerX - this.frontBGOinnerWidth/2, this.centerY + this.frontBGOinnerWidth/2 + this.lineWeight, 'right', split, '#FF0000');

        //back suppressors
        this.drawHalfL(-Math.PI/2, this.suppressorWidth, this.backBGOouterWidth/2, this.centerX - this.backBGOinnerWidth/2, this.centerY - this.backBGOinnerWidth/2, 'left', split, '#00FF00');
        this.drawHalfL(0, this.suppressorWidth, this.backBGOouterWidth/2, this.centerX - this.backBGOinnerWidth/2, this.centerY - this.backBGOinnerWidth/2, 'right', split, '#00FF00');

        this.drawHalfL(0, this.suppressorWidth, this.backBGOouterWidth/2, this.centerX + this.backBGOinnerWidth/2 + this.lineWeight, this.centerY - this.backBGOinnerWidth/2, 'left', split, '#0000FF');
        this.drawHalfL(Math.PI/2, this.suppressorWidth, this.backBGOouterWidth/2, this.centerX + this.backBGOinnerWidth/2 + this.lineWeight, this.centerY - this.backBGOinnerWidth/2, 'right', split, '#0000FF');

        this.drawHalfL(Math.PI/2, this.suppressorWidth, this.backBGOouterWidth/2, this.centerX + this.backBGOinnerWidth/2 + this.lineWeight, this.centerY + this.backBGOinnerWidth/2 + this.lineWeight, 'left', split, '#FFFFFF');
        this.drawHalfL(Math.PI, this.suppressorWidth, this.backBGOouterWidth/2, this.centerX + this.backBGOinnerWidth/2 + this.lineWeight, this.centerY + this.backBGOinnerWidth/2 + this.lineWeight, 'right', split, '#FFFFFF');

        this.drawHalfL(Math.PI, this.suppressorWidth, this.backBGOouterWidth/2, this.centerX - this.backBGOinnerWidth/2, this.centerY + this.backBGOinnerWidth/2 + this.lineWeight, 'left', split, '#FF0000');
        this.drawHalfL(3*Math.PI/2, this.suppressorWidth, this.backBGOouterWidth/2, this.centerX - this.backBGOinnerWidth/2, this.centerY + this.backBGOinnerWidth/2 + this.lineWeight, 'right', split, '#FF0000');

        //side suppressors
        this.drawHalfL(-Math.PI/2, this.suppressorWidth, this.sideBGOouterWidth/2 - this.sideSpacer, this.centerX - this.sideBGOinnerWidth/2, this.centerY - this.sideBGOinnerWidth/2 + this.sideSpacer, 'left', split, '#00FF00');
        this.drawHalfL(0, this.suppressorWidth, this.sideBGOouterWidth/2 - this.sideSpacer, this.centerX - this.sideBGOinnerWidth/2 + this.sideSpacer, this.centerY - this.sideBGOinnerWidth/2, 'right', split, '#00FF00');

        this.drawHalfL(0, this.suppressorWidth, this.sideBGOouterWidth/2 - this.sideSpacer, this.centerX + this.sideBGOinnerWidth/2 + this.lineWeight - this.sideSpacer, this.centerY - this.sideBGOinnerWidth/2, 'left', split, '#0000FF');
        this.drawHalfL(Math.PI/2, this.suppressorWidth, this.sideBGOouterWidth/2 - this.sideSpacer, this.centerX + this.sideBGOinnerWidth/2 + this.lineWeight, this.centerY - this.sideBGOinnerWidth/2 + this.sideSpacer, 'right', split, '#0000FF');

        this.drawHalfL(Math.PI/2, this.suppressorWidth, this.sideBGOouterWidth/2 - this.sideSpacer, this.centerX + this.sideBGOinnerWidth/2 + this.lineWeight, this.centerY + this.sideBGOinnerWidth/2 + this.lineWeight - this.sideSpacer, 'left', split, '#FFFFFF');
        this.drawHalfL(Math.PI, this.suppressorWidth, this.sideBGOouterWidth/2 - this.sideSpacer, this.centerX + this.sideBGOinnerWidth/2 + this.lineWeight - this.sideSpacer, this.centerY + this.sideBGOinnerWidth/2 + this.lineWeight, 'right', split, '#FFFFFF');

        this.drawHalfL(Math.PI, this.suppressorWidth, this.sideBGOouterWidth/2 - this.sideSpacer, this.centerX - this.sideBGOinnerWidth/2 + this.sideSpacer, this.centerY + this.sideBGOinnerWidth/2 + this.lineWeight, 'left', split, '#FF0000');
        this.drawHalfL(3*Math.PI/2, this.suppressorWidth, this.sideBGOouterWidth/2 - this.sideSpacer, this.centerX - this.sideBGOinnerWidth/2, this.centerY + this.sideBGOinnerWidth/2 + this.lineWeight - this.sideSpacer, 'right', split, '#FF0000');
    };

    //draw crystal core
    this.crystalCore = function(x0, y0, border, fill){
    	this.detailContext.strokeStyle = border;
        this.detailContext.fillStyle = '#4C4C4C';
    	this.detailContext.fillRect(x0, y0, this.crystalSide/3, this.crystalSide/3);
    	this.detailContext.stroke();
    };

    //draw HV box for one cloverleaf:
    this.crystal = function(x0, y0, border, fill){
        this.detailContext.strokeStyle = border;
        this.detailContext.fillStyle = '#4C4C4C';
        this.detailContext.fillRect(x0, y0, this.crystalSide, this.crystalSide);
        this.detailContext.strokeRect(x0, y0, this.crystalSide, this.crystalSide);
        this.detailContext.stroke();
    };    

    //draw split crystal for HV view
    this.splitCrystal = function(x0, y0, border, fill){
        this.detailContext.strokeStyle = border;
        this.detailContext.fillStyle = '#4C4C4C';
        this.detailContext.beginPath();
        this.detailContext.moveTo(x0+this.crystalSide,y0);
        this.detailContext.lineTo(x0,y0);
        this.detailContext.lineTo(x0,y0+this.crystalSide);
        this.detailContext.closePath();
        this.detailContext.fill();
        this.detailContext.stroke();

        this.detailContext.beginPath();
        this.detailContext.moveTo(x0+this.crystalSide,y0);
        this.detailContext.lineTo(x0+this.crystalSide,y0+this.crystalSide);
        this.detailContext.lineTo(x0,y0+this.crystalSide);
        this.detailContext.closePath();
        this.detailContext.fill();
        this.detailContext.stroke();
    };

    //draw BGO summary box
    this.BGOsummary = function(x0,y0,fill){
        this.context.strokeStyle = '#999999';
        this.context.fillRect(x0,y0,this.BGOouter, this.BGOouter);
        this.context.strokeRect(x0,y0,this.BGOouter, this.BGOouter);

        this.context.clearRect(x0 + (this.BGOouter-this.BGOinner)/2, y0 + (this.BGOouter-this.BGOinner)/2, this.BGOinner, this.BGOinner);
        this.context.strokeRect(x0 + (this.BGOouter-this.BGOinner)/2, y0 + (this.BGOouter-this.BGOinner)/2, this.BGOinner, this.BGOinner);
    };

    //draw HPGE summary
    this.HPGEsummary = function(x0,y0){
        this.context.strokeStyle = '#999999';
        this.context.fillRect(x0 + (this.BGOouter-this.HPGEside)/2, y0 + (this.BGOouter-this.HPGEside)/2, this.HPGEside,this.HPGEside);
        this.context.strokeRect(x0 + (this.BGOouter-this.HPGEside)/2, y0 + (this.BGOouter-this.HPGEside)/2, this.HPGEside, this.HPGEside);

    };

    //draw L shape
    this.drawL = function(phi, thickness, length, x0, y0, border, fill){
        this.detailContext.strokeStyle = border;
        this.detailContext.fillStyle = '#4C4C4C';
    	this.detailContext.save();
    	this.detailContext.translate(x0, y0);
    	this.detailContext.rotate(phi);

        this.detailContext.beginPath();
    	this.detailContext.moveTo(0,0);
    	this.detailContext.lineTo(length, 0);
    	this.detailContext.lineTo(length, thickness);
    	this.detailContext.lineTo(thickness, thickness);
    	this.detailContext.lineTo(thickness, length);
    	this.detailContext.lineTo(0,length);
    	this.detailContext.closePath();
        this.detailContext.fill();
    	this.detailContext.stroke();

    	this.detailContext.restore();

    };

    //draw half-L
    this.drawHalfL = function(phi, thickness, length, x0, y0, chirality, split, border, fill){
        this.detailContext.strokeStyle = border;
        this.detailContext.fillStyle = '#4C4C4C';
        this.detailContext.save();
        this.detailContext.translate(x0, y0);
        this.detailContext.rotate(phi);

        if(chirality == 'left'){
            this.detailContext.translate(this.detailContext.width,0);
            this.detailContext.scale(-1,1);   
        }

        if(split){
            this.detailContext.beginPath();
            this.detailContext.moveTo((length-thickness)/2,0);
            this.detailContext.lineTo(length-thickness, 0);
            this.detailContext.lineTo(length-thickness, -thickness);
            this.detailContext.lineTo((length-thickness)/2,-thickness);
            this.detailContext.closePath();
            this.detailContext.fill();
            this.detailContext.stroke();

            this.detailContext.beginPath();
            this.detailContext.moveTo(0,0);
            this.detailContext.lineTo((length-thickness)/2,0);
            this.detailContext.lineTo((length-thickness)/2,-thickness);
            this.detailContext.lineTo(-thickness, -thickness);
            this.detailContext.closePath();
            this.detailContext.fill();
            this.detailContext.stroke();
        } else{
            this.detailContext.beginPath();
            this.detailContext.moveTo(0,0);
            this.detailContext.lineTo(length-thickness, 0);
            this.detailContext.lineTo(length-thickness, -thickness);
            this.detailContext.lineTo(-thickness, -thickness);
            this.detailContext.closePath();
            this.detailContext.fill();
            this.detailContext.stroke();
        }

        this.detailContext.restore();
    };


}










