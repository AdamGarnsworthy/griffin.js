SHARC.prototype = Object.create(Subsystem.prototype);
function SHARC(){
    //basic plumbing:
    this.name = 'SHARC';                //name prefix
    var that = this;                    //pointer to self
    Subsystem.call(this);               //inject Subsystem attributes
    window.SHARCpointer = that;         //send a pointer to SHARC up to global scope
    this.dataBus = new SHARCDS();       //build the data structure to manage SHARC's info
    DetailView.call(this);              //inject the infrastructure for a detail level view

    //member variables////////////////////
    this.padsEnabled = 1;               //are the pads present?
    this.detailShowing = 0;             //is the detail view on display?

    //drawing parameters//////////////////
    /*
    this.scaleFactor = (this.padsEnabled) ? 0.67 : 1;  //scale down layers D and E to accomodate pads if present
    this.innerQuadRad = 0.02*this.canvasWidth*this.scaleFactor;
    this.outerQuadRad = 0.1*this.canvasWidth*this.scaleFactor;
    this.quadArc = 0.66*Math.PI/2;
    this.innerQuadCenterLine = this.canvasHeight*0.4;
    this.outerRowSpacing = this.canvasHeight*0.2*this.scaleFactor + this.padsEnabled*0.02*this.canvasHeight;
    this.summaryBoxWidth = 0.08*this.canvasWidth;
    this.summaryBoxHeight = 0.16*this.canvasHeight*this.scaleFactor;
    this.x0 = 0.1*this.canvasWidth;  //top left corner for TT boxes on summary view
    this.y0 = (1-this.scaleFactor)*(this.canvasHeight-this.scaleHeight)/2;
    this.TTboxWidth = 0.1*this.canvasWidth;
    this.TTboxHeight = 0.2*this.canvasHeight*this.scaleFactor;
    this.padSize = 0.02*this.canvasWidth;
    */
    //summary drawing V.2
    //summary view is laid out on a 15x12 grid:
    this.cellWidth = this.canvasWidth/15;
    this.cellHeight = (this.canvasHeight - this.scaleHeight)/12
    this.quadInnerRad = 0.05*this.cellWidth;
    this.quadOuterRad = 0.98*this.cellWidth;
    this.quadSquish = 0.98*this.cellHeight/this.quadOuterRad/2;

    //detail view
    this.innerQuadRadDetail = this.canvasHeight*0.1;
    this.outerQuadRadDetail = this.canvasHeight*0.6;
    this.quadArcDetail = 0.45*Math.PI/2;
    this.detailTitles = ['Upstream Quadrant 1', 'Upstream Quadrant 2', 'Upstream Quadrant 3', 'Upstream Quadrant 4', 'Upstream Box 1', 'Upstream Box 2', 'Upstream Box 3', 'Upstream Box 4', 'Downstream Box 1', 'Downstream Box 2', 'Downstream Box 3', 'Downstream Box 4', 'Downstream Quadrant 1', 'Downstream Quadrant 2', 'Downstream Quadrant 3', 'Downstream Quadrant 4']
    this.quadDetailFrontCenter = (0.3 - 0.1*this.padsEnabled)*this.canvasWidth;
    this.quadDetailBackCenter = (0.7 - 0.1*this.padsEnabled)*this.canvasWidth;
    this.boxDetailFrontLeftEdge = 0.1*this.canvasWidth*(1-this.padsEnabled);
    this.boxDetailBackLeftEdge = (0.52-0.1*this.padsEnabled)*this.canvasWidth;
    this.scaleDown = 0.9;

    //member functions////////////////////

    this.draw = function(frame){
        var dummyColors4 = ['#000000', '#444444', '#AAAAAA', '#FFFFFF'], i, dummyColors16 = [], x, TTcolors = [];
        for(i=0; i<16; i++){
            x = i.toString(16);
            dummyColors16[i] = '#'+x+x+x+x+x+x;
        }

        this.context.fillStyle = '#000000'

        //UPSTREAM//////////////////////////////////////
        if(this.padsEnabled){
            //upstream quad pad back
            quadBack(this.context, 1*this.cellWidth, 11.5*this.cellHeight, this.quadInnerRad, this.quadOuterRad, this.quadSquish, dummyColors4, 0);
            //upstream quad pad front
            quadBack(this.context, 1.5*this.cellWidth, 10.5*this.cellHeight, this.quadInnerRad, this.quadOuterRad, this.quadSquish, dummyColors4, 0);       

            //tooltip:
            if(frame==this.nFrames || frame==0){
                TTcolors = ['rgba(114,114,114,1)', 'rgba(113,113,113,1)', 'rgba(116,116,116,1)', 'rgba(115,115,115,1)'];
                //upstream quad pad back
                quadBack(this.TTcontext, 1*this.cellWidth, 11.5*this.cellHeight, this.quadInnerRad, this.quadOuterRad, this.quadSquish, TTcolors, 1);
                //upstream quad pad front
                quadBack(this.TTcontext, 1.5*this.cellWidth, 10.5*this.cellHeight, this.quadInnerRad, this.quadOuterRad, this.quadSquish, TTcolors, 1); 
            }
        }

        //upstream quad back
        quadBack(this.context, 2*this.cellWidth, 9.5*this.cellHeight, this.quadInnerRad, this.quadOuterRad, this.quadSquish, dummyColors16, 0);
        //upstream quad front
        quadFront(this.context, 2.5*this.cellWidth, 8.5*this.cellHeight, this.quadInnerRad, this.quadOuterRad, this.quadSquish, dummyColors16, 0);
        //upstream quad tooltip:
        if(frame==this.nFrames || frame==0){
            //upstream quad back
            TTcolors = ['rgba(28,28,28,1)', 'rgba(26,26,26,1)', 'rgba(32,32,32,1)', 'rgba(30,30,30,1)'];
            quadBack(this.TTcontext, 2*this.cellWidth, 9.5*this.cellHeight, this.quadInnerRad, this.quadOuterRad, this.quadSquish, TTcolors, 1);
            //upstream quad front
            TTcolors = ['rgba(27,27,27,1)', 'rgba(25,25,25,1)', 'rgba(31,31,31,1)', 'rgba(29,29,29,1)'];
            quadBack(this.TTcontext, 2.5*this.cellWidth, 8.5*this.cellHeight, this.quadInnerRad, this.quadOuterRad, this.quadSquish, TTcolors, 1);
        }

        //3 o'clock upstream DSSD:
        //pads
        if(this.padsEnabled){
            horizStack(this.context, 7.5*this.cellWidth, 3.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, ['#000000'], 'h', 0);
            horizStack(this.context, 7.5*this.cellWidth, 4.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, ['#000000'], 'h', 0);

            //tooltip:
            if(frame==this.nFrames || frame==0){
                TTcolors = ['rgba(111,111,111,1)'];
                horizStack(this.TTcontext, 7.5*this.cellWidth, 3.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, TTcolors, 'h', 1);
                horizStack(this.TTcontext, 7.5*this.cellWidth, 4.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, TTcolors, 'h', 1);
            }
        }
        //back
        vertStack(this.context, 6.5*this.cellWidth, 4*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*2*this.cellHeight*1.7, dummyColors4, 'v', 0);
        //front
        horizStack(this.context, 5.5*this.cellWidth, 4*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*2*this.cellHeight*1.7, dummyColors4, 'v', 0);
        //tooltip:
        if(frame==this.nFrames || frame==0){
            //back
            TTcolors = ['rgba(21,21,21,1)'];
            vertStack(this.TTcontext, 6.5*this.cellWidth, 4*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*2*this.cellHeight*1.7, TTcolors, 'v', 1);
            //front
            TTcolors = ['rgba(22,22,22,1)'];
            horizStack(this.TTcontext, 5.5*this.cellWidth, 4*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*2*this.cellHeight*1.7, TTcolors, 'v', 1);
        }

        //12 o'clock upstream DSSD:
        //pads
        if(this.padsEnabled){
            horizStack(this.context, 3.5*this.cellWidth, 0.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, ['#000000'], 'h', 0);
            horizStack(this.context, 4.5*this.cellWidth, 0.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, ['#000000'], 'h', 0);
            //tooltip:
            if(frame==this.nFrames || frame==0){
                TTcolors = ['rgba(110,110,110,1)'];
                horizStack(this.TTcontext, 3.5*this.cellWidth, 0.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, TTcolors, 'h', 1);
                horizStack(this.TTcontext, 4.5*this.cellWidth, 0.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, TTcolors, 'h', 1);                
            }            
        }
        //back
        horizStack(this.context, 4*this.cellWidth, 1.5*this.cellHeight, this.scaleDown*2*this.cellWidth, this.scaleDown*this.cellHeight, dummyColors4, 'h', 0);
        //front
        vertStack(this.context, 4*this.cellWidth, 2.5*this.cellHeight, this.scaleDown*2*this.cellWidth, this.scaleDown*this.cellHeight, dummyColors4, 'h', 0);
        //tooltip:
        if(frame==this.nFrames || frame==0){
            //back
            TTcolors = ['rgba(19,19,19,1)'];
            horizStack(this.TTcontext, 4*this.cellWidth, 1.5*this.cellHeight, this.scaleDown*2*this.cellWidth, this.scaleDown*this.cellHeight, TTcolors, 'h', 1);
            //front
            TTcolors = ['rgba(20,20,20,1)'];
            vertStack(this.TTcontext, 4*this.cellWidth, 2.5*this.cellHeight, this.scaleDown*2*this.cellWidth, this.scaleDown*this.cellHeight, TTcolors, 'h', 1);
        }

        //9 o'clock upstream DSSD:
        //pads
        if(this.padsEnabled){
            horizStack(this.context, 0.5*this.cellWidth, 3.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, ['#000000'], 'h', 0);
            horizStack(this.context, 0.5*this.cellWidth, 4.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, ['#000000'], 'h', 0);
            //tooltip:
            if(frame==this.nFrames || frame==0){
                TTcolors = ['rgba(109,109,109,1)'];
                horizStack(this.TTcontext, 0.5*this.cellWidth, 3.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, TTcolors, 'h', 1);
                horizStack(this.TTcontext, 0.5*this.cellWidth, 4.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, TTcolors, 'h', 1);                
            } 
        }
        //back
        vertStack(this.context, 1.5*this.cellWidth, 4*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*2*this.cellHeight*1.7, dummyColors4, 'v', 0);
        //front
        horizStack(this.context, 2.5*this.cellWidth, 4*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*2*this.cellHeight*1.7, dummyColors4, 'v', 0);
        //tooltip:
        if(frame==this.nFrames || frame==0){
            //back
            TTcolors = ['rgba(17,17,17,1)'];
            vertStack(this.TTcontext, 1.5*this.cellWidth, 4*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*2*this.cellHeight*1.7, TTcolors, 'v', 1);
            //front
            TTcolors = ['rgba(18,18,18,1)'];
            horizStack(this.TTcontext, 2.5*this.cellWidth, 4*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*2*this.cellHeight*1.7, TTcolors, 'v', 1);
        }

        //6 o'clock upstream DSSD:
        //pads
        if(this.padsEnabled){
            horizStack(this.context, 3.5*this.cellWidth, 7.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, ['#000000'], 'h', 0);
            horizStack(this.context, 4.5*this.cellWidth, 7.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, ['#000000'], 'h', 0);
            //tooltip:
            if(frame==this.nFrames || frame==0){
                TTcolors = ['rgba(112,112,112,1)'];
                horizStack(this.TTcontext, 3.5*this.cellWidth, 7.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, TTcolors, 'h', 1);
                horizStack(this.TTcontext, 4.5*this.cellWidth, 7.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, TTcolors, 'h', 1);              
            } 
        }
        //back
        horizStack(this.context, 4*this.cellWidth, 6.5*this.cellHeight, this.scaleDown*2*this.cellWidth, this.scaleDown*this.cellHeight, dummyColors4, 'h', 0);
        //front
        vertStack(this.context, 4*this.cellWidth, 5.5*this.cellHeight, this.scaleDown*2*this.cellWidth, this.scaleDown*this.cellHeight, dummyColors4, 'h', 0);
        //tooltip:
        if(frame==this.nFrames || frame==0){
            //back
            TTcolors = ['rgba(23,23,23,1)'];
            horizStack(this.TTcontext, 4*this.cellWidth, 6.5*this.cellHeight, this.scaleDown*2*this.cellWidth, this.scaleDown*this.cellHeight, TTcolors, 'h', 1);
            //front
            TTcolors = ['rgba(24,24,24,1)'];
            vertStack(this.TTcontext, 4*this.cellWidth, 5.5*this.cellHeight, this.scaleDown*2*this.cellWidth, this.scaleDown*this.cellHeight, TTcolors, 'h', 1);
        }

        //DOWNSTREAM//////////////////////////////////
        if(this.padsEnabled){
            //downstream quad pad back
            quadBack(this.context, 14*this.cellWidth, 0.5*this.cellHeight, this.quadInnerRad, this.quadOuterRad, this.quadSquish, dummyColors4, 0);
            //upstream quad pad front
            quadBack(this.context, 13.5*this.cellWidth, 1.5*this.cellHeight, this.quadInnerRad, this.quadOuterRad, this.quadSquish, dummyColors4, 0);

            //tooltip:
            if(frame==this.nFrames || frame==0){
                TTcolors = ['rgba(102,102,102,1)', 'rgba(101,101,101,1)', 'rgba(104,104,104,1)', 'rgba(103,103,103,1)'];
                //downstream quad pad back
                quadBack(this.TTcontext, 14*this.cellWidth, 0.5*this.cellHeight, this.quadInnerRad, this.quadOuterRad, this.quadSquish, TTcolors, 1);
                //upstream quad pad front
                quadBack(this.TTcontext, 13.5*this.cellWidth, 1.5*this.cellHeight, this.quadInnerRad, this.quadOuterRad, this.quadSquish, TTcolors, 1);
            }

        }

        //downstream quad back
        quadBack(this.context, 13*this.cellWidth, 2.5*this.cellHeight, this.quadInnerRad, this.quadOuterRad, this.quadSquish, dummyColors16, 0);
        //downstream quad front
        quadFront(this.context, 12.5*this.cellWidth, 3.5*this.cellHeight, this.quadInnerRad, this.quadOuterRad, this.quadSquish, dummyColors16, 0);
        //downstream quad tooltip:
        if(frame==this.nFrames || frame==0){
            //downstream quad back
            TTcolors = ['rgba(4,4,4,1)', 'rgba(2,2,2,1)', 'rgba(8,8,8,1)', 'rgba(6,6,6,1)'];
            quadBack(this.TTcontext, 13*this.cellWidth, 2.5*this.cellHeight, this.quadInnerRad, this.quadOuterRad, this.quadSquish, TTcolors, 1);
            //downstream quad front
            TTcolors = ['rgba(3,3,3,1)', 'rgba(1,1,1,1)', 'rgba(7,7,7,1)', 'rgba(5,5,5,1)']; 
            quadBack(this.TTcontext, 12.5*this.cellWidth, 3.5*this.cellHeight, this.quadInnerRad, this.quadOuterRad, this.quadSquish, TTcolors, 1);
        }

        //3 o'clock downstream DSSD:
        //pads
        if(this.padsEnabled){
            horizStack(this.context, 14.5*this.cellWidth, 7.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, ['#000000'], 'h', 0);
            horizStack(this.context, 14.5*this.cellWidth, 8.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, ['#000000'], 'h', 0);
            //tooltip:
            if(frame==this.nFrames || frame==0){
                TTcolors = ['rgba(107,107,107,1)'];
                horizStack(this.TTcontext, 14.5*this.cellWidth, 7.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, TTcolors, 'h', 1);
                horizStack(this.TTcontext, 14.5*this.cellWidth, 8.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, TTcolors, 'h', 1);             
            } 
        }
        //back
        vertStack(this.context, 13.5*this.cellWidth, 8*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*2*this.cellHeight*1.7, dummyColors4, 'v', 0);
        //front
        horizStack(this.context, 12.5*this.cellWidth, 8*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*2*this.cellHeight*1.7, dummyColors4, 'v', 0);
        //tooltip:
        if(frame==this.nFrames || frame==0){
            //back
            TTcolors = ['rgba(13,13,13,1)'];
            vertStack(this.TTcontext, 13.5*this.cellWidth, 8*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*2*this.cellHeight*1.7, TTcolors, 'v', 1);
            //front
            TTcolors = ['rgba(14,14,14,1)'];
            horizStack(this.TTcontext, 12.5*this.cellWidth, 8*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*2*this.cellHeight*1.7, TTcolors, 'v', 1);
        }

        //12 o'clock downstream DSSD:
        //pads
        if(this.padsEnabled){
            horizStack(this.context, 10.5*this.cellWidth, 4.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, ['#000000'], 'h', 0);
            horizStack(this.context, 11.5*this.cellWidth, 4.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, ['#000000'], 'h', 0);
            //tooltip:
            if(frame==this.nFrames || frame==0){
                TTcolors = ['rgba(106,106,106,1)'];
                horizStack(this.TTcontext, 10.5*this.cellWidth, 4.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, TTcolors, 'h', 1);
                horizStack(this.TTcontext, 11.5*this.cellWidth, 4.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, TTcolors, 'h', 1);            
            }
        }
        //back
        horizStack(this.context, 11*this.cellWidth, 5.5*this.cellHeight, this.scaleDown*2*this.cellWidth, this.scaleDown*this.cellHeight, dummyColors4, 'h', 0);
        //front
        vertStack(this.context, 11*this.cellWidth, 6.5*this.cellHeight, this.scaleDown*2*this.cellWidth, this.scaleDown*this.cellHeight, dummyColors4, 'h', 0);
        //tooltip:
        if(frame==this.nFrames || frame==0){
            //back
            TTcolors = ['rgba(11,11,11,1)'];
            horizStack(this.TTcontext, 11*this.cellWidth, 5.5*this.cellHeight, this.scaleDown*2*this.cellWidth, this.scaleDown*this.cellHeight, TTcolors, 'h', 1);
            //front
            TTcolors = ['rgba(12,12,12,1)'];
            vertStack(this.TTcontext, 11*this.cellWidth, 6.5*this.cellHeight, this.scaleDown*2*this.cellWidth, this.scaleDown*this.cellHeight, TTcolors, 'h', 1);
        }

        //9 o'clock downstream DSSD:
        //pads
        if(this.padsEnabled){
            horizStack(this.context, 7.5*this.cellWidth, 7.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, ['#000000'], 'h', 0);
            horizStack(this.context, 7.5*this.cellWidth, 8.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, ['#000000'], 'h', 0);
            //tooltip:
            if(frame==this.nFrames || frame==0){
                TTcolors = ['rgba(105,105,105,1)'];
                horizStack(this.TTcontext, 7.5*this.cellWidth, 7.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, TTcolors, 'h', 1);
                horizStack(this.TTcontext, 7.5*this.cellWidth, 8.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, TTcolors, 'h', 1);           
            }
        }
        //back
        vertStack(this.context, 8.5*this.cellWidth, 8*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*2*this.cellHeight*1.7, dummyColors4, 'v', 0);
        //front
        horizStack(this.context, 9.5*this.cellWidth, 8*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*2*this.cellHeight*1.7, dummyColors4, 'v', 0);
        //tooltip:
        if(frame==this.nFrames || frame==0){
            //back
            TTcolors = ['rgba(9,9,9,1)'];
            vertStack(this.TTcontext, 8.5*this.cellWidth, 8*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*2*this.cellHeight*1.7, TTcolors, 'v', 1);
            //front
            TTcolors = ['rgba(10,10,10,1)'];
            horizStack(this.TTcontext, 9.5*this.cellWidth, 8*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*2*this.cellHeight*1.7, TTcolors, 'v', 1);
        }

        //6 o'clock downstream DSSD:
        //pads
        if(this.padsEnabled){
            horizStack(this.context, 10.5*this.cellWidth, 11.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, ['#000000'], 'h', 0);
            horizStack(this.context, 11.5*this.cellWidth, 11.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, ['#000000'], 'h', 0);
            //tooltip:
            if(frame==this.nFrames || frame==0){
                TTcolors = ['rgba(108,108,108,1)'];
                horizStack(this.TTcontext, 10.5*this.cellWidth, 11.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, TTcolors, 'h', 1);
                horizStack(this.TTcontext, 11.5*this.cellWidth, 11.5*this.cellHeight, this.scaleDown*this.cellWidth, this.scaleDown*this.cellHeight, TTcolors, 'h', 1);         
            }
        }
        //back
        horizStack(this.context, 11*this.cellWidth, 10.5*this.cellHeight, this.scaleDown*2*this.cellWidth, this.scaleDown*this.cellHeight, dummyColors4, 'h', 0);
        //front
        vertStack(this.context, 11*this.cellWidth, 9.5*this.cellHeight, this.scaleDown*2*this.cellWidth, this.scaleDown*this.cellHeight, dummyColors4, 'h', 0);
        //tooltip:
        if(frame==this.nFrames || frame==0){
            //back
            TTcolors = ['rgba(15,15,15,1)'];
            horizStack(this.TTcontext, 11*this.cellWidth, 10.5*this.cellHeight, this.scaleDown*2*this.cellWidth, this.scaleDown*this.cellHeight, TTcolors, 'h', 1);
            //front
            TTcolors = ['rgba(16,16,16,1)'];
            vertStack(this.TTcontext, 11*this.cellWidth, 9.5*this.cellHeight, this.scaleDown*2*this.cellWidth, this.scaleDown*this.cellHeight, TTcolors, 'h', 1);
        }

        if(frame==this.nFrames || frame==0){ 
            //scale:
            this.drawScale(this.context);

            //orienting arrows:
            this.context.strokeStyle = '#999999';
            this.context.lineWidth = 2;
            //upstream
            this.context.beginPath();
            this.context.moveTo(2.5*this.cellWidth, 11.5*this.cellHeight);
            this.context.lineTo(4*this.cellWidth, 8.5*this.cellHeight);
            this.context.lineTo(4.2*this.cellWidth, 8.7*this.cellHeight);
            this.context.stroke();
            //downstream
            this.context.beginPath();
            this.context.moveTo(11*this.cellWidth, 3.5*this.cellHeight);
            this.context.lineTo(12.5*this.cellWidth, 0.5*this.cellHeight);
            this.context.lineTo(12.1*this.cellWidth, 0.7*this.cellHeight);
            this.context.stroke();

            this.context.lineWidth = 1;

            //titles:
            this.context.fillStyle = '#999999';
            this.context.font = '20px Orbitron';
            this.context.textBaseline = 'top';
            this.context.fillText('Upstream', this.cellWidth*4 - this.context.measureText('Upstream').width/2, this.canvasHeight - this.scaleHeight*0.95);
            this.context.fillText('Downstream', this.cellWidth*11 - this.context.measureText('Downstream').width/2, this.canvasHeight - this.scaleHeight*0.95);
            this.context.textBaseline = 'alphabetic';
        }
    };

/*
    //draw the summary view
    this.draw = function(frame){
        var colors, i, j, name, increment, index;

        for(i=1; i<5; i++){
            //upstream quad fronts:
            colors = [];
            for(j=0; j<4; j++){
                name = 'SHQ0' + i + 'DP' + j;
                colors[colors.length] = frameColor(this.dataBus.summary[name], frame, this.nFrames);
            }
            radialQuadrant(this.context, this.canvasWidth*(0.15 + 0.1*((i-1)%2)), this.innerQuadCenterLine + this.outerRowSpacing*Math.pow(-1, Math.ceil(i/2)), this.innerQuadRad, this.outerQuadRad, this.quadArc, Math.pow(-1, Math.ceil(i/2))*Math.PI/2, colors);           
            //downstream quad fronts:
            colors = [];
            for(j=0; j<4; j++){
                name = 'SHQ' + (i+12) + 'DP' + j;
                colors[colors.length] = frameColor(this.dataBus.summary[name], frame, this.nFrames);
            }
            radialQuadrant(this.context, this.canvasWidth*(0.75 + 0.1*((i-1)%2)), this.innerQuadCenterLine + this.outerRowSpacing*Math.pow(-1, Math.ceil(i/2)), this.innerQuadRad, this.outerQuadRad, this.quadArc, Math.pow(-1, Math.ceil(i/2))*Math.PI/2, colors);           

            //upstream quad backs:
            colors = [];
            for(j=0; j<4; j++){
                name = 'SHQ0' + i + 'EN' + j;
                colors[colors.length] = frameColor(this.dataBus.summary[name], frame, this.nFrames);
            }
            azimuthalQuadrant(this.context, this.canvasWidth*(0.15 + 0.1*((i-1)%2)), this.innerQuadCenterLine, this.innerQuadRad, this.outerQuadRad, this.quadArc, Math.pow(-1, Math.ceil(i/2))*Math.PI/2, colors);          
            //downstream quad backs:
            colors = [];
            for(j=0; j<4; j++){
                name = 'SHQ' + (i+12) + 'EN' + j;
                colors[colors.length] = frameColor(this.dataBus.summary[name], frame, this.nFrames);
            }
            azimuthalQuadrant(this.context, this.canvasWidth*(0.75 + 0.1*((i-1)%2)), this.innerQuadCenterLine, this.innerQuadRad, this.outerQuadRad, this.quadArc, Math.pow(-1, Math.ceil(i/2))*Math.PI/2, colors);

            //upstream quad pads
            if(this.padsEnabled){
                colors = [];
                for(j=0; j<2; j++){
                    name = 'SHQ0' + i + 'F'+( (j==0) ? 'N' : 'P' )+'00X';
                    colors[colors.length] = frameColor(this.dataBus.summary[name], frame, this.nFrames);
                } 
            }
            padSummaries(this.context, this.canvasWidth*(0.15 + 0.1*((i-1)%2)), this.innerQuadCenterLine + 2.5*this.TTboxHeight*Math.pow(-1, Math.ceil(i/2)), this.padSize, colors);

            //downstream quad pads
            if(this.padsEnabled){
                colors = [];
                for(j=0; j<2; j++){
                    name = 'SHQ' + (i+12) + 'F'+( (j==0) ? 'N' : 'P' )+'00X';
                    colors[colors.length] = frameColor(this.dataBus.summary[name], frame, this.nFrames);
                } 
            }
            padSummaries(this.context, this.canvasWidth*(0.75 + 0.1*((i-1)%2)), this.innerQuadCenterLine + 2.5*this.TTboxHeight*Math.pow(-1, Math.ceil(i/2)), this.padSize, colors);

            //upstream box fronts:
            colors = [];
            for(j=0; j<4; j++){
                name = 'SHB0' + (i+4) + 'DP' + j;
                colors[colors.length] = frameColor(this.dataBus.summary[name], frame, this.nFrames);
            }
            boxFront(this.context, this.canvasWidth*(0.31+0.1*((i+1)%2)), this.canvasHeight*(0.22+0.2*Math.floor((i-1)/2)) + (1-this.scaleFactor)/this.scaleFactor*this.summaryBoxHeight*(1-Math.floor((i-1)/2)), this.summaryBoxHeight, this.summaryBoxWidth, colors);

            //downstream box fronts:
            colors = [];
            for(j=0; j<4; j++){
                name = 'SHB' + ( (i+8<10) ? '0'+(i+8) : (i+8) ) + 'DP' + j;
                colors[colors.length] = frameColor(this.dataBus.summary[name], frame, this.nFrames);
            }
            boxFront(this.context, this.canvasWidth*(0.51+0.1*((i+1)%2)), this.canvasHeight*(0.22+0.2*Math.floor((i-1)/2)) + (1-this.scaleFactor)/this.scaleFactor*this.summaryBoxHeight*(1-Math.floor((i-1)/2)), this.summaryBoxHeight, this.summaryBoxWidth, colors);

            //upstream box backs:
            colors = [];
            for(j=0; j<4; j++){
                name = 'SHB0' + (i+4) + 'EN' + j;
                colors[colors.length] = frameColor(this.dataBus.summary[name], frame, this.nFrames);
            }
            boxBack(this.context, this.canvasWidth*(0.31+0.1*((i+1)%2)), this.canvasHeight*(0.02+0.6*Math.floor((i-1)/2)) + (1-this.scaleFactor)/this.scaleFactor*this.summaryBoxHeight*( (i<3) ? 2:-1 ), this.summaryBoxHeight, this.summaryBoxWidth, colors);
            //downstream box backs:
            colors = [];
            for(j=0; j<4; j++){
                name = 'SHB' + ( (i+8<10) ? '0'+(i+8) : (i+8) ) + 'EN' + j;
                colors[colors.length] = frameColor(this.dataBus.summary[name], frame, this.nFrames);
            }
            boxBack(this.context, this.canvasWidth*(0.51+0.1*((i+1)%2)), this.canvasHeight*(0.02+0.6*Math.floor((i-1)/2)) + (1-this.scaleFactor)/this.scaleFactor*this.summaryBoxHeight*( (i<3) ? 2:-1 ), this.summaryBoxHeight, this.summaryBoxWidth, colors);            
            
            //upstream box pads
            if(this.padsEnabled){
                colors = [];
                for(j=0; j<2; j++){
                    name = 'SHB' + ( (i+8<10) ? '0'+(i+8) : (i+8) ) + 'F'+( (j==0) ? 'N' : 'P' )+'00X';
                    colors[colors.length] = frameColor(this.dataBus.summary[name], frame, this.nFrames);
                } 
            }
            padSummaries(this.context, this.canvasWidth*(0.31+0.1*((i+1)%2)) + this.summaryBoxWidth/2, this.innerQuadCenterLine + 2.5*this.TTboxHeight*Math.pow(-1, Math.ceil(i/2)), this.padSize, colors);

            //downstream box pads
            if(this.padsEnabled){
                colors = [];
                for(j=0; j<2; j++){
                    name = 'SHB' + ( (i+8<10) ? '0'+(i+8) : (i+8) ) + 'F'+( (j==0) ? 'N' : 'P' )+'00X';
                    colors[colors.length] = frameColor(this.dataBus.summary[name], frame, this.nFrames);
                } 
            }
            padSummaries(this.context, this.canvasWidth*(0.51+0.1*((i+1)%2)) + this.summaryBoxWidth/2, this.innerQuadCenterLine + 2.5*this.TTboxHeight*Math.pow(-1, Math.ceil(i/2)), this.padSize, colors);

        }

        //decorations & TT:
        if(frame==this.nFrames || frame==0){ 
            //beamline:
            this.context.strokeStyle = '#999999';
            this.context.moveTo(this.canvasWidth*0.1, this.canvasHeight*0.4);
            this.context.lineTo(this.canvasWidth*0.9, this.canvasHeight*0.4);
            this.context.lineTo(this.canvasWidth*0.9 - 15, this.canvasHeight*0.4 - 15);
            this.context.stroke();

            //scale:
            this.drawScale(this.context);

            //tooltip:
            index = 1;
            this.TTcontext.strokeStyle = '#123456';
            for(i=0; i<32; i++){
                this.TTcontext.fillStyle = 'rgba('+index+','+index+','+index+',1)';
                this.TTcontext.fillRect(this.x0 + this.TTboxWidth*Math.floor(i/4), this.y0 + this.TTboxHeight*(i%4), this.TTboxWidth, this.TTboxHeight);
                this.TTcontext.strokeRect(this.x0 + this.TTboxWidth*Math.floor(i/4), this.y0 + this.TTboxHeight*(i%4), this.TTboxWidth, this.TTboxHeight);
                
                if((i+1)%4 == 1) increment = 1;
                else if((i+1)%4 == 2) increment = 4;
                else if((i+1)%4 == 3) increment = -1;
                else if((i+1)%8 == 4) increment = -2;
                else if((i+1)%8 == 0) increment = 2;
                index += increment;

            }

            //pads tooltip:
            if(this.padsEnabled){
                for(i=1; i<17; i++){
                    this.TTcontext.fillStyle = 'rgba('+(100+i)+','+(100+i)+','+(100+i)+',1)';
                    this.TTcontext.fillRect(this.x0 + this.TTboxWidth*Math.floor((i+1)%2) + 2*this.TTboxWidth*Math.floor((i-1)/4), this.y0 + ( ((i-1)%4 < 2) ? -this.TTboxHeight : 4*this.TTboxHeight ), this.TTboxWidth, this.TTboxHeight);
                    this.TTcontext.strokeRect(this.x0 + this.TTboxWidth*Math.floor((i+1)%2) + 2*this.TTboxWidth*Math.floor((i-1)/4), this.y0 + ( ((i-1)%4 < 2) ? -this.TTboxHeight : 4*this.TTboxHeight ), this.TTboxWidth, this.TTboxHeight);
                }
            }

        }
    };
*/
    this.drawDetail = function(x, frame){  //animatedetail expects the first argument to be the detail context - refactor to eliminate.
        var colors = [], TTcolors = [],
            i, name,
            arrayElt = Math.ceil(this.detailShowing/2);

        this.detailContext.clearRect(0,0, this.canvasWidth, this.canvasHeight-this.scaleHeight);
        this.TTdetailContext.fillStyle = '#FEDCBA'
        this.TTdetailContext.fillRect(0,0, this.canvasWidth, this.canvasHeight);
        //title
        this.detailContext.fillStyle = '#999999';
        this.detailContext.font = '20px Orbitron';
        this.detailContext.fillText(this.detailTitles[arrayElt-1], this.canvasWidth/2 - this.detailContext.measureText(this.detailTitles[arrayElt-1]).width/2, this.canvasHeight*0.75 );

        //quadrant details
        if(arrayElt < 5 || arrayElt > 12){

            //subtitles:
            this.detailContext.fillText('Front', this.quadDetailFrontCenter - this.detailContext.measureText('Front').width/2, this.canvasHeight*0.67);
            this.detailContext.fillText('Back', this.quadDetailBackCenter - this.detailContext.measureText('Back').width/2, this.canvasHeight*0.67);
            this.detailContext.fillText('Pads', this.canvasWidth*0.9 - this.detailContext.measureText('Pads').width/2, this.canvasHeight*0.67);

            //front side:
            colors = [];
            TTcolors = [];
            for(i=0; i<16; i++){
                name = 'SHQ' + ( (arrayElt < 10) ? '0'+arrayElt : arrayElt ) + 'DP' + ( (i<10) ? '0'+i : i ) + 'X';
                colors[colors.length] = frameColor(this.dataBus.SHARC[name], frame, this.nFrames);
                TTcolors[TTcolors.length] = 'rgba('+i+','+i+','+i+',1)';
            }
            radialQuadrant(this.detailContext, this.quadDetailFrontCenter, this.canvasHeight*0.7, this.innerQuadRadDetail, this.outerQuadRadDetail, this.quadArcDetail, -Math.PI/2, colors);
            radialQuadrant(this.TTdetailContext, this.quadDetailFrontCenter, this.canvasHeight*0.7, this.innerQuadRadDetail, this.outerQuadRadDetail, this.quadArcDetail, -Math.PI/2, TTcolors, 1);

            //back side:
            colors = [];
            TTcolors = [];
            for(i=0; i<24; i++){
                name = 'SHQ' + ( (arrayElt < 10) ? '0'+arrayElt : arrayElt ) + 'EN' + ( (i<10) ? '0'+i : i ) + 'X';
                colors[colors.length] = frameColor(this.dataBus.SHARC[name], frame, this.nFrames);
                TTcolors[TTcolors.length] = 'rgba('+(i+16)+','+(i+16)+','+(i+16)+',1)';
            }
            azimuthalQuadrant(this.detailContext, this.quadDetailBackCenter, this.canvasHeight*0.7, this.innerQuadRadDetail, this.outerQuadRadDetail, this.quadArcDetail, -Math.PI/2, colors);
            azimuthalQuadrant(this.TTdetailContext, this.quadDetailBackCenter, this.canvasHeight*0.7, this.innerQuadRadDetail, this.outerQuadRadDetail, this.quadArcDetail, -Math.PI/2, TTcolors, 1);

            //pads
            colors = [];
            TTcolors = [];
            if(this.padsEnabled){
                name = 'SHQ' + ( (arrayElt < 10) ? '0'+arrayElt : arrayElt ) + 'FN00X';
                colors[0] = frameColor(this.dataBus.SHARC[name], frame, this.nFrames);
                TTcolors[0] = 'rgba(40,40,40,1)';
                radialQuadrant(this.detailContext, this.canvasWidth*0.9, this.canvasHeight*0.4, this.innerQuadRadDetail/2, this.innerQuadRadDetail*2, this.quadArcDetail, -Math.PI/2, colors);
                radialQuadrant(this.TTdetailContext, this.canvasWidth*0.9, this.canvasHeight*0.4, this.innerQuadRadDetail/2, this.innerQuadRadDetail*2, this.quadArcDetail, -Math.PI/2, TTcolors, 1);
                name = 'SHQ' + ( (arrayElt < 10) ? '0'+arrayElt : arrayElt ) + 'FP00X';
                colors[0] = frameColor(this.dataBus.SHARC[name], frame, this.nFrames);
                TTcolors[0] = 'rgba(41,41,41,1)';
                radialQuadrant(this.detailContext, this.canvasWidth*0.9, this.canvasHeight*0.6, this.innerQuadRadDetail/2, this.innerQuadRadDetail*2, this.quadArcDetail, -Math.PI/2, colors);
                radialQuadrant(this.TTdetailContext, this.canvasWidth*0.9, this.canvasHeight*0.6, this.innerQuadRadDetail/2, this.innerQuadRadDetail*2, this.quadArcDetail, -Math.PI/2, TTcolors, 1);
            }

        } else{  //box details

            //subtitles:
            this.detailContext.fillText('Front', this.canvasWidth*0.19+this.boxDetailFrontLeftEdge - this.detailContext.measureText('Front').width/2, this.canvasHeight*0.7);
            this.detailContext.fillText('Back', this.canvasWidth*0.19+this.boxDetailBackLeftEdge - this.detailContext.measureText('Back').width/2, this.canvasHeight*0.7);
            this.detailContext.fillText('Pads', this.canvasWidth*0.9 - this.detailContext.measureText('Pads').width/2, this.canvasHeight*0.7);

            //front side:
            colors = [];
            TTcolors = [];
            for(i=0; i<24; i++){
                name = 'SHB' + ( (arrayElt < 10) ? '0'+arrayElt : arrayElt ) + 'DP' + ( (i<10) ? '0'+i : i ) + 'X';
                colors[colors.length] = frameColor(this.dataBus.SHARC[name], frame, this.nFrames);
                TTcolors[TTcolors.length] = 'rgba('+i+','+i+','+i+',1)';
            }
            boxFront(this.detailContext, this.boxDetailFrontLeftEdge,0.05*this.canvasHeight, 0.60*this.canvasHeight, 0.38*this.canvasWidth, colors);
            boxFront(this.TTdetailContext, this.boxDetailFrontLeftEdge,0.05*this.canvasHeight, 0.60*this.canvasHeight, 0.38*this.canvasWidth, TTcolors, 1);

            //back side:
            colors = [];
            TTcolors = [];
            for(i=0; i<48; i++){
                name = 'SHB' + ( (arrayElt < 10) ? '0'+arrayElt : arrayElt ) + 'EN' + ( (i<10) ? '0'+i : i ) + 'X';
                colors[colors.length] = frameColor(this.dataBus.SHARC[name], frame, this.nFrames);
                TTcolors[TTcolors.length] = 'rgba('+(i+24)+','+(i+24)+','+(i+24)+',1)';
            }
            boxBack(this.detailContext, this.boxDetailBackLeftEdge, 0.05*this.canvasHeight, 0.60*this.canvasHeight, 0.38*this.canvasWidth, colors);
            boxBack(this.TTdetailContext, this.boxDetailBackLeftEdge, 0.05*this.canvasHeight, 0.60*this.canvasHeight, 0.38*this.canvasWidth, TTcolors, 1);

            //pads
            colors = [];
            TTcolors = [];
            if(this.padsEnabled){
                name = 'SHB' + ( (arrayElt < 10) ? '0'+arrayElt : arrayElt ) + 'FN00X';
                colors[0] = frameColor(this.dataBus.SHARC[name], frame, this.nFrames);
                TTcolors[0] = 'rgba(72,72,72,1)';
                boxFront(this.detailContext, this.canvasWidth*0.85, this.canvasHeight*0.175, 0.15*this.canvasHeight, 0.1*this.canvasWidth, colors);
                boxFront(this.TTdetailContext, this.canvasWidth*0.85, this.canvasHeight*0.175, 0.15*this.canvasHeight, 0.1*this.canvasWidth, TTcolors, 1);
                name = 'SHB' + ( (arrayElt < 10) ? '0'+arrayElt : arrayElt ) + 'FP00X';
                colors[0] = frameColor(this.dataBus.SHARC[name], frame, this.nFrames);
                TTcolors[0] = 'rgba(73,73,73,1)';
                boxFront(this.detailContext, this.canvasWidth*0.85, this.canvasHeight*0.375, 0.15*this.canvasHeight, 0.1*this.canvasWidth, colors);
                boxFront(this.TTdetailContext, this.canvasWidth*0.85, this.canvasHeight*0.375, 0.15*this.canvasHeight, 0.1*this.canvasWidth, TTcolors, 1);
            }            
        }

        //decorations & TT:
        if(frame==this.nFrames || frame==0){ 
            //scale:
            this.drawScale(this.detailContext);
        }
    }

    this.defineText = function(cell){
        var i, name,
            objects = [], 
            keys = ['HV', 'threshold', 'rate'],
            arrayElt;

        if(this.detailShowing == 0){

            //strip elements:
            if(cell < 100){
                arrayElt = Math.ceil(cell/2);
                //quadrants
                if(arrayElt < 5 || arrayElt > 12){
                    //fronts
                    if(cell%2){
                        for(i=0; i<16; i++){
                            objects[objects.length] = 'SHQ' + ( (arrayElt < 10) ? '0'+arrayElt : arrayElt ) + 'DP' + ( (i<10) ? '0'+i : i ) + 'X';
                        }
                    } else { //backs
                        for(i=0; i<24; i++){
                            objects[objects.length] = 'SHQ' + ( (arrayElt < 10) ? '0'+arrayElt : arrayElt ) + 'EN' + ( (i<10) ? '0'+i : i ) + 'X';
                        }
                    }            
                } else{ //boxes
                    //fronts
                    if(cell%2 == 0){
                        for(i=0; i<24; i++){
                            objects[objects.length] = 'SHB' + ( (arrayElt < 10) ? '0'+arrayElt : arrayElt ) + 'DP' + ( (i<10) ? '0'+i : i ) + 'X';
                        }
                    } else { //backs
                        //backs
                        for(i=0; i<48; i++){
                            objects[objects.length] = 'SHB' + ( (arrayElt < 10) ? '0'+arrayElt : arrayElt ) + 'EN' + ( (i<10) ? '0'+i : i ) + 'X';
                        } 
                    }

                }
                document.getElementById(this.name+'TT').innerHTML = '';
                window.state.staticTT = 1;
                TTtable(this.name+'TT', this.dataBus.SHARC , objects, keys, objects[0].slice(0,5) + ( (objects[0].slice(5,7) == 'DP') ? ' (front)' : ' (back)' ), ['Device','HV [V]', 'Threhsold [ADC Units]', 'Rate [Hz]'], [Math.ceil(objects.length/2),Math.floor(objects.length/2)] );
            } else {  //pads:
                arrayElt = cell - 100;
                //quadrants
                if(arrayElt < 5 || arrayElt > 12){
                    objects[0] = 'SHQ' + ( (arrayElt < 10) ? '0'+arrayElt : arrayElt ) + 'FP00X';
                    objects[1] = 'SHQ' + ( (arrayElt < 10) ? '0'+arrayElt : arrayElt ) + 'FN00X';
                } else { //boxes
                    objects[0] = 'SHB' + ( (arrayElt < 10) ? '0'+arrayElt : arrayElt ) + 'FP00X';
                    objects[1] = 'SHB' + ( (arrayElt < 10) ? '0'+arrayElt : arrayElt ) + 'FN00X';
                }
                document.getElementById(this.name+'TT').innerHTML = '';
                TTtable(this.name+'TT', this.dataBus.SHARC ,objects, keys, objects[0].slice(0,5) + ' pads', ['Device','HV [V]', 'Threhsold [ADC Units]', 'Rate [Hz]'], [objects.length]);
            }
        } else {
            arrayElt = Math.ceil(this.detailShowing/2);
            if(arrayElt < 5 || arrayElt > 12){
                if(cell < 40)
                    name = 'SHQ' + ( (arrayElt < 10) ? '0'+arrayElt : arrayElt ) + ( (cell < 16) ? ('DP' + ((cell<10)?'0'+cell:cell) ) : ('EN' + ((cell-16<10)?'0'+(cell-16):(cell-16))) ) + 'X';
                else 
                    name = 'SHQ' + ( (arrayElt < 10) ? '0'+arrayElt : arrayElt ) + 'F' + ( (cell==40) ? 'N' : 'P' ) + '00X';
            } else {
                if(cell < 72)
                    name = 'SHB' + ( (arrayElt < 10) ? '0'+arrayElt : arrayElt ) + ( (cell < 24) ? ('DP' + ((cell<10)?'0'+cell:cell) ) : ('EN' + ((cell-24<10)?'0'+(cell-24):(cell-24))) ) + 'X';
                else
                    name = 'SHB' + ( (arrayElt < 10) ? '0'+arrayElt : arrayElt ) + 'F' + ( (cell==72) ? 'N' : 'P' ) + '00X';
            }
            
            document.getElementById(this.detailTooltip.ttDivID).innerHTML = name + '<br><br>' + this.baseTTtext(this.dataBus.SHARC[name].HV, this.dataBus.SHARC[name].threshold, this.dataBus.SHARC[name].rate);

        }

    };

    //get new data
    this.fetchNewData = function(){
        
        var key, normalization, quarter;

        //zero out the summary:
        for(key in this.dataBus.summary){
            if(this.dataBus.summary.hasOwnProperty(key)){
                this.dataBus.summary[key].HV = 0;
                this.dataBus.summary[key].threshold = 0;
                this.dataBus.summary[key].rate = 0;
            }
        }

        //fetch data, plug into detail level and increment summary cells:
        for(key in this.dataBus.SHARC){
            if(window.JSONPstore['thresholds']){
                if(window.JSONPstore['thresholds'][key]){
                    this.dataBus.SHARC[key]['threshold'] = window.JSONPstore['thresholds'][key];
                    quarter = Math.floor(parseInt(key.slice(7,9)) / this.sizeOfQuarter(key));
                    if(key.slice(5,6) != 'F') //treat pads differently since they don't need to be averaged:
                        this.dataBus.summary[key.slice(0,7) + quarter].threshold += window.JSONPstore['thresholds'][key];
                    else 
                        this.dataBus.summary[key].threshold = window.JSONPstore['thresholds'][key];
                } else
                    this.dataBus.SHARC[key]['threshold'] = 0xDEADBEEF;
            }

            if(window.JSONPstore['scalar']){
                if(window.JSONPstore['scalar'][key]){
                    this.dataBus.SHARC[key]['rate'] = window.JSONPstore['scalar'][key]['TRIGREQ'];
                    quarter = Math.floor(parseInt(key.slice(7,9)) / this.sizeOfQuarter(key));
                    if(key.slice(5,6) != 'F') //treat pads differently since they don't need to be averaged:
                        this.dataBus.summary[key.slice(0,7) + quarter].rate += window.JSONPstore['scalar'][key]['TRIGREQ'];
                    else 
                        this.dataBus.summary[key].rate = window.JSONPstore['scalar'][key]['TRIGREQ'];
                } else 
                    this.dataBus.SHARC[key]['rate'] = 0xDEADBEEF;
            }
        }

        //average the summary level cells:
        for(key in this.dataBus.summary){
            if(this.dataBus.summary.hasOwnProperty(key) && key.slice(5,6)!='F' ){
                this.dataBus.summary[key].HV /= this.sizeOfQuarter(key);
                this.dataBus.summary[key].threshold /= this.sizeOfQuarter(key);
                this.dataBus.summary[key].rate /= this.sizeOfQuarter(key);
            }
        }
        

    };

    //given a SHARC key, return 1/4 the number of segments in that type of detector
    this.sizeOfQuarter = function(key){

        if(key.slice(0,3) == 'SHB'){
            if(key.slice(5,7) == 'DP')
                return 6;
            else if(key.slice(5,7) == 'EN')
                return 12;
        } else if(key.slice(0,3) == 'SHQ'){
            if(key.slice(5,7) == 'DP')
                return 4;
            else if(key.slice(5,7) == 'EN')
                return 6;
        }        
    };

}


