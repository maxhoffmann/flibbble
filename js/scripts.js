
var body = document.body;


body.ontouchmove = function (e) {
	e.preventDefault();
}

var pages = document.querySelectorAll('.page'),
		startY, endY, deg, time, current = 1;

body.addEventListener('touchstart', flipStart, false);
body.addEventListener('touchmove', flipMove, false);
body.addEventListener('touchend', flipEnd, false);

setIndex();

function flipStart(e) {

	startY = e.targetTouches[0].pageY;
	dist = 0;
	deg = 0;
	time = new Date().getTime();
}

function flipMove(e) {

	e.preventDefault();
	dist = startY-e.targetTouches[0].pageY;

	if ( dist > 0 ) { // flip up
	
		if ( current < pages.length-1 ) {

			deg = Math.min( dist*0.48, 180 );

			pages[current].style.webkitTransition = "";	
			pages[current].style.webkitTransform = "rotateX(" + deg + "deg)";
			
			pages[current].style.zIndex = +pages[current-1].style.zIndex+1;

			// reset transformations of previous page
			if ( current === 1 ) {
				pages[0].style.webkitTransition = "";
				pages[0].style.webkitTransform = "";
			} else {
				pages[(current-1)].style.webkitTransform = "rotateX(180deg) translateZ(0)";
			}

		}

		if ( current === pages.length-1 ) { // transform last

			deg = Math.min( dist*0.48, 60 );

			pages[current].style.webkitTransition = "";	
			pages[current].style.webkitTransform = "rotateX(" + deg + "deg)";			

		}

	}

	if ( dist < 0 ) { // flip Down

		if ( current != 1 ) {

			deg = Math.max( (360 + dist) * 0.48, 0 );

			pages[(current-1)].style.webkitTransition = "";
			pages[(current-1)].style.webkitTransform = "rotateX(" + deg +"deg)";

			if ( deg < 90 ) {
				pages[(current-1)].style.zIndex = +pages[current].style.zIndex+1;
			} else {
				pages[(current-1)].style.zIndex = +pages[(current-2)].style.zIndex+1;			
			}

		}

		if ( current === 1 ) {

			deg = Math.max( dist*0.48 , -50 );

				pages[0].style.webkitTransition = "";
				pages[0].style.webkitTransform = "rotateX("+deg+"deg)";

		}

		// reset transformations for flip down
		pages[current].style.webkitTransform = "rotateX(0deg)";

	}


}

function flipEnd(e) {

	var ms = new Date().getTime()-time;

	if ( deg < 0 && dist < 0 && current === 1 ) { // flip first back up

			pages[(current-1)].style.webkitTransition = "all ease-out .6s";
			pages[(current-1)].style.webkitTransform = "rotateX("+0+"deg) translateZ(0)";

	}
	if ( deg >= 90 && dist < 0 && current != 1 ) { // flip back up

			pages[(current-1)].style.webkitTransition = "all ease-out .6s";
			pages[(current-1)].style.webkitTransform = "rotateX("+180+"deg) translateZ(0)";

			// update z-Index of next page
			if ( current < pages.length-1 ) {
				pages[current].style.zIndex = +pages[(current+1)].style.zIndex+1;
			}

	}
	if ( ( deg >= 90 || ms < 300 ) && dist > 0 && current < pages.length-1 ) { // flip up

		pages[current].style.webkitTransition = "all ease-out .4s";
		pages[current].style.webkitTransform = "rotateX("+180+"deg) translateZ(0)";

		// update z-Index of this page
		pages[current].style.zIndex = +pages[(current-1)].style.zIndex+1;

		current++;

	}
	if ( deg < 90 && dist > 0 && current != pages.length ) { // flip back down

		pages[current].style.webkitTransition = "all ease-out .6s";
		pages[current].style.webkitTransform = "rotateX("+0+"deg)";

		pages[current].style.zIndex = pages.length-current;

	}
	if ( ( deg < 90 || ms < 300 ) && dist < 0 && current != 1 ) { // flip down

		pages[(current-1)].style.webkitTransition = "all ease-out .4s";
		pages[(current-1)].style.webkitTransform = "rotateX("+0+"deg)";
		pages[(current-1)].style.zIndex = +pages[current].style.zIndex+1;

		current--;

	}

	time = 0;

}

function setIndex() {
	var z = pages.length;
	for (var i=0; i<pages.length; i++) {
		pages[i].style.zIndex = z;
		z--;
	}
}


