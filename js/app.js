(function flibbble( window, document, undefined ) {

	// initialization
	// -------------------------------------------------------------

	var flipscreen,
			pages,

	init = function() {

		document.body.ontouchmove = function( e ) {
			e.preventDefault();
		};

		document.body.innerHTML = '<div id="menu" class="screen"><ul id="navigation"><li class="logo">flibbble</li><li data-open="#/popular">Popular</li><li data-open="#/following">Following</li><li data-open="#/likes">Likes</a></li><li data-open="#/debuts">Debuts</li><li data-open="#/everyone">Everyone</li></ul></div><div id="flipper" class="screen"></div>';

		flipscreen = document.getElementById( 'flipper' );

		var handler = function() {
			navigate.to();
		};

		window.addEventListener( 'hashchange', handler );

		navigate.enable();
		navigate.to();

		flip.enable();
		slide.enable();

	},

	// navigate
	// -------------------------------------------------------------

	navigate = (function() {

		var url = localStorage.getItem('url'),
				loading = false,
				page = 1,
				maxpage = 1,
				player,

		to = function() {

			var that = this,
					destination = ( location.hash ) ? location.hash.slice(2).split("/") : [];

			switch ( destination[0] ) {

				case "player":

					this.url = 'http://api.dribbble.com/players/'+destination[1]+'/shots/';

				break;
				case "following":
				case "likes":
					player = prompt("dribbble username:", player);

					if ( player ) {

						this.url = 'http://api.dribbble.com/players/'+player+'/shots/'+destination[0];

					}

				break;
				case "popular":
				case "debuts":
				case "everyone":

					this.url = 'http://api.dribbble.com/shots/'+destination[0];

				break;
				default:

					this.url = localStorage.getItem('url') || 'http://api.dribbble.com/shots/popular';

				break;
			}

			JSONP.get( this.url, {per_page:'20', page:'1'}, function( data ) {
					render(data);
					that.page = 1;
					that.maxpage = data.pages;
					slide.center();
					localStorage.setItem('url', that.url);
			});

			this.page = that.page;
			this.maxpage = that.maxpage;

		},

		enable = function() {

			var navigation = document.getElementById( 'navigation' );

			navigation.children[1].addEventListener('touchstart', navigate.activate, false);
			navigation.children[2].addEventListener('touchstart', navigate.activate, false);
			navigation.children[3].addEventListener('touchstart', navigate.activate, false);
			navigation.children[4].addEventListener('touchstart', navigate.activate, false);
			navigation.children[5].addEventListener('touchstart', navigate.activate, false);

		},

		activate = function() {

			if ( document.getElementsByClassName('active')[0] ) {
				document.getElementsByClassName('active')[0].classList.remove('active');
			}
			this.classList.add('active');			
			location.hash = this.getAttribute('data-open');

		},

		more = function( current ) {

			if ( ! loading && this.page < this.maxpage ) {
				loading = true;
				JSONP.get( this.url, {per_page:'20', page: ++this.page}, function(data) {
					render(data);
					pages[current+1].classList.add('hidden');
					loading = false;
				});
			}

		};

		return {
			to: to,
			more: more,
			url: url,
			enable: enable,
			activate: activate
		};

	})(),

	// rendering
	// -------------------------------------------------------------

	render = function( data ) {
		
		var length = data.shots.length,
		container  = document.createDocumentFragment(),
		i          = 0,
		
		build = function() {

			for ( ; i < length; i++ ) {

				var page = document.createElement('div');
				page.className = "page";

				// first page
				if ( i === 0 && data.page === 1 ) {

					page.appendChild( side() );
					page.classList.add('first');						
					page.firstChild.classList.add('front');

					container.appendChild( page );

				}

				// back of last page
				if ( i === 0 && data.page > 1 ) {
					pages[pages.length-1].appendChild( side() );
					pages[pages.length-1].classList.remove('last');
					pages[pages.length-1].lastChild.classList.add('back');					
				}				

				// page with front and back
				if ( i !== 0 && i !== length-1 ) {

					if ( i !== 1 ) {
						page.classList.add('hidden');
					}

					page.appendChild( side() );
					i++;
					page.appendChild( side() );

					page.firstChild.classList.add('front');
					page.lastChild.classList.add('back');

					container.appendChild( page );

				}

				// last page
				if ( i === length-1 ) {

					console.log(i, length-1);

					if ( length%2 === 0) {

						page.classList.add('last');
						if ( i !== 1 ) {
							page.classList.add('hidden');
						}
						page.appendChild( side() );
						page.firstChild.classList.add('front');

					} else {

						container.appendChild( page );

						page = document.createElement('div');
						page.className = "page last";
						if ( i !== 0 ) {
							page.classList.add('hidden');
						}
						page.innerHTML += '<div class="front text">END</div>';

					}

					container.appendChild( page );

				}

			}

		},

		insert = function() {

			flip.reset();
			flipscreen.innerHTML = "";
			if ( data.pages > 1 ) {
				flipscreen.appendChild( loading() );
			}			
			flipscreen.appendChild(container);
			pages = document.getElementsByClassName('page');

		},

		append = function() {

			if ( data.page === data.pages ) {
				flipscreen.removeChild( flipscreen.firstChild );
			}
			flipscreen.appendChild(container);
			pages = document.getElementsByClassName('page');

		},

		side = function() {

			var side = document.createElement('div'),
			shot = document.createElement('img'),
			details = document.createElement('div'),
			author = document.createElement('div'),
			authorImageLink = document.createElement('a'),
			authorImage = document.createElement('img');

			shot.className    = "shot";
			shot.height       = 240;
			shot.width        = 320;
			shot.src          = data.shots[i].image_url;			

			details.className = "details";
			details.innerHTML = '<h2 class="title">'+data.shots[i].title+'</h2>';
			details.innerHTML += '<div class="meta"><span class="likes"></span>'+data.shots[i].likes_count+' <span class="views"></span>'+data.shots[i].views_count+' <span class="comments"></span>'+data.shots[i].comments_count+' <a href="'+data.shots[i].url+'" class="open"></a></div>';

			author.className = "author";

			authorImageLink.className = "author-image";
			authorImageLink.href = '#/player/'+data.shots[i].player.username;

			authorImage.width = "50";
			authorImage.height = "50";
			authorImage.src = data.shots[i].player.avatar_url;

			authorImageLink.appendChild(authorImage);

			author.appendChild(authorImageLink);
			author.innerHTML += '<a href="#/player/'+data.shots[i].player.username+'" class="author-name">'+data.shots[i].player.name+'</a>';

			details.appendChild(author);
			side.appendChild(shot);
			side.appendChild(details);

			return side;

		},

		loading = function() {

			var loading = document.createElement('div');
			loading.className = "loading";
			loading.innerHTML = '<span class="arrow">&#8634;</span>drag up for more shots';

			return loading;

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

	flip = (function() {

		var current = 1,

		startY, startX, distY, distX, deg, time,

		start = function( e ) {
			startY = e.targetTouches[0].pageY;
			startX = e.targetTouches[0].pageX;
			distY = 0;
			distX = 0;
			deg = 0;
			time = new Date().getTime();
		},

		move = function( e ) {

			e.preventDefault();
			distY = startY-e.targetTouches[0].pageY;
			distX = startX-e.targetTouches[0].pageX;

			// FLIP UP
			if ( distY > 0 && Math.abs(distX) < Math.abs(distY) ) {
			
				slide.disable();

				if ( current === pages.length-1 ) { // LAST

					deg = Math.min(-Math.log(distY)*25+75,1);

					pages[current].style.webkitTransform = "rotateX(" + -deg + "deg)";
					pages[current].style.webkitTransition = "none";					

					if ( deg < -60 ) {
						flipscreen.firstChild.firstChild.classList.add('spin');
					} else {
						flipscreen.firstChild.firstChild.classList.remove('spin');							
					}

				} else {

					deg = Math.min( Math.max( (distY-20)*0.485, 1 ), 180 );

					pages[current].style.webkitTransform = "rotateX(" + deg + "deg)";
					pages[current].style.webkitTransition = "none";					

					pages[current+1].classList.remove('hidden');

					pages[current-1].style.webkitTransition = "";
					pages[current-1].style.webkitTransform = "";

				}

				if ( current > 1 ) {
					pages[current-2].classList.add('hidden');
				}

			}

			// FLIP DOWN
			if ( distY < 0 && Math.abs(distX) < Math.abs(distY) ) {

				slide.disable();

				if ( current === 1 ) { // FIRST

					deg = Math.min(-Math.log(-distY)*25+75, 1 );

					pages[0].style.webkitTransform = "rotateX(" + deg + "deg)";
					pages[0].style.webkitTransition = "none";

				} else {

					deg = Math.max( Math.min( (340 + distY) * 0.485, 180), 1 );

					pages[current-1].style.webkitTransform = "rotateX(" + deg +"deg)";
					pages[current-1].style.webkitTransition = "none";

					pages[current-2].classList.remove('hidden');

				}

				pages[current].style.webkitTransition = "";
				pages[current].style.webkitTransform = "";

				if ( current < pages.length-1 ) {
					pages[current+1].classList.add('hidden');					
				}

			}

		},

		end = function( e ) {

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
				if ( current-2 >= 0 ) {				
					pages[current-2].classList.add('hidden');
				}

			}

			// flip back down
			if ( deg < 90 && ( ms > 500 || current === pages.length-1 ) && distY > 0 ) {

				pages[current].style.webkitTransition = "";
				pages[current].style.webkitTransform = "";
				if ( current < pages.length-1 ) {
					pages[current+1].classList.add('hidden');
				}

				if ( current === pages.length-1) {

					pages[current-1].style.webkitTransition = "";
					pages[current-1].style.webkitTransform = "";

					if ( deg < -60 ) {
						navigate.more(current);
					}

				}

			}

			// flip up			
			if ( ( deg >= 90 || ms <= 500 ) && distY > 0 && current < pages.length-1 && Math.abs(distX) < Math.abs(distY) ) {

				pages[current].style.webkitTransition = "";
				pages[current].style.webkitTransform = "";
				pages[current].classList.add('up');

				if ( current-1 >= 0 ) {
					pages[current-1].classList.add('hidden');
				}

				current++;

			}

			// flip down			
			if ( ( deg < 90 || ms < 500 ) && distY < 0 && current !== 1 && Math.abs(distX) < Math.abs(distY) ) {

				pages[current-1].style.webkitTransition = "";
				pages[current-1].style.webkitTransform = "";
				pages[current-1].classList.remove('up');

				if ( current < pages.length-1 ) {
					pages[current+1].classList.add('hidden');
				}

				pages[current].classList.add('hidden');

				current--;

			}

			time = 0;

			slide.enable();

		},

		enable = function() {
		
			flipscreen.addEventListener('touchstart', start, false);
			flipscreen.addEventListener('touchmove', move, false);
			flipscreen.addEventListener('touchend', end, false);

		},

		disable = function() {

			flipscreen.removeEventListener('touchstart', start);
			flipscreen.removeEventListener('touchmove', move);
			flipscreen.removeEventListener('touchend', end);

		},

		reset = function() {
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

	slide = (function() {

		var startY, startX, distY, distX, position = "center",

		start = function( e ) {
			startY = e.targetTouches[0].pageY;
			startX = e.targetTouches[0].pageX;
			distY = 0;
			distX = 0;
		
		},

		move = function( e ) {
			e.preventDefault();
			distY = startY-e.targetTouches[0].pageY;
			distX = startX-e.targetTouches[0].pageX;
		
		},

		end = function( e ) {

			if ( position === "center" && Math.abs(distX) > Math.abs(distY) && distX > 50 ) {

				if ( e.target.classList.contains('shot') ) {
					e.target.classList.add('left');
					e.target.parentNode.addEventListener('touchend', hideDetails, false);
				}

			}

			if ( position === "center" && Math.abs(distX) > Math.abs(distY) && distX < -50 ) {

				if ( ( e.target.classList.contains('shot') && ! e.target.classList.contains('left') ) || e.target.classList.contains('text') ) {

					right();
				
				}
			
			}

			if ( position === "right" && Math.abs(distX) > Math.abs(distY) && distX > 0 ) {

				center();

			}

		},

		hideDetails = function( e ) {

			if ( position === "center" && Math.abs(distX) > Math.abs(distY) && distX < -50 ) {
				
				this.children[0].classList.remove('left');
				e.stopPropagation();
				this.removeEventListener('touchend', hideDetails);

			}

		},

		right = function() {

			flipscreen.classList.add('right');
			flip.disable();
			position = "right";

		},

		center = function() {

			flipscreen.classList.remove('right');
			flip.enable();
			position = "center";

		},

		enable = function() {
		
			flipscreen.addEventListener('touchstart', start, false);
			flipscreen.addEventListener('touchmove', move, false);
			flipscreen.addEventListener('touchend', end, false);

		},

		disable = function() {

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

	JSONP = (function() {

		var counter = 0, head, query, key, window = this, config = {};

		function load(url) {

			var script   = document.createElement('script'),
			done         = false;
			script.src   = url;
			script.async = true;

			script.onload = script.onreadystatechange = function() {

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
				} catch ( e ) {}
				window[ _jsonp ] = null;
			};

			load(url + query + (callbackName||config.callbackName||'callback') + '=' + _jsonp);
			return _jsonp;

		}

		function setDefaults( obj ){

			config = obj;

		}

		return {

			get: jsonp,

			init: setDefaults

		};

	})();

	init();

})( window, document );