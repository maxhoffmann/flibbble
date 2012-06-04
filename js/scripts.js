var flibbble = (function () {

	// Initialization
	// -------------------------------------------------------------

	var flipscreen = document.getElementById('flipper'),
			pages, startY, startX, distY, distX, deg, time, current = 1,

	init = function () {

		document.body.ontouchmove = function (e) {
			e.preventDefault();
		};

		enableFlip();

		JSONP.get( 'http://api.dribbble.com/shots/popular', {per_page:'50', page:'1'}, function(data) { render(data); } );

	},

	// Rendering
	// -------------------------------------------------------------

	render = function(data) {
		
		var length = data.shots.length,
		container  = document.createDocumentFragment(),
		i          = 0,
		z          = 3,

		build = function () {

			for ( ; i < length; i++ ) {

				if ( i === 0 ) {
					container.appendChild( firstPage( data.shots[0], z ) );
				}
				if ( i === length-1 ) {

					if ( length%2 === 0) {
						container.appendChild( lastPage( data.shots[length-1] ), z );
					} else {
						container.appendChild( lastPage( {}, z ) );
					}

				}
				if ( i !== 0 && i !== length-1 ) {
					container.appendChild( page( data.shots[i], data.shots[i+1], z ) );
					if ( i !== length-2 ) {
						i++;
					}
				}
				z--;
			}

		},

		insert = function () {
			
			flipscreen.appendChild(container);
			pages = document.getElementsByClassName('page');

		},

		firstPage = function( shotsdata, z ) {

			var page          = document.createElement('div'),
			front             = document.createElement('div'),
			shot              = document.createElement('img'),
			link              = document.createElement('a');
			page.className    = "page first";
			page.style.zIndex = z;
			front.innerHTML   = "Loading";
			front.className   = "front shot";
			link.href         = shotsdata.url;
			shot.src          = shotsdata.image_url;
			shot.alt          = shotsdata.title;

			link.appendChild(shot);
			front.appendChild(link);
			page.appendChild(front);
			return page;

		},

		page = function( shotsdata1, shotsdata2, z ) {

			var page        = document.createElement('div'),
			front           = document.createElement('div'),
			back            = document.createElement('div'),
			link1           = document.createElement('a'),
			link2           = document.createElement('a'),
			shot1           = document.createElement('img'),
			shot2           = document.createElement('img');
			page.className  = "page";
			front.className = "front shot";
			front.innerHTML = "Loading";
			back.className  = "back shot";
			back.innerHTML  = "Loading";
			link1.href      = shotsdata1.url;
			link2.href      = shotsdata2.url;
			shot1.src       = shotsdata1.image_url;
			shot1.alt       = shotsdata1.title;
			shot2.src       = shotsdata2.image_url;
			shot2.alt       = shotsdata2.title;

			if ( z > 0 ) {
				page.style.zIndex = z;
			} else {
				page.style.visibility = "hidden";
			}

			link1.appendChild(shot1);
			link2.appendChild(shot2);
			front.appendChild(link1);
			back.appendChild(link2);
			page.appendChild(front);
			page.appendChild(back);
			return page;

		},

		lastPage = function( shotsdata, z ) {
			
			var page          = document.createElement('div'),
			front             = document.createElement('div');
			page.className    = "page last";

			if ( z < 1 ) {
				page.style.visibility = "hidden";
			}

			if ( shotsdata.image_url && shotsdata.title ) {
				var shot        = document.createElement('img'),
				link            = document.createElement('a');
				front.className = "front shot";
				front.innerHTML = "Loading";
				link.href       = shotsdata.url;
				shot.src        = shotsdata.image_url;
				shot.alt        = shotsdata.title;

				link.appendChild(shot);
				front.appendChild(link);
			} else {
				front.className = "front text";
				front.innerHTML = "END";
			}
			
			page.appendChild(front);
			return page;
		};

		build();
		insert();

	},

	// Swipe Functions
	// -------------------------------------------------------------

	updateZindex = function () {

		if ( current > 2 ) {
			pages[(current-3)].style.visibility = "hidden";
			pages[(current-3)].style.zIndex = "";
		}
		if ( current > 1 ) {
			pages[(current-2)].style.zIndex = 1;
			pages[(current-2)].style.visibility = "";
		}
		pages[(current-1)].style.zIndex = 2;
		if ( pages.length-current > 1 ) {
			pages[(current+1)].style.zIndex = 2;
		}
		if ( pages.length-current > 2 ) {
			pages[(current+2)].style.zIndex = 1;
			pages[(current+2)].style.visibility = "";
			pages[(current+2)].style.webkitTransform = "";
			pages[(current+2)].style.webkitTransition = "";
		}
		if ( pages.length-current > 3 ) {
			pages[(current+3)].style.visibility = "hidden";
			pages[(current+3)].style.zIndex = "";
		}

	},

	flipStart = function(e) {
		startY = e.targetTouches[0].pageY;
		startX = e.targetTouches[0].pageX;
		distY = 0;
		distX = 0;
		deg = 0;
		time = new Date().getTime();
	},

	flipMove = function(e) {

		e.preventDefault();
		distY = startY-e.targetTouches[0].pageY;
		distX = startX-e.targetTouches[0].pageX;

		if ( distY > 0 ) { // flip up
		
			if ( current < pages.length-1 ) {

				deg = Math.min( Math.max( (distY-20)*0.55, 0 ), 180 );

				pages[current].style.webkitTransition = "";
				pages[current].style.webkitTransform = "rotateX(" + deg + "deg)";
				
				pages[current].style.zIndex = 3;

				// reset transformations of previous page
				if ( current === 1 ) {
					pages[0].style.webkitTransition = "";
					pages[0].style.webkitTransform = "";
				} else {
					pages[(current-1)].style.webkitTransform = "rotateX(180deg) translateZ(0)";
				}

				updateZindex();

			}

			if ( current === pages.length-1 ) { // transform last

				deg = Math.min(-Math.log(distY)*25+75,0);

				pages[current].style.webkitTransition = "";
				pages[current].style.webkitTransform = "rotateX(" + -deg + "deg)";

			}

		}

		if ( distY < 0 ) { // flip Down

			if ( current !== 1 ) {

				deg = Math.max( Math.min( (340 + distY) * 0.55, 180), 0 );

				pages[(current-1)].style.webkitTransition = "";
				pages[(current-1)].style.webkitTransform = "rotateX(" + deg +"deg)";

				pages[(current-1)].style.zIndex = 3;

			}

			if ( current === 1 ) { // transform first

				deg = Math.min(-Math.log(-distY)*25+75,0);

					pages[0].style.webkitTransition = "";
					pages[0].style.webkitTransform = "rotateX("+deg+"deg)";

			}

			// reset transformations for flip down
			pages[current].style.webkitTransform = "rotateX(0deg)";

		}

	},

	flipEnd = function(e) {

		var ms = new Date().getTime()-time;

		if ( deg < 0 && distY < 0 && current === 1 ) { // flip first back up

			pages[(current-1)].style.webkitTransition = "all ease-out .6s";
			pages[(current-1)].style.webkitTransform = "rotateX("+0+"deg) translateZ(0)";

		}
		if ( deg >= 90 && distY < 0 && current !== 1 ) { // flip back up

			pages[(current-1)].style.webkitTransition = "all ease-out .6s";
			pages[(current-1)].style.webkitTransform = "rotateX("+180+"deg) translateZ(0)";

		}
		if ( ( deg >= 90 || ms < 300 || ( ms > 300 && ms < 800 && distY > 100 && deg < 90 ) ) && distY > 0 && current < pages.length-1 ) { // flip up

			pages[current].style.webkitTransition = "all ease-out .4s";
			pages[current].style.webkitTransform = "rotateX("+180+"deg) translateZ(0)";

			current++;

		}
		if ( deg < 90 && distY > 0 && current !== pages.length ) { // flip back down

			pages[current].style.webkitTransition = "all ease-out .6s";
			pages[current].style.webkitTransform = "rotateX("+0+"deg)";

		}
		if ( ( deg < 90 || ms < 300 || ( ms > 300 && ms < 800 && distY < -100 && deg > 90 ) ) && distY < 0 && current !== 1 ) { // flip down

			pages[(current-1)].style.webkitTransition = "all ease-out .4s";
			pages[(current-1)].style.webkitTransform = "rotateX("+0+"deg)";

			current--;

			updateZindex();

		}
		
		time = 0;

	},

	enableFlip = function () {
	
		flipscreen.addEventListener('touchstart', flipStart, false);
		flipscreen.addEventListener('touchmove', flipMove, false);
		flipscreen.addEventListener('touchend', flipEnd, false);

	},

	disableFlip = function () {

		flipscreen.removeEventListener('touchstart', flipStart);
		flipscreen.removeEventListener('touchmove', flipMove);
		flipscreen.removeEventListener('touchend', flipEnd);

	},

	// JSONP
	// -------------------------------------------------------------

	JSONP = (function () {

		var counter = 0, head, query, key, window = this, config = {};

		function load(url) {

			var script   = document.createElement('script'),
			done         = false;
			script.src   = url;
			script.async = true;

			script.onload = script.onreadystatechange = function () {

				if ( !done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") ) {

					done = true;
					script.onload = script.onreadystatechange = null;

					if ( script && script.parentNode ) {
						script.parentNode.removeChild( script );
					}

				}

			};

			if ( !head ) {

				head = document.getElementsByTagName('head')[0];

			}

			head.appendChild( script );

		}

		function encode(str) {
			return encodeURIComponent(str);
		}

		function jsonp(url, params, callback, callbackName) {

			query = (url||'').indexOf('?') === -1 ? '?' : '&';
			params = params || {};

			for ( var key in params ) {

				if ( params.hasOwnProperty(key) ) {
					query += encode(key) + "=" + encode(params[key]) + "&";
				}

			}

			var _jsonp = "json" + (++counter);
			window[ _jsonp ] = function(data){
				callback(data);
				try {
					delete window[ _jsonp ];
				} catch (e) {}
				window[ _jsonp ] = null;
			};

			load(url + query + (callbackName||config.callbackName||'callback') + '=' + _jsonp);
			return _jsonp;

		}

		function setDefaults(obj){

			config = obj;

		}

		return {

			get: jsonp,

			init: setDefaults

		};

	})();

	// public functions
	// -------------------------------------------------------------

	return {

		init: init

	};

})();

document.addEventListener( "DOMContentLoaded", flibbble.init );

