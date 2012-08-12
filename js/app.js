(function flibbble( window, document, undefined ) {

	"use strict";

	// initialization
	// -------------------------------------------------------------

	var flipscreen,
			pages,

	init = function() {

		document.body.ontouchmove = function( e ) {
			e.preventDefault();
		};

		document.body.innerHTML = '<div id="notifications"><span id="notification"></span></div><div id="menu" class="screen"><ul id="navigation"><li class="logo">flibbble</li><li data-open="#/popular">Popular</li><li data-open="#/following">Following</li><li data-open="#/likes">Likes</a></li><li data-open="#/debuts">Debuts</li><li data-open="#/everyone">Everyone</li></ul></div><div id="flipper" class="screen"></div>';

		flipscreen = document.getElementById( 'flipper' );

		var handler = function() {
			navigate.to();
		},
		destination = JSON.parse(localStorage.getItem('destination'));

		window.addEventListener( 'hashchange', handler, false );
		window.addEventListener( 'orientationchange', orientation, false );

		notification.enable();
		if ( destination.length && destination[1] === undefined ) {
			notification.show( destination[0], destination[1] );
		}

		navigate.enable();
		navigate.to();

		flip.enable();
		slide.enable();

	},

	// navigate
	// -------------------------------------------------------------

	navigate = (function() {

		var url,
				loading = false,
				page = 1,
				maxpage = 1,
				player,

		to = function() {

			var that = this,
					destination = ( location.hash.length ) ? location.hash.slice(2).split("/") : JSON.parse(localStorage.getItem('destination'));

			switch ( destination[0] ) {

				case "shots":

					this.url = 'http://api.dribbble.com/players/'+destination[1]+'/'+destination[0]+'/';

				break;
				case "following":
				case "likes":

					player = ( destination[1] === undefined ) ? prompt("dribbble username:", player) : destination[1];

					this.url = 'http://api.dribbble.com/players/'+player+'/shots/'+destination[0];
					localStorage.setItem('player', player);

				break;
				case "popular":
				case "debuts":
				case "everyone":

					this.url = 'http://api.dribbble.com/shots/'+destination[0];

				break;
				default:

					this.url = 'http://api.dribbble.com/shots/popular';

				break;

			}

			JSONP.get( this.url, {per_page: 20, page: page }, function( data ) {
					render(data);
					if ( destination[1] !== undefined ) {
						notification.show( destination[0], destination[1] );
					}
					that.page = 1;
					that.maxpage = data.pages;
					slide.center();
					localStorage.setItem( 'destination', JSON.stringify(destination) );
			});

			this.page = that.page;
			this.maxpage = that.maxpage;

		},

		enable = function() {

			var navigation = document.getElementById( 'navigation' ),
			destination = ( localStorage.getItem('destination') !== null ) ? JSON.parse(localStorage.getItem('destination')) : ["popular"],
			i = 1;

			for ( ; i < navigation.children.length; i++ ) {
				navigation.children[i].addEventListener('touchstart', navigate.activate, false);
				if ( navigation.children[i].getAttribute('data-open').slice(2) === destination[0] ) {
					navigation.children[i].classList.add('active');
				}
			}

			localStorage.setItem('destination', JSON.stringify(destination));

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

					if ( length%2 === 0) {

						page.classList.add('last');
						if ( i !== 1 ) {
							page.classList.add('hidden');
						}
						page.appendChild( side() );
						page.firstChild.classList.add('front');

					} else {

						if ( length > 1 ) {
							container.appendChild( page );
						}

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
				flipscreen.appendChild( dragging() );
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

			var side        = document.createElement('div'),
			shotWrapper     = document.createElement('div'),
			shot            = document.createElement('img'),
			details         = document.createElement('div'),
			author          = document.createElement('div'),
			authorImageLink = document.createElement('a'),
			authorImage     = document.createElement('img'),
			loading         = document.createElement('div'),
			removeLoading   = function() {
				shotWrapper.removeChild(loading);
			};

			loading.className = "loading";
			loading.innerHTML = '<div class="loading-title">'+data.shots[i].title+'</div><div class="loading-author">by '+data.shots[i].player.name+'</div>';

			shotWrapper.appendChild(loading);
			shotWrapper.className = "shot";
			shot.className        = "hide";
			shot.height           = 240;
			shot.width            = 320;
			shot.src              = data.shots[i].image_url;

			shot.addEventListener('load', function loaded() {
				shot.classList.remove('hide');
				setTimeout(removeLoading, 400);
				shot.removeEventListener('load', loaded);
			}, false);

			details.className = "details";
			details.innerHTML = '<h2 class="title"><a href="'+data.shots[i].url+'">'+data.shots[i].title+'</a></h2>';
			details.innerHTML += '<div class="meta"><span class="likes"></span>'+data.shots[i].likes_count+' <span class="views"></span>'+data.shots[i].views_count+' <span class="comments"></span>'+data.shots[i].comments_count+'</div>';

			author.className = "author";

			authorImageLink.className = "author-image";
			authorImageLink.href = '#/shots/'+data.shots[i].player.username;
			authorImageLink.setAttribute('data-src', data.shots[i].player.avatar_url);

			author.appendChild(authorImageLink);
			author.innerHTML += '<a href="#/shots/'+data.shots[i].player.username+'" class="author-name">'+data.shots[i].player.name+'</a><br><span class="author-links"><a href="#/following/'+data.shots[i].player.username+'">Following</a> &bull; <a href="#/likes/'+data.shots[i].player.username+'">Likes</a></span>';

			details.appendChild(author);
			shotWrapper.appendChild(shot);
			side.appendChild(shotWrapper);
			side.appendChild(details);			

			return side;

		},

		dragging = function() {

			var dragging = document.createElement('div');
			dragging.className = "dragging";
			dragging.innerHTML = '<span class="arrow">&#8634;</span>drag up for more shots';

			return dragging;

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
			distY  = 0;
			distX  = 0;
			deg    = 0;
			time   = new Date().getTime();
		},

		move = function( e ) {

			e.preventDefault();
			distY = startY-e.targetTouches[0].pageY;
			distX = startX-e.targetTouches[0].pageX;

			// FLIP UP
			if ( distY > 0 && Math.abs(distX) < Math.abs(distY) ) {
			
				slide.disable();

				if ( current === pages.length-1 ) { // LAST

					deg = Math.min(-Math.log(distY)*25+75,-1);

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

					deg = Math.min(-Math.log(-distY)*25+75, -1 );

					pages[0].style.webkitTransform = "rotateX(" + deg + "deg)";
					pages[0].style.webkitTransition = "none";

				} else {

					deg = Math.max( Math.min( (380 + distY) * 0.485, 180), 1 );

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
			if ( ( deg >= 90 || ms <= 500 ) && distY > 0 && current < pages.length-1 ) {

				pages[current].style.webkitTransition = "";
				pages[current].style.webkitTransform = "";
				pages[current].classList.add('up');

				if ( current-1 >= 0 ) {
					pages[current-1].classList.add('hidden');
				}

				current++;

			}

			// flip down			
			if ( ( deg < 90 || ms < 500 ) && distY < 0 && current !== 1 ) {

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

				var element = false;

				if ( e.target.parentNode.classList.contains('shot') ) {
					element = e.target.parentNode;
				}
				if ( e.target.classList.contains('shot') ) {
					element = e.target;
				}

				if ( element ) {
					element.classList.add('left');
					element.parentNode.addEventListener('touchend', hideDetails, false);
				}

				var authorImageLink = e.target.parentNode.parentNode.querySelector('.author-image');

				if ( authorImageLink.hasAttribute('data-src') ) {

					var authorImage = document.createElement('img');

					authorImage.width = "50";
					authorImage.height = "50";
					authorImage.className = "hide";					
					authorImage.src = authorImageLink.getAttribute('data-src');						
					authorImageLink.appendChild(authorImage);
					authorImageLink.removeAttribute('data-src');

					authorImage.addEventListener('load', function loaded() {
						authorImage.classList.remove('hide');
						authorImage.removeEventListener('load', loaded);
					}, false);

				}

			}

			if ( position === "center" && Math.abs(distX) > Math.abs(distY) && distX < -50 && ! document.body.classList.contains('landscape') ) {

				if ( ( e.target.classList.contains('shot') && ! e.target.classList.contains('left') ) || ( e.target.parentNode.classList.contains('shot') && ! e.target.parentNode.classList.contains('left') ) || e.target.classList.contains('text') ) {

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

	// orientation functions
	// -------------------------------------------------------------

	orientation = function() {

		// Portrait
		if ( window.orientation === 0 ) {

			flip.enable();

			document.body.classList.remove('landscape');
			document.body.classList.remove('left');
			document.body.classList.remove('right');

		// Landscape
		} else {

			flip.disable();

			if ( slide.position !== "center" ) {
				slide.center();
			}

			document.body.classList.add('landscape');

			if ( window.orientation > 0 ) {
				document.body.classList.remove('right');				
				document.body.classList.add('left');
			} else {
				document.body.classList.remove('left');				
				document.body.classList.add('right');
			}

		}

	},

	// notifications
	// -------------------------------------------------------------	

	notification = (function() {

		var notification,
		nextmessage = false,
		active = false;

		return {	

			enable: function() {
				notification = document.getElementById('notifications');
			},

			show: function( text, type ) {

				var message = text;
				if ( type !== undefined ) {
					message = " <b>"+type+"</b>&#8217;s "+message;
				}

				if ( ! active ) {	
					active = true;
					nextmessage = false;					
					notification.firstChild.innerHTML = message;
					notification.classList.add('show');
					setTimeout(this.hide(this), 2000);
				} else {				
					nextmessage = message;
				}

			},

			hide: function( obj ) {

				return function() {
					active = false;					
					notification.classList.remove('show');
					if ( nextmessage ) {
						setTimeout(function() {
							obj.show( nextmessage );							
						}, 500);
					}
				};
				
			}

		};

	})(),


	// Lightweight JSONP fetcher by Erik Karlsson.
	// -------------------------------------------------------------

	JSONP = (function() {

		var counter = 0, head, query, key, config = {};

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