
/**
 * This file provides some basic functionality for communicating with an external request via AJAX
 * and processing a number of various response types
 *
 * @author cmorelli
 * @since July 25th, 2012
 */
var RedVentures = {};

( function( $, window ) {
	RedVentures.init = function() {
		
		$('body').on('click', 'a.ajax', function(event) {
			if ( $(this).is('.disabled') ) {
				event.preventDefault();
				return false;
			}
		});

		// Bind all clicks on links iwth an ajax class
		$('body').on('click', 'a.ajax', null, RedVentures.Ajax.link);

		// And a generic ajax complete handler
		$(document).ajaxComplete( function(e, r) { RedVentures.Ajax.handle(r); } );
		$(document).ajaxError( function(e, r) { RedVentures.Ajax.handle(r, true); } );
		
		// Check for alocation
		if ( window.location.hash && window.location.hash.indexOf('#!') == 0 ) {
			var pull = window.location.hash.substr(2);
			$.get(pull);
			window.location.hash = '';
			
			if ( typeof history.pushState != 'undefined' ) {
				history.pushState('');
			}
		}
	};
	
	/**
	 * General helper functions for UI
	 * 
	 * @author cmorelli
	 */
	RedVentures.UI = { 		
		dateFormat: function(date) {
			return ( date.getMonth() + 1 ) + '/' + date.getDate() + '/' + date.getFullYear();
		},
		
		timeFormat: function(date) {
			var hours = date.getHours(), mins = date.getMinutes(), ampm = hours >= 12 ? 'pm' : 'am';
			hours = hours > 12 ? hours - 12 : hours;
			hours = hours < 10 ? '0' + hours : hours;
			hours = hours == 0 ? '12' : hours;
			mins = mins < 10 ? '0' + mins : mins;
			return hours + ':' + mins + ' ' + ampm;
		},
		
		dateTimeFormat: function(date) {
			return RedVentures.UI.dateFormat(date) + ' ' + RedVentures.UI.timeFormat(date);
		},
			
        createDate: function(str, timezone, formatter) {
            var offset = ( new Date() ).getTimezoneOffset(), hours = Math.floor( offset / 60 ), minutes = Math.abs(offset) - (hours * 60), rep;
            hours = Math.abs(hours);
            hours = hours < 10 ? '0' + hours : hours;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            rep = ( offset > 0 ? '-' : '+' ) + hours + ':' + minutes;

            var date = new Date(str.replace(/\s/, 'T') + rep);
            return formatter( date );
    },
		
		/**
		 * Creates a source function compatible with jQuery UI
		 * 
		 * @access public
		 * @param string location
		 * @return callable
		 */
		createAutocompleteSource: function(location, mapping) {			
			return function(request, response) {
				var xhr = $.getJSON( location, request, function( data, status, obj ) {
					if ( obj === xhr ) {
						var results = data.payload;
						
						if (typeof results.mapping != 'undefined') {
							mapping = results.mapping;
							results = results.results;
						}
						
						if (typeof mapping != 'undefined') {
							for (var i = 0; i < results.length; i++) {
								for (var j in mapping) {
									if ( typeof mapping[j] == 'function' ) {
										results[i][j] = mapping[j]( results[i] );
									} else if (/^[a-z0-9\.]+$/i.test(mapping[j])) {
										results[i][j] = eval('results[i].' + mapping[j]);
									}
								}
							}
						}
						
						response( results );
					}
				});
			};
		}
	};

	/**
	 * Anything that provides event dispatching capabilities should extend this class
	 *
	 * @author cmorelli
	 */
	RedVentures.EventDispatcher = {

		/**
		 * Object mapping event name to array of callbacks
		 *
		 * @access public
		 * @var object
		 */
		eventListeners: {},

		/**
		 * Binds a callback to an event
		 *
		 * @access public
		 * @param string event
		 * @param function callback
		 * @return boolean
		 */
		on: function(ev, callback, once) {

			// See if the callback had a namespace
			var namespaceParts = ev.split('.'), callbackNamespace = namespaceParts.length == 2 ? namespaceParts[2] : '', eventAction = namespaceParts.length == 2 ? namespaceParts[1] : ev, stackItem = { namespace: callbackNamespace, callback: callback, once: once || false };

			// Make sure we have this array intialized
			if ( typeof this.eventListeners[ eventAction ] == 'undefined' ) {
				this.eventListeners[ eventAction ] = [];
			}

			// If a namespace was added, delete current callback with that namespace
			if ( callbackNamespace ) {
				for ( var i = 0; i < this.eventListeners[ eventAction ].length; i++ ) {
					if ( this.eventListeners[ eventAction ][ i ].namespace == callbackNamespace ) {
						this.eventListeners[ eventAction ].splice( i, 1, stackItem );
						return this;
					}
				}
			}

			// Push to stack
			this.eventListeners[ eventAction ].push( stackItem );
			return this;
		},

		/**
		 * Binds an event to be executed once
		 *
		 * @access public
		 * @param string event
		 * @param callable callback
		 * @return boolean
		 */
		once: function(ev, callback) {
			return this.on(ev, callback, true);
		},

		/**
		 * Unbinds a callback from an event
		 *
		 * @access public
		 * @param string event
		 * @return integer
		 */
		off: function(ev) {

			// See if the callback had a namespace
			var namespaceParts = ev.split('.'), callbackNamespace = namespaceParts.length == 2 ? namespaceParts[2] : '', eventAction = namespaceParts.length == 2 ? namespaceParts[1] : ev, removedEvents = 0;

			// Nothing to do if there was no array created for this event
			if ( typeof this.eventListeners[ eventAction ] == 'undefined' ) {
				return this;
			}

			// Loop all listeners and check for the given event
			if ( callbackNamespace ) {
				for ( var i = 0; i < this.eventListeners[ eventAction ].length; i++ ) {

					// If we had a namespace, and this matches, remove it
					if ( callbackNamespace && this.eventListeners[ eventAction ][ i ].namespace == callbackNamespace ) {
						removedEvents = 1;
						this.eventListeners[ eventAction ].splice( i, 1 );
					}
				}
			} else {
				removedEvents = this.eventListeners[ eventAction ].length;
				this.eventListeners[ eventAction ] = [];
			}

			// Return the unbound events
			return this;
		},

		/**
		 * Triggers an event
		 *
		 * @access public
		 * @param string event
		 * @return boolean
		 */
		trigger: function(ev, props, scope) {
			var returnValue;

			// See if we have this
			if ( typeof this.eventListeners[ ev ] == 'undefined' ) {
				return this;
			}

			// Loop all and execute
			for ( var i = 0; i < this.eventListeners[ ev ].length; i++ ) {
				returnValue = this.eventListeners[ ev ][ i ].callback.apply( typeof scope == 'undefined' ? this : scope, typeof props == 'undefined' ? [] : props );

				// If this was only to be executed once, remove it
				if ( this.eventListeners[ ev ][ i ].once == true ) {
					this.eventListeners[ ev ].splice(i, 1);
				}

				// Check if it's set
				if ( typeof returnValue != 'undefined' && returnValue === false ) {
					return false;
				}
			}

			// Successful
			return this;
		}
	};

	/**
	 * Pipe-based page loading via AJAX
	 *
	 * @author cmorelli
	 */
	RedVentures.Pipe = {
		pageCount: 0,
		pages: {},
		
		/**
		 * List of all registered page objects
		 *
		 * @access protected
		 * @var object
		 */
		tags: {},

		/**
		 * Returns a page 
		 *
		 * @access public
		 * @return RedVentures.Pipe.Page
		 */
		getPagesByTag: function(tag) {
			return typeof this.tags[ tag ] == 'undefined' ? [] : this.tags[ tag ];
		},
		
		/**
		 * Gets a page by name
		 * 
		 * @access public
		 * @return RedVentures.Pipe.Page
		 */
		getPage: function(name) {
			return this.pages[ name ];
		},
		
		/**
		 * Registers a page by its name
		 * 
		 * @access public
		 * @param string name
		 * @param RedVentures.Pipe.Page page
		 * @return void
		 */
		registerPage: function(name, page) {
			this.pages[ name ] = page;
		},
		
		/**
		 * Adds a tag to a page
		 * 
		 * @access public
		 * @param array tag
		 * @param RedVentures.Pipe.Page page
		 * @return void
		 */
		addTagsToPage: function(tags, page) {
			outer: for (var i = 0 ; i < tags.length; i++) {
				if ( typeof this.tags[ tags[i] ] != 'undefined' ) {
					for (var j = 0; j < this.tags[ tags[i] ].length; j++) {
						if ( this.tags[ tags[i] ][j].id == page.id ) {
							continue outer;
						}
					}
				} else {
					this.tags[ tags[i] ] = [];
				}
				
				this.tags[ tags[i] ].push( page );
			}
		},
		
		createPage: function(name, container) {
			return new RedVentures.Pipe.Page( name, container );
		}
	};

	/** 
	 * This is the controller for an individual pipe page object
	 *
	 * @author cmorelli
	 */
	RedVentures.Pipe.Page = function(name, container) {
		
		// Validate the container
		if ( $( container ).size() != 1 ) {
			throw 'Unable to initialize a page without a container, or with multiple containers';
		}

		// Set parameters
		this.id = ++RedVentures.Pipe.pageCount;
		this.name = name;
		this.$container = $(container);
		
		// Register the page
		RedVentures.Pipe.registerPage( name, this );
	};

	RedVentures.Pipe.Page.prototype = $.extend( true, RedVentures.EventDispatcher, {
		id: null,
		name: null,
		source: '',
		meta: {},
		request: null,
		$container: null,
		post: null,
		
		/**
		 * Adds a tag to the given page
		 */
		addTags: function(tags) {
			RedVentures.Pipe.addTagsToPage(tags, this);
			return this;
		},

		/**
		 * Sets the source of the page content
		 *
		 * @param string source
		 * @return self
		 */
		setSource: function(source, post) {
			this.source = source;
			this.post = post;
			this.refresh();
			return this;
		},

		/**
		 * Returns the source of the page
		 *
	 	 * @return source
	 	 */
	 	getSource: function() {
	 		return this.source;
	 	},

	 	/** 
	 	 * Arbitrary metadata on the page
	 	 *
		 * @param string key
		 * @param mixed value
		 * @return self
		 */
		setMeta: function(key, value) {
			this.meta[key] = value;
			return this;
		},

		/**
		 * Retuns arbitrary metadata on the page
		 *
		 * @param string key
		 * @return mixed
		 */
		getMeta: function(key) {
			return this.meta[key];
		},

		/**
		 * Returns the container element
		 *
		 * @return object
		 */
		getContent: function() {
			return this.$container;
		},

	 	/**
	 	 * Takes a callback method to execute when the page is ready (loaded)
	 	 *
		 * @param callable callback
		 * @return void
		 */
		ready: function(callback) {

			// If we have a source and we don't have a request (the request is done) then fire the callback now
			if ( this.getSource() && !this.request ) {
				callback.apply( this );
			} else {
				this.once( 'load', callback );
			}
		},

	 	/**
	 	 * Loads page content
	 	 *
		 * @return self
		 */
		refresh: function() {

			// If we don't have a source there's nothing to do
			if ( !this.getSource() ) {
				return false;
			}

			// Abort any currently operating requests
			if ( this.request ) {
				this.request.abort();
			}

			// Performs an AJAX request from the source to get the page content
			if ( this.post ) {
				this.request = $.post( this.getSource(), this.post, $.proxy( this._response, this ) );
			} else {
				this.request = $.get( this.getSource(), $.proxy( this._response, this ) );
			}

			// Chain
			return this;
		},

		/**
		 * Parses an AJAX response of page content
		 *
		 * @return void
		 */
		_response: function(data) {
			this.$container.html( data.payload );

			// Clear the request object out
			this.request = null;

			// Trigger the load callback
			this.trigger( 'load' );
		}
	} );

	/**
	 * Drag and drop file uploading for RV
	 *
	 * @author cmorelli
	 */
	RedVentures.FileDrop = function(el) {
		this.$el = $(el);
		this.initialize();
	};
	RedVentures.FileDrop.prototype = $.extend( true, {}, RedVentures.EventDispatcher, {

		/**
		 * Called when a file is dropped on to the form
		 *
		 * @access protected
		 * @return void
		 */
		_drop: function(event) {
			this.trigger('drop', [event]);

			// Prevent the page from changing to the new location
			event.preventDefault();
			return false;
		},

		/**
		 * We need this function to indicate a valid drop target to the browser
		 *
		 * @access protected
		 * @return void
		 */
		_target: function(event) {
			event.preventDefault();
			return false;
		},

		/**
		 * Validates the elements and binds any necessary events
		 *
		 * @access public
		 * @return void
		 */
		initialize: function() {
			this.$el.on('dragover dragenter', $.proxy( this._target, this )).on('drop', $.proxy( this._drop, this ));
		}
	} );

	/**
	 * Form handling for RV
	 *
	 * @author cmorelli
	 */
	RedVentures.Form = function(el, options) {
		this.id = RedVentures.Form.prototype.formCount++;
		this.$el = $(el);
		this.options = $.extend(true, {}, this.defaultOptions, options);
		this.initialize();
	};
	RedVentures.Form.prototype = $.extend( true, {}, RedVentures.EventDispatcher, {
		defaultOptions: {
			errorMessage: 'Please correct the errors listed below',
			errorContainer: '.errors'
		},
		options: {},
		formCount: 0,
		id: null,
		$el: null,
		$error: null,

		/**
		 * Fired when the form triggers a submit event, which prepares the data to be sent
		 *
		 * @access public
		 * @return boolean
		 */
		_submitEvent: function() {
			if ( this.submit() ) {
				return false;
			}
		},

		/**
		 * Submits the form to the remote location
		 *
		 * @access public
		 * @return void
		 */
		submit: function() {
			var that = this;
			
			// Clear errors
			if ( this.$error && this.$error.size() ) {
				this.$error.empty();
			}
			
			// Disable submit buttons
			this.$el.find(':submit').attr('disabled', 'disabled').addClass('disabled');
			
			// If there is a file input, we need to create an iframe to post to
			if ( this.$el.find('input[type=file]').size() ) {
				if ( !this.$frame ) {
					this.$frame = $( '<iframe name="formframe' + this.id + '" src="about:blank" style="width: 1px; height: 1px; visibility: hidden; overflow: hidden; display: none;" />' );
	
					this.$el.append( this.$frame );
					this.$el.attr( 'target', 'formframe' + this.id );
	
					this.$frame.load( function() { var data = $.parseJSON( $(this).contents().text() ); RedVentures.Ajax.process( data ); that._response.apply( that, [ data ] ); } );
				}
			}

			// Ajax if we don't have a target location
			if ( !this.$el.attr('target') ) {
				$.post( this.$el.attr('action') || window.location, this.$el.serialize(), function(ignore, status, obj) { var data = $.parseJSON(obj.responseText); that._response.apply( that, [ data ] ); } );
				return true;
			}

			// Shouldn't be handled
			return false;
		},

		/**
		 * Initializes the form and binds all necessary events
		 *
		 * @access public
		 * @return void
		 */
		initialize: function() {
			var that = this;

			// Make sure we were given an object
			if ( !this.$el.size() ) {
				return false;
			}
			
			// Select the error container
			if ( this.options.errorContainer ) {
				this.$error = this.$el.find(this.options.errorContainer);
			}

			// Bind the submit handler
			this.$el.submit( $.proxy( this._submitEvent, this ) );
		},

		/**
		 * Handles the respone payload
		 *
		 * @access public
		 * @return void
		 */
		_response: function(data, status, obj) {
			this.$el.find(':submit').removeAttr('disabled').removeClass('disabled');
			
			// Check for simple flash message
			if (data.type == 'flash' && this.$error && this.$error.size()) {
				this.$error.empty();
				
				// Remove all current errors
				for (var j in data.payload) {
					if (data.payload.hasOwnProperty(j)) {
						if (data.payload[j].length) {
							var node = $('<div>').addClass('alert alert-' + j);
							
							for (var i = 0; i < data.payload[j].length; i++) {
								node.append( $('<div>').html( data.payload[j][i] ) );
							}
							
							this.$error.append( node );
						}
					}
				}
				
				return;
			}
			
			// Validate that we received a form response back
			if ( typeof data.payload.name == 'undefined' ) {
				return;
			}
			
			var form = $('#' + data.payload.name), data = data.payload.result, that = this;
			
			// Remove all error classes
			$(form).find('.error').removeClass('error');
			$(form).find('.field-errors').remove();

			// Check if the submission is valid
			if ( data.valid == true ) {
				this.trigger( 'success' );
				return false;
			} else {
				this.trigger( 'error' );
			}

			// Check for invalid inputs
			var bindFormErrors = function(node, parent) {
				var rootNode = ( typeof parent == 'undefined' ), currentNode;
				parent = parent || node.name;
				
				if ( that.$error && that.$error.size() && rootNode == true ) {
					that.$error.empty();
					
					if ( node.errors.length ) {
						that.$error.append( $('<div>').addClass('alert alert-error').html('<p>' + that.options.errorMessage + '</p><ul><li>' + node.errors.join('</li><li>') + '</li></ul>') );
					}
				}
				
				for ( var i = 0; i < node.children.length; i++ ) {
					currentNode = parent + '[' + node.children[i].name + ']';

					// Append node following field with errors
					if ( node.children[i].errors.length ) {
						$(form).find('*[name="' + currentNode + '"]').next('.field-errors').remove();
						$(form).find('*[name="' + currentNode + '"]').after( $('<div></div>').addClass('field-errors hide').html( node.children[i].errors.join(', ') ) ).parents('.control-group').addClass('error');
					}

					// See if there are children
					bindFormErrors(node.children[i], currentNode);
				}
				
			};

			// Bind errors
			bindFormErrors( data.errors );
		}
	} );

	/**
	 * All methods related to AJAX calls
	 *
	 * @author cmorelli
	 */
	RedVentures.Ajax = $.extend( true, {}, RedVentures.EventDispatcher, {
		callbacks: {},

		/**
		 * Registers a callback
		 *
		 * @access public
		 * @param string method
		 * @param callable callback
		 * @return void
		 */
		registerCallback: function(name, callback) {
			this.callbacks[ name ] = callback;
		},

		/**
		 * Called when an event is fired
		 *
		 * @access public
		 * @return void
		 */
		link: function(event) {
			if ( $(this).is('.disabled') ) {
				event.preventDefault();
				return false;
			}
			
			// Load the link
			RedVentures.Ajax.trigger('load');

			// Make an HTTP request to the item's HREF
			$.get( $(this).attr('href') );

			// Prevent the event from navigating
			event.preventDefault();
		},
		
		/**
		 * Handles an incoming AJAX response
		 *
		 * @access private
		 * @param object data
		 * @return void
		 */
		handle: function(xhr, error) {
			RedVentures.Ajax.trigger('complete');
			
			var data = $.parseJSON(xhr.responseText);

			// Make sure we get an object back
			if (typeof data != 'object' || data == null) {
				return;
			}

			// Process callbacks
			RedVentures.Ajax.process(data, error);
		},

		/**
		 * Handles an incoming AJAX response
		 *
		 * @access private
		 * @param object data
		 * @return void
		 */
		process: function(data, error) {
			
			// Check for exception
			if ( data instanceof Array && error ) {
				message = data[ data.length - 1 ];
				
				var modal = $('<div>').appendTo('body').addClass('modal').append( $('<div>').addClass('modal-header').append( '<h3>An Error Has Occurred</h3>' ) ).append( $('<div>').addClass('modal-body').append( '<div class="alert alert-error">' + message.message + '</div>' ) ).modal('show');
				return;
			}

			// Check if we can handle this
			if ( typeof data.callbacks != 'undefined' && data.callbacks.length ) {
				for (var i = 0, callback; i < data.callbacks.length; i++) {
					callback = data.callbacks[i];

					// Check to see if the callback exists
					if ( typeof RedVentures.Ajax.callbacks[ callback.callback ] != 'undefined' ) {
						RedVentures.Ajax.callbacks[ callback.callback ].apply( this, callback.arguments );
					}
				}
			}
		}
	} );

	/**
	 * Handles displaying dialogs as a result of a callback
	 *
	 * @access public
	 * @param string content
	 * @return void
	 */
	RedVentures.Ajax.registerCallback( 'dialog', function( content ) {
		var el = $('<div>').addClass('modal hide fade').appendTo('body');

		// Set the modal contents
		el.html( content );

		// Load
		window.setTimeout( function() { $(el).modal().on('hide', function() { window.setTimeout( function() { $(el).remove(); }, 300 ); }) }, 0 );
	} );
	
	/**
	 * Handles displaying dialogs as a result of a callback
	 *
	 * @access public
	 * @param string content
	 * @return void
	 */
	RedVentures.Ajax.registerCallback( 'error', function( content ) {
		var modal = $('<div>').appendTo('body').addClass('modal').append( $('<div>').addClass('modal-header').append( '<a class="close" data-dismiss="modal">&times;</a><h3>An Error Has Occurred</h3>' ) ).append( $('<div>').addClass('modal-body').append( '<div class="alert alert-error">' + content + '</div>' ) ).modal('show');

		// Load
		window.setTimeout( function() { $(modal).modal().on('hide', function() { window.setTimeout( function() { $(modal).remove(); }, 300 ); }) }, 0 );
	} );

	/**
	 * Handles a server-generated redirect
	 *
	 * @access public
	 * @param string location
	 * @return void
	 */
	RedVentures.Ajax.registerCallback( 'redirect', function( location, download ) {
		
		// If the location is null, reload
		if ( typeof location == 'undefined' || !location ) {
			location = window.location.href;
		}
		
		// Determine if we should attach an iframe
		if ( download == true ) {
			$('<iframe>').hide().attr('src', location).appendTo('body');
		} else {
			if ( location == window.location.href ) {
				window.location.reload();
			} else {
				window.location.href = location;
			}
		}
	} );

	/**
	 * Handles a server-generated redirect
	 *
	 * @access public
	 * @param string location
	 * @return void
	 */
	RedVentures.Ajax.registerCallback( 'pagelet', function( name, method ) {
		var page = null, names = name instanceof Array ? name : [ name ];
		
		// If the location is null, reload
		for ( var i = 0; i < names.length; i++ ) {
			if ( pages = RedVentures.Pipe.getPagesByTag( names[i] ) ) {
				for (var j = 0; j < pages.length; j++) {
					pages[j][method]();
				}
			}
		}
	} );

	// Bind all
	$( function() { RedVentures.init(); } );
} )( jQuery, window );