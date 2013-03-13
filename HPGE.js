function HPGE(){

	this.monitorID = window.parameters.wrapper;		//div ID of wrapper div
	this.canvasID = 'HPGECanvas'; 			        //ID of canvas to draw top level TIGRESS view on
	this.detailCanvasID = 'HPGEdetailCanvas';		//ID of canvas to draw single HPGE view on
    this.linkWrapperID = 'SubsystemLinks';          //ID of div wrapping subsystem navigation links
    this.sidebarID = 'SubsystemSidebar';            //ID of right sidebar for this object
    this.topNavID = 'SubsystemsButton';             //ID of top level nav button
    this.TTcanvasID = 'HPGETTCanvas';               //ID of hidden tooltip map canvas for summary level
    this.TTdetailCanvasID = 'HPGETTdetailCanvas';   //ID of hidden tooltip map canvas for detail level
    this.minima = window.parameters.HPGEminima;     //array of scale minima: [HPGE HV, HPGE Thresholds, HPGE Rate...]
    this.maxima = window.parameters.HPGEmaxima;     //array of scale maxima, arranged as minima.
    this.mode = window.parameters.HPGEmode;         //mode to run in, either 'TIGRESS' or 'GRIFFIN'
    this.BGOenable = window.parameters.BGOenable;   //are the suppresors present?
    this.dataBus = new HPGEDS();

    this.cloverShowing = 1;                         //index of clover currently showing in detail view
    this.detailShowing = 0;                         //is the detail canvas showing?

    this.nHPGEsegments = 0;
    if(this.mode == 'TIGRESS')
        this.nHPGEsegments = 40;
    else if(this.mode == 'GRIFFIN')
        this.nHPGEsegments = 8;

    var that = this;
    //make a pointer at window level back to this object, so we can pass by reference to the nav button onclick
    window.HPGEpointer = that;

    //establish animation parameters////////////////////////////////////////////////////////////////////
    this.FPS = 30;
    this.duration = 0.5;
    this.nFrames = this.FPS*this.duration;

    //subsystem navigation//////////////////////////////////////////////////////////////////////////////
    //insert nav link
    insertButton('HPGElink', 'navLink', "javascript:swapFade('HPGElink', window.HPGEpointer, window.subsystemScalars, window.subdetectorView)", this.linkWrapperID, 'HPGE');

    //insert & scale canvas//////////////////////////////////////////////////////////////////////////////////////
    this.monitor = document.getElementById(this.monitorID);
    this.canvasWidth = 0.48*$(this.monitor).width();
    this.canvasHeight = 0.8*$(this.monitor).height();
    //top level
    insertCanvas(this.canvasID, 'monitor', 'top:' + ($('#SubsystemLinks').height()*1.25 + 5) +'px; transition:opacity 0.5s, z-index 0.5s; -moz-transition:opacity 0.5s, z-index 0.5s; -webkit-transition:opacity 0.5s, z-index 0.5s;', this.canvasWidth, this.canvasHeight, this.monitorID);
    this.canvas = document.getElementById(this.canvasID);
    this.context = this.canvas.getContext('2d');
    //detail level
    insertCanvas(this.detailCanvasID, 'monitor', 'top:' + ($('#SubsystemLinks').height()*1.25 + 5) +'px; transition:opacity 0.5s, z-index 0.5s; -moz-transition:opacity 0.5s, z-index 0.5s; -webkit-transition:opacity 0.5s, z-index 0.5s;', this.canvasWidth, this.canvasHeight, this.monitorID);
    this.detailCanvas = document.getElementById(this.detailCanvasID);
    this.detailContext = this.detailCanvas.getContext('2d');
    //hidden Tooltip map layer for summary
    insertCanvas(this.TTcanvasID, 'monitor', 'top:' + ($('#SubsystemLinks').height()*1.25 + 5) +'px;', this.canvasWidth, this.canvasHeight, this.monitorID);
    this.TTcanvas = document.getElementById(this.TTcanvasID);
    this.TTcontext = this.TTcanvas.getContext('2d');
    //hidden Tooltip map layer for detail
    insertCanvas(this.TTdetailCanvasID, 'monitor', 'top:' + ($('#SubsystemLinks').height()*1.25 + 5) +'px;', this.canvasWidth, this.canvasHeight, this.monitorID);
    this.TTdetailCanvas = document.getElementById(this.TTdetailCanvasID);
    this.TTdetailContext = this.TTdetailCanvas.getContext('2d');

    //onclick switch between top and detail view:
    this.detailCanvas.onclick = function(event){
                                    that.detailShowing = 0;
                                    swapFade(null, that, 1000, 0);
                                };
    this.canvas.onclick =   function(event){
                                //use TT layer to decide which clover user clicked on
                                var cloverClicked = -1;
                                var x,y;
                                x = event.pageX - that.canvas.offsetLeft - that.monitor.offsetLeft;
                                y = event.pageY - that.canvas.offsetTop - that.monitor.offsetTop;
                                cloverClicked = that.findCell(x,y);
                                //draw and swap out if user clicked on a valid clover
                                if(cloverClicked != -1){
                                    that.cloverShowing = cloverClicked
                                    that.drawDetail(that.detailContext, that.nFrames);
                                    that.drawDetail(that.TTdetailContext, that.nFrames);
                                    that.detailShowing = 1;
                                    swapFade(null, that, 1000, 0)
                                }
                            };

    //Dirty trick to implement tooltip on obnoxious geometry: make another canvas of the same size hidden beneath, with the 
    //detector drawn on it, but with each element filled in with rgba(0,0,n,1), where n is the channel number; fetching the color from the 
    //hidden canvas at point x,y will then return the appropriate channel index.
    //summary level:
    //paint whole hidden canvas with R!=G!=B to trigger TT suppression:
    this.TTcontext.fillStyle = 'rgba(50,100,150,1)';
    this.TTcontext.fillRect(0,0,this.canvasWidth, this.canvasHeight);
    //set up summary tooltip:
    this.tooltip = new Tooltip(this.canvasID, 'HPGETipText', 'HPGEttCanv', 'HPGETT', this.monitorID, window.parameters.HPGEprefix, window.parameters.HPGEpostfix);
    this.tooltip.obj = that;
    //detail level tt:
    //paint whole hidden canvas with R!=G!=B to trigger TT suppression:
    this.TTdetailContext.fillStyle = 'rgba(50,100,150,1)';
    this.TTdetailContext.fillRect(0,0,this.canvasWidth, this.canvasHeight);
    //set up detail tooltip:
    this.detailTooltip = new Tooltip(this.detailCanvasID, 'HPGEdetailTipText', 'HPGEttDetailCanv', 'HPGETTdetail', this.monitorID, window.parameters.HPGEprefix, window.parameters.HPGEpostfix);
    this.detailTooltip.obj = that;

    //drawing parameters/////////////////////////////////////////////////////////////////////////////////////////////
    this.centerX = this.canvasWidth/2;
    this.centerY = this.canvasHeight/2*0.9;
    this.lineWeight = 2;

    //summary view
    this.BGOouter = 0.08*this.canvasWidth;
    this.BGOinner = 0.67*this.BGOouter;
    this.HPGEside = 0.4*this.BGOouter;
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
    this.summaryCoord[5] = [this.secondCol, this.secondRow, 'north'];
    this.summaryCoord[6] = [this.secondCol, this.firstRow, 'north'];
    this.summaryCoord[7] = [this.fifthCol, this.firstRow, 'south'];
    this.summaryCoord[8] = [this.fifthCol, this.secondRow, 'south'];
    this.summaryCoord[9] = [this.fifthCol, this.thirdRow, 'south']; 
    this.summaryCoord[10] = [this.fifthCol, this.fourthRow, 'south'];
    this.summaryCoord[11] = [this.secondCol, this.fourthRow, 'north'];
    this.summaryCoord[12] = [this.secondCol, this.thirdRow, 'north'];
    if(this.mode == 'TIGRESS'){
        this.summaryCoord[1] = [this.thirdCol, this.secondRow, 'north'];
        this.summaryCoord[2] = [this.fourthCol, this.firstRow, 'south'];
        this.summaryCoord[3] = [this.fourthCol, this.thirdRow, 'south'];
        this.summaryCoord[4] = [this.thirdCol, this.fourthRow, 'north'];
        this.summaryCoord[13] = [this.firstCol, this.secondRow, 'north'];
        this.summaryCoord[14] = [this.sixthCol, this.firstRow, 'south'];
        this.summaryCoord[15] = [this.sixthCol, this.thirdRow, 'south'];
        this.summaryCoord[16] = [this.firstCol, this.fourthRow, 'north'];
    } else if(this.mode == 'GRIFFIN'){
        this.summaryCoord[1] = [this.thirdCol, this.firstRow, 'north'];
        this.summaryCoord[2] = [this.fourthCol, this.secondRow, 'south'];
        this.summaryCoord[3] = [this.fourthCol, this.fourthRow, 'south'];
        this.summaryCoord[4] = [this.thirdCol, this.thirdRow, 'north'];
        this.summaryCoord[13] = [this.firstCol, this.firstRow, 'north'];
        this.summaryCoord[14] = [this.sixthCol, this.secondRow, 'south'];
        this.summaryCoord[15] = [this.sixthCol, this.fourthRow, 'south'];
        this.summaryCoord[16] = [this.firstCol, this.thirdRow, 'north'];
    }

    //detail view
    this.crystalSide = this.canvasWidth*0.1*0.9;
    this.suppressorWidth = this.canvasWidth*0.03*0.9;
    this.suppressorSpacing = this.canvasWidth*0.04*0.9;
    this.backBGOinnerWidth = 2*this.crystalSide + 2*this.suppressorSpacing;
    this.backBGOouterWidth = this.backBGOinnerWidth + 2*this.suppressorWidth;
    this.sideBGOinnerWidth = this.backBGOouterWidth + 2*this.suppressorSpacing;
    this.sideBGOouterWidth = this.sideBGOinnerWidth + 2*this.suppressorWidth;
    this.frontBGOinnerWidth = this.sideBGOouterWidth + 2*this.suppressorSpacing;
    this.frontBGOouterWidth = this.frontBGOinnerWidth + 2*this.suppressorWidth;
    this.sideSpacer = 20;

    //establish data buffers////////////////////////////////////////////////////////////////////////////
    this.summaryHPGEHVcolor = [];
    this.oldSummaryHPGEHVcolor = [];
    this.summaryHPGEthresholdColor = [];
    this.oldSummaryHPGEthresholdColor = [];
    this.summaryHPGErateColor = [];
    this.oldSummaryHPGErateColor = [];
    this.summaryBGOHVcolor = [];
    this.oldSummaryBGOHVcolor = [];
    this.summaryBGOthresholdColor = [];
    this.oldSummaryBGOthresholdColor = [];
    this.summaryBGOrateColor = [];
    this.oldSummaryBGOrateColor = [];

    this.detailHPGEHVcolor = [];
    this.oldDetailHPGEHVcolor = [];
    this.detailHPGEthresholdColor = [];
    this.oldDetailHPGEthresholdColor = [];
    this.detailHPGErateColor = [];
    this.oldDetailHPGErateColor = [];
    this.detailBGOHVcolor = [];
    this.oldDetailBGOHVcolor = [];
    this.detailBGOthresholdColor = [];
    this.oldDetailBGOthresholdColor = [];
    this.detailBGOrateColor = [];
    this.oldDetailBGOrateColor = [];

    //Member functions/////////////////////////////////////////////////////////////////////////////////
    //decide which view to transition to when this object is navigated to
    this.view = function(){
        if(this.detailShowing == 0)
            return this.canvasID;
        else if(this.detailShowing == 1)
            return this.detailCanvasID;
    }

    this.draw = function(frame){
        var i;
        this.context.lineWidth = this.lineWeight;

        for(i=0; i<16; i++){
            this.drawSummary(this.summaryCoord[i+1][0], this.summaryCoord[i+1][1], this.summaryCoord[i+1][2], i+1, frame);
        }

        //titles
        this.context.clearRect(0,0.65*this.canvasHeight,this.canvasWidth,0.35*this.canvasHeight);
        this.context.fillStyle = '#999999';
        this.context.font="24px 'Orbitron'";
        if(this.mode == 'TIGRESS'){
            this.context.fillText('North Hemisphere', 0.325*this.canvasWidth - this.context.measureText('North Hemisphere').width/2, 0.7*this.canvasHeight);
            this.context.fillText('South Hemisphere', 0.725*this.canvasWidth - this.context.measureText('North Hemisphere').width/2, 0.7*this.canvasHeight);
        } else if(this.mode == 'GRIFFIN'){
            this.context.fillText('West Hemisphere', 0.325*this.canvasWidth - this.context.measureText('West Hemisphere').width/2, 0.7*this.canvasHeight);
            this.context.fillText('East Hemisphere', 0.725*this.canvasWidth - this.context.measureText('East Hemisphere').width/2, 0.7*this.canvasHeight);
        }
    };


    //drawing functions/////////////////////////////////////////////////////////
    //summary view/////////////////////////

    this.drawSummary = function(x0,y0, hemisphere, cloverNumber, frame){
        var i;
        var colors 
        //cloverleaves are oriented differently in north and south hemispheres in the blueprints, match here:
        if(hemisphere == 'north') colors = ['#00FF00', '#0000FF', '#FF0000', '#FFFFFF'];
        else if(hemisphere == 'south') colors = ['#FFFFFF', '#FF0000', '#0000FF', '#00FF00'];

        for(i=0; i<4; i++){

            //HPGE
            //fill the crystal quarter with the appropriate color on the top view, or the tt encoding on the tt layer:
            if(window.subdetectorView == 0) this.context.fillStyle = interpolateColor(parseHexColor(this.oldSummaryHPGEHVcolor[4*(cloverNumber-1)+i]), parseHexColor(this.summaryHPGEHVcolor[4*(cloverNumber-1)+i]), frame/this.nFrames);
            else if(window.subdetectorView == 1) this.context.fillStyle = interpolateColor(parseHexColor(this.oldSummaryHPGEthresholdColor[4*(cloverNumber-1)+i]), parseHexColor(this.summaryHPGEthresholdColor[4*(cloverNumber-1)+i]), frame/this.nFrames);
            else if(window.subdetectorView == 2) this.context.fillStyle = interpolateColor(parseHexColor(this.oldSummaryHPGErateColor[4*(cloverNumber-1)+i]), parseHexColor(this.summaryHPGErateColor[4*(cloverNumber-1)+i]), frame/this.nFrames);
            this.context.fillRect(Math.round(x0 + (this.BGOouter-this.HPGEside)/2 + (i%2)*(this.lineWeight + this.HPGEside/2)), Math.round(y0 + (this.BGOouter-this.HPGEside)/2 + (i>>1)/2*(2*this.lineWeight + this.HPGEside)), Math.round(this.HPGEside/2),Math.round(this.HPGEside/2));
            //give the top view clovers an appropriately-colored outline:
            this.context.strokeStyle = colors[i];
            this.context.strokeRect(x0 + (this.BGOouter-this.HPGEside)/2 + (i%2)*(this.lineWeight + this.HPGEside/2), y0 + (this.BGOouter-this.HPGEside)/2 + (i>>1)/2*(2*this.lineWeight + this.HPGEside), this.HPGEside/2, this.HPGEside/2);

            //BGO
            var rotation 
            if(i<2) rotation = i*Math.PI/2;
            else if(i==2) rotation = 3*Math.PI/2;
            else if(i==3) rotation = Math.PI;
            var color = '#000000';
            if(this.BGOenable){
                if(window.subdetectorView == 0) color = interpolateColor(parseHexColor(this.oldSummaryBGOHVcolor[4*(cloverNumber-1)+i]), parseHexColor(this.summaryBGOHVcolor[4*(cloverNumber-1)+i]), frame/this.nFrames);
                else if(window.subdetectorView == 1) color = interpolateColor(parseHexColor(this.oldSummaryBGOthresholdColor[4*(cloverNumber-1)+i]), parseHexColor(this.summaryBGOthresholdColor[4*(cloverNumber-1)+i]), frame/this.nFrames);
                else if(window.subdetectorView == 2) color = interpolateColor(parseHexColor(this.oldSummaryBGOrateColor[4*(cloverNumber-1)+i]), parseHexColor(this.summaryBGOrateColor[4*(cloverNumber-1)+i]), frame/this.nFrames);
            }
            this.drawL(this.context, rotation, Math.round((this.BGOouter - this.BGOinner)/2), Math.round(this.BGOouter/2), Math.round(x0 + (this.BGOouter+this.lineWeight)*(i%2)), Math.round(y0 + (this.BGOouter+this.lineWeight)*(i>>1)), colors[i], color);

            //reproduce encoded shadow on the summary tooltip canvas:
            this.TTcontext.fillStyle = 'rgba('+cloverNumber+', '+cloverNumber+', '+cloverNumber+', 1)';
            this.TTcontext.fillRect(Math.round(x0), Math.round(y0), Math.round(this.BGOouter), Math.round(this.BGOouter) );
        }
    }

    //detail view///////////////////////////

    this.drawDetail = function(context, frame){
        var i, j;

        //state variables select the segmentation state of HPGE and services of BGO 
        var HPGEstate, BGOstate;

        this.detailContext.lineWidth = this.lineWeight;

        //colorWheel enumerates the standard configuration of color sectors:
        var colorWheel = ['#00FF00', '#0000FF', '#FFFFFF', '#FF0000'];
        //orientation enumerates orientations of half-BGOs
        var orientation = ['left', 'right'];

        var fillColor, fillColor2;

        if(window.subdetectorView == 0){
            HPGEstate = 0; //no segmentation
            BGOstate = 1;  //two services per sector per side per suppressor
        }else if(window.subdetectorView == 1 || window.subdetectorView == 2){
            HPGEstate = 1; //9-element segmentation
            BGOstate = 0;  //one service per sector per side per suppressor
        }
            
        //loop over quadrents:
        for(i=0; i<4; i++){
            //useful switches:
            var PBC = Math.ceil((i%3)/3);               //positive for i=1,2, 0 OW
            var NAD = Math.ceil((i%3)/3) - 1;           //negative for i=0,3, 0 OW
            var NAB = Math.floor(i/2) - 1;              //negative for i=0,1, 0 OW
            var PCD = Math.floor(i/2);                  //positive for i=2,3, 0 OW

            //HPGE/////////////////////////////
            if(HPGEstate == 0){
                if(context == this.detailContext){
                    fillColor  = interpolateColor(parseHexColor(this.oldDetailHPGEHVcolor[4*(this.cloverShowing-1)+i]), parseHexColor(this.detailHPGEHVcolor[4*(this.cloverShowing-1)+i]), frame/this.nFrames);
                } else{
                    fillColor  = 'rgba('+i+', '+i+', '+i+', 1)';
                }
                this.crystal(context, this.centerX + PBC*this.lineWeight + NAD*this.crystalSide, this.centerY + NAB*this.crystalSide + PCD*this.lineWeight, colorWheel[i], fillColor);

            } else if(HPGEstate == 1){
                if(this.mode == 'TIGRESS'){
                    //cores
                    if(context == this.detailContext){
                        if(window.subdetectorView == 1){ 
                            fillColor  = interpolateColor(parseHexColor(this.oldDetailHPGEthresholdColor[this.nHPGEsegments*(this.cloverShowing-1)+this.nHPGEsegments/4*i]), parseHexColor(this.detailHPGEthresholdColor[this.nHPGEsegments*(this.cloverShowing-1)+this.nHPGEsegments/4*i]), frame/this.nFrames);
                            fillColor2 = interpolateColor(parseHexColor(this.oldDetailHPGEthresholdColor[this.nHPGEsegments*(this.cloverShowing-1)+this.nHPGEsegments/4*i+1]), parseHexColor(this.detailHPGEthresholdColor[this.nHPGEsegments*(this.cloverShowing-1)+this.nHPGEsegments/4*i+1]), frame/this.nFrames);
                        }
                        else if(window.subdetectorView == 2){
                            fillColor  = interpolateColor(parseHexColor(this.oldDetailHPGErateColor[this.nHPGEsegments*(this.cloverShowing-1)+this.nHPGEsegments/4*i]), parseHexColor(this.detailHPGErateColor[this.nHPGEsegments*(this.cloverShowing-1)+this.nHPGEsegments/4*i]), frame/this.nFrames);
                            fillColor2 = interpolateColor(parseHexColor(this.oldDetailHPGErateColor[this.nHPGEsegments*(this.cloverShowing-1)+this.nHPGEsegments/4*i+1]), parseHexColor(this.detailHPGErateColor[this.nHPGEsegments*(this.cloverShowing-1)+this.nHPGEsegments/4*i+1]), frame/this.nFrames);
                        }
                    } else{
                        fillColor  = 'rgba('+this.nHPGEsegments/4*i+', '+this.nHPGEsegments/4*i+', '+this.nHPGEsegments/4*i+', 1)';
                        fillColor2 = 'rgba('+(this.nHPGEsegments/4*i+1)+', '+(this.nHPGEsegments/4*i+1)+', '+(this.nHPGEsegments/4*i+1)+', 1)';
                    }
                    this.splitCrystal(context, this.centerX + NAD*2/3*this.crystalSide + PBC*1/3*this.crystalSide + PBC*this.lineWeight, this.centerY + NAB*2/3*this.crystalSide + PCD*1/3*this.crystalSide + PCD*this.lineWeight, this.crystalSide/3, i, colorWheel[i], fillColor, fillColor2);  

                    for(j=0; j<4; j++){
                        //useful switches:
                        var PBC2 = Math.ceil((j%3)/3);               //positive for i=1,2, 0 OW
                        var NAD2 = Math.ceil((j%3)/3) - 1;           //negative for i=0,3, 0 OW
                        var NAB2 = Math.floor(j/2) - 1;              //negative for i=0,1, 0 OW
                        var PCD2 = Math.floor(j/2);                  //positive for i=2,3, 0 OW

                        //front segs
                        if(context == this.detailContext){
                            if(window.subdetectorView == 1) fillColor = interpolateColor(parseHexColor(this.oldDetailHPGEthresholdColor[this.nHPGEsegments*(this.cloverShowing-1)+this.nHPGEsegments/4*i+j+2]), parseHexColor(this.detailHPGEthresholdColor[this.nHPGEsegments*(this.cloverShowing-1)+this.nHPGEsegments/4*i+j+2]), frame/this.nFrames);
                            else if(window.subdetectorView == 2) fillColor = interpolateColor(parseHexColor(this.oldDetailHPGErateColor[this.nHPGEsegments*(this.cloverShowing-1)+this.nHPGEsegments/4*i+j+2]), parseHexColor(this.detailHPGErateColor[this.nHPGEsegments*(this.cloverShowing-1)+this.nHPGEsegments/4*i+j+2]), frame/this.nFrames);
    
                        } else
                            fillColor = 'rgba('+(this.nHPGEsegments/4*i+j+2)+', '+(this.nHPGEsegments/4*i+j+2)+', '+(this.nHPGEsegments/4*i+j+2)+', 1)';
                        this.drawL(context, j*Math.PI/2, this.crystalSide/6, 1/3*this.crystalSide, this.centerX + PBC*this.lineWeight + NAD*(-NAD2)*5/6*this.crystalSide + NAD*PBC2*1/6*this.crystalSide + PBC*(-NAD2)*1/6*this.crystalSide + PBC*PBC2*5/6*this.crystalSide, this.centerY + NAB*(-NAB2)*5/6*this.crystalSide + NAB*PCD2*1/6*this.crystalSide + PCD*(-NAB2)*1/6*this.crystalSide + PCD*PCD2*5/6*this.crystalSide + PCD*this.lineWeight, colorWheel[i], fillColor);

                        //back segs
                        if(context == this.detailContext){
                            if(window.subdetectorView == 1) fillColor = interpolateColor(parseHexColor(this.oldDetailHPGEthresholdColor[this.nHPGEsegments*(this.cloverShowing-1)+this.nHPGEsegments/4*i+j+2+4]), parseHexColor(this.detailHPGEthresholdColor[this.nHPGEsegments*(this.cloverShowing-1)+this.nHPGEsegments/4*i+j+2+4]), frame/this.nFrames);
                            else if(window.subdetectorView == 2) fillColor = interpolateColor(parseHexColor(this.oldDetailHPGErateColor[this.nHPGEsegments*(this.cloverShowing-1)+this.nHPGEsegments/4*i+j+2+4]), parseHexColor(this.detailHPGErateColor[this.nHPGEsegments*(this.cloverShowing-1)+this.nHPGEsegments/4*i+j+2+4]), frame/this.nFrames);
                        } else
                            fillColor = 'rgba('+(this.nHPGEsegments/4*i+j+2+4)+', '+(this.nHPGEsegments/4*i+j+2+4)+', '+(this.nHPGEsegments/4*i+j+2+4)+', 1)';
                        this.drawL(context, j*Math.PI/2, this.crystalSide/6, this.crystalSide/2, this.centerX + (-NAD)*NAD2*this.crystalSide + PBC*PBC2*this.crystalSide + PBC*this.lineWeight, this.centerY + (-NAB)*NAB2*this.crystalSide + PCD*PCD2*this.crystalSide + PCD*this.lineWeight, colorWheel[i], fillColor);
                    }
                } else if(this.mode == 'GRIFFIN'){
                    //cores
                    if(context == this.detailContext){
                        if(window.subdetectorView == 1){
                            fillColor  = interpolateColor(parseHexColor(this.oldDetailHPGEthresholdColor[8*(this.cloverShowing-1)+2*i]), parseHexColor(this.detailHPGEthresholdColor[8*(this.cloverShowing-1)+2*i]), frame/this.nFrames);
                            fillColor2 = interpolateColor(parseHexColor(this.oldDetailHPGEthresholdColor[8*(this.cloverShowing-1)+2*i+1]), parseHexColor(this.detailHPGEthresholdColor[8*(this.cloverShowing-1)+2*i+1]), frame/this.nFrames);
                        }
                        else if(window.subdetectorView == 2){ 
                            fillColor = interpolateColor(parseHexColor(this.oldDetailHPGErateColor[8*(this.cloverShowing-1)+2*i]), parseHexColor(this.detailHPGErateColor[8*(this.cloverShowing-1)+2*i]), frame/this.nFrames);
                            fillColor2 = interpolateColor(parseHexColor(this.oldDetailHPGErateColor[8*(this.cloverShowing-1)+2*i+1]), parseHexColor(this.detailHPGErateColor[8*(this.cloverShowing-1)+2*i+1]), frame/this.nFrames);
                        }
                    } else {
                        fillColor  = 'rgba('+2*i+', '+2*i+', '+2*i+', 1)';
                        fillColor2 = 'rgba('+(2*i+1)+', '+(2*i+1)+', '+(2*i+1)+', 1)';
                    }

                    this.splitCrystal(context, this.centerX + NAD*this.crystalSide + PBC*this.lineWeight, this.centerY + NAB*this.crystalSide + PCD*this.lineWeight, this.crystalSide, i, colorWheel[i], fillColor, fillColor2);                    
                }
            }

            //BGO//////////////////////////////
            for(j=0; j<2; j++){
                //useful switches
                var NA = j-1;
                var NB = (-1)*j;
                var PA = (j+1)%2;
                var PB = j;

                //back suppressors
                if(context == this.detailContext){
                    if(window.subdetectorView == 0){ 
                        fillColor  = interpolateColor(parseHexColor(this.oldDetailBGOHVcolor[40*(this.cloverShowing-1)+i*2+j]), parseHexColor(this.detailBGOHVcolor[40*(this.cloverShowing-1)+i*2+j]), frame/this.nFrames);
                    }
                    else if(window.subdetectorView == 1) fillColor = interpolateColor(parseHexColor(this.oldDetailBGOthresholdColor[20*(this.cloverShowing-1)+i]), parseHexColor(this.detailBGOthresholdColor[20*(this.cloverShowing-1)+i]), frame/this.nFrames);
                    else if(window.subdetectorView == 2) fillColor = interpolateColor(parseHexColor(this.oldDetailBGOrateColor[20*(this.cloverShowing-1)+i]), parseHexColor(this.detailBGOrateColor[20*(this.cloverShowing-1)+i]), frame/this.nFrames);
                } else{
                    if(window.subdetectorView == 0){
                        fillColor  = 'rgba('+(4+2*i+j)+', '+(4+2*i+j)+', '+(4+2*i+j)+', 1)';
                    }
                    else
                        fillColor = 'rgba('+(this.nHPGEsegments+i)+', '+(this.nHPGEsegments+i)+', '+(this.nHPGEsegments+i)+', 1)';
                }
                if(window.subdetectorView == 0){
                    this.drawHalfL(context, (i-1+j)*(Math.PI/2), this.suppressorWidth, this.backBGOouterWidth/2, this.centerX + NAD*this.backBGOinnerWidth/2 + PBC*this.backBGOinnerWidth/2 + PBC*2*this.lineWeight + (-NAB)*NA*this.lineWeight + PCD*NB*this.lineWeight, this.centerY + (NAB+PCD)*this.backBGOinnerWidth/2 + PCD*2*this.lineWeight + (-NAD)*NB*this.lineWeight + PBC*NA*this.lineWeight, orientation[j], false, colorWheel[i], fillColor);
                } else if(window.subdetectorView == 1 || window.subdetectorView == 2){
                    if(j==0) this.drawL(context, i*(Math.PI/2), this.suppressorWidth, this.backBGOouterWidth/2, this.centerX + NAD*this.backBGOinnerWidth/2 + PBC*this.backBGOinnerWidth/2 + PBC*this.lineWeight + (NAD+PBC)*this.suppressorWidth, this.centerY + (NAB+PCD)*this.backBGOinnerWidth/2 + PCD*this.lineWeight + (NAB+PCD)*this.suppressorWidth, colorWheel[i], fillColor);    
                }

                //side suppressors
                if(context == this.detailContext){
                    if(window.subdetectorView == 0){
                        fillColor  = interpolateColor(parseHexColor(this.oldDetailBGOHVcolor[40*(this.cloverShowing-1)+i*4+j*2+8]), parseHexColor(this.detailBGOHVcolor[40*(this.cloverShowing-1)+i*4+j*2+8]), frame/this.nFrames);
                        fillColor2 = interpolateColor(parseHexColor(this.oldDetailBGOHVcolor[40*(this.cloverShowing-1)+i*4+j*2+8+1]), parseHexColor(this.detailBGOHVcolor[40*(this.cloverShowing-1)+i*4+j*2+8+1]), frame/this.nFrames);
                    }
                    else if(window.subdetectorView == 1) fillColor = interpolateColor(parseHexColor(this.oldDetailBGOthresholdColor[20*(this.cloverShowing-1)+i*2+j+4]), parseHexColor(this.detailBGOthresholdColor[20*(this.cloverShowing-1)+i*2+j+4]), frame/this.nFrames);
                    else if(window.subdetectorView == 2) fillColor = interpolateColor(parseHexColor(this.oldDetailBGOrateColor[20*(this.cloverShowing-1)+i*2+j+4]), parseHexColor(this.detailBGOrateColor[20*(this.cloverShowing-1)+i*2+j+4]), frame/this.nFrames);
                } else{
                    if(window.subdetectorView == 0){
                        fillColor  = 'rgba('+(4+8+4*i+2*j)+', '+(4+8+4*i+2*j)+', '+(4+8+4*i+2*j)+', 1)';
                        fillColor2 = 'rgba('+(4+8+4*i+2*j+1)+', '+(4+8+4*i+2*j+1)+', '+(4+8+4*i+2*j+1)+', 1)';
                    }
                    else
                        fillColor = 'rgba('+(this.nHPGEsegments+4+2*i+j)+', '+(this.nHPGEsegments+4+2*i+j)+', '+(this.nHPGEsegments+4+2*i+j)+', 1)';
                }
                this.drawHalfL(context, (i-1+j)*(Math.PI/2), this.suppressorWidth, this.sideBGOouterWidth/2, this.centerX +NAD*this.sideBGOinnerWidth/2 + PBC*this.sideBGOinnerWidth/2 + PBC*2*this.lineWeight + (-NAB)*NA*this.lineWeight + PCD*NB*this.lineWeight     , this.centerY + (NAB+PCD)*this.sideBGOinnerWidth/2 + PCD*2*this.lineWeight + (-NAD)*NB*this.lineWeight + PBC*NA*this.lineWeight, orientation[j], BGOstate, colorWheel[i], fillColor, fillColor2);
                //front suppressors
                if(context == this.detailContext){
                    if(window.subdetectorView == 0){
                        fillColor  = interpolateColor(parseHexColor(this.oldDetailBGOHVcolor[40*(this.cloverShowing-1)+i*4+j*2+8+16]), parseHexColor(this.detailBGOHVcolor[40*(this.cloverShowing-1)+i*4+j*2+8+16]), frame/this.nFrames);
                        fillColor2 = interpolateColor(parseHexColor(this.oldDetailBGOHVcolor[40*(this.cloverShowing-1)+i*4+j*2+8+16+1]), parseHexColor(this.detailBGOHVcolor[40*(this.cloverShowing-1)+i*4+j*2+8+16+1]), frame/this.nFrames);
                    }
                    else if(window.subdetectorView == 1) fillColor = interpolateColor(parseHexColor(this.oldDetailBGOthresholdColor[20*(this.cloverShowing-1)+i*2+j+4+8]), parseHexColor(this.detailBGOthresholdColor[20*(this.cloverShowing-1)+i*2+j+4+8]), frame/this.nFrames);
                    else if(window.subdetectorView == 2) fillColor = interpolateColor(parseHexColor(this.oldDetailBGOrateColor[20*(this.cloverShowing-1)+i*2+j+4+8]), parseHexColor(this.detailBGOrateColor[20*(this.cloverShowing-1)+i*2+j+4+8]), frame/this.nFrames);
                } else{
                    if(window.subdetectorView == 0){
                        fillColor  = 'rgba('+(4+8+16+4*i+2*j)+', '+(4+8+16+4*i+2*j)+', '+(4+8+16+4*i+2*j)+', 1)';
                        fillColor2 = 'rgba('+(4+8+16+4*i+2*j+1)+', '+(4+8+16+4*i+2*j+1)+', '+(4+8+16+4*i+2*j+1)+', 1)';
                    }
                    else
                        fillColor = 'rgba('+(this.nHPGEsegments+4+8+2*i+j)+', '+(this.nHPGEsegments+4+8+2*i+j)+', '+(this.nHPGEsegments+4+8+2*i+j)+', 1)';
                }
                this.drawHalfL(context, (i-1+j)*(Math.PI/2), this.suppressorWidth, this.frontBGOouterWidth/2 - this.sideSpacer, this.centerX + (PBC+NAD)*this.frontBGOinnerWidth/2 + PBC*this.lineWeight + (-NAB)*NA*this.sideSpacer + PCD*NB*this.sideSpacer + (-NAD)*this.sideSpacer, this.centerY + (NAB+PCD)*this.frontBGOinnerWidth/2 + PCD*this.lineWeight + (-NAB*PA + PBC*NA + PBC*PB + PCD*NB)*this.sideSpacer, orientation[j], BGOstate, colorWheel[i], fillColor, fillColor2);
            }   

        }

        //title
        this.detailContext.clearRect(0,0.85*this.canvasHeight,this.canvasWidth,0.15*this.canvasHeight);
        this.detailContext.fillStyle = '#999999';
        this.detailContext.font="24px 'Orbitron'";
        this.detailContext.fillText('Clover '+this.cloverShowing, 0.5*this.canvasWidth - this.detailContext.measureText('Clover '+this.cloverShowing).width/2, 0.95*this.canvasHeight);
    };

    //draw crystal core
    this.crystalCore = function(context, x0, y0, border, fill){
        context.strokeStyle = border;
        context.fillStyle = fill;
    	context.fillRect(Math.round(x0), Math.round(y0), Math.round(this.crystalSide/3), Math.round(this.crystalSide/3));
    	if(context == this.context || context == this.detailContext) context.stroke();
    };

    //draw HV box for one cloverleaf:
    this.crystal = function(context, x0, y0, border, fill){
        context.strokeStyle = border;
        context.fillStyle = fill;
        context.fillRect(Math.round(x0), Math.round(y0), Math.round(this.crystalSide), Math.round(this.crystalSide));
        if(context == this.context || context == this.detailContext){
            context.strokeRect(x0, y0, this.crystalSide, this.crystalSide);
        }

    };    

    //draw split crystal for HV view
    this.splitCrystal = function(context, x0, y0, side, cloverLeaf, border, fill, fillB){
        //antialiasing hack: draw this first on the tooltip level
        if(context == this.TTdetailContext && fill != '#123456'){
            this.splitCrystal(context, x0, y0, side, border, '#123456', '#123456');
        }

        context.save();
        context.translate(x0+side/2, y0+side/2);
        context.rotate(Math.PI/2*cloverLeaf);
        context.strokeStyle = border;
        context.fillStyle = fill;
        context.beginPath();
        context.moveTo(side/2,-side/2);
        context.lineTo(-side/2,-side/2);
        context.lineTo(-side/2,side/2);
        context.closePath();
        context.fill();
        if(context == this.context || context == this.detailContext) context.stroke();

        context.fillStyle = fillB;
        context.beginPath();
        context.moveTo(side/2,-side/2);
        context.lineTo(side/2,side/2);
        context.lineTo(-side/2,side/2);
        context.closePath();
        context.fill();
        if(context == this.context || context == this.detailContext) context.stroke();
        context.restore();
    };

    //draw L shape
    this.drawL = function(context, phi, thickness, length, x0, y0, border, fill){
        //antialiasing hack: draw this first on the tooltip level
        if(context == this.TTdetailContext && fill != '#123456'){
            this.drawL(context, phi, thickness, length, x0, y0, border, '#123456');
        }

        context.strokeStyle = border;
        context.fillStyle = fill;
    	context.save();
    	context.translate(Math.round(x0), Math.round(y0));
    	context.rotate(phi);

        context.beginPath();
    	context.moveTo(0,0);
    	context.lineTo(Math.round(length), 0);
    	context.lineTo(Math.round(length), Math.round(thickness));
    	context.lineTo(Math.round(thickness), Math.round(thickness));
    	context.lineTo(Math.round(thickness), Math.round(length));
    	context.lineTo(0,Math.round(length));
    	context.closePath();
        context.fill();
    	if(context == this.context || context == this.detailContext) context.stroke();

    	context.restore();

    };

    //draw half-L
    this.drawHalfL = function(context, phi, thickness, length, x0, y0, chirality, split, border, fill, fillB){
        //antialiasing hack: draw this first on the tooltip level
        if(context == this.TTdetailContext && fill != '#123456'){
            this.drawHalfL(context, phi, thickness, length, x0, y0, chirality, split, border, '#123456', '#123456');
        }

        context.save();
        context.strokeStyle = border;
        context.fillStyle = fill;
        context.translate(x0, y0);
        context.rotate(phi);

        if(chirality == 'left'){
            context.translate(this.detailContext.width,0);
            context.scale(-1,1);   
        }

        if(split){
            context.beginPath();
            context.moveTo((length-thickness)/2,0);
            context.lineTo(length-thickness, 0);
            context.lineTo(length-thickness, -thickness);
            context.lineTo((length-thickness)/2,-thickness);
            context.closePath();
            context.fill();
            if(context == this.context || context == this.detailContext) context.stroke();

            context.fillStyle = fillB;
            context.beginPath();
            context.moveTo(0,0);
            context.lineTo((length-thickness)/2,0);
            context.lineTo((length-thickness)/2,-thickness);
            context.lineTo(-thickness, -thickness);
            context.closePath();
            context.fill();
            if(context == this.context || context == this.detailContext) context.stroke();
        } else{
            context.beginPath();
            context.moveTo(0,0);
            context.lineTo(length-thickness, 0);
            context.lineTo(length-thickness, -thickness);
            context.lineTo(-thickness, -thickness);
            context.closePath();
            context.fill();
            if(context == this.context || context == this.detailContext) context.stroke();
        }

        context.restore();
    };
    //end drawing functions///////////////////////////////////////////////////////////////

    this.findCell = function(x, y){
        var imageData 
        if(this.detailShowing){
            imageData = this.TTdetailContext.getImageData(x,y,1,1);
        } else{
            imageData = this.TTcontext.getImageData(x,y,1,1);
        }
        var index = -1;
        if(imageData.data[0] == imageData.data[1] && imageData.data[0] == imageData.data[2]) index = imageData.data[0];

        return index;
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

        if(this.detailShowing){
            document.getElementById(this.detailTooltip.ttTextID).innerHTML = toolTipContent;
        } else{
            document.getElementById(this.tooltip.ttTextID).innerHTML = toolTipContent;
        }

        //return length of longest line:
        return longestLine;
    };

    this.update = function(){

        var i;

        //get new data
        this.fetchNewData();

        //parse colors
        for(i=0; i<16*4; i++){
            this.oldSummaryHPGEHVcolor[i] = this.summaryHPGEHVcolor[i];
            this.summaryHPGEHVcolor[i] = this.parseColor(this.dataBus.summaryHPGEHV[i]);
            this.oldSummaryHPGEthresholdColor[i] = this.summaryHPGEthresholdColor[i];
            this.summaryHPGEthresholdColor[i] = this.parseColor(this.dataBus.summaryHPGEthreshold[i]);
            this.oldSummaryHPGErateColor[i] = this.summaryHPGErateColor[i];
            this.summaryHPGErateColor[i] = this.parseColor(this.dataBus.summaryHPGErate[i]);

            this.oldSummaryBGOHVcolor[i] = this.summaryBGOHVcolor[i];
            this.summaryBGOHVcolor[i] = this.parseColor(this.dataBus.summaryBGOHV[i]);
            this.oldSummaryBGOthresholdColor[i] = this.summaryBGOthresholdColor[i];
            this.summaryBGOthresholdColor[i] = this.parseColor(this.dataBus.summaryBGOthreshold[i]);
            this.oldSummaryBGOrateColor[i] = this.summaryBGOrateColor[i];
            this.summaryBGOrateColor[i] = this.parseColor(this.dataBus.summaryBGOrate[i]);
        }

        //detail level
        for(i=0; i<16*this.nHPGEsegments; i++){
            this.oldDetailHPGEthresholdColor[i] = this.detailHPGEthresholdColor[i];
            this.detailHPGEthresholdColor[i] = this.parseColor(this.dataBus.detailHPGEthreshold[i]);
            this.oldDetailHPGErateColor[i] = this.detailHPGErateColor[i];
            this.detailHPGErateColor[i] = this.parseColor(this.dataBus.detailHPGErate[i]);
        }
        for(i=0; i<16*4; i++){
            this.oldDetailHPGEHVcolor[i] = this.detailHPGEHVcolor[i];
            this.detailHPGEHVcolor[i] = this.parseColor(this.dataBus.detailHPGEHV[i]);
        }
        for(i=0; i<16*20; i++){
            this.oldDetailBGOthresholdColor[i] = this.detailBGOthresholdColor[i];
            this.detailBGOthresholdColor[i] = this.parseColor(this.dataBus.detailBGOthreshold[i]);
            this.oldDetailBGOrateColor[i] = this.detailBGOrateColor[i];
            this.detailBGOrateColor[i] = this.parseColor(this.dataBus.detailBGOrate[i]);
        }
        for(i=0; i<16*40; i++){
            this.oldDetailBGOHVcolor[i] = this.detailBGOHVcolor[i];
            this.detailBGOHVcolor[i] = this.parseColor(this.dataBus.detailBGOHV[i]);
        }

        this.tooltip.update();
        this.detailTooltip.update();
        this.displaySwitch();
    };

    //determine which color <scalar> corresponds to
    this.parseColor = function(scalar){

        //how far along the scale are we?
        var scale = (scalar - this.minima[window.subdetectorView]) / (this.maxima[window.subdetectorView] - this.minima[window.subdetectorView]);

        //different scales for different meters to aid visual recognition:
        return colorScale(window.colorScales[window.subdetectorView],scale);
    };

    //decide which display version to show:
    this.displaySwitch = function(){
        this.TTdetailContext.fillStyle = 'rgba(50,100,150,1)';
        this.TTdetailContext.fillRect(0,0,this.canvasWidth,this.canvasHeight);
        this.drawDetail(this.detailContext, this.nFrames);
        this.drawDetail(this.TTdetailContext, this.nFrames);
    };

    this.fetchNewData = function(){
        var i;

        //dummy data
        //summary level
        for(i=0; i<16*4; i++){
            this.dataBus.summaryHPGEHV[i] = Math.random();
            this.dataBus.summaryHPGEthreshold[i] = Math.random();
            this.dataBus.summaryHPGErate[i] = Math.random();
            this.dataBus.summaryBGOHV[i] = Math.random();
            this.dataBus.summaryBGOthreshold[i] = Math.random();
            this.dataBus.summaryBGOrate[i] = Math.random();
        }

        //detail level
        for(i=0; i<16*this.nHPGEsegments; i++){
                this.dataBus.detailHPGEthreshold[i] = Math.random();
                this.dataBus.detailHPGErate[i] = Math.random();
        }
        for(i=0; i<16*4; i++){
            this.dataBus.detailHPGEHV[i] = Math.random();
        }
        for(i=0; i<16*20; i++){
            this.dataBus.detailBGOthreshold[i] = Math.random();
            this.dataBus.detailBGOrate[i] = Math.random();
        }
        for(i=0; i<16*40; i++){
            this.dataBus.detailBGOHV[i] = Math.random();        
        }

    };

    //do an initial populate
    this.update();
}