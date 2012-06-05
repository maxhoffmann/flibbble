var flibbble = (function () {

	// initialization
	// -------------------------------------------------------------

	var flipscreen = document.getElementById('flipper'),
			pages,

	init = function () {

		document.body.ontouchmove = function (e) {
			e.preventDefault();
		};

		navigate.enable();
		navigate.to('popular');
		flip.enable();
		slide.enable();

	},

	// navigate
	// -------------------------------------------------------------

	navigate = (function () {

		var url = "http://api.dribbble.com/shots/popular",
				loading = false,
				page = 1,
				maxpage = 1,
				user,

		to = function (destination) {

			var that = this;

			if ( destination === "following" || destination === "likes" ) {

				user = prompt("dribbble username:", user);

				if ( user ) {

					this.url = 'http://api.dribbble.com/players/'+user+'/shots/'+destination;

					JSONP.get( this.url, {per_page:'20', page:'1'}, function(data) {
							render(data);
							that.page = 1;
							that.maxpage = data.pages;
							slide.center();
					});

				}

			} else {

				this.url = 'http://api.dribbble.com/shots/'+destination;

				JSONP.get( this.url, {per_page:'20', page:'1'}, function(data) {
					render(data);
					that.page = 1;
					that.maxpage = data.pages;
					slide.center();
				});

			}

		},

		enable = function () {

			var popular = document.getElementById('popular'),
			following   = document.getElementById('following'),
			likes       = document.getElementById('likes'),
			debuts      = document.getElementById('debuts'),
			everyone    = document.getElementById('everyone');

			popular.addEventListener('touchstart', function(e) { navigate.to('popular'); }, false);
			following.addEventListener('touchstart', function(e) { navigate.to('following'); }, false);
			likes.addEventListener('touchstart', function(e) { navigate.to('likes'); }, false);
			debuts.addEventListener('touchstart', function(e) { navigate.to('debuts'); }, false);
			everyone.addEventListener('touchstart', function(e) { navigate.to('everyone'); }, false);

		},

		more = function (current) {

			if ( ! loading && this.page < this.maxpage ) {
				loading = true;
				JSONP.get( this.url, {per_page:'20', page: ++this.page}, function(data) {
					render(data);
					loading = false;
				});
			}

		};

		return {
			to: to,
			enable: enable,
			more: more,
			url: url
		};

	})(),

	// rendering
	// -------------------------------------------------------------

	render = function(data) {
		
		var length = data.shots.length,
		container  = document.createDocumentFragment(),
		i          = 0,
		z          = 3,
		backshot,

		build = function () {

			for ( ; i < length; i++ ) {

				if ( i === 0 && data.page === 1 ) {
					container.appendChild( firstPage( data.shots[0], z ) );
				}
				if ( i === 0 && data.page > 1 ) {
					backshot = backPage( data.shots[0] );
					z--;
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
			
			flipscreen.innerHTML = "";
			flip.reset();
			flipscreen.appendChild(container);
			pages = document.getElementsByClassName('page');

		},

		append = function () {

			pages[pages.length-1].appendChild(backshot);
			pages[pages.length-1].classList.remove('last');
			flipscreen.appendChild(container);
			pages = document.getElementsByClassName('page');

		},

		firstPage = function( shotsdata, z ) {

			var page          = document.createElement('div'),
			front             = document.createElement('div'),
			shot              = document.createElement('img');
			page.className    = "page first";
			page.style.zIndex = z;
			front.innerHTML   = "Loading";
			front.className   = "front shot";
			shot.height       = 240;
			shot.width        = 320;
			shot.src          = shotsdata.image_url;
			shot.alt          = shotsdata.title;

			front.appendChild(shot);
			page.appendChild(front);
			return page;

		},

		page = function( shotsdata1, shotsdata2, z ) {

			var page        = document.createElement('div'),
			front           = document.createElement('div'),
			back            = document.createElement('div'),
			shot1           = document.createElement('img'),
			shot2           = document.createElement('img');
			page.className  = "page";
			front.className = "front shot";
			front.innerHTML = "Loading";
			back.className  = "back shot";
			back.innerHTML  = "Loading";
			shot1.height    = 240;
			shot1.width     = 320;
			shot2.height    = 240;
			shot2.width     = 320;
			shot1.src       = shotsdata1.image_url;
			shot1.alt       = shotsdata1.title;
			shot2.src       = shotsdata2.image_url;
			shot2.alt       = shotsdata2.title;

			if ( z > 0 ) {
				page.style.zIndex = z;
			} else {
				page.style.visibility = "hidden";
			}

			front.appendChild(shot1);
			back.appendChild(shot2);
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

				var shot        = document.createElement('img');
				front.className = "front shot";
				front.innerHTML = "Loading";
				shot.height     = 240;
				shot.width      = 320;
				shot.src        = shotsdata.image_url;
				shot.alt        = shotsdata.title;

				front.appendChild(shot);

			} else {

				front.className = "front text";
				front.innerHTML = "END";

			}
			
			page.appendChild(front);
			return page;

		},

		backPage = function ( shotsdata ) {

			var shot        = document.createElement('img'),
			back            = document.createElement('div');
			back.className  = "back shot";
			back.innerHTML  = "Loading";
			shot.height     = 240;
			shot.width      = 320;
			shot.src        = shotsdata.image_url;
			shot.alt        = shotsdata.title;

			back.appendChild(shot);

			return back;

		};

		if ( data.page === 1 ) {
			build();
			insert();
		} else {
			build();
			append();
		}

	},

	// flip functions
	// -------------------------------------------------------------

	flip = (function () {

		var current  = 1,
		updatedIndex = false,

		startY, startX, distY, distX, deg, time,

		updateIndex = function () {

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
				pages[(current+2)].style.cssText = "z-index: 1;";
			}
			if ( pages.length-current > 3 ) {
				pages[(current+3)].style.cssText = "visibility: hidden;";
			}

		},

		start = function(e) {
			startY = e.targetTouches[0].pageY;
			startX = e.targetTouches[0].pageX;
			distY = 0;
			distX = 0;
			deg = 0;
			time = new Date().getTime();
		},

		move = function(e) {

			e.preventDefault();
			distY = startY-e.targetTouches[0].pageY;
			distX = startX-e.targetTouches[0].pageX;

			if ( distY > 0 && Math.abs(distX) < Math.abs(distY) ) { // flip up
			
				slide.disable();

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

					if ( ! updatedIndex ) {
						updateIndex();
						updatedIndex = true;
					}

				}

				if ( current === pages.length-1 ) { // transform last

					deg = Math.min(-Math.log(distY)*25+75,0);

					pages[current].style.webkitTransition = "";
					pages[current].style.webkitTransform = "rotateX(" + -deg + "deg)";

				}

			}

			if ( distY < 0 && Math.abs(distX) < Math.abs(distY) ) { // flip Down

				slide.disable();

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

		end = function(e) {

			if ( current === pages.length-1 ) {
				navigate.more(current);
			}

			var ms = new Date().getTime()-time;

			if ( current === 1 && deg < 0 && distY < 0 ) { // flip first back up

				pages[(current-1)].style.webkitTransition = "all ease-out .6s";
				pages[(current-1)].style.webkitTransform = "rotateX("+0+"deg) translateZ(0)";

			}
			if ( ( deg >= 90 || ms <= 500 ) && distY > 0 && current < pages.length-1 && Math.abs(distX) < Math.abs(distY) ) { // flip up

				pages[current].style.webkitTransition = "all ease-out .4s";
				pages[current].style.webkitTransform = "rotateX("+180+"deg) translateZ(0)";

				current++;

			}
			if ( deg < 90 && ( ms > 500 || current === pages.length-1 ) && distY > 0 ) { // flip back down

				pages[current].style.webkitTransition = "all ease-out .6s";
				pages[current].style.webkitTransform = "rotateX("+0+"deg)";

			}
			if ( ( deg < 90 || ms < 500 ) && distY < 0 && current !== 1 && Math.abs(distX) < Math.abs(distY) ) { // flip down

				pages[(current-1)].style.webkitTransition = "all ease-out .4s";
				pages[(current-1)].style.webkitTransform = "rotateX("+0+"deg)";

				current--;

				updateIndex();

			}
			if ( deg >= 90 && ms > 500 && distY < 0 && current !== 1 ) { // flip back up

				pages[(current-1)].style.webkitTransition = "all ease-out .6s";
				pages[(current-1)].style.webkitTransform = "rotateX("+180+"deg) translateZ(0)";

			}

			updatedIndex = false;
			time = 0;

			slide.enable();

		},

		enable = function () {
		
			flipscreen.addEventListener('touchstart', start, false);
			flipscreen.addEventListener('touchmove', move, false);
			flipscreen.addEventListener('touchend', end, false);

		},

		disable = function () {

			flipscreen.removeEventListener('touchstart', start);
			flipscreen.removeEventListener('touchmove', move);
			flipscreen.removeEventListener('touchend', end);

		},

		reset = function () {
			current = 1;
		};

		return {

			enable: enable,
			disable: disable,
			reset: reset

		};

	})(),

	// slide functions
	// -------------------------------------------------------------

	slide = (function () {

		var startY, startX, distY, distX, position = "center",

		start = function(e) {
			startY = e.targetTouches[0].pageY;
			startX = e.targetTouches[0].pageX;
			distY = 0;
			distX = 0;
		},

		move = function(e) {
			e.preventDefault();
			distY = startY-e.targetTouches[0].pageY;
			distX = startX-e.targetTouches[0].pageX;
		},

		end = function(e) {

			if ( position === "center" && Math.abs(distX) > Math.abs(distY) && distX < -50 ) {

				right();

			}

			if ( position === "right" && Math.abs(distX) > Math.abs(distY) && distX > 0 ) {

				center();

			}

		},

		right = function() {

			flipscreen.style.webkitTransform = "translateX(240px) translateZ(0)";
			flip.disable();
			position = "right";

		},

		center = function() {

			flipscreen.style.webkitTransform = "translateX(0px) translateZ(0)";
			flip.enable();
			position = "center";

		},

		enable = function () {
		
			flipscreen.addEventListener('touchstart', start, false);
			flipscreen.addEventListener('touchmove', move, false);
			flipscreen.addEventListener('touchend', end, false);

		},

		disable = function () {

			flipscreen.removeEventListener('touchstart', start);
			flipscreen.removeEventListener('touchmove', move);
			flipscreen.removeEventListener('touchend', end);

		};

		return {
			enable: enable,
			disable: disable,
			right: right,
			center: center
		};

	})(),

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

