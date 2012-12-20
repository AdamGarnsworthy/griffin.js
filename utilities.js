function partial(func /*, 0..n args */) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var allArguments = args.concat(Array.prototype.slice.call(arguments));
    return func.apply(this, allArguments);
  };
}

function curry (fn) {
    var slice = Array.prototype.slice,
        args = slice.apply(arguments, [1]);
    return function () {
        fn.apply(null, args.concat(slice.apply(arguments)));
    };
}

//generic function to execute the animation of some object <thing>, which has memeber function .draw which draws
//the thing only as a function of what frame the animation is on, and member data .duration, .FPS and .nFrames.
function animate(thing, frame){

    thing.draw(frame);
    if(frame < thing.nFrames){
        frame++;
        setTimeout(function(){animate(thing, frame)},thing.duration/thing.FPS*1000);
    }
}