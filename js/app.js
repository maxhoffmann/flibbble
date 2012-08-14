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

		document.body.innerHTML = '<div id="notifications"><span id="notification">Loading...</span></div><div id="menu" class="screen"><ul id="navigation"><li class="logo">flibbble</li><li data-open="#/popular">Popular</li><li data-open="#/following">Following</li><li data-open="#/likes">Likes</a></li><li data-open="#/debuts">Debuts</li><li data-open="#/everyone">Everyone</li></ul></div><div id="flipper" class="screen"></div>';

		flipscreen = document.getElementById( 'flipper' );

		var handler = function() {
			navigate.to();
		};

		window.addEventListener( 'hashchange', handler, false );
		window.addEventListener( 'orientationchange', orientation, false );

		navigate.enable();
		navigate.to();

		flip.enable();
		slide.enable();

		notification.enable();		

	},

	// navigate
	// -------------------------------------------------------------

	navigate = (function() {

		var url,
				loading = false,
				maxpage = 1,
				section,
				player,
				position = 0,

		to = function() {

			var that  = this;
			section   = location.hash.slice(2).split("/")[0] || section;
			player    = location.hash.slice(2).split("/")[1] || player;
			this.page = ( this.page ) ? 1 : +localStorage.getItem('page');
			position = ( position ) ? 1 : ( +localStorage.getItem('position') || 1 );

			switch ( section ) {

				case "shots":

					url = 'http://api.dribbble.com/players/'+player+'/'+section+'/';

				break;
				case "following":
				case "likes":

					player = player || prompt("dribbble username:", player);
					url = 'http://api.dribbble.com/players/'+player+'/shots/'+section;

				break;
				case "popular":
				case "debuts":
				case "everyone":

					url = 'http://api.dribbble.com/shots/'+section;
					player = null;

				break;
				default:

					url = 'http://api.dribbble.com/shots/popular';
					section = 'popular';
					player = null;

				break;

			}

			JSONP.get( url, {per_page: 20, page: this.page }, request );

		},

		request = function( data ) {

			if ( data.shots.length > 0 ) {
				flip.position = position;
				render(data, 'insert');
				navigate.page = data.page;
				maxpage = data.pages;
				slide.center();
				notification.show( section, player );
				localStorage.setItem( 'section', section );
				localStorage.setItem( 'page', navigate.page );
				localStorage.setItem( 'player', player );
				localStorage.setItem( 'position', position );
			}

		},

		enable = function() {

			var navigation = document.getElementById( 'navigation' );

			section = localStorage.getItem('section') || 'popular';
			player = localStorage.getItem('player');

			for ( var i = 1; i < navigation.children.length; i++ ) {
				navigation.children[i].addEventListener('touchstart', navigate.activate, false);
				if ( navigation.children[i].getAttribute('data-open').slice(2) === section ) {
					navigation.children[i].classList.add('active');
				}
			}

		},

		activate = function() {

			if ( document.getElementsByClassName('active')[0] ) {
				document.getElementsByClassName('active')[0].classList.remove('active');
			}
			this.classList.add('active');
			player = null;
			location.hash = this.getAttribute('data-open');

		},

		more = function( type ) {

			if ( ! loading ) {

				if ( type === 'append' && this.page < maxpage ) {

					loading = true;

					JSONP.get( url, {per_page: 20, page: this.page+1}, function(data) {
						render(data, type );
						loading = false;
					});

				}

				if ( type === 'prepend' && this.page > 1 ) {

					loading = true;

					JSONP.get( url, {per_page: 20, page: this.page-1}, function(data) {
						render(data, type );
						flip.position += 10;						
						loading = false;
					});

				}

			}

		};

		return {
			page: 0,
			to: to,
			more: more,
			enable: enable,
			activate: activate
		};

	})(),

	// rendering
	// -------------------------------------------------------------

	render = function( data, type ) {
		
		var length = data.shots.length,
		container  = document.createDocumentFragment(),
		i          = 0,

		build = function() {

			var position = flip.position;

			for ( ; i < length; i++ ) {

				var page = document.createElement('div');
				page.classList.add('page');

				if ( type === 'prepend' ) {
					page.classList.add('up');
				}

				// first page
				if ( i === 0 && type !== "append" ) {
					page.appendChild( side(i) );
					page.classList.add('up');
					if ( type === 'insert' && Math.floor((i+1)/2) === position-1 ) {
						page.classList.add('visible');
					}
					page.firstChild.classList.add('back');
					container.appendChild( page );
				}

				// back of last page
				if ( i === 0 && type === "append" ) {
					pages[pages.length-1].appendChild( side(0) );
					pages[pages.length-1].lastChild.classList.add('back');					
				}

				// page with front and back
				if ( i > 0 && i < length-1 ) {

					if ( ( Math.floor((i+1)/2) === position-1 || Math.floor((i+1)/2) === position ) && type === 'insert' ) {
						page.classList.add('visible');
					}
					if ( Math.floor((i+1)/2) < position && type === "insert" ) {
						page.classList.add('up');
					}

					page.appendChild( side(i) );
					i++;
					page.appendChild( side(i) );

					page.firstChild.classList.add('front');
					page.lastChild.classList.add('back');

					container.appendChild( page );

				}

				// last page
				if ( i === length-1 ) {

					if ( type === 'prepend' ) {

						pages[0].insertBefore( side(i), pages[0].firstChild );
						pages[0].firstChild.classList.add('front');

					} else {

						if ( length%2 === 0 ) {

							if ( type === 'insert' && Math.floor((i+1)/2) === position ) {
								page.classList.add('visible');
							}

							page.appendChild( side(i) );
							page.firstChild.classList.add('front');

						} else {

							if ( length > 1 ) {
								container.appendChild( page );
							}

							page = document.createElement('div');
							page.classList.add('page');
							if ( type === 'insert' && Math.floor((i+1)/2) === position-1 ) {
								page.classList.add('visible');
							}
							page.innerHTML += '<div class="front text">END</div>';

						}

						container.appendChild( page );

					}

				}

			}

		},	

		side = function( index ) {

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
			loading.innerHTML = '<div class="loading-title">'+data.shots[index].title+'</div><div class="loading-author">by '+data.shots[index].player.name+'</div>';

			shotWrapper.appendChild(loading);
			shotWrapper.className = "shot";
			shot.className        = "hidden";
			shot.height           = 240;
			shot.width            = 320;
			shot.src              = data.shots[index].image_url;

			shot.addEventListener('load', function loaded() {
				shot.classList.remove('hidden');
				setTimeout(removeLoading, 400);
				shot.removeEventListener('load', loaded);
			}, false);

			details.className = "details";
			details.innerHTML = '<h2 class="title"><a href="'+data.shots[index].url+'">'+data.shots[index].title+'</a></h2>';
			details.innerHTML += '<div class="meta"><span class="likes"></span>'+data.shots[index].likes_count+' <span class="views"></span>'+data.shots[index].views_count+' <span class="comments"></span>'+data.shots[index].comments_count+'</div>';

			author.className = "author";

			authorImageLink.className = "author-image";
			authorImageLink.href = '#/shots/'+data.shots[index].player.username;
			authorImageLink.setAttribute('data-src', data.shots[index].player.avatar_url);

			author.appendChild(authorImageLink);
			author.innerHTML += '<a href="#/shots/'+data.shots[index].player.username+'" class="author-name">'+data.shots[index].player.name+'</a><br><span class="author-links"><a href="#/following/'+data.shots[index].player.username+'">Following</a> &bull; <a href="#/likes/'+data.shots[index].player.username+'">Likes</a></span>';

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

		if ( type === 'insert' ) {
			flipscreen.innerHTML = "";
		}

		if ( type === 'prepend' ) {
			flipscreen.insertBefore( container, flipscreen.firstChild );
		} else {
			flipscreen.appendChild( container );
		}

		pages = document.getElementsByClassName('page');

	},

	// flip functions
	// -------------------------------------------------------------

	flip = (function() {

		var lastposition,

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

				// LAST
				if ( flip.position === pages.length-1 ) {
					deg = Math.max(-(-Math.log(distY)*25+75), 1);
				} else {
					deg = Math.min( Math.max( (distY-20)*0.485, 1 ), 180 );
					pages[flip.position+1].classList.add('visible');					
				}				

				//if ( deg < -60 ) {
				//	flipscreen.firstChild.firstChild.classList.add('spin');
				//} else {
				//	flipscreen.firstChild.firstChild.classList.remove('spin');
				//}

				pages[flip.position].style.webkitTransform = "rotateX(" + deg + "deg)";
				pages[flip.position].style.webkitTransition = "none";

				pages[flip.position-1].style.webkitTransition = "";
				pages[flip.position-1].style.webkitTransform = "";

				if ( flip.position > 1 ) {
					pages[flip.position-2].classList.remove('visible');
				}

			}

			// FLIP DOWN
			if ( distY < 0 && Math.abs(distX) < Math.abs(distY) ) {

				slide.disable();

				// FIRST
				if ( flip.position === 1 ) {
					deg = Math.min(180+(-Math.log(-distY)*25+75), 179);
				} else {
					deg = Math.max( Math.min( (380 + distY) * 0.485, 180), 1 );
					pages[flip.position-2].classList.add('visible');
				}

				pages[flip.position-1].style.webkitTransform = "rotateX(" + deg +"deg)";
				pages[flip.position-1].style.webkitTransition = "none";

				pages[flip.position].style.webkitTransition = "";
				pages[flip.position].style.webkitTransform = "";

				if ( flip.position < pages.length-1 ) {
					pages[flip.position+1].classList.remove('visible');					
				}

			}

		},

		end = function( e ) {

			var ms = new Date().getTime()-time;
			lastposition = flip.position;

			// flip back up			
			if ( deg >= 90 && ( ms > 500 || Math.abs(distX) > Math.abs(distY) || flip.position === 1 ) && distY < 0 ) {

				pages[flip.position-1].style.webkitTransition = "";
				pages[flip.position-1].style.webkitTransform = "";
				pages[flip.position-1].classList.add('up');
				if ( flip.position-2 >= 0 ) {				
					pages[flip.position-2].classList.remove('visible');
				}

				if ( deg < 120 ) {
					navigate.more( 'prepend' );
				}

			}

			// flip back down
			if ( deg < 90 && ( ms > 500 || flip.position === pages.length-1 || Math.abs(distX) > Math.abs(distY) ) && distY > 0 ) {

				pages[flip.position].style.webkitTransition = "";
				pages[flip.position].style.webkitTransform = "";
				if ( flip.position < pages.length-1 ) {
					pages[flip.position+1].classList.remove('visible');
				}

				if ( flip.position === pages.length-1) {

					pages[flip.position-1].style.webkitTransition = "";
					pages[flip.position-1].style.webkitTransform = "";

					if ( deg > 60 ) {
						navigate.more( 'append' );
					}

				}

			}

			// flip up			
			if ( ( deg >= 90 || ms <= 500 ) && distY > 0 && flip.position < pages.length-1 && Math.abs(distX) < Math.abs(distY) ) {

				pages[flip.position].style.webkitTransition = "";
				pages[flip.position].style.webkitTransform = "";
				pages[flip.position].classList.add('up');

				if ( flip.position-1 >= 0 ) {
					pages[flip.position-1].classList.remove('visible');
				}

				flip.position++;

			}

			// flip down			
			if ( ( deg < 90 || ms < 500 ) && distY < 0 && flip.position !== 1 && Math.abs(distX) < Math.abs(distY) ) {

				pages[flip.position-1].style.webkitTransition = "";
				pages[flip.position-1].style.webkitTransform = "";
				pages[flip.position-1].classList.remove('up');

				if ( flip.position < pages.length-1 ) {
					pages[flip.position+1].classList.remove('visible');
				}

				pages[flip.position].classList.remove('visible');

				flip.position--;

			}

			time = 0;

			// Save flip.position in flipper

			if ( flip.position%10 === 0 && lastposition === flip.position+1 ) {
				navigate.page--;
				localStorage.setItem('page', navigate.page);
			}
			if ( (flip.position-1)%10 === 0 && lastposition === flip.position-1 ) {
				navigate.page++;
				localStorage.setItem('page', navigate.page);
			}

			localStorage.setItem('flip.position', flip.position%10 || 10);

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

		};

		return {

			enable: enable,
			disable: disable,
			position: 1

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
					authorImage.className = "hidden";					
					authorImage.src = authorImageLink.getAttribute('data-src');						
					authorImageLink.appendChild(authorImage);
					authorImageLink.removeAttribute('data-src');

					authorImage.addEventListener('load', function loaded() {
						authorImage.classList.remove('hidden');
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

		var element,
		next = false,
		active = false;

		return {	

			enable: function() {
				element = document.getElementById('notifications');
			},

			show: function( section, player ) {

				var _notification = section;
				if ( player ) {
					_notification = " <b>"+player+"</b>&#8217;s "+_notification;
				}

				if ( ! active ) {
					active = true;
					next = false;
					element.firstChild.innerHTML = _notification;
					element.classList.add('show');
					setTimeout(this.hide(this), 2000);
				} else {
					next = _notification;
				}

			},

			hide: function( obj ) {

				return function() {
					active = false;
					element.classList.remove('show');
					if ( next ) {
						setTimeout(function() {
							obj.show( next );
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