
var body = document.body;


body.ontouchmove = function (e) {
	e.preventDefault();
}

var pages = document.querySelectorAll('.page'),
		startY, endY, deg, time, current = 0;

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

	if ( dist > 0 ) { // Flip Up
	
		deg = dist*0.48;

		if ( current != pages.length && deg <= 180 ) {

			pages[current].style.webkitTransition = "";	
			pages[current].style.webkitTransform = "rotateX(" + deg + "deg)";

			if ( current!= 0 ) {
				pages[current].style.zIndex = +pages[current-1].style.zIndex+1;
			}

		}

	}

	if ( dist < 0 ) { // Flip Down

		deg = (360 + dist) * 0.48;

		if ( current != 0 && deg >= 0 ) {

			pages[(current-1)].style.webkitTransition = "";
			pages[(current-1)].style.webkitTransform = "rotateX(" + deg +"deg)";

		}

	}


}

function flipEnd(e) {

	var ms = new Date().getTime()-time;

	if ( deg >= 90 && dist < 0 ) { // Flip Back Up

		pages[(current-1)].style.webkitTransition = "all ease-out .6s";
		pages[(current-1)].style.webkitTransform = "rotateX("+180+"deg) translateZ(0)";

	}
	if ( ( deg >= 90 || ms < 300 ) && dist > 0) { // Flip Up

		pages[current].style.webkitTransition = "all ease-out .4s";
		pages[current].style.webkitTransform = "rotateX("+180+"deg) translateZ(0)";
		
		current++;

	}
	if ( deg < 90 && dist > 0 ) { // Flip Back Down

		pages[current].style.webkitTransition = "all ease-out .6s";
		pages[current].style.webkitTransform = "rotateX("+0+"deg)";

		pages[current].style.zIndex = pages.length-current;

	}
	if ( ( deg < 90 || ms < 300 ) && dist < 0 ) { // Flip Down

		pages[(current-1)].style.webkitTransition = "all ease-out .4s";
		pages[(current-1)].style.webkitTransform = "rotateX("+0+"deg)";

		if ( current != pages.length ) {
			pages[(current-1)].style.zIndex = +pages[current].style.zIndex+1;
		} else {
			pages[(current-1)].style.zIndex = 1;			
		}
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


