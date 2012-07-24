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
		tap.enable();

	},

	// navigate
	// -------------------------------------------------------------

	navigate = (function () {

		var url = "http://api.dribbble.com/shots/popular",
				loading = false,
				page = 1,
				maxpage = 1,
				user,

		to = function (destination, el) {

			var that = this;

			switch ( destination ) {

				case "following":
				case "likes":
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
				break;

				default:

					this.url = 'http://api.dribbble.com/shots/'+destination;

					//local
					//this.url = 'http://localhost/js/popular.php';

					JSONP.get( this.url, {per_page:'20', page:'1'}, function(data) {
						render(data);
						that.page = 1;
						that.maxpage = data.pages;
						slide.center();
					});

				break;
			}

		},

		activate = function (item) {

			if ( document.getElementsByClassName('active')[0] ) {
				document.getElementsByClassName('active')[0].classList.remove('active');
			}
			item.classList.add('active');

		},

		enable = function () {

			var popular = document.getElementById('popular'),
			following   = document.getElementById('following'),
			likes       = document.getElementById('likes'),
			debuts      = document.getElementById('debuts'),
			everyone    = document.getElementById('everyone');

			popular.addEventListener('touchstart', function(e) { navigate.activate(this); navigate.to('popular'); }, false);
			following.addEventListener('touchstart', function(e) { navigate.activate(this); navigate.to('following'); }, false);
			likes.addEventListener('touchstart', function(e) { navigate.activate(this); navigate.to('likes'); }, false);
			debuts.addEventListener('touchstart', function(e) { navigate.activate(this); navigate.to('debuts'); }, false);
			everyone.addEventListener('touchstart', function(e) { navigate.activate(this); navigate.to('everyone'); }, false);

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
			url: url,
			activate: activate
		};

	})(),

	// rendering
	// -------------------------------------------------------------

	render = function(data) {
		
		var length = data.shots.length,
		container  = document.createDocumentFragment(),
		i          = 0,
		backshot,

		build = function() {

			for ( ; i < length; i++ ) {

				if ( i === 0 && data.page === 1 ) {
					container.appendChild( firstPage( data.shots[0] ) );
				}
				if ( i === 0 && data.page > 1 ) {
					backshot = backPage( data.shots[0] );
				}
				if ( i === length-1 ) {

					if ( length%2 === 0) {
						container.appendChild( lastPage( data.shots[length-1] ) );
					} else {
						container.appendChild( lastPage() );
					}

				}
				if ( i !== 0 && i !== length-1 ) {
					container.appendChild( page( data.shots[i], data.shots[i+1] ) );
					if ( i !== length-2 ) {
						i++;
					}
				}
			}

		},

		insert = function() {
			
			flipscreen.innerHTML = "";
			flip.reset();
			flipscreen.appendChild(container);
			pages = document.getElementsByClassName('page');

		},

		append = function() {

			pages[pages.length-1].appendChild(backshot);
			pages[pages.length-1].classList.remove('last');
			flipscreen.appendChild(container);
			pages = document.getElementsByClassName('page');

		},

		firstPage = function( shotsdata ) {

			var page          = document.createElement('div'),
			front             = document.createElement('div'),
			shot              = document.createElement('img');
			page.className    = "page first";
			front.className   = "front";
			shot.height       = 240;
			shot.width        = 320;
			shot.src          = shotsdata.image_url;
			shot.alt          = shotsdata.title;
			shot.className    = "shot";

			front.appendChild(shot);

			front.innerHTML += '<div class="details hidden"><h2>'+shotsdata.title+'</h2><div class="meta"><span class="likes"></span> '+shotsdata.likes_count+' <span class="views"></span> '+shotsdata.views_count+' <span class="comments"></span> '+shotsdata.comments_count+'</div><div class="author"><div class="author-image"><img src="'+shotsdata.player.avatar_url+'" height="50"></div><div class="author-name">'+shotsdata.player.name+'</div></div></div>';

			page.appendChild(front);
			return page;

		},

		page = function( shotsdata1, shotsdata2 ) {

			var page        = document.createElement('div'),
			front           = document.createElement('div'),
			back            = document.createElement('div'),
			shot1           = document.createElement('img'),
			shot2           = document.createElement('img');
			if ( i === 1 ) {
				page.className  = "page";
			} else {
				page.className  = "page hidden";				
			}
			front.className = "front";
			back.className  = "back";
			shot1.height    = 240;
			shot1.width     = 320;
			shot2.height    = 240;
			shot2.width     = 320;
			shot1.src       = shotsdata1.image_url;
			shot1.alt       = shotsdata1.title;
			shot2.src       = shotsdata2.image_url;
			shot2.alt       = shotsdata2.title;
			shot1.className = "shot";
			shot2.className = "shot";

			front.appendChild(shot1);
			back.appendChild(shot2);
			front.innerHTML += '<div class="details hidden"><h2>'+shotsdata1.title+'</h2><div class="meta"><span class="likes"></span> '+shotsdata1.likes_count+' <span class="views"></span> '+shotsdata1.views_count+' <span class="comments"></span> '+shotsdata1.comments_count+'</div><div class="author"><div class="author-image"><img src="'+shotsdata1.player.avatar_url+'" height="50"></div><div class="author-name">'+shotsdata1.player.name+'</div></div></div>';
			back.innerHTML += '<div class="details hidden"><h2>'+shotsdata2.title+'</h2><div class="meta"><span class="likes"></span> '+shotsdata2.likes_count+' <span class="views"></span> '+shotsdata2.views_count+' <span class="comments"></span> '+shotsdata2.comments_count+'</div><div class="author"><div class="author-image"><img src="'+shotsdata2.player.avatar_url+'" height="50"></div><div class="author-name">'+shotsdata2.player.name+'</div></div></div>';			
			page.appendChild(front);
			page.appendChild(back);
			return page;

		},

		lastPage = function( shotsdata ) {
			
			var page          = document.createElement('div'),
			front             = document.createElement('div');
			page.className    = "page last hidden";

			if ( shotsdata !== undefined ) {

				var shot        = document.createElement('img');
				front.className = "front";
				shot.height     = 240;
				shot.width      = 320;
				shot.src        = shotsdata.image_url;
				shot.alt        = shotsdata.title;
				shot.className  = "shot";

				front.appendChild(shot);
				front.innerHTML += '<div class="details hidden"><h2>'+shotsdata.title+'</h2><div class="meta"><span class="likes"></span> '+shotsdata.likes_count+' <span class="views"></span> '+shotsdata.views_count+' <span class="comments"></span> '+shotsdata.comments_count+'</div><div class="author"><div class="author-image"><img src="'+shotsdata.player.avatar_url+'" height="50"></div><div class="author-name">'+shotsdata.player.name+'</div></div></div>';

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
			back.className  = "back";
			shot.height     = 240;
			shot.width      = 320;
			shot.src        = shotsdata.image_url;
			shot.alt        = shotsdata.title;
			shot.className  = "shot";

			back.appendChild(shot);
			back.innerHTML += '<div class="details hidden"><h2>'+shotsdata.title+'</h2><div class="meta"><span class="likes"></span> '+shotsdata.likes_count+' <span class="views"></span> '+shotsdata.views_count+' <span class="comments"></span> '+shotsdata.comments_count+'</div><div class="author"><div class="author-image"><img src="'+shotsdata.player.avatar_url+'" height="50"></div><div class="author-name">'+shotsdata.player.name+'</div></div></div>';

			return back;

		};

		build();

		if ( data.page === 1 ) {
			insert();
		} else {
			append();
		}

	},

	// flip functions
	// -------------------------------------------------------------

	flip = (function () {

		var current  = 1,

		startY, startX, distY, distX, deg, time,

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

			// FLIP UP
			if ( distY > 0 && Math.abs(distX) < Math.abs(distY) ) {
			
				slide.disable();
				tap.disable();

				if ( current < pages.length-1 ) {

					deg = Math.min( Math.max( (distY-20)*0.485, 0 ), 180 );

					pages[current].style.webkitTransform = "rotateX(" + deg + "deg)";

					if ( pages[current].style.webkitTransition !== "none" ) { 
						pages[current].style.webkitTransition = "none";
					}
					
					if ( pages[current].style.zIndex === "" ) {
						pages[current].style.zIndex = +pages[current-1].style.zIndex+1;
					}

					pages[current+1].classList.remove('hidden');

					// reset transformations of previous page
					if ( pages[current-1].style.webkitTransition !== "" && pages[current-1].style.webkitTransform !== "" ) {
						pages[current-1].style.webkitTransition = "";
						pages[current-1].style.webkitTransform = "";
					}

				}

				if ( current === pages.length-1 ) { // transform last

					deg = Math.min(-Math.log(distY)*25+75,0);

					pages[current].style.webkitTransform = "rotateX(" + -deg + "deg)";

					if ( pages[current].style.webkitTransition !== "none" ) { 
						pages[current].style.webkitTransition = "none";
					}

				}

			}

			// FLIP DOWN
			if ( distY < 0 && Math.abs(distX) < Math.abs(distY) ) {

				slide.disable();
				tap.disable();

				if ( current !== 1 ) {

					deg = Math.max( Math.min( (340 + distY) * 0.485, 180), 0 );

					pages[current-1].style.webkitTransform = "rotateX(" + deg +"deg)";

					if ( pages[current-1].style.webkitTransition !== "none" ) {
						pages[current-1].style.webkitTransition = "none";
					}

				}

				if ( current === 1 ) { // transform first

					deg = Math.min(-Math.log(-distY)*25+75,0);

					pages[0].style.webkitTransform = "rotateX(" + deg + "deg)";

					if ( pages[0].style.webkitTransition !== "none" ) {
						pages[0].style.webkitTransition = "none";
					}

				}

				// reset transformations for flip down
				if ( pages[current].style.webkitTransition !== "" && pages[current].style.webkitTransform !== "" ) {
					pages[current].style.webkitTransition = "";
					pages[current].style.webkitTransform = "";
				}

				if ( current < pages.length-1 ) {
					pages[current+1].classList.add('hidden');
				}

			}

		},

		end = function(e) {

			if ( current === pages.length-1 ) {
				navigate.more(current);
			}

			var ms = new Date().getTime()-time;

			// flip first back up
			if ( current === 1 && deg < 0 && distY < 0 ) {

				pages[(current-1)].style.webkitTransition = "";
				pages[(current-1)].style.webkitTransform = "";				

			}

			// flip back up			
			if ( deg >= 90 && ms > 500 && distY < 0 && current !== 1 ) {

				pages[current-1].style.webkitTransition = "";
				pages[current-1].style.webkitTransform = "";
				pages[current-1].classList.add('up');

			}

			// flip up			
			if ( ( deg >= 90 || ms <= 500 ) && distY > 0 && current < pages.length-1 && Math.abs(distX) < Math.abs(distY) ) {

				pages[current].style.webkitTransition = "";
				pages[current].style.webkitTransform = "";
				pages[current].classList.add('up');

				if ( current-2 >= 0 ) {
					pages[current-2].classList.add('hidden');					
				}

				current++;

			}

			// flip back down
			if ( deg < 90 && ( ms > 500 || current === pages.length-1 ) && distY > 0 ) {

				pages[current].style.webkitTransition = "";
				pages[current].style.webkitTransform = "";

				if ( current === pages.length-1 ) {
					pages[current].style.zIndex = +pages[current-1].style.zIndex+1;
				}

			}

			// flip down			
			if ( ( deg < 90 || ms < 500 ) && distY < 0 && current !== 1 && Math.abs(distX) < Math.abs(distY) ) {

				pages[current-1].style.webkitTransition = "";
				pages[current-1].style.webkitTransform = "";
				pages[current-1].classList.remove('up');
				pages[current].style.zIndex = "";
				pages[current].classList.add('hidden');

				if ( current-3 >= 0 ) {
					pages[current-3].classList.remove('hidden');					
				}

				current--;

			}

			time = 0;

			slide.enable();
			tap.enable();

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

			flipscreen.classList.add('right');
			flip.disable();
			tap.disable();
			position = "right";

		},

		center = function() {

			flipscreen.classList.remove('right');
			flip.enable();
			tap.enable();
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

	// tap functions
	// -------------------------------------------------------------

	tap = (function () {

		var toggleDetail = function (e) {

			if ( e.target.classList.contains('shot') ) {

				e.target.classList.toggle('hide');
				e.target.nextElementSibling.classList.toggle('hidden');

			}

		},

		enable = function () {

			var frontpages = flipscreen.getElementsByClassName('front'),
			backpages = flipscreen.getElementsByClassName('back'),
			i = 0;

			for ( ; i < frontpages.length; i++ ) {
		
				frontpages[i].addEventListener('click', toggleDetail, false);

			}

			for ( i = 0; i < backpages.length; i++ ) {

				backpages[i].addEventListener('click', toggleDetail, false);

			}

		},

		disable = function () {

			var frontpages = flipscreen.getElementsByClassName('front'),
			backpages = flipscreen.getElementsByClassName('back'),
			i = 0;

			for ( ; i < frontpages.length; i++ ) {
		
				frontpages[i].removeEventListener('click', toggleDetail);

			}

			for ( i = 0; i < backpages.length; i++ ) {

				backpages[i].removeEventListener('click', toggleDetail);

			}

		};

		return {
			enable: enable,
			disable: disable
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

document.addEventListener( "DOMContentLoaded", function () {
	//if ( navigator.standalone && navigator.platform === 'iPhone' ) {
		flibbble.init();
	//}
});

