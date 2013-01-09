//collect the form input and do something with it.  Expect form 'setValues', which
//begins with a pair of radio buttons for channel on off, then has an arbitrary 
//no. of text fields for inputting whatever else.

function updateParameter(InputLayer){

	var i;
	var userInputs = [];

    //loop over all elements in the form except the first two (off/on) and last two (submit / cancel)
	for(i=2; i<document.getElementById('setValues').elements.length - 2; i++){
		userInputs[i-2] = getInput('setValues', i);
	}

    //determine where this cell falls in MIDAS vector:
    var MIDASindex = getMIDASindex(window.griffinDialogY, window.griffinDialogX);

    //some dummy behavior, replace the rest of this function with more exciting things
    var onoff;
    if(document.getElementById('onButton').checked == true) onoff = 'on'
    else onoff = 'off'

    alert(onoff+' '+userInputs[0]);    

}

//extract information from the field at position <fieldIndex> from a form with id = <formID>
function getInput(formId, fieldIndex){
    var oForm = document.getElementById(formId);
    var oText = oForm.elements[fieldIndex];
    return oText.value;
}

//set values in fields:
function setInput(formId, fieldIndex, setval){
    var oForm = document.getElementById(formId);
    var oText = oForm.elements[fieldIndex];
    oText.value = setval;
}

//dismiss the form without doing anything else:
function abortUpdate(InputLayer){
	var inputDiv = document.getElementById(InputLayer);
	divFade(inputDiv, 'out', 0);
}

//fade the form in / out:
function divFade(targetDiv, direction, frame){

	var FPS = 40;
	var duration = 0.1;
	var nFrames = FPS*duration;
	var alpha;
	var maxOpacity = 0;

	if(frame <= nFrames){
		if(direction === 'in'){
			alpha = maxOpacity*frame/nFrames;
			$(targetDiv).css('background', 'rgba(0,0,0,'+alpha+')');
			targetDiv.style.display = 'block';

		} else if(direction === 'out'){
			alpha = maxOpacity-maxOpacity*frame/nFrames;
			$(targetDiv).css('background', 'rgba(0,0,0,'+alpha+')');
		}
		frame++;

		setTimeout(function(){divFade(targetDiv, direction, frame)}, 1000/FPS);
	} else if(direction === 'out'){
		targetDiv.style.display = 'none';
	}

}

//plugs a new cell into the input interface; used for both onclicks on the waffles, and on button submits 
//in the sidepanel view.
function channelSelect(waffle){

    //Throw up to global so the setter remembers where we're pointing.  TODO: refactor without globals?
    window.griffinDialogX = waffle.chx;
    window.griffinDialogY = waffle.chy;
	
    var superDiv = document.getElementById(waffle.wrapperDiv);
    var inputDiv = document.getElementById(waffle.InputLayer);

    //set text in dialog box:
    var inputTitle = 'Parameters for <br>'+waffle.colTitles[0]+' '+waffle.colTitles[waffle.chx+1]+', '+waffle.rowTitles[0]+' '+waffle.rowTitles[waffle.chy+1];
    document.getElementById('inputTitle').innerHTML = inputTitle;

    //set defaults
    if (waffle.channelMask[waffle.chy][waffle.chx] == 1) document.getElementById('onButton').checked = true;
    else document.getElementById('offButton').checked = true;

    //manage sliders
    waffle.voltageSlider.update(Math.round(waffle.demandVoltage[waffle.chy][waffle.chx]*10000)/10000);
    waffle.rampSlider.update(Math.round(waffle.demandVramp[waffle.chy][waffle.chx]*10000)/10000);

    //input sidebar:
    //$(inputDiv).css('right', '3%');

    //only actually display if the click was on the waffle and not the rest of the canvas:
    if(waffle.chx < waffle.cols && waffle.chy < waffle.rows){
        divFade(inputDiv, 'in', 0);

        setInput('changeChannel',0,waffle.colTitles[waffle.chx+1]);
        setInput('changeChannel',1,waffle.chy);
    }

    //dummy for now just to illustrate fill meters:
    meter.update(Math.round(waffle.reportVoltage[waffle.chy][waffle.chx]*10000)/10000);
}

//point interface at new channel indicated by user in the 'changeChannel' form.
function gotoNewChannel(event, waffle){
    var xName = getInput('changeChannel', 0);

    //have to map column titles onto index
    var xVal;
    for(var i=1; i<waffle.cols; i++){
        if(waffle.colTitles[i] == xName) xVal = i - 1;
    }

	var yVal = parseInt(getInput('changeChannel', 1));

    waffle.chx = xVal;
    waffle.chy = yVal;

    if(xVal<waffle.cols && yVal<waffle.rows){
        channelSelect(waffle);
    }
}