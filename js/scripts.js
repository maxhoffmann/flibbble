
document.addEventListener("DOMContentLoaded", function () {

/* Initialization */

var body = document.body,
		flip = document.getElementsByClassName('flip')[0],
		pages, startY, startX, distY, distX, deg, time, current = 1;

body.ontouchmove = function (e) {
	e.preventDefault();
}

flip.addEventListener('touchstart', flipStart, false);
flip.addEventListener('touchmove', flipMove, false);
flip.addEventListener('touchend', flipEnd, false);

JSONP.get( 'http://api.dribbble.com/shots/popular', {per_page:'27', page:'1'}, function(data) { renderShots(data); } );

/* Render */

function renderShots(data) {
	
	var length = data.shots.length,
	flip       = document.getElementsByClassName('flip')[0],
	container  = document.createDocumentFragment(),
	i          = 0,
	z					 = Math.round(length/2+1);

	for ( ; i < length; i++ ) {

		if ( i === 0 ) {
			container.appendChild( renderFirstPage( data.shots[0].image_url, data.shots[0].title, z ) );			
		}
		if ( i === length-1 ) {

			if ( length%2 === 0) {
				container.appendChild( renderLastPage( data.shots[length-1].image_url, data.shots[length-1].title ) );
			} else {
				container.appendChild( renderLastPage( ) );
			}			

		}
		if ( i !== 0 && i !== length-1 ) {
			container.appendChild( renderPage( data.shots[i].image_url, data.shots[i].title, data.shots[i+1].image_url, data.shots[i+1].title, z ) );
			if ( i !== length-2 ) {
				i++;
			}
		}
		z--;
	}

	flip.appendChild(container);
	pages = document.getElementsByClassName('page');

	function renderFirstPage( url, title, z ) {

		var page          = document.createElement('div'),
		front             = document.createElement('div'),
		shot              = document.createElement('img');
		page.className    = "page first";
		page.style.zIndex = z;
		front.innerHTML		= "Loading";
		front.className   = "front shot";
		shot.src          = url;
		shot.alt          = title;

		front.appendChild(shot);
		page.appendChild(front);
		return page;

	}

	function renderPage( url1, title1, url2, title2, z ) {

		var page          = document.createElement('div'),
		front             = document.createElement('div'),
		back              = document.createElement('div'),
		shot1             = document.createElement('img'),
		shot2             = document.createElement('img');	
		page.className    = "page";
		page.style.zIndex = z;
		front.className   = "front shot";
		front.innerHTML		= "Loading";
		back.className    = "back shot";
		back.innerHTML		= "Loading";		
		shot1.src         = url1;
		shot1.alt         = title1;
		shot2.src         = url2;
		shot2.alt         = title2;

		front.appendChild(shot1);
		back.appendChild(shot2);
		page.appendChild(front);
		page.appendChild(back);
		return page;

	}

	function renderLastPage( url, title ) {
		
		var page          = document.createElement('div'),
		front             = document.createElement('div');
		page.className    = "page last";
		page.style.zIndex = 1;

		if ( url && title ) {
			var shot        = document.createElement('img');
			front.className = "front shot";
			front.innerHTML	= "Loading";
			shot.src        = url;
			shot.alt        = title;

			front.appendChild(shot);
		} else {
			front.className = "front text";
			front.innerHTML = "END";
		}
		
		page.appendChild(front);
		return page;
	}

}

/* Swipe Functions */

function flipStart(e) {
	startY = e.targetTouches[0].pageY;
	startX = e.targetTouches[0].pageX;
	distY = 0;
	distX = 0;
	deg = 0;
	time = new Date().getTime();
}

function flipMove(e) {

	e.preventDefault();
	distY = startY-e.targetTouches[0].pageY;
	distX = startX-e.targetTouches[0].pageX;

	if ( distY > 0 ) { // flip up
	
		if ( current < pages.length-1 ) {

			deg = Math.min( distY*0.48, 180 );

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

			deg = Math.min(-Math.log(distY+18)*25+75,0);

			pages[current].style.webkitTransition = "";	
			pages[current].style.webkitTransform = "rotateX(" + -deg + "deg)";	

		}

	}

	if ( distY < 0 ) { // flip Down

		if ( current !== 1 ) {

			deg = Math.max( (360 + distY) * 0.48, 0 );

			pages[(current-1)].style.webkitTransition = "";
			pages[(current-1)].style.webkitTransform = "rotateX(" + deg +"deg)";

			if ( deg < 90 ) {
				pages[(current-1)].style.zIndex = +pages[current].style.zIndex+1;
			} else {
				pages[(current-1)].style.zIndex = +pages[(current-2)].style.zIndex+1;			
			}

			if ( current !==  pages.length-1 ) {
				pages[current].style.zIndex = +pages[(current+1)].style.zIndex+1;
			}

		}

		if ( current === 1 ) { // transform first

			deg = Math.min(-Math.log(-distY+18)*25+75,0);

				pages[0].style.webkitTransition = "";
				pages[0].style.webkitTransform = "rotateX("+deg+"deg)";

		}

		// reset transformations for flip down
		pages[current].style.webkitTransform = "rotateX(0deg)";

	}

}

function flipEnd(e) {

	var ms = new Date().getTime()-time;

	if ( deg < 0 && distY < 0 && current === 1 ) { // flip first back up

		pages[(current-1)].style.webkitTransition = "all ease-out .6s";
		pages[(current-1)].style.webkitTransform = "rotateX("+0+"deg) translateZ(0)";

	}
	if ( deg >= 90 && distY < 0 && current !== 1 ) { // flip back up

		pages[(current-1)].style.webkitTransition = "all ease-out .6s";
		pages[(current-1)].style.webkitTransform = "rotateX("+180+"deg) translateZ(0)";

		// update z-Index of next page
		if ( current < pages.length-1 ) {
			pages[current].style.zIndex = +pages[(current+1)].style.zIndex+1;
		}

	}
	if ( ( deg >= 90 || ms < 300 ) && distY > 0 && current < pages.length-1 ) { // flip up

		pages[current].style.webkitTransition = "all ease-out .4s";
		pages[current].style.webkitTransform = "rotateX("+180+"deg) translateZ(0)";

		// update z-Index of this page
		pages[current].style.zIndex = +pages[(current-1)].style.zIndex+1;

		current++;

	}
	if ( deg < 90 && distY > 0 && current !== pages.length ) { // flip back down

		pages[current].style.webkitTransition = "all ease-out .6s";
		pages[current].style.webkitTransform = "rotateX("+0+"deg)";

		pages[current].style.zIndex = pages.length-current;

	}
	if ( ( deg < 90 || ms < 300 ) && distY < 0 && current !== 1 ) { // flip down

		pages[(current-1)].style.webkitTransition = "all ease-out .4s";
		pages[(current-1)].style.webkitTransform = "rotateX("+0+"deg)";
		pages[(current-1)].style.zIndex = +pages[current].style.zIndex+1;

		current--;

	}

	/* Slide aside
	if ( distX < -100 ) {
		flip.style.webkitTransition = "-webkit-transform ease-out .2s";
		flip.style.webkitTransform = "translateX("+280+"px)";
	}

	if ( distX > 20 ) {
		flip.style.webkitTransition = "-webkit-transform ease-out .2s";
		flip.style.webkitTransform = "translateX("+0+"px)";
	}
	*/
	
	time = 0;

}

function setIndex() {
	var z = pages.length;
	for (var i=0; i<pages.length; i++) {
		pages[i].style.zIndex = z;
		z--;
	}
}

});

