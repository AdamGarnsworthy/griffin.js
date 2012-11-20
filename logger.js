function Sample(cvas1, cvas2, initialY){

    if(!document.webkitHidden && !document.mozHidden){
    	var pullSlope = Math.random() - 0.5;

	    var scrollIt = new ScrollPlot(cvas1, cvas2, 0, 0, initialY, pullSlope);

    	initialY += pullSlope;
    }

	setTimeout(function(){Sample(cvas1, cvas2, initialY)},3000);

}

function ScrollPlot(cvas1, cvas2, iter, frame, initialY, slope){
	var canvas1 = document.getElementById(cvas1);
    var context1 = canvas1.getContext('2d');
	var canvas2 = document.getElementById(cvas2);
    var context2 = canvas2.getContext('2d');

    var yMin = -0.5;
    var yMax = 0.5;
    var xMin = 0;
    var xMax = 10;

    var FPS = 20;
    var duration = 2; //in seconds;
    var nFrames = FPS*duration;

    //number of samples on screen at once:
    var nSamples = 10;

    //seek optimal parameter to autoadjust plot size for smooth animation & maximum size:
    //(this is a solution to the problem that a measurement must be represented with a 
    //line segment which has a width in pixels = integer multiple of the number of
    //frames of animation used to scroll it one step back on the striptool; if not, 
    //roundoff errors at each frame cause the line segments to not line up with the tickmarks
    //nicely).
    var scale = 0;
    while((canvas1.width - scale*nSamples*nFrames) > 0) scale++;
    scale--;

    //same as in LoggerFrame:
    var marginSize = (canvas1.width - scale*nSamples*nFrames)*0.4  //70;
    var marginScaleY = 1.5;
    var axisLineWidth = 2;

    //plot origin:
    var x0 = marginSize*marginScaleY+axisLineWidth;
    var y0 = canvas1.height - marginSize - axisLineWidth;

    //right-hand boundary:
    var RHB = canvas1.width-marginSize;

    //width of one sample:
    var sampleWidth = (RHB - x0) / nSamples;

    //turn initialY into canvas coords:
    var yCoord = (yMax - initialY)/(yMax-yMin)*(y0-marginSize)              
    //and similarly for the slope:
    var s = slope*(y0-marginSize)/(yMax-yMin)*(xMax-xMin)/(RHB-x0);

    var lineColor = 'black';    
    if(yCoord < marginSize){
        s = 0;
        yCoord = marginSize;
        lineColor = 'red';
    } else if(yCoord > y0){
        s = 0;
        yCoord = y0-1;
        lineColor = 'red';
    }

    //how far to scroll in each frame of animation:
    var step = Math.round(sampleWidth / nFrames);

    if(iter){

        context1.drawImage(canvas2, x0+step, 0, RHB-x0-step, y0, x0, 0, RHB-x0-step, y0);
	    canvas1.style.zIndex=1;
	    canvas2.style.zIndex=0;
	    context2.fillStyle = 'rgba(255,255,255,1)';
        context2.fillRect(0,0,canvas1.width, canvas1.height);

        LoggerFrame(cvas2, xMin, xMax, yMin, yMax, marginSize, 'arbitrary x unit', 'arbitrary y unit', 'striptool');

	    context2.beginPath();
	    context2.lineWidth = 1;
        context2.strokeStyle = lineColor;
	    context2.moveTo(RHB-step,yCoord);
	    context2.lineTo(RHB,-step*s+yCoord);
	    context2.stroke();

	} else{

	    context2.drawImage(canvas1, x0+step, 0, RHB-x0-step, y0, x0, 0, RHB-x0-step, y0);
	    canvas2.style.zIndex=1;
	    canvas1.style.zIndex=0;
	    context1.fillStyle = 'rgba(255,255,255,1)';
        context1.fillRect(0,0,canvas1.width, canvas1.height);

        LoggerFrame(cvas1, xMin, xMax, yMin, yMax, marginSize, 'arbitrary x unit', 'arbitrary y unit', 'striptool');

	    context1.beginPath();
	    context1.lineWidth = 1;
        context1.strokeStyle = lineColor;
	    context1.moveTo(RHB-step, yCoord);
	    context1.lineTo(RHB,-step*s+yCoord);
	    context1.stroke();

	}

	if(iter) iter = 0;
	else iter = 1;

	frame++;
	if(frame<nFrames){
	    setTimeout(function(){ScrollPlot(cvas1,cvas2,iter, frame, initialY+slope/nFrames, slope)},1000/30);
	}
}




