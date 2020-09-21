;(function($, window){
	var self = {};
	var App = {};
	
	self.App = function(){
		this.components = {}; 
	};
	
	self.App.prototype.addComponent = function( key, templateLocation, fns, forceNew ){
		console.log(['Adding a new component', key, templateLocation, fns, forceNew]);
		var component;
		if( !forceNew ){
			component = this.components[key];
			if( typeof component !== 'undefined' ){
				return component;
			}
		}
		component = new self.Component(key, templateLocation, fns );
		this.components[key] = component;
		return component;
	};
	
	self.App.prototype.getComponent = function(key){
		return this.components[key];
	};
	
	//Create a Component 
	self.Component = function( key, templateLocation, fns ){
		console.log(['New Component', key, templateLocation, fns ]);
		this.key = key;
		this.templateLocation = templateLocation || '/';
		this.fns = fns || {};
	};
	
	self.Component.prototype.getKey = function(){
		return this.key;
	};
	
	self.Component.prototype.getPath = function(){
		return _config.resources.template.directory+this.templateLocation+_config.resources.template.suffix+'?v='+_config.version;
	};
	self.Component.prototype.getTemplatePromise = function(){
		var dfd = $.Deferred();
		$.get( this.getPath() )
			.done( function( data ){
				dfd.resolve( data );
			})
			.fail( function(){
				dfd.reject( arguments );
			});
		return dfd.promise();
	};
	self.Component.prototype.render = function( templateId, $containers, params, partialIds ){
		console.log(['self.Component.prototype.render', templateId, $containers, params, partialIds]);
		var dfd = $.Deferred();
		this.getTemplatePromise()
		.done( function( template ){
			var partials = {};
			if( typeof partialIds === 'string' ){
				partials[partialIds] = $(template).filter('#'+partialIds).html();
			}else if( typeof partialIds !== 'undefined'  ){
				for(var i=0, leng = partialIds.length; i<leng; i++){
					partials[partialIds[i]] = $(template).filter('#'+partialIds[i]).html();	
				}
			}
			var mustacheParams = $.extend({}, params);
			if( typeof mustacheParams !== 'undefined'){
				mustacheParams.fn = _mustacheHelper;
			}
			var rendered = Mustache.render( $(template).filter('#'+templateId).html(), mustacheParams, partials );
			$containers.each(function(){
				$(this).html(rendered);
			});
			dfd.resolve($containers, params);
		}).fail(function(args){
			dfd.reject(args);
		});
		return dfd.promise();
	};
	self.Component.prototype.getRenderedString = function( templateId, params, partialIds ){
		var dfd = $.Deferred();
		this.getTemplatePromise()
		.done( function( template ){
			var partials = {};
			if( typeof partialIds === 'string' ){
				partials[partialIds] = $(template).filter('#'+partialIds).html();
			}else if( typeof partialIds !== 'undefined'  ){
				for(var i=0, leng = partialIds.length; i<leng; i++){
					partials[partialIds[i]] = $(template).filter('#'+partialIds[i]).html();	
				}
			}
			
			var mustacheParams = $.extend({}, params);
			if( typeof mustacheParams !== 'undefined'){
				mustacheParams.fn = _mustacheHelper;
			}
			
			var rendered = Mustache.render( $(template).filter('#'+templateId).html(), mustacheParams, partials );
			dfd.resolve(rendered);
		}).fail(function(args){
			dfd.reject(args);
		});
		return dfd.promise();
	};
	self.Component.prototype.getFn = function( fName, args ){
		console.log(['getFn', fName, args, this.fns ]);
		var fn = this.fns[fName];
		if( typeof fn === 'function' ){
			return fn.apply(this, args);
		}
		throw 'No public function by the name: '+fName+' found on Component '+this.key;
	};
	self.Component.prototype.getFnPromise = function( fName, args ){
		var dfd = $.Deferred();
		var fn = this.fns[fName];
		if( typeof fn === 'function' ){
			return dfd.resolve( fn.apply(this, args) );
		}
		return dfd.reject( 'No public function by the name: '+fName+' found on Component '+this.key );
	};
	
	App = new self.App();
	
	var _App = window.App;
	App.noConflict = function(){
		if( window.App === App){
			window.App = _App;
		}
		return App;
	};
	
	window.App = App;
	return App;
})(jQuery, window);