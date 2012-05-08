
var body = document.body;


body.ontouchmove = function (e) {
	e.preventDefault();
}

var pages = document.querySelectorAll('.page'),
		startY, endY, current = 0;

body.addEventListener('touchstart', flipStart, false);
body.addEventListener('touchmove', flipMove, false);
body.addEventListener('touchend', flipEnd, false);

setIndex();

function flipStart(e) {
	startY = e.targetTouches[0].pageY;
	dist = 0;
}

function flipMove(e) {
	e.preventDefault();
	dist = startY-e.targetTouches[0].pageY;

	if ( dist > 0 && current != pages.length && (dist*0.48) <= 180 ) { // Flip Up
		pages[current].style.webkitTransition = "";	
		pages[current].style.webkitTransform = "rotateX("+(dist*0.48)+"deg)";
	}
	if ( dist < 0 && current != 0 && ((360+dist)*0.48) >= 0 ) { // Flip Down
		pages[(current-1)].style.webkitTransition = "";
		pages[(current-1)].style.webkitTransform = "rotateX("+((360+dist)*0.48)+"deg)";
		if ( current < pages.length ) {
			pages[current].style.zIndex = pages.length-current;
		}
	}

}

function flipEnd(e) {

	if ( dist > 0 && current != pages.length ) { // Flip Up
		pages[current].style.webkitTransition = "all ease-out .4s";
		pages[current].style.webkitTransform = "rotateX("+180+"deg) translateZ(0)";
		current++;
		if ( current != pages.length ) {
			pages[current].style.zIndex = +pages[(current-1)].style.zIndex+1;			
		}
	}
	if ( dist < 0 && current != 0 ) { // Flip Down
		pages[(current-1)].style.webkitTransition = "all ease-out .4s";
		pages[(current-1)].style.webkitTransform = "rotateX("+0+"deg)";
		current--;
	}
}

function setIndex() {
	var z = pages.length;
	for (var i=0; i<pages.length; i++) {
		pages[i].style.zIndex = z;
		z--;
	}
}