function LoggerFrame(cvas, xmin, xmax, ymin, ymax, marginSize, xtitle, ytitle, title) {

	var canvas = document.getElementById(cvas);
    var context = canvas.getContext('2d');

    
    //var marginSize = 70;
    var marginScaleY = 1.5;
    var bigTick = 10;
    var smallTick = 5;
    var majorX = 3;
    var minorX = 4;
    var xDecimal = 0;
    var majorY = 3;
    var minorY = 9;
    var yDecimal = 1;
    var scaleFont = '15px sans-serif';
    var titleFont = 'italic 24px times new roman';        
    var textColor = 'black';
    var titleNudgeX = 0;
    var titleNudgeY = 0;
    var xLabelNudgeX = 0;
    var xLabelNudgeY = 0;
    var yLabelNudgeX = 0;
    var yLabelNudgeY = 0;
    var axisLineWidth = 2;    

    var i, j, majorTickSpacingX, minorTickSpacingX, majorTickSpacingY, minorTickSpacingY;
  
    //text color
    context.fillStyle = textColor;

    context.beginPath();
    context.strokeStyle = 'black';
    context.lineWidth = axisLineWidth;
    //axes
    context.moveTo(marginScaleY * marginSize, canvas.height - marginSize);
    context.lineTo(canvas.width - marginSize, canvas.height - marginSize);
    context.moveTo(marginScaleY * marginSize, canvas.height - marginSize);
    context.lineTo(marginScaleY * marginSize, marginSize);

    //x-axis tick marks
    majorTickSpacingX = (canvas.width - (1 + marginScaleY) * marginSize) / (majorX - 1);
    minorTickSpacingX = majorTickSpacingX / (minorX + 1);

    for (i = 0; i < majorX; i++) {
        context.moveTo(marginScaleY * marginSize + i * majorTickSpacingX, canvas.height - marginSize);
        context.lineTo(marginScaleY * marginSize + i * majorTickSpacingX, canvas.height - marginSize + bigTick);

        context.font = scaleFont;
        context.fillText(((xmax - xmin) / (majorX - 1) * i + xmin).toFixed(xDecimal), marginScaleY * marginSize + i * majorTickSpacingX, canvas.height - marginSize + bigTick + 12);

        if (i < majorX - 1) {
            for (j = 0; j < minorX; j++) {
                context.moveTo(marginScaleY * marginSize + i * majorTickSpacingX + (j + 1) * minorTickSpacingX, canvas.height - marginSize);
                context.lineTo(marginScaleY * marginSize + i * majorTickSpacingX + (j + 1) * minorTickSpacingX, canvas.height - marginSize + smallTick);
            }
        }
    }

    //y-axis tick marks
    majorTickSpacingY = (canvas.height - 2 * marginSize) / (majorY - 1);
    minorTickSpacingY = majorTickSpacingY / (minorY + 1);
    for (i = 0; i < majorY; i++) {
        context.moveTo(marginScaleY * marginSize, canvas.height - marginSize - i * majorTickSpacingY);
        context.lineTo(marginScaleY * marginSize - bigTick, canvas.height - marginSize - i * majorTickSpacingY);

        context.font = scaleFont;
        context.textBaseline = "middle";
        context.textAlign = "right";
        context.fillText(((ymax - ymin) / (majorY - 1) * i + ymin).toFixed(yDecimal), marginScaleY * marginSize - bigTick - 12, canvas.height - marginSize - i * majorTickSpacingY);

        if (i < majorY - 1) {
            for (j = 0; j < minorY; j++) {
                context.moveTo(marginScaleY * marginSize, canvas.height - marginSize - i * majorTickSpacingY - (j + 1) * minorTickSpacingY);
                context.lineTo(marginScaleY * marginSize - smallTick, canvas.height - marginSize - i * majorTickSpacingY - (j + 1) * minorTickSpacingY);
            }
        }
    }

    //titles  

    context.textBaseline = "middle";
    context.textAlign = "right";
    context.font = titleFont;
    context.fillText(xtitle, canvas.width - marginSize - minorTickSpacingX + xLabelNudgeX, canvas.height - marginSize / 2 + xLabelNudgeY);

    context.save();
    context.translate(marginSize / 2 + yLabelNudgeX, marginSize + minorTickSpacingY + yLabelNudgeY);
    context.rotate(-1 * Math.PI / 2);
    context.textBaseline = "bottom";
    context.fillText(ytitle, 0, 0);
    context.restore();

    context.textBaseline = "bottom";
    //context.fillText(title, canvas.width - marginSize - minorTickSpacingX + titleNudgeX, marginSize + titleNudgeY);
       
    context.stroke();

 }

