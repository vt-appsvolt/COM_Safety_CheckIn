var token = $("meta[name='_csrf']").attr("content");
var header = $("meta[name='_csrf_header']").attr("content");
$(document).ajaxSend(function(e, xhr, options) {
	if( typeof header === 'string' && typeof token === 'string' ){
		xhr.setRequestHeader(header, token);
	}
});
$(document).ajaxError(function(e, xhr, options, thrownError) {
	if( options.suppressErrors ){
		return;
	}
	if( xhr.status == '422' ){
		//If an errorModalTemplate object was passed into the ajax request
		// it will be forwarded all the way to the modal builder as the modal 
		// builder options.
		if( typeof options.errorModalTemplate !== 'undefined' ){
			handleUnprocessableEntity( xhr.responseJSON, options.errorModalTemplate );	
		}else{
			handleUnprocessableEntity( xhr.responseJSON );			
		}
	}
});;var _config = {
	name: 'checkin',
	version: '1.0.5',
	pageableDefault: {
		page:1,
		size:100
	},
	resources:{
		js: {
			directory: '/js'
		},
		template: {
			directory: '/templates',
			suffix: '.html'
		},
		img:{ 
			directory: '/img'
		}
	},
	SignInClass: 'fa-check-circle',
	SignOutClass: 'fa-times-circle'
};;$(document).on('submit', 'form', function(){
	var $form = $(this);
	$form.find('input.currency.mask').each(function(){
		var $input = $(this),
			name = $(this).attr('name').replace('-mask', '');
		$form.find('input[name='+name+']').val( Utils.currencyLongValue( $input.val() ) );
	});
	
});
Inputmask.extendDefaults({
  'autoUnmask': true,
  'removeMaskOnSubmit': true
});
Inputmask.extendAliases({
	'percentage': {
		'autoUnmask': true,
		'removeMaskOnSubmit': true
	},
	'currency': {
		'autoUnmask': true,
		'removeMaskOnSubmit': true,
		'allowPlus': false,
		'allowMinus': false
	},
	'rate': {
		'alias': 'decimal',
		'digits': 2,
		'numericInput': true,
		'greedy': false,
		'autoUnmask': false,
		'removeMaskOnSubmit': false,
		'allowPlus': false,
		'allowMinus': false,
		'placeholder': '0'
	},
	'currencydigits': {
		'alias': 'decimal',
		'autoUnmask': true,
		'removeMaskOnSubmit': true,
		'allowPlus': false,
		'allowMinus': false,
		'digits': 2
	}
});
;var _mustacheHelper = {
	upper: function(){
		return function(text, render){
			return render(text).toUpperCase();
		};
	},
	lower: function(){
		return function(text, render){
			return render(text).toLowerCase();
		};
	},
	preventAutocomplete: function(){
    	var preventAutocomplete = false;
    	try{
	    	if( navigator.userAgent.match(/Android/i)|| 
	    		navigator.userAgent.match(/BlackBerry/i) || 
	    		navigator.userAgent.match(/Windows Phone/i) ||
	    		navigator.userAgent.match(/Mozilla/i)
	    			){
	    		preventAutocomplete = true;
	    	}
    	}catch(err){}
    	return preventAutocomplete;
    }
};;var timeFormatterSettings = {
	pattern: 'MM/D/YY h:mma'
};

var timeFormatter = {
		getMomentDate: function( data ){
			data.pattern = data.pattern || timeFormatterSettings.pattern;
			try{
				var timezone = data.timezone || moment.tz.guess();
				return moment.tz( data.date, data.pattern, timezone );
			}catch( ieErr ){
				return moment( data.date, data.pattern );
			}
		},
		getMomentFullDate: function( data ){
			try{
				var timezone = data.timezone || moment.tz.guess();
				return moment.tz( data.date, timezone );
			}catch( ieErr ){
				return moment( data.date );
			}
		},
		formatDate: function( data ){
			//var _moment = moment( data.date );
			data.pattern = data.pattern || timeFormatterSettings.pattern;
			try{
				var timezone = data.timezone || moment.tz.guess();
				return moment.tz( data.date, timezone ).format( data.pattern );
				//return _moment.tz( timezone ).format( data.pattern );
			}catch( ieErr ){
				return moment( data.date ).format( data.pattern );
			}
		}
};;function Auth() {}
Auth.prototype = {
	constructor: Auth,
	data: { 
		roles: [],
		groups: {
		 'OWNERS': ['Owner'],
		 'MANAGERS': ['Manager']
		}
	},
	setEmployeeRoles: function( roles ){
		var _ = this;
		console.log(['roles', roles]);
		_.data.roles = roles;
	},
	isAuthorized: function( authorizedRoles ){
		var _ = this;
		return Utils.hasMatch( _.data.roles, authorizedRoles );
	},
	inAuthorizedGroup: function( groupName ){
		var _ = this;
		var authorizedRoles = _.data.groups[ groupName ];
		console.log(['inAuthorizedGroup', groupName, authorizedRoles, _.data.roles]);
		
		return Utils.hasMatch( _.data.roles, authorizedRoles );
	}
};
var Auth = new Auth();
;function Utils() {}
Utils.prototype = {
	constructor: Utils,
	isElementInView: function (element, fullyInView) {
        var pageTop = $(window).scrollTop();
        var pageBottom = pageTop + $(window).height();
        var elementTop = $(element).offset().top;
        var elementBottom = elementTop + $(element).height();

        if (fullyInView === true) {
            return ((pageTop < elementTop) && (pageBottom > elementBottom));
        } else {
            return ((elementBottom <= pageBottom) && (elementTop >= pageTop));
        }
    },
	clearChildrenInputs: function (element){
		for (var i = 0; i < element.childNodes.length; i++) {
	      var e = element.childNodes[i];
	      if (e.tagName){ 
	    	 switch (e.tagName.toLowerCase()) {
		         case 'input':
		            switch (e.type) {
		               case "radio":
		               case "checkbox": e.checked = false; break;
		               case "button":
		               case "submit":
		               case "image": break;
		               default: e.value = ''; break;
		            }
		            break;
		         case 'select': e.selectedIndex = 0; break;
		         case 'textarea': e.innerHTML = ''; break;
		         default: Utils.clearChildrenInputs(e);
	    	 }
	     }
	   }
	},
	isNonEmpty: function( field ){
		if( typeof field === 'undefined' || field === null || 
				(typeof field === 'string' && ( field === '' || field.trim() === '') )){
			return false;
		}
		return true;
	},
	isEmpty: function( field ){
		if( typeof field === 'undefined' || field === null || 
				(typeof field === 'string' && ( field === '' || field.trim() === '') )){
			return true;
		}
		return false;
	},
	isValidEmail: function( email ){
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	},
	toUSD: function( cents, symbol, round, decimalKey, thousandsKey ){
		if( isNaN(parseInt(cents)) ){
			return '';
		}
		symbol = symbol || '';
		round = isNaN(round = Math.abs(round)) ? 2 : round; 
		decimalKey = decimalKey || '.';
		thousandsKey = thousandsKey || ',';
		var sign = Math.sign(cents) === -1 ? '- ' : '',
		n = parseInt(cents)/100,
		i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(round))),
		j = (j = i.length) > 3 ? j % 3 : 0;
		return sign+symbol + (j ? i.substr(0, j) + thousandsKey : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousandsKey) + (round ? decimalKey + Math.abs(n - i).toFixed(round).slice(2) : "");
		
	},
	currencyLongValue: function( currency ){
		if( isNaN(parseInt(currency) ) ){
			return '';
		}
		//return parseInt( currency*100.00 );
		return (currency*100.00).toFixed(0);
	},
	floatValue: function( val ){
		if( isNaN(parseInt(val)) ){
			return '';
		}
		return parseFloat(val);
	},
	fixedValue: function( val, digits ){
		if( isNaN(parseInt(val)) ){
			return '';
		}
		return val.toFixed(digits);
	},
	hasMatch: function( array1, array2, requiredMatches ){
		requiredMatches = requiredMatches || 1;
		var matches = 0;
		if( typeof array1 === 'undefined' || typeof array2 === 'undefined' ){return false;}
		return array1.some(function(element){
			if( array2.indexOf(element) > -1 ){
				matches ++;
				if( matches >= requiredMatches){
					return true;
				}
			}
		});
	},
	contains: function( a, b ){
		return a.indexOf(b) > -1;
	}
};
var Utils = new Utils();

function Validation( passedDefault, failedModalTitle, failedModalId ){
	this.passed = passedDefault || true;
	this.title = failedModalTitle || 'Action Required';
	this.id = failedModalId || 'failed-validation-modal';
	this.errorMessages = [];	
};/**
 * Modal for handling InvalidRequestException
 * 
 * By default will create an errorModal inside the element with id modal-wrapper
 * using the jsonError.message as the modal title and 
 * using all jsonError.fieldErrors with code 'displayable' to generate a 
 * unordered list for the modals description. 
 * 
 */
;(function($){
	var _options = {
		showModal: true,
		wrapperId: 'modal-wrapper',
		headerClasses: 'text-center',
		displayableCodes: ['displayable'] //FieldError codes to show to the user in the list
	},
	handleUnprocessableEntity = function( jsonError, options ){
		console.log(['handleUnprocessableEntity', jsonError, options ]); 
		delete _options.title;
		delete _options.description;
		if( typeof options === 'string'){
			_options = $.extend(_options, {wrapperId: options});
		}else if( typeof options !== 'undefined'){
			_options = $.extend(_options, options);
		}
		// If no title was passed in as an option, it will attempt to generate modal title
		// from the jsonError message
		if( typeof _options.title === 'undefined' || _options.title.trim === ''){
			buildTitle( jsonError.message );			
		}
		// If no description was passed in as an option, it will attempt to generate description
		// from the jsonError fieldErrors
		if( typeof _options.description === 'undefined' || _options.description.trim === ''){
			buildDescription( jsonError.fieldErrors, jsonError.objectErrors );
		}
		if( _options.showModal ){
			$('#'+_options.wrapperId).modal('errorModal', _options);
		}
		return _options;
	};
	
	function buildTitle( message ){
		if( typeof message === 'undefined' || message.trim() === ''){
			_options.title = 'Failed To Save';
		}else{
			_options.title = message;
		}
	}
	function buildDescription( fieldErrors, objectErrors ){
		console.log(['fieldErrors', fieldErrors]);
		if( ( typeof fieldErrors === 'undefined' || fieldErrors.length < 1) && (typeof objectErrors === 'undefined' || objectErrors.length < 1 ) ){
			_options.description = 'An error while attempting to save. Please make sure all required fields have been set and try again.';
		}else{
			var $p = $('<p>');
			var errorCount = 0;
			if( typeof fieldErrors !== 'undefined'){
				errorCount += fieldErrors.length;
			}
			if( typeof objectErrors !== 'undefined'){
				errorCount += objectErrors.length;
			}
			
			if( errorCount == 1 ){
				$p.text('Failed to save due to the following error:');		
			}else{
				$p.text('Failed to save due to the following errors:');			
			}
			var $ul = $('<ul>');
			if( typeof fieldErrors !== 'undefined'){
				$.each( fieldErrors, function( index, value ){
					if( $.inArray( value.code, _options.displayableCodes ) !== -1 ) {
						$('<li>')
							.text( value.message )
							.appendTo( $ul );
					}
				});
			}
			if( typeof objectErrors !== 'undefined'){
				$.each( objectErrors, function( index, value ){
					if( $.inArray( value.code, _options.displayableCodes ) !== -1 ) {
						$('<li>')
							.text( value.message )
							.appendTo( $ul );
					}
				});
			}
			_options.description = $p[0].outerHTML + $ul[0].outerHTML;
		}
	}
})(jQuery);

var FormId=0;
getPageObj = function( data ){
	var page = {};
	if( typeof data !== 'undefined' && typeof data.number !== 'undefined' ){
		page.page = data.number+1;
		page.max = data.totalPages;
	}
	
	if( typeof data !== 'undefined' && typeof data.size !== 'undefined' ){
		page.size = data.size;
	}else{
		page.size = 100;
	}
	
	return page;
};

$.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

$.cachedScript = function( url, options ) {
  if( $.inArray( url, LoadedScripts ) ){
	  //Prevent Scripts from loading more than once
	  return;
  }	
  LoadedScripts.push(url);
  
  // Allow user to set any option except for dataType, cache, and url
  options = $.extend( options || {}, {
    dataType: "script",
    cache: true,
    url: url
  });
 
  // Use $.ajax() since it is more flexible than $.getScript
  // Return the jqXHR object so we can chain callbacks
  return jQuery.ajax( options ).fail( function(){
	  LoadedScripts.removeValue( url );
  });
};
jQuery.each( [ "put", "ajaxDelete", "postJSON" ], function( i, method ) {
  jQuery[ method ] = function( url, data, callback, type ) {
	 var contentType;
	 if ( jQuery.isFunction( data ) ) {
      type = type || callback;
      callback = data;
      data = undefined;
    }
	if( typeof type === 'undefined' && method.indexOf('JSON') > -1 ){
		type = 'json';
		contentType = 'application/json';
	}
	
    return jQuery.ajax({
      url: url,
      type: method.replace('ajax','').replace('JSON', ''),
      dataType: type,
      data: data,
      success: callback,
      contentType: contentType
    });
  };
});

pushState = function( URL, title, stateObj ){
	window.history.pushState( $.extend({}, stateObj), title || '', URL);
};

locationJSON = function(){
	var search = location.search.substring(1);
	return search?JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}',
	                 function(key, value) { return key===""?value:decodeURIComponent(value); }):{};
};
initializeScriptLoader = function( funct, timeout, maxTrys, params ){
	var fn = window[funct];
	if( typeof fn !== 'function'){
		maxTrys = maxTrys-1;
		if( maxTrys > 0 ){
			setTimeout(function(){ initializeScriptLoader(funct, timeout, maxTrys, params); }, timeout);			
		}else{
			//logger.error('Script '+funct+' failed to load.');
		}
	}else{
		fn.call( null, params );
	}
};
emptyStringsAndZerosToNulls = function(val, inputName) {
	if (val === "") return null; // parse empty strings as nulls
	if (val === 0)  return null; // parse 0 as null
	return val;
};
emptyStringsToNulls = function(val, inputName) {
	if (val === "") return null; // parse empty strings as nulls
	return val;
};
removeOptions = function( selectbox ){
	if( typeof selectbox !== 'undefined' ){
		for(var i=selectbox.options.length - 1 ; i >= 0 ; i--){
	        selectbox.remove(i);
	    }
	}
};
serializeJSON_Defaults = {
		skipFalsyValuesForTypes: ['string'],
		parseWithFunction: emptyStringsAndZerosToNulls, 
		parseNumbers: true
};
initializeInputMasks = function( $container ){
	$container = $container || $(document);
	$container.find('input.mask').each(function(){
		if( Utils.isNonEmpty( $(this).data('alias') ) ){
			$(this).inputmask( $(this).data('alias') );
		}else{
			$(this).inputmask();
		}
	});
};
calculateInputMasks = function( $form ){
	$form.find('input.currency.mask').each(function(){
		var $input = $(this);
		var inputName = $input.attr('name').replace('-mask', '');
		$form.find('input[name='+inputName+']').val( Utils.currencyLongValue( $input.val() ) );
	});
};
formatForm = function(form){
	form.formId = getFormId();
	return form;
};
getFormId = function(){
	FormId++;
	return FormId;
};
thousandsSeparators = function(num){
  var num_parts = num.toString().split(".");
  num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return num_parts.join(".");
};
processingModalQueue=false;
publishToModalQueue = function( modalHtml, modalId ){
	if( processingModalQueue ){ 
		setTimeout( function(){
			publishToModalQueue(modalHtml, modalId);
		}, 500);
	}else{
		processingModalQueue=true;
		try{
			if( $('#modal-wrapper').find('.modal').length ){ //&& $('#modal-wrapper').find('.modal').attr('id') !== modalId ){
				$('#modal-queue').append( modalHtml );
			}else{
				$('#modal-wrapper').html( modalHtml );
				$('#'+modalId).modal('show');
			}
		}catch(err){}
		processingModalQueue=false;
	}
	
};

setActiveContainer= function( $target ){
	$('.sci-main').not('#'+$target.attr('id') ).hide();
	$target.show();
};

;;(function($, window){
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
})(jQuery, window);;/*
	Storage Object Structure
	{
		programId: {
					//key: date
					'YYYY-MM-DD': {	
									//keys 
					 				awaitingCheckins: { //key
					 									studentId: { 
					 												checkinModel ( studentId, checkinTime ) 
					 												}
					 								   },
					 				processingCheckins: {},
					 				awaitingCheckouts: {},
					 				processingCheckouts: {}
								  }
				   }
	}
*/
var appLocalStorage = window.localStorage;
var _checkinLocalStorage = {
	_setProgramStorage: function( programId, programStorage ){
		appLocalStorage.setItem(programId, JSON.stringify(programStorage) );
	},
	setProcessingCheckin: function( programId, studentId, checkinModel, _moment ){
		_moment = _moment || moment();
		var dateKey = _moment.format('YYYY-MM-DD');
		_checkinLocalStorage.removeAwaitingCheckin( programId, studentId, dateKey );
		var programStorage = _checkinLocalStorage.getProgramDateStorage( programId, dateKey );
		programStorage[dateKey].processingCheckins[studentId] = checkinModel;
		_checkinLocalStorage._setProgramStorage( programId, programStorage);
	},	
	setAwaitingCheckin: function( programId, studentId, checkinModel, _moment ){
		_moment = _moment || moment();
		var dateKey = _moment.format('YYYY-MM-DD');
		_checkinLocalStorage.removeProcessingCheckin( programId, studentId, dateKey );
		var programStorage = _checkinLocalStorage.getProgramDateStorage( programId, dateKey );
		programStorage[dateKey].awaitingCheckins[studentId] = checkinModel;
		_checkinLocalStorage._setProgramStorage( programId, programStorage);
	},
	getProcessingCheckin: function( programId, studentId, _moment ){
		_moment = _moment || moment();
		var awaitingCheckins = getAwaitingCheckins( programId, _moment );
		if( typeof awaitingCheckins[ studentId ] !== 'undefined' ){
			return awaitingCheckins[ studentId ];
		}
		return {};
	},
	getAwaitingCheckins: function( programId, _moment ){
		_moment = _moment || moment();
		var dateKey = _moment.format('YYYY-MM-DD');
		var programStorage = _checkinLocalStorage.getProgramStorage( programId );
		if( typeof programStorage[dateKey] !== 'undefined' &&
			typeof programStorage[dateKey].awaitingCheckins !== 'undefined'
		){
			return programStorage[dateKey].awaitingCheckins;
		}
		return {};
	},
	getAwaitingCheckinsList: function( programId, _moment ){
		_moment = _moment || moment();
		var dateKey = _moment.format('YYYY-MM-DD');
		var programStorage = _checkinLocalStorage.getProgramStorage( programId );
		if( typeof programStorage[dateKey] !== 'undefined' &&
			typeof programStorage[dateKey].awaitingCheckins !== 'undefined'
		){
			return _checkinLocalStorage.getCheckinModelList( programStorage[dateKey].awaitingCheckins );
		}
		return [];
	},
	getProgramStorage: function( programId ){
		var programStorage = JSON.parse( appLocalStorage.getItem(programId) );
		if( typeof programStorage === 'undefined' || programStorage === null ){
			programStorage = {};
			_checkinLocalStorage._setProgramStorage( programId, programStorage);
		}
		return programStorage;
	},
	getProgramDateStorage: function( programId, dateKey ){
		var programStorage = _checkinLocalStorage.getProgramStorage( programId );
		if( typeof programStorage[dateKey] === 'undefined' ||  programStorage[dateKey] === null ){
			programStorage[dateKey] = {
					awaitingCheckins: {},
					processingCheckins: {},
					awaitingCheckouts: {},
					processingCheckouts: {}
			};
			_checkinLocalStorage._setProgramStorage( programId, programStorage);
		}
		return programStorage;
	},
	getCheckinModelList: function( checkinModelMap ){
		var checkinModelList = [], prop;
		for( prop in checkinModelMap ){
			if( checkinModelMap.hasOwnProperty( prop ) ){
				checkinModelList.push( checkinModelMap[prop] );
			}
		}
		return checkinModelList;
	},
	removeCheckin: function( programId, studentId, _moment){
		_moment = _moment || moment();
		var dateKey = _moment.format('YYYY-MM-DD');
		_checkinLocalStorage.removeProcessingCheckin( programId, studentId, dateKey );
		_checkinLocalStorage.removeAwaitingCheckin( programId, studentId, dateKey );
	},
	removeProcessingCheckin: function( programId, studentId, dateKey ){
		var programStorage = _checkinLocalStorage.getProgramStorage( programId );
		if( typeof programStorage[dateKey] !== 'undefined' &&
			typeof programStorage[dateKey].processingCheckins !== 'undefined' &&
			typeof programStorage[dateKey].processingCheckins[studentId] !== 'undefined'
		){
			delete programStorage[dateKey].processingCheckins[studentId];
		}
		_checkinLocalStorage._setProgramStorage( programId, programStorage );
	},
	removeAwaitingCheckin: function( programId, studentId, dateKey ){
		var programStorage = _checkinLocalStorage.getProgramStorage( programId );
		if( typeof programStorage[dateKey] !== 'undefined' &&
			typeof programStorage[dateKey].awaitingCheckins !== 'undefined' &&
			typeof programStorage[dateKey].awaitingCheckins[studentId] !== 'undefined'
		){
			delete programStorage[dateKey].awaitingCheckins[studentId];
		}
		_checkinLocalStorage._setProgramStorage( programId, programStorage );
	}
		
};;/*
	*	Original script by: Shafiul Azam
	*	Version 4.0
	*	Modified by: Luigi Balzano

	*	Description:
	*	Inserts Countries and/or States as Dropdown List
	*	How to Use:

		In Head section:
		----------------
		<script type= "text/javascript" src = "countries.js"></script>
		
		In Body Section:
		----------------
		Select Country (with states):   <select id="country" name ="country"></select>
			
		Select State: <select name ="state" id ="state"></select>

        Select Country (without states):   <select id="country2" name ="country2"></select>
			
		<script language="javascript">
			populateCountries("country", "state");
			populateCountries("country2");
		</script>

	*
	*	License: Free to copy, distribute, modify, whatever you want to.
	*	Aurthor's Website: http://bdhacker.wordpress.com
	*
*/

// Countries
var country_arr = ["Afghanistan", "Albania", "Algeria", "American Samoa", "Angola", "Anguilla", "Antartica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Ashmore and Cartier Island", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burma", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Clipperton Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo, Democratic Republic of the", "Congo, Republic of the", "Cook Islands", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czeck Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Europa Island", "Falkland Islands (Islas Malvinas)", "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "French Southern and Antarctic Lands", "Gabon", "Gambia, The", "Gaza Strip", "Georgia", "Germany", "Ghana", "Gibraltar", "Glorioso Islands", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard Island and McDonald Islands", "Holy See (Vatican City)", "Honduras", "Hong Kong", "Howland Island", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Ireland, Northern", "Israel", "Italy", "Jamaica", "Jan Mayen", "Japan", "Jarvis Island", "Jersey", "Johnston Atoll", "Jordan", "Juan de Nova Island", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia, Former Yugoslav Republic of", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Man, Isle of", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia, Federated States of", "Midway Islands", "Moldova", "Monaco", "Mongolia", "Montserrat", "Morocco", "Mozambique", "Namibia", "Nauru", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcaim Islands", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romainia", "Russia", "Rwanda", "Saint Helena", "Saint Kitts and Nevis", "Saint Lucia", "Saint Pierre and Miquelon", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Scotland", "Senegal", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia and South Sandwich Islands", "Spain", "Spratly Islands", "Sri Lanka", "Sudan", "Suriname", "Svalbard", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Tobago", "Toga", "Tokelau", "Tonga", "Trinidad", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "Uruguay", "United States", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Virgin Islands", "Wales", "Wallis and Futuna", "West Bank", "Western Sahara", "Yemen", "Yugoslavia", "Zambia", "Zimbabwe"];
var country_short_arr = ["AF","AL","DZ","AS","AO","AI","","AG","AR","AM","AW","","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BA","BW","BR","VG","BN","BG","BF","","BI","KH","CM","CA","CV","KY","CF","TD","CL","CN","CX","","","CO","KM","","","CK","CR","","HR","CU","CY","","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","ET","","","FO","FJ","FI","FR","GF","PF","","GA","","","GE","DE","GH","GI","","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","","","HN","HK","","HU","IS","IN","ID","IR","IQ","IE","","IL","IT","JM","","JP","","JE","","JO","","KZ","KE","KI","","","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","","","MG","MW","MY","MV","ML","MT","","MH","MQ","MR","MU","YT","MX","","","MD","MC","MN","MS","MA","MZ","NA","NR","NP","NL","AN","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PA","PG","PY","PE","PH","","PL","PT","PR","QA","RE","","RU","RW","SH","","LC","","","WS","SM","","SA","","SN","SC","SL","SG","SK","SI","SB","SO","ZA","","ES","","LK","SD","SR","","SZ","SE","CH","SY","TW","TJ","TZ","TH","","","TK","TO","","TN","TR","TM","TV","UG","UA","AE","GB","UY","US","UZ","VU","VE","VN","","","","","EH","YE","","ZM","ZW"];

var allowed_countrys = ["United States", "Canada", "South Africa"];

var us_state_abbrevs = {
	    "AL": "Alabama",
	    "AK": "Alaska",
	    "AS": "American Samoa",
	    "AZ": "Arizona",
	    "AR": "Arkansas",
	    "CA": "California",
	    "CO": "Colorado",
	    "CT": "Connecticut",
	    "DE": "Delaware",
	    "DC": "District Of Columbia",
	    "FM": "Federated States Of Micronesia",
	    "FL": "Florida",
	    "GA": "Georgia",
	    "GU": "Guam",
	    "HI": "Hawaii",
	    "ID": "Idaho",
	    "IL": "Illinois",
	    "IN": "Indiana",
	    "IA": "Iowa",
	    "KS": "Kansas",
	    "KY": "Kentucky",
	    "LA": "Louisiana",
	    "ME": "Maine",
	    "MH": "Marshall Islands",
	    "MD": "Maryland",
	    "MA": "Massachusetts",
	    "MI": "Michigan",
	    "MN": "Minnesota",
	    "MS": "Mississippi",
	    "MO": "Missouri",
	    "MT": "Montana",
	    "NE": "Nebraska",
	    "NV": "Nevada",
	    "NH": "New Hampshire",
	    "NJ": "New Jersey",
	    "NM": "New Mexico",
	    "NY": "New York",
	    "NC": "North Carolina",
	    "ND": "North Dakota",
	    "MP": "Northern Mariana Islands",
	    "OH": "Ohio",
	    "OK": "Oklahoma",
	    "OR": "Oregon",
	    "PW": "Palau",
	    "PA": "Pennsylvania",
	    "PR": "Puerto Rico",
	    "RI": "Rhode Island",
	    "SC": "South Carolina",
	    "SD": "South Dakota",
	    "TN": "Tennessee",
	    "TX": "Texas",
	    "UT": "Utah",
	    "VT": "Vermont",
	    "VI": "Virgin Islands",
	    "VA": "Virginia",
	    "WA": "Washington",
	    "WV": "West Virginia",
	    "WI": "Wisconsin",
	    "WY": "Wyoming"
	};


// States
var s_a = [];
s_a[0]="";
s_a[1]="Badakhshan|Badghis|Baghlan|Balkh|Bamian|Farah|Faryab|Ghazni|Ghowr|Helmand|Herat|Jowzjan|Kabol|Kandahar|Kapisa|Konar|Kondoz|Laghman|Lowgar|Nangarhar|Nimruz|Oruzgan|Paktia|Paktika|Parvan|Samangan|Sar-e Pol|Takhar|Vardak|Zabol";
s_a[2]="Berat|Bulqize|Delvine|Devoll (Bilisht)|Diber (Peshkopi)|Durres|Elbasan|Fier|Gjirokaster|Gramsh|Has (Krume)|Kavaje|Kolonje (Erseke)|Korce|Kruje|Kucove|Kukes|Kurbin|Lezhe|Librazhd|Lushnje|Malesi e Madhe (Koplik)|Mallakaster (Ballsh)|Mat (Burrel)|Mirdite (Rreshen)|Peqin|Permet|Pogradec|Puke|Sarande|Shkoder|Skrapar (Corovode)|Tepelene|Tirane (Tirana)|Tirane (Tirana)|Tropoje (Bajram Curri)|Vlore";
s_a[3]="Adrar|Ain Defla|Ain Temouchent|Alger|Annaba|Batna|Bechar|Bejaia|Biskra|Blida|Bordj Bou Arreridj|Bouira|Boumerdes|Chlef|Constantine|Djelfa|El Bayadh|El Oued|El Tarf|Ghardaia|Guelma|Illizi|Jijel|Khenchela|Laghouat|M'Sila|Mascara|Medea|Mila|Mostaganem|Naama|Oran|Ouargla|Oum el Bouaghi|Relizane|Saida|Setif|Sidi Bel Abbes|Skikda|Souk Ahras|Tamanghasset|Tebessa|Tiaret|Tindouf|Tipaza|Tissemsilt|Tizi Ouzou|Tlemcen";
s_a[4]="Eastern|Manu'a|Rose Island|Swains Island|Western";
s_a[5]="Andorra la Vella|Bengo|Benguela|Bie|Cabinda|Canillo|Cuando Cubango|Cuanza Norte|Cuanza Sul|Cunene|Encamp|Escaldes-Engordany|Huambo|Huila|La Massana|Luanda|Lunda Norte|Lunda Sul|Malanje|Moxico|Namibe|Ordino|Sant Julia de Loria|Uige|Zaire";
s_a[6]="Anguilla";
s_a[7]="Antartica";
s_a[8]="Barbuda|Redonda|Saint George|Saint John|Saint Mary|Saint Paul|Saint Peter|Saint Philip";
s_a[9]="Antartica e Islas del Atlantico Sur|Buenos Aires|Buenos Aires Capital Federal|Catamarca|Chaco|Chubut|Cordoba|Corrientes|Entre Rios|Formosa|Jujuy|La Pampa|La Rioja|Mendoza|Misiones|Neuquen|Rio Negro|Salta|San Juan|San Luis|Santa Cruz|Santa Fe|Santiago del Estero|Tierra del Fuego|Tucuman";
s_a[10]="Aragatsotn|Ararat|Armavir|Geghark'unik'|Kotayk'|Lorri|Shirak|Syunik'|Tavush|Vayots' Dzor|Yerevan";
s_a[11]="Aruba";
s_a[12]="Ashmore and Cartier Island";
s_a[13]="Australian Capital Territory|New South Wales|Northern Territory|Queensland|South Australia|Tasmania|Victoria|Western Australia";
s_a[14]="Burgenland|Kaernten|Niederoesterreich|Oberoesterreich|Salzburg|Steiermark|Tirol|Vorarlberg|Wien";
s_a[15]="Abseron Rayonu|Agcabadi Rayonu|Agdam Rayonu|Agdas Rayonu|Agstafa Rayonu|Agsu Rayonu|Ali Bayramli Sahari|Astara Rayonu|Baki Sahari|Balakan Rayonu|Barda Rayonu|Beylaqan Rayonu|Bilasuvar Rayonu|Cabrayil Rayonu|Calilabad Rayonu|Daskasan Rayonu|Davaci Rayonu|Fuzuli Rayonu|Gadabay Rayonu|Ganca Sahari|Goranboy Rayonu|Goycay Rayonu|Haciqabul Rayonu|Imisli Rayonu|Ismayilli Rayonu|Kalbacar Rayonu|Kurdamir Rayonu|Lacin Rayonu|Lankaran Rayonu|Lankaran Sahari|Lerik Rayonu|Masalli Rayonu|Mingacevir Sahari|Naftalan Sahari|Naxcivan Muxtar Respublikasi|Neftcala Rayonu|Oguz Rayonu|Qabala Rayonu|Qax Rayonu|Qazax Rayonu|Qobustan Rayonu|Quba Rayonu|Qubadli Rayonu|Qusar Rayonu|Saatli Rayonu|Sabirabad Rayonu|Saki Rayonu|Saki Sahari|Salyan Rayonu|Samaxi Rayonu|Samkir Rayonu|Samux Rayonu|Siyazan Rayonu|Sumqayit Sahari|Susa Rayonu|Susa Sahari|Tartar Rayonu|Tovuz Rayonu|Ucar Rayonu|Xacmaz Rayonu|Xankandi Sahari|Xanlar Rayonu|Xizi Rayonu|Xocali Rayonu|Xocavand Rayonu|Yardimli Rayonu|Yevlax Rayonu|Yevlax Sahari|Zangilan Rayonu|Zaqatala Rayonu|Zardab Rayonu";
s_a[16]="Acklins and Crooked Islands|Bimini|Cat Island|Exuma|Freeport|Fresh Creek|Governor's Harbour|Green Turtle Cay|Harbour Island|High Rock|Inagua|Kemps Bay|Long Island|Marsh Harbour|Mayaguana|New Providence|Nicholls Town and Berry Islands|Ragged Island|Rock Sound|San Salvador and Rum Cay|Sandy Point";
s_a[17]="Al Hadd|Al Manamah|Al Mintaqah al Gharbiyah|Al Mintaqah al Wusta|Al Mintaqah ash Shamaliyah|Al Muharraq|Ar Rifa' wa al Mintaqah al Janubiyah|Jidd Hafs|Juzur Hawar|Madinat 'Isa|Madinat Hamad|Sitrah";
s_a[18]="Barguna|Barisal|Bhola|Jhalokati|Patuakhali|Pirojpur|Bandarban|Brahmanbaria|Chandpur|Chittagong|Comilla|Cox's Bazar|Feni|Khagrachari|Lakshmipur|Noakhali|Rangamati|Dhaka|Faridpur|Gazipur|Gopalganj|Jamalpur|Kishoreganj|Madaripur|Manikganj|Munshiganj|Mymensingh|Narayanganj|Narsingdi|Netrokona|Rajbari|Shariatpur|Sherpur|Tangail|Bagerhat|Chuadanga|Jessore|Jhenaidah|Khulna|Kushtia|Magura|Meherpur|Narail|Satkhira|Bogra|Dinajpur|Gaibandha|Jaipurhat|Kurigram|Lalmonirhat|Naogaon|Natore|Nawabganj|Nilphamari|Pabna|Panchagarh|Rajshahi|Rangpur|Sirajganj|Thakurgaon|Habiganj|Maulvi bazar|Sunamganj|Sylhet";
s_a[19]="Bridgetown|Christ Church|Saint Andrew|Saint George|Saint James|Saint John|Saint Joseph|Saint Lucy|Saint Michael|Saint Peter|Saint Philip|Saint Thomas";
s_a[20]="Brestskaya (Brest)|Homyel'skaya (Homyel')|Horad Minsk|Hrodzyenskaya (Hrodna)|Mahilyowskaya (Mahilyow)|Minskaya|Vitsyebskaya (Vitsyebsk)";
s_a[21]="Antwerpen|Brabant Wallon|Brussels Capitol Region|Hainaut|Liege|Limburg|Luxembourg|Namur|Oost-Vlaanderen|Vlaams Brabant|West-Vlaanderen";
s_a[22]="Belize|Cayo|Corozal|Orange Walk|Stann Creek|Toledo";
s_a[23]="Alibori|Atakora|Atlantique|Borgou|Collines|Couffo|Donga|Littoral|Mono|Oueme|Plateau|Zou";
s_a[24]="Devonshire|Hamilton|Hamilton|Paget|Pembroke|Saint George|Saint Georges|Sandys|Smiths|Southampton|Warwick";
s_a[25]="Bumthang|Chhukha|Chirang|Daga|Geylegphug|Ha|Lhuntshi|Mongar|Paro|Pemagatsel|Punakha|Samchi|Samdrup Jongkhar|Shemgang|Tashigang|Thimphu|Tongsa|Wangdi Phodrang";
s_a[26]="Beni|Chuquisaca|Cochabamba|La Paz|Oruro|Pando|Potosi|Santa Cruz|Tarija";
s_a[27]="Federation of Bosnia and Herzegovina|Republika Srpska";
s_a[28]="Central|Chobe|Francistown|Gaborone|Ghanzi|Kgalagadi|Kgatleng|Kweneng|Lobatse|Ngamiland|North-East|Selebi-Pikwe|South-East|Southern";
s_a[29]="Acre|Alagoas|Amapa|Amazonas|Bahia|Ceara|Distrito Federal|Espirito Santo|Goias|Maranhao|Mato Grosso|Mato Grosso do Sul|Minas Gerais|Para|Paraiba|Parana|Pernambuco|Piaui|Rio de Janeiro|Rio Grande do Norte|Rio Grande do Sul|Rondonia|Roraima|Santa Catarina|Sao Paulo|Sergipe|Tocantins";
s_a[30]="Anegada|Jost Van Dyke|Tortola|Virgin Gorda";
s_a[31]="Belait|Brunei and Muara|Temburong|Tutong";
s_a[32]="Blagoevgrad|Burgas|Dobrich|Gabrovo|Khaskovo|Kurdzhali|Kyustendil|Lovech|Montana|Pazardzhik|Pernik|Pleven|Plovdiv|Razgrad|Ruse|Shumen|Silistra|Sliven|Smolyan|Sofiya|Sofiya-Grad|Stara Zagora|Turgovishte|Varna|Veliko Turnovo|Vidin|Vratsa|Yambol";
s_a[33]="Bale|Bam|Banwa|Bazega|Bougouriba|Boulgou|Boulkiemde|Comoe|Ganzourgou|Gnagna|Gourma|Houet|Ioba|Kadiogo|Kenedougou|Komandjari|Kompienga|Kossi|Koupelogo|Kouritenga|Kourweogo|Leraba|Loroum|Mouhoun|Nahouri|Namentenga|Naumbiel|Nayala|Oubritenga|Oudalan|Passore|Poni|Samentenga|Sanguie|Seno|Sissili|Soum|Sourou|Tapoa|Tuy|Yagha|Yatenga|Ziro|Zondomo|Zoundweogo";
s_a[34]="Ayeyarwady|Bago|Chin State|Kachin State|Kayah State|Kayin State|Magway|Mandalay|Mon State|Rakhine State|Sagaing|Shan State|Tanintharyi|Yangon";
s_a[35]="Bubanza|Bujumbura|Bururi|Cankuzo|Cibitoke|Gitega|Karuzi|Kayanza|Kirundo|Makamba|Muramvya|Muyinga|Mwaro|Ngozi|Rutana|Ruyigi";
s_a[36]="Banteay Mean Cheay|Batdambang|Kampong Cham|Kampong Chhnang|Kampong Spoe|Kampong Thum|Kampot|Kandal|Kaoh Kong|Keb|Kracheh|Mondol Kiri|Otdar Mean Cheay|Pailin|Phnum Penh|Pouthisat|Preah Seihanu (Sihanoukville)|Preah Vihear|Prey Veng|Rotanah Kiri|Siem Reab|Stoeng Treng|Svay Rieng|Takev";
s_a[37]="Adamaoua|Centre|Est|Extreme-Nord|Littoral|Nord|Nord-Ouest|Ouest|Sud|Sud-Ouest";
s_a[38]="Alberta|British Columbia|Manitoba|New Brunswick|Newfoundland|Northwest Territories|Nova Scotia|Nunavut|Ontario|Prince Edward Island|Quebec|Saskatchewan|Yukon Territory";
s_a[39]="Boa Vista|Brava|Maio|Mosteiros|Paul|Porto Novo|Praia|Ribeira Grande|Sal|Santa Catarina|Santa Cruz|Sao Domingos|Sao Filipe|Sao Nicolau|Sao Vicente|Tarrafal";
s_a[40]="Creek|Eastern|Midland|South Town|Spot Bay|Stake Bay|West End|Western";
s_a[41]="Bamingui-Bangoran|Bangui|Basse-Kotto|Gribingui|Haut-Mbomou|Haute-Kotto|Haute-Sangha|Kemo-Gribingui|Lobaye|Mbomou|Nana-Mambere|Ombella-Mpoko|Ouaka|Ouham|Ouham-Pende|Sangha|Vakaga";
s_a[42]="Batha|Biltine|Borkou-Ennedi-Tibesti|Chari-Baguirmi|Guera|Kanem|Lac|Logone Occidental|Logone Oriental|Mayo-Kebbi|Moyen-Chari|Ouaddai|Salamat|Tandjile";
s_a[43]="Aisen del General Carlos Ibanez del Campo|Antofagasta|Araucania|Atacama|Bio-Bio|Coquimbo|Libertador General Bernardo O'Higgins|Los Lagos|Magallanes y de la Antartica Chilena|Maule|Region Metropolitana (Santiago)|Tarapaca|Valparaiso";
s_a[44]="Anhui|Beijing|Chongqing|Fujian|Gansu|Guangdong|Guangxi|Guizhou|Hainan|Hebei|Heilongjiang|Henan|Hubei|Hunan|Jiangsu|Jiangxi|Jilin|Liaoning|Nei Mongol|Ningxia|Qinghai|Shaanxi|Shandong|Shanghai|Shanxi|Sichuan|Tianjin|Xinjiang|Xizang (Tibet)|Yunnan|Zhejiang";
s_a[45]="Christmas Island";
s_a[46]="Clipperton Island";
s_a[47]="Direction Island|Home Island|Horsburgh Island|North Keeling Island|South Island|West Island";
s_a[48]="Amazonas|Antioquia|Arauca|Atlantico|Bolivar|Boyaca|Caldas|Caqueta|Casanare|Cauca|Cesar|Choco|Cordoba|Cundinamarca|Distrito Capital de Santa Fe de Bogota|Guainia|Guaviare|Huila|La Guajira|Magdalena|Meta|Narino|Norte de Santander|Putumayo|Quindio|Risaralda|San Andres y Providencia|Santander|Sucre|Tolima|Valle del Cauca|Vaupes|Vichada";
// <!-- -->
s_a[49]="Anjouan (Nzwani)|Domoni|Fomboni|Grande Comore (Njazidja)|Moheli (Mwali)|Moroni|Moutsamoudou";
s_a[50]="Bandundu|Bas-Congo|Equateur|Kasai-Occidental|Kasai-Oriental|Katanga|Kinshasa|Maniema|Nord-Kivu|Orientale|Sud-Kivu";
s_a[51]="Bouenza|Brazzaville|Cuvette|Kouilou|Lekoumou|Likouala|Niari|Plateaux|Pool|Sangha";
s_a[52]="Aitutaki|Atiu|Avarua|Mangaia|Manihiki|Manuae|Mauke|Mitiaro|Nassau Island|Palmerston|Penrhyn|Pukapuka|Rakahanga|Rarotonga|Suwarrow|Takutea";
s_a[53]="Alajuela|Cartago|Guanacaste|Heredia|Limon|Puntarenas|San Jose";
s_a[54]="Abengourou|Abidjan|Aboisso|Adiake'|Adzope|Agboville|Agnibilekrou|Ale'pe'|Bangolo|Beoumi|Biankouma|Bocanda|Bondoukou|Bongouanou|Bouafle|Bouake|Bouna|Boundiali|Dabakala|Dabon|Daloa|Danane|Daoukro|Dimbokro|Divo|Duekoue|Ferkessedougou|Gagnoa|Grand Bassam|Grand-Lahou|Guiglo|Issia|Jacqueville|Katiola|Korhogo|Lakota|Man|Mankono|Mbahiakro|Odienne|Oume|Sakassou|San-Pedro|Sassandra|Seguela|Sinfra|Soubre|Tabou|Tanda|Tiassale|Tiebissou|Tingrela|Touba|Toulepleu|Toumodi|Vavoua|Yamoussoukro|Zuenoula";
s_a[55]="Bjelovarsko-Bilogorska Zupanija|Brodsko-Posavska Zupanija|Dubrovacko-Neretvanska Zupanija|Istarska Zupanija|Karlovacka Zupanija|Koprivnicko-Krizevacka Zupanija|Krapinsko-Zagorska Zupanija|Licko-Senjska Zupanija|Medimurska Zupanija|Osjecko-Baranjska Zupanija|Pozesko-Slavonska Zupanija|Primorsko-Goranska Zupanija|Sibensko-Kninska Zupanija|Sisacko-Moslavacka Zupanija|Splitsko-Dalmatinska Zupanija|Varazdinska Zupanija|Viroviticko-Podravska Zupanija|Vukovarsko-Srijemska Zupanija|Zadarska Zupanija|Zagreb|Zagrebacka Zupanija";
s_a[56]="Camaguey|Ciego de Avila|Cienfuegos|Ciudad de La Habana|Granma|Guantanamo|Holguin|Isla de la Juventud|La Habana|Las Tunas|Matanzas|Pinar del Rio|Sancti Spiritus|Santiago de Cuba|Villa Clara";
s_a[57]="Famagusta|Kyrenia|Larnaca|Limassol|Nicosia|Paphos";
s_a[58]="Brnensky|Budejovicky|Jihlavsky|Karlovarsky|Kralovehradecky|Liberecky|Olomoucky|Ostravsky|Pardubicky|Plzensky|Praha|Stredocesky|Ustecky|Zlinsky";
s_a[59]="Arhus|Bornholm|Fredericksberg|Frederiksborg|Fyn|Kobenhavn|Kobenhavns|Nordjylland|Ribe|Ringkobing|Roskilde|Sonderjylland|Storstrom|Vejle|Vestsjalland|Viborg";
s_a[60]="'Ali Sabih|Dikhil|Djibouti|Obock|Tadjoura";
s_a[61]="Saint Andrew|Saint David|Saint George|Saint John|Saint Joseph|Saint Luke|Saint Mark|Saint Patrick|Saint Paul|Saint Peter";
s_a[62]="Azua|Baoruco|Barahona|Dajabon|Distrito Nacional|Duarte|El Seibo|Elias Pina|Espaillat|Hato Mayor|Independencia|La Altagracia|La Romana|La Vega|Maria Trinidad Sanchez|Monsenor Nouel|Monte Cristi|Monte Plata|Pedernales|Peravia|Puerto Plata|Salcedo|Samana|San Cristobal|San Juan|San Pedro de Macoris|Sanchez Ramirez|Santiago|Santiago Rodriguez|Valverde";
// <!-- -->
s_a[63]="Azuay|Bolivar|Canar|Carchi|Chimborazo|Cotopaxi|El Oro|Esmeraldas|Galapagos|Guayas|Imbabura|Loja|Los Rios|Manabi|Morona-Santiago|Napo|Orellana|Pastaza|Pichincha|Sucumbios|Tungurahua|Zamora-Chinchipe";
s_a[64]="Ad Daqahliyah|Al Bahr al Ahmar|Al Buhayrah|Al Fayyum|Al Gharbiyah|Al Iskandariyah|Al Isma'iliyah|Al Jizah|Al Minufiyah|Al Minya|Al Qahirah|Al Qalyubiyah|Al Wadi al Jadid|As Suways|Ash Sharqiyah|Aswan|Asyut|Bani Suwayf|Bur Sa'id|Dumyat|Janub Sina'|Kafr ash Shaykh|Matruh|Qina|Shamal Sina'|Suhaj";
s_a[65]="Ahuachapan|Cabanas|Chalatenango|Cuscatlan|La Libertad|La Paz|La Union|Morazan|San Miguel|San Salvador|San Vicente|Santa Ana|Sonsonate|Usulutan";
s_a[66]="Annobon|Bioko Norte|Bioko Sur|Centro Sur|Kie-Ntem|Litoral|Wele-Nzas";
s_a[67]="Akale Guzay|Barka|Denkel|Hamasen|Sahil|Semhar|Senhit|Seraye";
s_a[68]="Harjumaa (Tallinn)|Hiiumaa (Kardla)|Ida-Virumaa (Johvi)|Jarvamaa (Paide)|Jogevamaa (Jogeva)|Laane-Virumaa (Rakvere)|Laanemaa (Haapsalu)|Parnumaa (Parnu)|Polvamaa (Polva)|Raplamaa (Rapla)|Saaremaa (Kuessaare)|Tartumaa (Tartu)|Valgamaa (Valga)|Viljandimaa (Viljandi)|Vorumaa (Voru)";
s_a[69]="Adis Abeba (Addis Ababa)|Afar|Amara|Dire Dawa|Gambela Hizboch|Hareri Hizb|Oromiya|Sumale|Tigray|YeDebub Biheroch Bihereseboch na Hizboch";
s_a[70]="Europa Island";
s_a[71]="Falkland Islands (Islas Malvinas)";
s_a[72]="Bordoy|Eysturoy|Mykines|Sandoy|Skuvoy|Streymoy|Suduroy|Tvoroyri|Vagar";
s_a[73]="Central|Eastern|Northern|Rotuma|Western";
s_a[74]="Aland|Etela-Suomen Laani|Ita-Suomen Laani|Lansi-Suomen Laani|Lappi|Oulun Laani";
s_a[75]="Alsace|Aquitaine|Auvergne|Basse-Normandie|Bourgogne|Bretagne|Centre|Champagne-Ardenne|Corse|Franche-Comte|Haute-Normandie|Ile-de-France|Languedoc-Roussillon|Limousin|Lorraine|Midi-Pyrenees|Nord-Pas-de-Calais|Pays de la Loire|Picardie|Poitou-Charentes|Provence-Alpes-Cote d'Azur|Rhone-Alpes";
s_a[76]="French Guiana";
s_a[77]="Archipel des Marquises|Archipel des Tuamotu|Archipel des Tubuai|Iles du Vent|Iles Sous-le-Vent";
s_a[78]="Adelie Land|Ile Crozet|Iles Kerguelen|Iles Saint-Paul et Amsterdam";
s_a[79]="Estuaire|Haut-Ogooue|Moyen-Ogooue|Ngounie|Nyanga|Ogooue-Ivindo|Ogooue-Lolo|Ogooue-Maritime|Woleu-Ntem";
s_a[80]="Banjul|Central River|Lower River|North Bank|Upper River|Western";
s_a[81]="Gaza Strip";
s_a[82]="Abashis|Abkhazia or Ap'khazet'is Avtonomiuri Respublika (Sokhumi)|Adigenis|Ajaria or Acharis Avtonomiuri Respublika (Bat'umi)|Akhalgoris|Akhalk'alak'is|Akhalts'ikhis|Akhmetis|Ambrolauris|Aspindzis|Baghdat'is|Bolnisis|Borjomis|Ch'khorotsqus|Ch'okhatauris|Chiat'ura|Dedop'listsqaros|Dmanisis|Dushet'is|Gardabanis|Gori|Goris|Gurjaanis|Javis|K'arelis|K'ut'aisi|Kaspis|Kharagaulis|Khashuris|Khobis|Khonis|Lagodekhis|Lanch'khut'is|Lentekhis|Marneulis|Martvilis|Mestiis|Mts'khet'is|Ninotsmindis|Onis|Ozurget'is|P'ot'i|Qazbegis|Qvarlis|Rust'avi|Sach'kheris|Sagarejos|Samtrediis|Senakis|Sighnaghis|T'bilisi|T'elavis|T'erjolis|T'et'ritsqaros|T'ianet'is|Tqibuli|Ts'ageris|Tsalenjikhis|Tsalkis|Tsqaltubo|Vanis|Zestap'onis|Zugdidi|Zugdidis";
s_a[83]="Baden-Wuerttemberg|Bayern|Berlin|Brandenburg|Bremen|Hamburg|Hessen|Mecklenburg-Vorpommern|Niedersachsen|Nordrhein-Westfalen|Rheinland-Pfalz|Saarland|Sachsen|Sachsen-Anhalt|Schleswig-Holstein|Thueringen";
s_a[84]="Ashanti|Brong-Ahafo|Central|Eastern|Greater Accra|Northern|Upper East|Upper West|Volta|Western";
s_a[85]="Gibraltar";
s_a[86]="Ile du Lys|Ile Glorieuse";
s_a[87]="Aitolia kai Akarnania|Akhaia|Argolis|Arkadhia|Arta|Attiki|Ayion Oros (Mt. Athos)|Dhodhekanisos|Drama|Evritania|Evros|Evvoia|Florina|Fokis|Fthiotis|Grevena|Ilia|Imathia|Ioannina|Irakleion|Kardhitsa|Kastoria|Kavala|Kefallinia|Kerkyra|Khalkidhiki|Khania|Khios|Kikladhes|Kilkis|Korinthia|Kozani|Lakonia|Larisa|Lasithi|Lesvos|Levkas|Magnisia|Messinia|Pella|Pieria|Preveza|Rethimni|Rodhopi|Samos|Serrai|Thesprotia|Thessaloniki|Trikala|Voiotia|Xanthi|Zakinthos";
s_a[88]="Avannaa (Nordgronland)|Kitaa (Vestgronland)|Tunu (Ostgronland)";
s_a[89]="Carriacou and Petit Martinique|Saint Andrew|Saint David|Saint George|Saint John|Saint Mark|Saint Patrick";
s_a[90]="Basse-Terre|Grande-Terre|Iles de la Petite Terre|Iles des Saintes|Marie-Galante";
s_a[91]="Guam";
s_a[92]="Alta Verapaz|Baja Verapaz|Chimaltenango|Chiquimula|El Progreso|Escuintla|Guatemala|Huehuetenango|Izabal|Jalapa|Jutiapa|Peten|Quetzaltenango|Quiche|Retalhuleu|Sacatepequez|San Marcos|Santa Rosa|Solola|Suchitepequez|Totonicapan|Zacapa";
s_a[93]="Castel|Forest|St. Andrew|St. Martin|St. Peter Port|St. Pierre du Bois|St. Sampson|St. Saviour|Torteval|Vale";
s_a[94]="Beyla|Boffa|Boke|Conakry|Coyah|Dabola|Dalaba|Dinguiraye|Dubreka|Faranah|Forecariah|Fria|Gaoual|Gueckedou|Kankan|Kerouane|Kindia|Kissidougou|Koubia|Koundara|Kouroussa|Labe|Lelouma|Lola|Macenta|Mali|Mamou|Mandiana|Nzerekore|Pita|Siguiri|Telimele|Tougue|Yomou";
s_a[95]="Bafata|Biombo|Bissau|Bolama-Bijagos|Cacheu|Gabu|Oio|Quinara|Tombali";
s_a[96]="Barima-Waini|Cuyuni-Mazaruni|Demerara-Mahaica|East Berbice-Corentyne|Essequibo Islands-West Demerara|Mahaica-Berbice|Pomeroon-Supenaam|Potaro-Siparuni|Upper Demerara-Berbice|Upper Takutu-Upper Essequibo";
s_a[97]="Artibonite|Centre|Grand'Anse|Nord|Nord-Est|Nord-Ouest|Ouest|Sud|Sud-Est";
s_a[98]="Heard Island and McDonald Islands";
s_a[99]="Holy See (Vatican City)";
s_a[100]="Atlantida|Choluteca|Colon|Comayagua|Copan|Cortes|El Paraiso|Francisco Morazan|Gracias a Dios|Intibuca|Islas de la Bahia|La Paz|Lempira|Ocotepeque|Olancho|Santa Barbara|Valle|Yoro";
s_a[101]="Hong Kong";
s_a[102]="Howland Island";
s_a[103]="Bacs-Kiskun|Baranya|Bekes|Bekescsaba|Borsod-Abauj-Zemplen|Budapest|Csongrad|Debrecen|Dunaujvaros|Eger|Fejer|Gyor|Gyor-Moson-Sopron|Hajdu-Bihar|Heves|Hodmezovasarhely|Jasz-Nagykun-Szolnok|Kaposvar|Kecskemet|Komarom-Esztergom|Miskolc|Nagykanizsa|Nograd|Nyiregyhaza|Pecs|Pest|Somogy|Sopron|Szabolcs-Szatmar-Bereg|Szeged|Szekesfehervar|Szolnok|Szombathely|Tatabanya|Tolna|Vas|Veszprem|Veszprem|Zala|Zalaegerszeg";
s_a[104]="Akranes|Akureyri|Arnessysla|Austur-Bardhastrandarsysla|Austur-Hunavatnssysla|Austur-Skaftafellssysla|Borgarfjardharsysla|Dalasysla|Eyjafjardharsysla|Gullbringusysla|Hafnarfjordhur|Husavik|Isafjordhur|Keflavik|Kjosarsysla|Kopavogur|Myrasysla|Neskaupstadhur|Nordhur-Isafjardharsysla|Nordhur-Mulasys-la|Nordhur-Thingeyjarsysla|Olafsfjordhur|Rangarvallasysla|Reykjavik|Saudharkrokur|Seydhisfjordhur|Siglufjordhur|Skagafjardharsysla|Snaefellsnes-og Hnappadalssysla|Strandasysla|Sudhur-Mulasysla|Sudhur-Thingeyjarsysla|Vesttmannaeyjar|Vestur-Bardhastrandarsysla|Vestur-Hunavatnssysla|Vestur-Isafjardharsysla|Vestur-Skaftafellssysla";
s_a[105]="Andaman and Nicobar Islands|Andhra Pradesh|Arunachal Pradesh|Assam|Bihar|Chandigarh|Chhattisgarh|Dadra and Nagar Haveli|Daman and Diu|Delhi|Goa|Gujarat|Haryana|Himachal Pradesh|Jammu and Kashmir|Jharkhand|Karnataka|Kerala|Lakshadweep|Madhya Pradesh|Maharashtra|Manipur|Meghalaya|Mizoram|Nagaland|Orissa|Pondicherry|Punjab|Rajasthan|Sikkim|Tamil Nadu|Tripura|Uttar Pradesh|Uttaranchal|West Bengal";
s_a[106]="Aceh|Bali|Banten|Bengkulu|East Timor|Gorontalo|Irian Jaya|Jakarta Raya|Jambi|Jawa Barat|Jawa Tengah|Jawa Timur|Kalimantan Barat|Kalimantan Selatan|Kalimantan Tengah|Kalimantan Timur|Kepulauan Bangka Belitung|Lampung|Maluku|Maluku Utara|Nusa Tenggara Barat|Nusa Tenggara Timur|Riau|Sulawesi Selatan|Sulawesi Tengah|Sulawesi Tenggara|Sulawesi Utara|Sumatera Barat|Sumatera Selatan|Sumatera Utara|Yogyakarta";
s_a[107]="Ardabil|Azarbayjan-e Gharbi|Azarbayjan-e Sharqi|Bushehr|Chahar Mahall va Bakhtiari|Esfahan|Fars|Gilan|Golestan|Hamadan|Hormozgan|Ilam|Kerman|Kermanshah|Khorasan|Khuzestan|Kohgiluyeh va Buyer Ahmad|Kordestan|Lorestan|Markazi|Mazandaran|Qazvin|Qom|Semnan|Sistan va Baluchestan|Tehran|Yazd|Zanjan";
s_a[108]="Al Anbar|Al Basrah|Al Muthanna|Al Qadisiyah|An Najaf|Arbil|As Sulaymaniyah|At Ta'mim|Babil|Baghdad|Dahuk|Dhi Qar|Diyala|Karbala'|Maysan|Ninawa|Salah ad Din|Wasit";
s_a[109]="Carlow|Cavan|Clare|Cork|Donegal|Dublin|Galway|Kerry|Kildare|Kilkenny|Laois|Leitrim|Limerick|Longford|Louth|Mayo|Meath|Monaghan|Offaly|Roscommon|Sligo|Tipperary|Waterford|Westmeath|Wexford|Wicklow";
s_a[110]="Antrim|Ards|Armagh|Ballymena|Ballymoney|Banbridge|Belfast|Carrickfergus|Castlereagh|Coleraine|Cookstown|Craigavon|Derry|Down|Dungannon|Fermanagh|Larne|Limavady|Lisburn|Magherafelt|Moyle|Newry and Mourne|Newtownabbey|North Down|Omagh|Strabane";
s_a[111]="Central|Haifa|Jerusalem|Northern|Southern|Tel Aviv";
s_a[112]="Abruzzo|Basilicata|Calabria|Campania|Emilia-Romagna|Friuli-Venezia Giulia|Lazio|Liguria|Lombardia|Marche|Molise|Piemonte|Puglia|Sardegna|Sicilia|Toscana|Trentino-Alto Adige|Umbria|Valle d'Aosta|Veneto";
s_a[113]="Clarendon|Hanover|Kingston|Manchester|Portland|Saint Andrew|Saint Ann|Saint Catherine|Saint Elizabeth|Saint James|Saint Mary|Saint Thomas|Trelawny|Westmoreland";
s_a[114]="Jan Mayen";
s_a[115]="Aichi|Akita|Aomori|Chiba|Ehime|Fukui|Fukuoka|Fukushima|Gifu|Gumma|Hiroshima|Hokkaido|Hyogo|Ibaraki|Ishikawa|Iwate|Kagawa|Kagoshima|Kanagawa|Kochi|Kumamoto|Kyoto|Mie|Miyagi|Miyazaki|Nagano|Nagasaki|Nara|Niigata|Oita|Okayama|Okinawa|Osaka|Saga|Saitama|Shiga|Shimane|Shizuoka|Tochigi|Tokushima|Tokyo|Tottori|Toyama|Wakayama|Yamagata|Yamaguchi|Yamanashi";
s_a[116]="Jarvis Island";
s_a[117]="Jersey";
s_a[118]="Johnston Atoll";
s_a[119]="'Amman|Ajlun|Al 'Aqabah|Al Balqa'|Al Karak|Al Mafraq|At Tafilah|Az Zarqa'|Irbid|Jarash|Ma'an|Madaba";
s_a[120]="Juan de Nova Island";
s_a[121]="Almaty|Aqmola|Aqtobe|Astana|Atyrau|Batys Qazaqstan|Bayqongyr|Mangghystau|Ongtustik Qazaqstan|Pavlodar|Qaraghandy|Qostanay|Qyzylorda|Shyghys Qazaqstan|Soltustik Qazaqstan|Zhambyl";
s_a[122]="Central|Coast|Eastern|Nairobi Area|North Eastern|Nyanza|Rift Valley|Western";
s_a[123]="Abaiang|Abemama|Aranuka|Arorae|Banaba|Banaba|Beru|Butaritari|Central Gilberts|Gilbert Islands|Kanton|Kiritimati|Kuria|Line Islands|Line Islands|Maiana|Makin|Marakei|Nikunau|Nonouti|Northern Gilberts|Onotoa|Phoenix Islands|Southern Gilberts|Tabiteuea|Tabuaeran|Tamana|Tarawa|Tarawa|Teraina";
s_a[124]="Chagang-do (Chagang Province)|Hamgyong-bukto (North Hamgyong Province)|Hamgyong-namdo (South Hamgyong Province)|Hwanghae-bukto (North Hwanghae Province)|Hwanghae-namdo (South Hwanghae Province)|Kaesong-si (Kaesong City)|Kangwon-do (Kangwon Province)|Namp'o-si (Namp'o City)|P'yongan-bukto (North P'yongan Province)|P'yongan-namdo (South P'yongan Province)|P'yongyang-si (P'yongyang City)|Yanggang-do (Yanggang Province)";
s_a[125]="Ch'ungch'ong-bukto|Ch'ungch'ong-namdo|Cheju-do|Cholla-bukto|Cholla-namdo|Inch'on-gwangyoksi|Kangwon-do|Kwangju-gwangyoksi|Kyonggi-do|Kyongsang-bukto|Kyongsang-namdo|Pusan-gwangyoksi|Soul-t'ukpyolsi|Taegu-gwangyoksi|Taejon-gwangyoksi|Ulsan-gwangyoksi";
s_a[126]="Al 'Asimah|Al Ahmadi|Al Farwaniyah|Al Jahra'|Hawalli";
s_a[127]="Batken Oblasty|Bishkek Shaary|Chuy Oblasty (Bishkek)|Jalal-Abad Oblasty|Naryn Oblasty|Osh Oblasty|Talas Oblasty|Ysyk-Kol Oblasty (Karakol)";
s_a[128]="Attapu|Bokeo|Bolikhamxai|Champasak|Houaphan|Khammouan|Louangnamtha|Louangphabang|Oudomxai|Phongsali|Salavan|Savannakhet|Viangchan|Viangchan|Xaignabouli|Xaisomboun|Xekong|Xiangkhoang";
s_a[129]="Aizkraukles Rajons|Aluksnes Rajons|Balvu Rajons|Bauskas Rajons|Cesu Rajons|Daugavpils|Daugavpils Rajons|Dobeles Rajons|Gulbenes Rajons|Jekabpils Rajons|Jelgava|Jelgavas Rajons|Jurmala|Kraslavas Rajons|Kuldigas Rajons|Leipaja|Liepajas Rajons|Limbazu Rajons|Ludzas Rajons|Madonas Rajons|Ogres Rajons|Preilu Rajons|Rezekne|Rezeknes Rajons|Riga|Rigas Rajons|Saldus Rajons|Talsu Rajons|Tukuma Rajons|Valkas Rajons|Valmieras Rajons|Ventspils|Ventspils Rajons";
s_a[130]="Beyrouth|Ech Chimal|Ej Jnoub|El Bekaa|Jabal Loubnane";
s_a[131]="Berea|Butha-Buthe|Leribe|Mafeteng|Maseru|Mohales Hoek|Mokhotlong|Qacha's Nek|Quthing|Thaba-Tseka";
s_a[132]="Bomi|Bong|Grand Bassa|Grand Cape Mount|Grand Gedeh|Grand Kru|Lofa|Margibi|Maryland|Montserrado|Nimba|River Cess|Sinoe";
s_a[133]="Ajdabiya|Al 'Aziziyah|Al Fatih|Al Jabal al Akhdar|Al Jufrah|Al Khums|Al Kufrah|An Nuqat al Khams|Ash Shati'|Awbari|Az Zawiyah|Banghazi|Darnah|Ghadamis|Gharyan|Misratah|Murzuq|Sabha|Sawfajjin|Surt|Tarabulus|Tarhunah|Tubruq|Yafran|Zlitan";
s_a[134]="Balzers|Eschen|Gamprin|Mauren|Planken|Ruggell|Schaan|Schellenberg|Triesen|Triesenberg|Vaduz";
s_a[135]="Akmenes Rajonas|Alytaus Rajonas|Alytus|Anyksciu Rajonas|Birstonas|Birzu Rajonas|Druskininkai|Ignalinos Rajonas|Jonavos Rajonas|Joniskio Rajonas|Jurbarko Rajonas|Kaisiadoriu Rajonas|Kaunas|Kauno Rajonas|Kedainiu Rajonas|Kelmes Rajonas|Klaipeda|Klaipedos Rajonas|Kretingos Rajonas|Kupiskio Rajonas|Lazdiju Rajonas|Marijampole|Marijampoles Rajonas|Mazeikiu Rajonas|Moletu Rajonas|Neringa Pakruojo Rajonas|Palanga|Panevezio Rajonas|Panevezys|Pasvalio Rajonas|Plunges Rajonas|Prienu Rajonas|Radviliskio Rajonas|Raseiniu Rajonas|Rokiskio Rajonas|Sakiu Rajonas|Salcininku Rajonas|Siauliai|Siauliu Rajonas|Silales Rajonas|Silutes Rajonas|Sirvintu Rajonas|Skuodo Rajonas|Svencioniu Rajonas|Taurages Rajonas|Telsiu Rajonas|Traku Rajonas|Ukmerges Rajonas|Utenos Rajonas|Varenos Rajonas|Vilkaviskio Rajonas|Vilniaus Rajonas|Vilnius|Zarasu Rajonas";
s_a[136]="Diekirch|Grevenmacher|Luxembourg";
s_a[137]="Macau";
s_a[138]="Aracinovo|Bac|Belcista|Berovo|Bistrica|Bitola|Blatec|Bogdanci|Bogomila|Bogovinje|Bosilovo|Brvenica|Cair (Skopje)|Capari|Caska|Cegrane|Centar (Skopje)|Centar Zupa|Cesinovo|Cucer-Sandevo|Debar|Delcevo|Delogozdi|Demir Hisar|Demir Kapija|Dobrusevo|Dolna Banjica|Dolneni|Dorce Petrov (Skopje)|Drugovo|Dzepciste|Gazi Baba (Skopje)|Gevgelija|Gostivar|Gradsko|Ilinden|Izvor|Jegunovce|Kamenjane|Karbinci|Karpos (Skopje)|Kavadarci|Kicevo|Kisela Voda (Skopje)|Klecevce|Kocani|Konce|Kondovo|Konopiste|Kosel|Kratovo|Kriva Palanka|Krivogastani|Krusevo|Kuklis|Kukurecani|Kumanovo|Labunista|Lipkovo|Lozovo|Lukovo|Makedonska Kamenica|Makedonski Brod|Mavrovi Anovi|Meseista|Miravci|Mogila|Murtino|Negotino|Negotino-Poloska|Novaci|Novo Selo|Oblesevo|Ohrid|Orasac|Orizari|Oslomej|Pehcevo|Petrovec|Plasnia|Podares|Prilep|Probistip|Radovis|Rankovce|Resen|Rosoman|Rostusa|Samokov|Saraj|Sipkovica|Sopiste|Sopotnika|Srbinovo|Star Dojran|Staravina|Staro Nagoricane|Stip|Struga|Strumica|Studenicani|Suto Orizari (Skopje)|Sveti Nikole|Tearce|Tetovo|Topolcani|Valandovo|Vasilevo|Veles|Velesta|Vevcani|Vinica|Vitoliste|Vranestica|Vrapciste|Vratnica|Vrutok|Zajas|Zelenikovo|Zileno|Zitose|Zletovo|Zrnovci";
s_a[139]="Antananarivo|Antsiranana|Fianarantsoa|Mahajanga|Toamasina|Toliara";
s_a[140]="Balaka|Blantyre|Chikwawa|Chiradzulu|Chitipa|Dedza|Dowa|Karonga|Kasungu|Likoma|Lilongwe|Machinga (Kasupe)|Mangochi|Mchinji|Mulanje|Mwanza|Mzimba|Nkhata Bay|Nkhotakota|Nsanje|Ntcheu|Ntchisi|Phalombe|Rumphi|Salima|Thyolo|Zomba";
s_a[141]="Johor|Kedah|Kelantan|Labuan|Melaka|Negeri Sembilan|Pahang|Perak|Perlis|Pulau Pinang|Sabah|Sarawak|Selangor|Terengganu|Wilayah Persekutuan";
s_a[142]="Alifu|Baa|Dhaalu|Faafu|Gaafu Alifu|Gaafu Dhaalu|Gnaviyani|Haa Alifu|Haa Dhaalu|Kaafu|Laamu|Lhaviyani|Maale|Meemu|Noonu|Raa|Seenu|Shaviyani|Thaa|Vaavu";
s_a[143]="Gao|Kayes|Kidal|Koulikoro|Mopti|Segou|Sikasso|Tombouctou";
s_a[144]="Valletta";
s_a[145]="Man, Isle of";
s_a[146]="Ailinginae|Ailinglaplap|Ailuk|Arno|Aur|Bikar|Bikini|Bokak|Ebon|Enewetak|Erikub|Jabat|Jaluit|Jemo|Kili|Kwajalein|Lae|Lib|Likiep|Majuro|Maloelap|Mejit|Mili|Namorik|Namu|Rongelap|Rongrik|Toke|Ujae|Ujelang|Utirik|Wotho|Wotje";
s_a[147]="Martinique";
s_a[148]="Adrar|Assaba|Brakna|Dakhlet Nouadhibou|Gorgol|Guidimaka|Hodh Ech Chargui|Hodh El Gharbi|Inchiri|Nouakchott|Tagant|Tiris Zemmour|Trarza";
s_a[149]="Agalega Islands|Black River|Cargados Carajos Shoals|Flacq|Grand Port|Moka|Pamplemousses|Plaines Wilhems|Port Louis|Riviere du Rempart|Rodrigues|Savanne";
s_a[150]="Mayotte";
s_a[151]="Aguascalientes|Baja California|Baja California Sur|Campeche|Chiapas|Chihuahua|Coahuila de Zaragoza|Colima|Distrito Federal|Durango|Guanajuato|Guerrero|Hidalgo|Jalisco|Mexico|Michoacan de Ocampo|Morelos|Nayarit|Nuevo Leon|Oaxaca|Puebla|Queretaro de Arteaga|Quintana Roo|San Luis Potosi|Sinaloa|Sonora|Tabasco|Tamaulipas|Tlaxcala|Veracruz-Llave|Yucatan|Zacatecas";
s_a[152]="Chuuk (Truk)|Kosrae|Pohnpei|Yap";
s_a[153]="Midway Islands";
s_a[154]="Balti|Cahul|Chisinau|Chisinau|Dubasari|Edinet|Gagauzia|Lapusna|Orhei|Soroca|Tighina|Ungheni";
s_a[155]="Fontvieille|La Condamine|Monaco-Ville|Monte-Carlo";
s_a[156]="Arhangay|Bayan-Olgiy|Bayanhongor|Bulgan|Darhan|Dornod|Dornogovi|Dundgovi|Dzavhan|Erdenet|Govi-Altay|Hentiy|Hovd|Hovsgol|Omnogovi|Ovorhangay|Selenge|Suhbaatar|Tov|Ulaanbaatar|Uvs";
s_a[157]="Saint Anthony|Saint Georges|Saint Peter's";
s_a[158]="Agadir|Al Hoceima|Azilal|Ben Slimane|Beni Mellal|Boulemane|Casablanca|Chaouen|El Jadida|El Kelaa des Srarhna|Er Rachidia|Essaouira|Fes|Figuig|Guelmim|Ifrane|Kenitra|Khemisset|Khenifra|Khouribga|Laayoune|Larache|Marrakech|Meknes|Nador|Ouarzazate|Oujda|Rabat-Sale|Safi|Settat|Sidi Kacem|Tan-Tan|Tanger|Taounate|Taroudannt|Tata|Taza|Tetouan|Tiznit";
s_a[159]="Cabo Delgado|Gaza|Inhambane|Manica|Maputo|Nampula|Niassa|Sofala|Tete|Zambezia";
s_a[160]="Caprivi|Erongo|Hardap|Karas|Khomas|Kunene|Ohangwena|Okavango|Omaheke|Omusati|Oshana|Oshikoto|Otjozondjupa";
s_a[161]="Aiwo|Anabar|Anetan|Anibare|Baiti|Boe|Buada|Denigomodu|Ewa|Ijuw|Meneng|Nibok|Uaboe|Yaren";
s_a[162]="Bagmati|Bheri|Dhawalagiri|Gandaki|Janakpur|Karnali|Kosi|Lumbini|Mahakali|Mechi|Narayani|Rapti|Sagarmatha|Seti";
s_a[163]="Drenthe|Flevoland|Friesland|Gelderland|Groningen|Limburg|Noord-Brabant|Noord-Holland|Overijssel|Utrecht|Zeeland|Zuid-Holland";
s_a[164]="Netherlands Antilles";
s_a[165]="Iles Loyaute|Nord|Sud";
s_a[166]="Akaroa|Amuri|Ashburton|Bay of Islands|Bruce|Buller|Chatham Islands|Cheviot|Clifton|Clutha|Cook|Dannevirke|Egmont|Eketahuna|Ellesmere|Eltham|Eyre|Featherston|Franklin|Golden Bay|Great Barrier Island|Grey|Hauraki Plains|Hawera|Hawke's Bay|Heathcote|Hikurangi|Hobson|Hokianga|Horowhenua|Hurunui|Hutt|Inangahua|Inglewood|Kaikoura|Kairanga|Kiwitea|Lake|Mackenzie|Malvern|Manaia|Manawatu|Mangonui|Maniototo|Marlborough|Masterton|Matamata|Mount Herbert|Ohinemuri|Opotiki|Oroua|Otamatea|Otorohanga|Oxford|Pahiatua|Paparua|Patea|Piako|Pohangina|Raglan|Rangiora|Rangitikei|Rodney|Rotorua|Runanga|Saint Kilda|Silverpeaks|Southland|Stewart Island|Stratford|Strathallan|Taranaki|Taumarunui|Taupo|Tauranga|Thames-Coromandel|Tuapeka|Vincent|Waiapu|Waiheke|Waihemo|Waikato|Waikohu|Waimairi|Waimarino|Waimate|Waimate West|Waimea|Waipa|Waipawa|Waipukurau|Wairarapa South|Wairewa|Wairoa|Waitaki|Waitomo|Waitotara|Wallace|Wanganui|Waverley|Westland|Whakatane|Whangarei|Whangaroa|Woodville";
s_a[167]="Atlantico Norte|Atlantico Sur|Boaco|Carazo|Chinandega|Chontales|Esteli|Granada|Jinotega|Leon|Madriz|Managua|Masaya|Matagalpa|Nueva Segovia|Rio San Juan|Rivas";
s_a[168]="Agadez|Diffa|Dosso|Maradi|Niamey|Tahoua|Tillaberi|Zinder";
s_a[169]="Abia|Abuja Federal Capital Territory|Adamawa|Akwa Ibom|Anambra|Bauchi|Bayelsa|Benue|Borno|Cross River|Delta|Ebonyi|Edo|Ekiti|Enugu|Gombe|Imo|Jigawa|Kaduna|Kano|Katsina|Kebbi|Kogi|Kwara|Lagos|Nassarawa|Niger|Ogun|Ondo|Osun|Oyo|Plateau|Rivers|Sokoto|Taraba|Yobe|Zamfara";
s_a[170]="Niue";
s_a[171]="Norfolk Island";
s_a[172]="Northern Islands|Rota|Saipan|Tinian";
s_a[173]="Akershus|Aust-Agder|Buskerud|Finnmark|Hedmark|Hordaland|More og Romsdal|Nord-Trondelag|Nordland|Oppland|Oslo|Ostfold|Rogaland|Sogn og Fjordane|Sor-Trondelag|Telemark|Troms|Vest-Agder|Vestfold";
s_a[174]="Ad Dakhiliyah|Al Batinah|Al Wusta|Ash Sharqiyah|Az Zahirah|Masqat|Musandam|Zufar";
s_a[175]="Balochistan|Federally Administered Tribal Areas|Islamabad Capital Territory|North-West Frontier Province|Punjab|Sindh";
s_a[176]="Aimeliik|Airai|Angaur|Hatobohei|Kayangel|Koror|Melekeok|Ngaraard|Ngarchelong|Ngardmau|Ngatpang|Ngchesar|Ngeremlengui|Ngiwal|Palau Island|Peleliu|Sonsoral|Tobi";
s_a[177]="Bocas del Toro|Chiriqui|Cocle|Colon|Darien|Herrera|Los Santos|Panama|San Blas|Veraguas";
s_a[178]="Bougainville|Central|Chimbu|East New Britain|East Sepik|Eastern Highlands|Enga|Gulf|Madang|Manus|Milne Bay|Morobe|National Capital|New Ireland|Northern|Sandaun|Southern Highlands|West New Britain|Western|Western Highlands";
s_a[179]="Alto Paraguay|Alto Parana|Amambay|Asuncion (city)|Boqueron|Caaguazu|Caazapa|Canindeyu|Central|Concepcion|Cordillera|Guaira|Itapua|Misiones|Neembucu|Paraguari|Presidente Hayes|San Pedro";
s_a[180]="Amazonas|Ancash|Apurimac|Arequipa|Ayacucho|Cajamarca|Callao|Cusco|Huancavelica|Huanuco|Ica|Junin|La Libertad|Lambayeque|Lima|Loreto|Madre de Dios|Moquegua|Pasco|Piura|Puno|San Martin|Tacna|Tumbes|Ucayali";
s_a[181]="Abra|Agusan del Norte|Agusan del Sur|Aklan|Albay|Angeles|Antique|Aurora|Bacolod|Bago|Baguio|Bais|Basilan|Basilan City|Bataan|Batanes|Batangas|Batangas City|Benguet|Bohol|Bukidnon|Bulacan|Butuan|Cabanatuan|Cadiz|Cagayan|Cagayan de Oro|Calbayog|Caloocan|Camarines Norte|Camarines Sur|Camiguin|Canlaon|Capiz|Catanduanes|Cavite|Cavite City|Cebu|Cebu City|Cotabato|Dagupan|Danao|Dapitan|Davao City Davao|Davao del Sur|Davao Oriental|Dipolog|Dumaguete|Eastern Samar|General Santos|Gingoog|Ifugao|Iligan|Ilocos Norte|Ilocos Sur|Iloilo|Iloilo City|Iriga|Isabela|Kalinga-Apayao|La Carlota|La Union|Laguna|Lanao del Norte|Lanao del Sur|Laoag|Lapu-Lapu|Legaspi|Leyte|Lipa|Lucena|Maguindanao|Mandaue|Manila|Marawi|Marinduque|Masbate|Mindoro Occidental|Mindoro Oriental|Misamis Occidental|Misamis Oriental|Mountain|Naga|Negros Occidental|Negros Oriental|North Cotabato|Northern Samar|Nueva Ecija|Nueva Vizcaya|Olongapo|Ormoc|Oroquieta|Ozamis|Pagadian|Palawan|Palayan|Pampanga|Pangasinan|Pasay|Puerto Princesa|Quezon|Quezon City|Quirino|Rizal|Romblon|Roxas|Samar|San Carlos (in Negros Occidental)|San Carlos (in Pangasinan)|San Jose|San Pablo|Silay|Siquijor|Sorsogon|South Cotabato|Southern Leyte|Sultan Kudarat|Sulu|Surigao|Surigao del Norte|Surigao del Sur|Tacloban|Tagaytay|Tagbilaran|Tangub|Tarlac|Tawitawi|Toledo|Trece Martires|Zambales|Zamboanga|Zamboanga del Norte|Zamboanga del Sur";
s_a[182]="Pitcaim Islands";
s_a[183]="Dolnoslaskie|Kujawsko-Pomorskie|Lodzkie|Lubelskie|Lubuskie|Malopolskie|Mazowieckie|Opolskie|Podkarpackie|Podlaskie|Pomorskie|Slaskie|Swietokrzyskie|Warminsko-Mazurskie|Wielkopolskie|Zachodniopomorskie";
s_a[184]="Acores (Azores)|Aveiro|Beja|Braga|Braganca|Castelo Branco|Coimbra|Evora|Faro|Guarda|Leiria|Lisboa|Madeira|Portalegre|Porto|Santarem|Setubal|Viana do Castelo|Vila Real|Viseu";
s_a[185]="Adjuntas|Aguada|Aguadilla|Aguas Buenas|Aibonito|Anasco|Arecibo|Arroyo|Barceloneta|Barranquitas|Bayamon|Cabo Rojo|Caguas|Camuy|Canovanas|Carolina|Catano|Cayey|Ceiba|Ciales|Cidra|Coamo|Comerio|Corozal|Culebra|Dorado|Fajardo|Florida|Guanica|Guayama|Guayanilla|Guaynabo|Gurabo|Hatillo|Hormigueros|Humacao|Isabela|Jayuya|Juana Diaz|Juncos|Lajas|Lares|Las Marias|Las Piedras|Loiza|Luquillo|Manati|Maricao|Maunabo|Mayaguez|Moca|Morovis|Naguabo|Naranjito|Orocovis|Patillas|Penuelas|Ponce|Quebradillas|Rincon|Rio Grande|Sabana Grande|Salinas|San German|San Juan|San Lorenzo|San Sebastian|Santa Isabel|Toa Alta|Toa Baja|Trujillo Alto|Utuado|Vega Alta|Vega Baja|Vieques|Villalba|Yabucoa|Yauco";
s_a[186]="Ad Dawhah|Al Ghuwayriyah|Al Jumayliyah|Al Khawr|Al Wakrah|Ar Rayyan|Jarayan al Batinah|Madinat ash Shamal|Umm Salal";
s_a[187]="Reunion";
s_a[188]="Alba|Arad|Arges|Bacau|Bihor|Bistrita-Nasaud|Botosani|Braila|Brasov|Bucuresti|Buzau|Calarasi|Caras-Severin|Cluj|Constanta|Covasna|Dimbovita|Dolj|Galati|Giurgiu|Gorj|Harghita|Hunedoara|Ialomita|Iasi|Maramures|Mehedinti|Mures|Neamt|Olt|Prahova|Salaj|Satu Mare|Sibiu|Suceava|Teleorman|Timis|Tulcea|Vaslui|Vilcea|Vrancea";
s_a[189]="Adygeya (Maykop)|Aginskiy Buryatskiy (Aginskoye)|Altay (Gorno-Altaysk)|Altayskiy (Barnaul)|Amurskaya (Blagoveshchensk)|Arkhangel'skaya|Astrakhanskaya|Bashkortostan (Ufa)|Belgorodskaya|Bryanskaya|Buryatiya (Ulan-Ude)|Chechnya (Groznyy)|Chelyabinskaya|Chitinskaya|Chukotskiy (Anadyr')|Chuvashiya (Cheboksary)|Dagestan (Makhachkala)|Evenkiyskiy (Tura)|Ingushetiya (Nazran')|Irkutskaya|Ivanovskaya|Kabardino-Balkariya (Nal'chik)|Kaliningradskaya|Kalmykiya (Elista)|Kaluzhskaya|Kamchatskaya (Petropavlovsk-Kamchatskiy)|Karachayevo-Cherkesiya (Cherkessk)|Kareliya (Petrozavodsk)|Kemerovskaya|Khabarovskiy|Khakasiya (Abakan)|Khanty-Mansiyskiy (Khanty-Mansiysk)|Kirovskaya|Komi (Syktyvkar)|Komi-Permyatskiy (Kudymkar)|Koryakskiy (Palana)|Kostromskaya|Krasnodarskiy|Krasnoyarskiy|Kurganskaya|Kurskaya|Leningradskaya|Lipetskaya|Magadanskaya|Mariy-El (Yoshkar-Ola)|Mordoviya (Saransk)|Moskovskaya|Moskva (Moscow)|Murmanskaya|Nenetskiy (Nar'yan-Mar)|Nizhegorodskaya|Novgorodskaya|Novosibirskaya|Omskaya|Orenburgskaya|Orlovskaya (Orel)|Penzenskaya|Permskaya|Primorskiy (Vladivostok)|Pskovskaya|Rostovskaya|Ryazanskaya|Sakha (Yakutsk)|Sakhalinskaya (Yuzhno-Sakhalinsk)|Samarskaya|Sankt-Peterburg (Saint Petersburg)|Saratovskaya|Severnaya Osetiya-Alaniya [North Ossetia] (Vladikavkaz)|Smolenskaya|Stavropol'skiy|Sverdlovskaya (Yekaterinburg)|Tambovskaya|Tatarstan (Kazan')|Taymyrskiy (Dudinka)|Tomskaya|Tul'skaya|Tverskaya|Tyumenskaya|Tyva (Kyzyl)|Udmurtiya (Izhevsk)|Ul'yanovskaya|Ust'-Ordynskiy Buryatskiy (Ust'-Ordynskiy)|Vladimirskaya|Volgogradskaya|Vologodskaya|Voronezhskaya|Yamalo-Nenetskiy (Salekhard)|Yaroslavskaya|Yevreyskaya";
s_a[190]="Butare|Byumba|Cyangugu|Gikongoro|Gisenyi|Gitarama|Kibungo|Kibuye|Kigali Rurale|Kigali-ville|Ruhengeri|Umutara";
s_a[191]="Ascension|Saint Helena|Tristan da Cunha";
s_a[192]="Christ Church Nichola Town|Saint Anne Sandy Point|Saint George Basseterre|Saint George Gingerland|Saint James Windward|Saint John Capisterre|Saint John Figtree|Saint Mary Cayon|Saint Paul Capisterre|Saint Paul Charlestown|Saint Peter Basseterre|Saint Thomas Lowland|Saint Thomas Middle Island|Trinity Palmetto Point";
s_a[193]="Anse-la-Raye|Castries|Choiseul|Dauphin|Dennery|Gros Islet|Laborie|Micoud|Praslin|Soufriere|Vieux Fort";
s_a[194]="Miquelon|Saint Pierre";
s_a[195]="Charlotte|Grenadines|Saint Andrew|Saint David|Saint George|Saint Patrick";
s_a[196]="A'ana|Aiga-i-le-Tai|Atua|Fa'asaleleaga|Gaga'emauga|Gagaifomauga|Palauli|Satupa'itea|Tuamasaga|Va'a-o-Fonoti|Vaisigano";
s_a[197]="Acquaviva|Borgo Maggiore|Chiesanuova|Domagnano|Faetano|Fiorentino|Monte Giardino|San Marino|Serravalle";
s_a[198]="Principe|Sao Tome";
s_a[199]="'Asir|Al Bahah|Al Hudud ash Shamaliyah|Al Jawf|Al Madinah|Al Qasim|Ar Riyad|Ash Sharqiyah (Eastern Province)|Ha'il|Jizan|Makkah|Najran|Tabuk";
s_a[200]="Aberdeen City|Aberdeenshire|Angus|Argyll and Bute|City of Edinburgh|Clackmannanshire|Dumfries and Galloway|Dundee City|East Ayrshire|East Dunbartonshire|East Lothian|East Renfrewshire|Eilean Siar (Western Isles)|Falkirk|Fife|Glasgow City|Highland|Inverclyde|Midlothian|Moray|North Ayrshire|North Lanarkshire|Orkney Islands|Perth and Kinross|Renfrewshire|Shetland Islands|South Ayrshire|South Lanarkshire|Stirling|The Scottish Borders|West Dunbartonshire|West Lothian";
s_a[201]="Dakar|Diourbel|Fatick|Kaolack|Kolda|Louga|Saint-Louis|Tambacounda|Thies|Ziguinchor";
s_a[202]="Anse aux Pins|Anse Boileau|Anse Etoile|Anse Louis|Anse Royale|Baie Lazare|Baie Sainte Anne|Beau Vallon|Bel Air|Bel Ombre|Cascade|Glacis|Grand' Anse (on Mahe)|Grand' Anse (on Praslin)|La Digue|La Riviere Anglaise|Mont Buxton|Mont Fleuri|Plaisance|Pointe La Rue|Port Glaud|Saint Louis|Takamaka";
s_a[203]="Eastern|Northern|Southern|Western";
s_a[204]="Singapore";
s_a[205]="Banskobystricky|Bratislavsky|Kosicky|Nitriansky|Presovsky|Trenciansky|Trnavsky|Zilinsky";
s_a[206]="Ajdovscina|Beltinci|Bled|Bohinj|Borovnica|Bovec|Brda|Brezice|Brezovica|Cankova-Tisina|Celje|Cerklje na Gorenjskem|Cerknica|Cerkno|Crensovci|Crna na Koroskem|Crnomelj|Destrnik-Trnovska Vas|Divaca|Dobrepolje|Dobrova-Horjul-Polhov Gradec|Dol pri Ljubljani|Domzale|Dornava|Dravograd|Duplek|Gorenja Vas-Poljane|Gorisnica|Gornja Radgona|Gornji Grad|Gornji Petrovci|Grosuplje|Hodos Salovci|Hrastnik|Hrpelje-Kozina|Idrija|Ig|Ilirska Bistrica|Ivancna Gorica|Izola|Jesenice|Jursinci|Kamnik|Kanal|Kidricevo|Kobarid|Kobilje|Kocevje|Komen|Koper|Kozje|Kranj|Kranjska Gora|Krsko|Kungota|Kuzma|Lasko|Lenart|Lendava|Litija|Ljubljana|Ljubno|Ljutomer|Logatec|Loska Dolina|Loski Potok|Luce|Lukovica|Majsperk|Maribor|Medvode|Menges|Metlika|Mezica|Miren-Kostanjevica|Mislinja|Moravce|Moravske Toplice|Mozirje|Murska Sobota|Muta|Naklo|Nazarje|Nova Gorica|Novo Mesto|Odranci|Ormoz|Osilnica|Pesnica|Piran|Pivka|Podcetrtek|Podvelka-Ribnica|Postojna|Preddvor|Ptuj|Puconci|Race-Fram|Radece|Radenci|Radlje ob Dravi|Radovljica|Ravne-Prevalje|Ribnica|Rogasevci|Rogaska Slatina|Rogatec|Ruse|Semic|Sencur|Sentilj|Sentjernej|Sentjur pri Celju|Sevnica|Sezana|Skocjan|Skofja Loka|Skofljica|Slovenj Gradec|Slovenska Bistrica|Slovenske Konjice|Smarje pri Jelsah|Smartno ob Paki|Sostanj|Starse|Store|Sveti Jurij|Tolmin|Trbovlje|Trebnje|Trzic|Turnisce|Velenje|Velike Lasce|Videm|Vipava|Vitanje|Vodice|Vojnik|Vrhnika|Vuzenica|Zagorje ob Savi|Zalec|Zavrc|Zelezniki|Ziri|Zrece";
s_a[207]="Bellona|Central|Choiseul (Lauru)|Guadalcanal|Honiara|Isabel|Makira|Malaita|Rennell|Temotu|Western";
s_a[208]="Awdal|Bakool|Banaadir|Bari|Bay|Galguduud|Gedo|Hiiraan|Jubbada Dhexe|Jubbada Hoose|Mudug|Nugaal|Sanaag|Shabeellaha Dhexe|Shabeellaha Hoose|Sool|Togdheer|Woqooyi Galbeed";
s_a[209]="Eastern Cape|Free State|Gauteng|KwaZulu-Natal|Mpumalanga|North-West|Northern Cape|Northern Province|Western Cape";
s_a[210]="Bird Island|Bristol Island|Clerke Rocks|Montagu Island|Saunders Island|South Georgia|Southern Thule|Traversay Islands";
s_a[211]="Andalucia|Aragon|Asturias|Baleares (Balearic Islands)|Canarias (Canary Islands)|Cantabria|Castilla y Leon|Castilla-La Mancha|Cataluna|Ceuta|Communidad Valencian|Extremadura|Galicia|Islas Chafarinas|La Rioja|Madrid|Melilla|Murcia|Navarra|Pais Vasco (Basque Country)|Penon de Alhucemas|Penon de Velez de la Gomera";
s_a[212]="Spratly Islands";
s_a[213]="Central|Eastern|North Central|North Eastern|North Western|Northern|Sabaragamuwa|Southern|Uva|Western";
s_a[214]="A'ali an Nil|Al Bahr al Ahmar|Al Buhayrat|Al Jazirah|Al Khartum|Al Qadarif|Al Wahdah|An Nil al Abyad|An Nil al Azraq|Ash Shamaliyah|Bahr al Jabal|Gharb al Istiwa'iyah|Gharb Bahr al Ghazal|Gharb Darfur|Gharb Kurdufan|Janub Darfur|Janub Kurdufan|Junqali|Kassala|Nahr an Nil|Shamal Bahr al Ghazal|Shamal Darfur|Shamal Kurdufan|Sharq al Istiwa'iyah|Sinnar|Warab";
s_a[215]="Brokopondo|Commewijne|Coronie|Marowijne|Nickerie|Para|Paramaribo|Saramacca|Sipaliwini|Wanica";
s_a[216]="Barentsoya|Bjornoya|Edgeoya|Hopen|Kvitoya|Nordaustandet|Prins Karls Forland|Spitsbergen";
s_a[217]="Hhohho|Lubombo|Manzini|Shiselweni";
s_a[218]="Blekinge|Dalarnas|Gavleborgs|Gotlands|Hallands|Jamtlands|Jonkopings|Kalmar|Kronobergs|Norrbottens|Orebro|Ostergotlands|Skane|Sodermanlands|Stockholms|Uppsala|Varmlands|Vasterbottens|Vasternorrlands|Vastmanlands|Vastra Gotalands";
s_a[219]="Aargau|Ausser-Rhoden|Basel-Landschaft|Basel-Stadt|Bern|Fribourg|Geneve|Glarus|Graubunden|Inner-Rhoden|Jura|Luzern|Neuchatel|Nidwalden|Obwalden|Sankt Gallen|Schaffhausen|Schwyz|Solothurn|Thurgau|Ticino|Uri|Valais|Vaud|Zug|Zurich";
s_a[220]="Al Hasakah|Al Ladhiqiyah|Al Qunaytirah|Ar Raqqah|As Suwayda'|Dar'a|Dayr az Zawr|Dimashq|Halab|Hamah|Hims|Idlib|Rif Dimashq|Tartus";
s_a[221]="Chang-hua|Chi-lung|Chia-i|Chia-i|Chung-hsing-hsin-ts'un|Hsin-chu|Hsin-chu|Hua-lien|I-lan|Kao-hsiung|Kao-hsiung|Miao-li|Nan-t'ou|P'eng-hu|P'ing-tung|T'ai-chung|T'ai-chung|T'ai-nan|T'ai-nan|T'ai-pei|T'ai-pei|T'ai-tung|T'ao-yuan|Yun-lin";
s_a[222]="Viloyati Khatlon|Viloyati Leninobod|Viloyati Mukhtori Kuhistoni Badakhshon";
s_a[223]="Arusha|Dar es Salaam|Dodoma|Iringa|Kagera|Kigoma|Kilimanjaro|Lindi|Mara|Mbeya|Morogoro|Mtwara|Mwanza|Pemba North|Pemba South|Pwani|Rukwa|Ruvuma|Shinyanga|Singida|Tabora|Tanga|Zanzibar Central/South|Zanzibar North|Zanzibar Urban/West";
s_a[224]="Amnat Charoen|Ang Thong|Buriram|Chachoengsao|Chai Nat|Chaiyaphum|Chanthaburi|Chiang Mai|Chiang Rai|Chon Buri|Chumphon|Kalasin|Kamphaeng Phet|Kanchanaburi|Khon Kaen|Krabi|Krung Thep Mahanakhon (Bangkok)|Lampang|Lamphun|Loei|Lop Buri|Mae Hong Son|Maha Sarakham|Mukdahan|Nakhon Nayok|Nakhon Pathom|Nakhon Phanom|Nakhon Ratchasima|Nakhon Sawan|Nakhon Si Thammarat|Nan|Narathiwat|Nong Bua Lamphu|Nong Khai|Nonthaburi|Pathum Thani|Pattani|Phangnga|Phatthalung|Phayao|Phetchabun|Phetchaburi|Phichit|Phitsanulok|Phra Nakhon Si Ayutthaya|Phrae|Phuket|Prachin Buri|Prachuap Khiri Khan|Ranong|Ratchaburi|Rayong|Roi Et|Sa Kaeo|Sakon Nakhon|Samut Prakan|Samut Sakhon|Samut Songkhram|Sara Buri|Satun|Sing Buri|Sisaket|Songkhla|Sukhothai|Suphan Buri|Surat Thani|Surin|Tak|Trang|Trat|Ubon Ratchathani|Udon Thani|Uthai Thani|Uttaradit|Yala|Yasothon";
s_a[225]="Tobago";
s_a[226]="De La Kara|Des Plateaux|Des Savanes|Du Centre|Maritime";
s_a[227]="Atafu|Fakaofo|Nukunonu";
s_a[228]="Ha'apai|Tongatapu|Vava'u";
s_a[229]="Arima|Caroni|Mayaro|Nariva|Port-of-Spain|Saint Andrew|Saint David|Saint George|Saint Patrick|San Fernando|Victoria";
s_a[230]="Ariana|Beja|Ben Arous|Bizerte|El Kef|Gabes|Gafsa|Jendouba|Kairouan|Kasserine|Kebili|Mahdia|Medenine|Monastir|Nabeul|Sfax|Sidi Bou Zid|Siliana|Sousse|Tataouine|Tozeur|Tunis|Zaghouan";
s_a[231]="Adana|Adiyaman|Afyon|Agri|Aksaray|Amasya|Ankara|Antalya|Ardahan|Artvin|Aydin|Balikesir|Bartin|Batman|Bayburt|Bilecik|Bingol|Bitlis|Bolu|Burdur|Bursa|Canakkale|Cankiri|Corum|Denizli|Diyarbakir|Duzce|Edirne|Elazig|Erzincan|Erzurum|Eskisehir|Gaziantep|Giresun|Gumushane|Hakkari|Hatay|Icel|Igdir|Isparta|Istanbul|Izmir|Kahramanmaras|Karabuk|Karaman|Kars|Kastamonu|Kayseri|Kilis|Kirikkale|Kirklareli|Kirsehir|Kocaeli|Konya|Kutahya|Malatya|Manisa|Mardin|Mugla|Mus|Nevsehir|Nigde|Ordu|Osmaniye|Rize|Sakarya|Samsun|Sanliurfa|Siirt|Sinop|Sirnak|Sivas|Tekirdag|Tokat|Trabzon|Tunceli|Usak|Van|Yalova|Yozgat|Zonguldak";
s_a[232]="Ahal Welayaty|Balkan Welayaty|Dashhowuz Welayaty|Lebap Welayaty|Mary Welayaty";
s_a[233]="Tuvalu";
s_a[234]="Adjumani|Apac|Arua|Bugiri|Bundibugyo|Bushenyi|Busia|Gulu|Hoima|Iganga|Jinja|Kabale|Kabarole|Kalangala|Kampala|Kamuli|Kapchorwa|Kasese|Katakwi|Kibale|Kiboga|Kisoro|Kitgum|Kotido|Kumi|Lira|Luwero|Masaka|Masindi|Mbale|Mbarara|Moroto|Moyo|Mpigi|Mubende|Mukono|Nakasongola|Nebbi|Ntungamo|Pallisa|Rakai|Rukungiri|Sembabule|Soroti|Tororo";
s_a[235]="Avtonomna Respublika Krym (Simferopol')|Cherkas'ka (Cherkasy)|Chernihivs'ka (Chernihiv)|Chernivets'ka (Chernivtsi)|Dnipropetrovs'ka (Dnipropetrovs'k)|Donets'ka (Donets'k)|Ivano-Frankivs'ka (Ivano-Frankivs'k)|Kharkivs'ka (Kharkiv)|Khersons'ka (Kherson)|Khmel'nyts'ka (Khmel'nyts'kyy)|Kirovohrads'ka (Kirovohrad)|Kyyiv|Kyyivs'ka (Kiev)|L'vivs'ka (L'viv)|Luhans'ka (Luhans'k)|Mykolayivs'ka (Mykolayiv)|Odes'ka (Odesa)|Poltavs'ka (Poltava)|Rivnens'ka (Rivne)|Sevastopol'|Sums'ka (Sumy)|Ternopil's'ka (Ternopil')|Vinnyts'ka (Vinnytsya)|Volyns'ka (Luts'k)|Zakarpats'ka (Uzhhorod)|Zaporiz'ka (Zaporizhzhya)|Zhytomyrs'ka (Zhytomyr)";
s_a[236]="'Ajman|Abu Zaby (Abu Dhabi)|Al Fujayrah|Ash Shariqah (Sharjah)|Dubayy (Dubai)|Ra's al Khaymah|Umm al Qaywayn";
s_a[237]="Barking and Dagenham|Barnet|Barnsley|Bath and North East Somerset|Bedfordshire|Bexley|Birmingham|Blackburn with Darwen|Blackpool|Bolton|Bournemouth|Bracknell Forest|Bradford|Brent|Brighton and Hove|Bromley|Buckinghamshire|Bury|Calderdale|Cambridgeshire|Camden|Cheshire|City of Bristol|City of Kingston upon Hull|City of London|Cornwall|Coventry|Croydon|Cumbria|Darlington|Derby|Derbyshire|Devon|Doncaster|Dorset|Dudley|Durham|Ealing|East Riding of Yorkshire|East Sussex|Enfield|Essex|Gateshead|Gloucestershire|Greenwich|Hackney|Halton|Hammersmith and Fulham|Hampshire|Haringey|Harrow|Hartlepool|Havering|Herefordshire|Hertfordshire|Hillingdon|Hounslow|Isle of Wight|Islington|Kensington and Chelsea|Kent|Kingston upon Thames|Kirklees|Knowsley|Lambeth|Lancashire|Leeds|Leicester|Leicestershire|Lewisham|Lincolnshire|Liverpool|Luton|Manchester|Medway|Merton|Middlesbrough|Milton Keynes|Newcastle upon Tyne|Newham|Norfolk|North East Lincolnshire|North Lincolnshire|North Somerset|North Tyneside|North Yorkshire|Northamptonshire|Northumberland|Nottingham|Nottinghamshire|Oldham|Oxfordshire|Peterborough|Plymouth|Poole|Portsmouth|Reading|Redbridge|Redcar and Cleveland|Richmond upon Thames|Rochdale|Rotherham|Rutland|Salford|Sandwell|Sefton|Sheffield|Shropshire|Slough|Solihull|Somerset|South Gloucestershire|South Tyneside|Southampton|Southend-on-Sea|Southwark|St. Helens|Staffordshire|Stockport|Stockton-on-Tees|Stoke-on-Trent|Suffolk|Sunderland|Surrey|Sutton|Swindon|Tameside|Telford and Wrekin|Thurrock|Torbay|Tower Hamlets|Trafford|Wakefield|Walsall|Waltham Forest|Wandsworth|Warrington|Warwickshire|West Berkshire|West Sussex|Westminster|Wigan|Wiltshire|Windsor and Maidenhead|Wirral|Wokingham|Wolverhampton|Worcestershire|York";
s_a[238]="Artigas|Canelones|Cerro Largo|Colonia|Durazno|Flores|Florida|Lavalleja|Maldonado|Montevideo|Paysandu|Rio Negro|Rivera|Rocha|Salto|San Jose|Soriano|Tacuarembo|Treinta y Tres";
s_a[239]="Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|District of Columbia|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming";
s_a[240]="Andijon Wiloyati|Bukhoro Wiloyati|Farghona Wiloyati|Jizzakh Wiloyati|Khorazm Wiloyati (Urganch)|Namangan Wiloyati|Nawoiy Wiloyati|Qashqadaryo Wiloyati (Qarshi)|Qoraqalpoghiston (Nukus)|Samarqand Wiloyati|Sirdaryo Wiloyati (Guliston)|Surkhondaryo Wiloyati (Termiz)|Toshkent Shahri|Toshkent Wiloyati";
s_a[241]="Malampa|Penama|Sanma|Shefa|Tafea|Torba";
s_a[242]="Amazonas|Anzoategui|Apure|Aragua|Barinas|Bolivar|Carabobo|Cojedes|Delta Amacuro|Dependencias Federales|Distrito Federal|Falcon|Guarico|Lara|Merida|Miranda|Monagas|Nueva Esparta|Portuguesa|Sucre|Tachira|Trujillo|Vargas|Yaracuy|Zulia";
s_a[243]="An Giang|Ba Ria-Vung Tau|Bac Giang|Bac Kan|Bac Lieu|Bac Ninh|Ben Tre|Binh Dinh|Binh Duong|Binh Phuoc|Binh Thuan|Ca Mau|Can Tho|Cao Bang|Da Nang|Dac Lak|Dong Nai|Dong Thap|Gia Lai|Ha Giang|Ha Nam|Ha Noi|Ha Tay|Ha Tinh|Hai Duong|Hai Phong|Ho Chi Minh|Hoa Binh|Hung Yen|Khanh Hoa|Kien Giang|Kon Tum|Lai Chau|Lam Dong|Lang Son|Lao Cai|Long An|Nam Dinh|Nghe An|Ninh Binh|Ninh Thuan|Phu Tho|Phu Yen|Quang Binh|Quang Nam|Quang Ngai|Quang Ninh|Quang Tri|Soc Trang|Son La|Tay Ninh|Thai Binh|Thai Nguyen|Thanh Hoa|Thua Thien-Hue|Tien Giang|Tra Vinh|Tuyen Quang|Vinh Long|Vinh Phuc|Yen Bai";
s_a[244]="Saint Croix|Saint John|Saint Thomas";
s_a[245]="Blaenau Gwent|Bridgend|Caerphilly|Cardiff|Carmarthenshire|Ceredigion|Conwy|Denbighshire|Flintshire|Gwynedd|Isle of Anglesey|Merthyr Tydfil|Monmouthshire|Neath Port Talbot|Newport|Pembrokeshire|Powys|Rhondda Cynon Taff|Swansea|The Vale of Glamorgan|Torfaen|Wrexham";
s_a[246]="Alo|Sigave|Wallis";
s_a[247]="West Bank";
s_a[248]="Western Sahara";
s_a[249]="'Adan|'Ataq|Abyan|Al Bayda'|Al Hudaydah|Al Jawf|Al Mahrah|Al Mahwit|Dhamar|Hadhramawt|Hajjah|Ibb|Lahij|Ma'rib|Sa'dah|San'a'|Ta'izz";
s_a[250]="Kosovo|Montenegro|Serbia|Vojvodina";
s_a[251]="Central|Copperbelt|Eastern|Luapula|Lusaka|North-Western|Northern|Southern|Western";
s_a[252]="Bulawayo|Harare|ManicalandMashonaland Central|Mashonaland East|Mashonaland West|Masvingo|Matabeleland North|Matabeleland South|Midlands";

function populateStates( countryElementId, stateElementId ){
	
	var selectedCountryIndex = document.getElementById( countryElementId ).selectedIndex;

	var stateElement = document.getElementById( stateElementId );
	
	stateElement.length=0;	// Fixed by Julian Woods
	stateElement.options[0] = new Option('Select State','');
	stateElement.options[0].disabled = true;
	stateElement.selectedIndex = 0;
	
	var state_arr = s_a[selectedCountryIndex].split("|");
	
	for (var i=0; i<state_arr.length; i++) {
		stateElement.options[stateElement.length] = new Option(state_arr[i],state_arr[i]);
	}
}

function populateCountries(countryElementId, stateElementId){
	// given the id of the <select> tag as function argument, it inserts <option> tags
	var countryElement = document.getElementById(countryElementId);
	countryElement.length=0;
	countryElement.options[0] = new Option('Select Country','');
	countryElement.options[0].disabled = true;
	countryElement.selectedIndex = 0;
	
	for (var i=0; i<country_arr.length; i++) {
		countryElement.options[countryElement.length] = new Option(country_arr[i],country_short_arr[i]);
		if(country_short_arr[i] == 'US') {
			countryElement.selectedIndex = i + 1;
		}
	}

	// Assigned all countries. Now assign event listener for the states.

	if(countryElement.selectedIndex >= 0) {
		populateStates( countryElementId, stateElementId );
	}
	
	if( stateElementId ){
		countryElement.onchange = function(){
			populateStates( countryElementId, stateElementId );
		};
	}
}

function populateCountries(countryElementId) {
	var countryElement = document.getElementById(countryElementId);
	countryElement.length=0;
	countryElement.options[0] = new Option('Select Country','');
	countryElement.options[0].disabled = true;
	countryElement.selectedIndex = 0;
	
	for (var i=0; i<country_arr.length; i++) {
		if(country_arr.indexOf(country_arr[i]) != -1) {
			countryElement.options[countryElement.length] = new Option(country_arr[i],country_short_arr[i]);
			if(country_short_arr[i] == 'US') {
				countryElement.selectedIndex = i + 1;
			}
		}
	}
}

function allowedPopulateCountries(countryElementId, stateElementId) {
	var countryElement = document.getElementById(countryElementId);
	countryElement.length=0;
	countryElement.options[0] = new Option('Select Country','');
	countryElement.options[0].disabled = true;
	countryElement.selectedIndex = 0;
	
	for (var i=0; i<country_arr.length; i++) {
		if(country_arr.indexOf(country_arr[i]) != -1) {
			countryElement.options[countryElement.length] = new Option(country_arr[i],country_short_arr[i]);
			if(country_short_arr[i] == 'US') {
				countryElement.selectedIndex = i + 1;
			}
		}
	}
	
	if(countryElement.selectedIndex >= 0) {
		populateStates( countryElementId, stateElementId );
	}
	
	if( stateElementId ){
		countryElement.onchange = function(){
			allowedPopulateStates( countryElementId, stateElementId );
		};
	}
}

function allowedPopulateStates(countryElementId, stateElementId) {
	var countryElement = document.getElementById( countryElementId );
	
	var selectedCountryIndex = country_arr.indexOf(countryElement.options[countryElement.selectedIndex].text) + 1;

	var stateElement = document.getElementById( stateElementId );
	
	stateElement.length=0;	// Fixed by Julian Woods
	stateElement.options[0] = new Option('Select State','');
	stateElement.options[0].disabled = true;
	stateElement.selectedIndex = 0;
	
	var state_arr = s_a[selectedCountryIndex].split("|");
	
	for (var i=0; i<state_arr.length; i++) {
		stateElement.options[stateElement.length] = new Option(state_arr[i],state_arr[i]);
	}
}

function selectPopulatedState(countryElementId, stateElementId, country, state) {
	allowedPopulateCountries(countryElementId, stateElementId);
	
	if(country !== null && country.length !== -1) {
		var countryElement = document.getElementById( countryElementId );
		
		for(var i = 0, j = countryElement.options.length; i < j; ++i) {
	        if(countryElement.options[i].innerHTML === country) {
	        	countryElement.selectedIndex = i;
	        	break;
	        }
	    }
	}
	
	if(state !== null && state.length !== -1) {
		allowedPopulateStates(countryElementId, stateElementId);
		var stateElement = document.getElementById( stateElementId );
		
		for(var k = 0, l = stateElement.options.length; k < l; ++k) {
	        if(stateElement.options[k].innerHTML === state) {
	        	stateElement.selectedIndex = k;
	        	break;
	        }
	    }
	}
}

function selectPopulatedStateWith2LetterCountry(countryElementId, stateElementId, country, state) {
	allowedPopulateCountries(countryElementId, stateElementId);
	
	if(country !== null && country.length !== -1) {
		var countryElement = document.getElementById( countryElementId );
		
		for(var i = 0, j = countryElement.options.length; i < j; ++i) {
	        if(countryElement.options[i].value === country) {
	        	countryElement.selectedIndex = i;
	        	break;
	        }
	    }
	}
	
	if(state !== null && state.length !== -1) {
		allowedPopulateStates(countryElementId, stateElementId);
		var stateElement = document.getElementById( stateElementId );
		
		for(var k = 0, l = stateElement.options.length; k < l; ++k) {
	        if(stateElement.options[k].innerHTML === state) {
	        	stateElement.selectedIndex = k;
	        	break;
	        }
	    }
	}
}

function selectPopulated2LetterCountry(countryElementId, country) {
	populateCountries(countryElementId);
	
	if(country !== null && country.length !== -1) {
		var countryElement = document.getElementById( countryElementId );
		
		for(var i = 0, j = countryElement.options.length; i < j; ++i) {
			if(typeof country !== 'undefined') {
				if(countryElement.options[i].value === country) {
					countryElement.selectedIndex = i;
					break;
				}
			}
	    }
	}
}

function selectPopulatedrCountry(countryElementId, country) {
	populateCountries(countryElementId);
	
	if(country !== null && country.length !== -1) {
		var countryElement = document.getElementById( countryElementId );
		
		for(var i = 0, j = countryElement.options.length; i < j; ++i) {
			if(typeof country !== 'undefined') {
				if(countryElement.options[i].innerHTML === country) {
					countryElement.selectedIndex = i;
					break;
				}
			}
	    }
	}
}

function selectPopulateStatesUnitedStates(stateElementClass) {
	//var stateElement = document.getElementById( stateElementId );
	var stateElements = document.getElementsByClassName(stateElementClass);
	
	for (var int = 0; int < stateElements.length; int++) {
		
		var stateElement = stateElements[int];
		
		stateElement.length = 0;
		stateElement.options[0] = new Option('Select State','');
		stateElement.options[0].disabled = true;
		stateElement.selectedIndex = 0;
		
		var state_arr = s_a[country_arr.indexOf("United States") + 1].split("|");
		
		for (var i = 0; i < state_arr.length; i++) {
			stateElement.options[stateElement.length] = new Option(state_arr[i], state_arr[i]);
		}
	}
	
}


function initializeStateCountrySelects( countryElement, stateElement, selectedCountry, selectedState ){
	countryElement.length=0;
	countryElement.options[0] = new Option('Country','');
	countryElement.options[0].disabled = true;
	countryElement.selectedIndex = 0;
	
	for (var i=0; i<country_arr.length; i++) {
		if(country_arr.indexOf(country_arr[i]) != -1) {
			countryElement.options[countryElement.length] = new Option(country_arr[i],country_short_arr[i]);
			if(country_short_arr[i] == 'US') {
				countryElement.selectedIndex = i + 1;
			}
		}
	}
	
	if(countryElement.selectedIndex >= 0) {
		populateStateSelects( countryElement, stateElement );
	}
	
	if( stateElement ){
		countryElement.onchange = function(){
			populateStateSelects( countryElement, stateElement );
		};
	}
	
	if(selectedCountry !== null && selectedCountry.length !== -1) {
		for(var k = 0, l = countryElement.options.length; k < l; ++k) {
	        if(countryElement.options[k].value === selectedCountry) {
	        	countryElement.selectedIndex = k;
	        	break;
	        }
	    }
	}
	if(selectedState !== null && selectedState.length !== -1) {
		if( selectedState.length === 2 && us_state_abbrevs.hasOwnProperty(selectedState) ){
			selectedState = us_state_abbrevs[selectedState];
        }
		//populateStateSelects( countryElement, stateElement );		
		for(var m = 0, n = stateElement.options.length; m < n; ++m) {
	        if(stateElement.options[m].innerHTML === selectedState) {
	        	stateElement.selectedIndex = m;
	        	break;
	        }
	    }
	}
}

function populateStateSelects( countryElement, stateElement ){
	var selectedCountryIndex = country_arr.indexOf(countryElement.options[countryElement.selectedIndex].text) + 1;

	stateElement.length=0;	// Fixed by Julian Woods
	stateElement.options[0] = new Option('State','');
	stateElement.options[0].disabled = true;
	stateElement.selectedIndex = 0;
	
	var state_arr = s_a[selectedCountryIndex].split("|");
	
	for (var i=0; i<state_arr.length; i++) {
		stateElement.options[stateElement.length] = new Option(state_arr[i],state_arr[i]);
	}
};;(function($) {
	'use strict';
	$.widget("w.pagination",{
		options: {
			pageMin: '1',
			resetPageOnFilterChange: true,
			ajaxData: {
				page: '1',
				size: '10'
			},
			typeToFilterDelay: 500, //Time to wait until the user finishes type to search on inputs with class type-to-filter
			successEventHandlers:  function() {},
			onSuccess: function(data){
				var self = this,
				$elem = $(self.element);
				//Keep multiple instances of pages in sync
				if( self.options.pageClass ){
					var pagesHtml = $(data).find('.'+self.options.pageClass).filter(':first').html() || $(data).filter('.'+self.options.pageClass).filter(':first').html();
					$('.'+self.options.pageClass).each(function(){
						$(this).html( pagesHtml );
						$(this).pagination('option', 'ajaxData', self.options.ajaxData );
						$(this).pagination('bindEvents');
					});
				} else{
					$elem.html( $(data).find( '#'+$elem.attr('id') ).html() || $(data).filter( '#'+$elem.attr('id') ).html() );					
				}
				self.options.container.html( $(data).find( '#'+self.options.container.attr('id') ).html() || $(data).filter( '#'+self.options.container.attr('id') ).html() );
			},
			onError: function(jqXHR, textStatus, errorThrown){
				console.log('jqXHR : '+jqXHR);
			},
			postSuccess: function(){}
		},
		_create: function() {
			var self = this;
			self.typeToFilterTimer={};
			//Container set to option passed in or element with id defined in data-container
			self.options.container = self.options.container || $('#'+$(self.element).data('container') );
			//Ajax URL set to option passed or defined in data-href or defaults to location.href 
			self.options.url = self.options.url || $(self.element).data('href') || location.href;
			
		},
		_init: function() {
			var self = this;
			self.bindEvents();
			self.options.pageMax = $(self.element).find('.jump-to').data('max') || null;
			//Load initial Ajax Data 
			self._initialAjaxData();
		},
		 _setOption: function( key, value ) {
			 switch(key) {
			 
			 }
		 },
		_initialAjaxData: function(){
			var self = this;
			$('.'+self.options.filterClass).each(function(){
				if( $(this).is('[type=text], [type=number]') ){
					self.options.ajaxData[$(this).data('filter')] = $(this).val();
				}else if( $(this).is('select') ){
					self.options.ajaxData[$(this).data('filter')] = $(this).find('option:selected').val();
				}else if( $(this).is('[type=hidden]') ){
					self.options.ajaxData[$(this).data('filter')] = $(this).val();
				}else if( $(this).hasClass('search-btn') ){
					self.options.ajaxData[$(this).prev().data('filter')] = $(this).prev().val();
				}else if( $(this).hasClass('toggle') && $(this).hasClass('active') ){
					console.log(['initialAjaxData for toggle', $(this), $(this).data('filter'), $(this).data('filter'), $('.'+self.options.filterClass+'.toggle.active[data-filter="'+$(this).data('filter')+'"]').data('val') ]);
					self.options.ajaxData[$(this).data('filter')] = $(this).data('val');
				}else{
					console.log('Unaccounted for type');
					console.log($(this));
				}
			});
			self.options.ajaxData.page = self._cleanPage( self.options.ajaxData.page );
		},
		_loadFilterPage: function() {
			var self = this;
			if( self.options.resetPageOnFilterChange ){
				self.options.ajaxData.page = 1;
			}
			self.loadPage();
		},
		_cleanPage: function(page) {
			var self = this,
				pageMin = parseInt(this.options.pageMin),
				pageMax = parseInt(this.options.pageMax);
			page = parseInt(page);
			if( !$.isNumeric(page) || page < pageMin ){
				return pageMin;
			}
			if( $.isNumeric(pageMax) && page > pageMax ){
				return pageMax;
			}
			return page;
		},
		bindEvents: function() {
			var self = this,
			$elem = $(self.element);
			$elem.find('.pageroo').click( function(e){
				if( $(this).hasClass('disabled') ){
					e.preventDefault();
				}else{
					self.loadPage({page: $(this).data('page')});
				}
			});
			$elem.find('.jump-to').on({
				keyup: function(e){
					if( e.which === 13 ){ 
						self.loadPage( {
							page: $(this).val() 
						});
					}
				},
				blur: function(e){
					self.loadPage( {
						page: $(this).val() 
					});
				}
			});
			if( self.options.filterClass ){
				$('.'+self.options.filterClass).each(function(){
					//if( !$(this).hasClass(self.options.filterClass+'-activated') ){
						if( $(this).is('[type=text],[type=number]') ){
							$(this).off('keypress.pagination');
							$(this).on('keypress.pagination', function(e){
								if( e.which === 13 ){
									clearTimeout( self.typeToFilterTimer );
									self._loadFilterPage();
								}
							});
							$(this).off('keyup.pagination');
							$(this).on('keyup.pagination', function(e){
								if( $(this).hasClass('type-to-filter') && e.which !== 13 ){
									clearTimeout( self.typeToFilterTimer );
									self.typeToFilterTimer = setTimeout( function(){
										self._loadFilterPage();
									}, self.options.typeToFilterDelay );
								}
							});
							if( $(this).hasClass('search-on-change') ){
								$(this).off('change.pagination');
								$(this).on('change.pagination', function(){							
									self._loadFilterPage();
								});
							}
						}
						if( $(this).is('select') ){
							$(this).off('change.pagination');
							$(this).on('change.pagination', function(){
								self.options.ajaxData[$(this).data('filter')] = $(this).find('option:selected').val();
								self._loadFilterPage();
							});
						}
						if( $(this).hasClass('search-btn') ){
							$(this).off('click.pagination');
							$(this).on('click.pagination', function(){							
								self._loadFilterPage();
							});
						}
						if( $(this).hasClass('toggle') ){
							$(this).off('click.pagination');
							$(this).on('click.pagination', function(){
								$('.'+self.options.filterClass+'.toggle.active[data-filter="'+$(this).data('filter')+'"]').removeClass('active');
								self.options.ajaxData[$(this).data('filter')] = $(this).data('val');
								$(this).addClass('active');
								self._loadFilterPage();
							});
						}
						$(this).addClass(self.options.filterClass+'-activated');
					//}
				});
			}
		},
		loadPage: function(data) {
			var self = this;
			//Load the current values from input fields.
			$('.'+self.options.filterClass+'[type=text], .'+self.options.filterClass+'[type=number], .'+self.options.filterClass+'.update-on-change[type=hidden]').each(function(){
				self.options.ajaxData[$(this).data('filter')] = $(this).val();
			});
			//Override any input fields with values explictly passed in.
			self.options.ajaxData = $.extend( self.options.ajaxData, data);
			self.options.ajaxData.page = self._cleanPage( self.options.ajaxData.page );
			
			console.log(['Pagination load page called with options:', self.options]);
			if( self.options.overrideLoadFunction !== undefined ){
				self.options.overrideLoadFunction.call( self, self.options );
			}else{
				$.ajax({
					type:'GET',
					url: self.options.url,
					data: self.options.ajaxData,
					success: function(data){
						self.options.onSuccess.call( self, data );
						self.bindEvents();
						self.options.pageMax = $(self.element).find('.jump-to').data('max') || null;
						self.options.successEventHandlers.call( self );
						self.options.postSuccess.call( self );
					},
					error: function( jqXHR, textStatus, errorThrown ){
						self.options.onError.call( self, jqXHR, textStatus, errorThrown );
					}
				});
			}
		},
		loadFilters: function(data){
			var self = this;
			//Load the current values from input fields.
			$('.'+self.options.filterClass+'[type=text], .'+self.options.filterClass+'[type=number]').each(function(){
				self.options.ajaxData[$(this).data('filter')] = $(this).val();
			});
			//Override any input fields with values explictly passed in.
			self.options.ajaxData = $.extend( self.options.ajaxData, data);
			self.options.ajaxData.page = self._cleanPage( self.options.ajaxData.page );
			return self.options.ajaxData;
		},
		getAjaxData: function(data){
			var self = this;
			//Load the current values from input fields.
			$('.'+self.options.filterClass+'[type=text], .'+self.options.filterClass+'[type=number], .'+self.options.filterClass+'.update-on-change[type=hidden]').each(function(){
				self.options.ajaxData[$(this).data('filter')] = $(this).val();
			});
			//Override any input fields with values explictly passed in.
			self.options.ajaxData = $.extend( self.options.ajaxData, data);
			self.options.ajaxData.page = self._cleanPage( self.options.ajaxData.page );
			return self.options.ajaxData;
		}
		
	});
})(jQuery);;$(function () {
	$.widget('sci.print',{
		/*
		 * Add options/parameters that are not common
		 */
		options: {
			pathToPrint: 'about:blank',
			callback: undefined
		},
		
		/*
		 * FA Icons 
		 * 
		 */
		_fa_icons: [
			{ 
				selector:'.far.fa-square',  
				html:'<svg height="14" width="14" class="svg-inline--fa fa-square fa-w-14" aria-hidden="true" focusable="false" data-prefix="far" data-icon="square" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg=""><path fill="currentColor" d="M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-6 400H54c-3.3 0-6-2.7-6-6V86c0-3.3 2.7-6 6-6h340c3.3 0 6 2.7 6 6v340c0 3.3-2.7 6-6 6z"></path></svg>'
			},
			{
				selector:'.far.fa-check-square',  
				html:'<svg height="14" width="14" class="svg-inline--fa fa-check-square fa-w-14" aria-hidden="true" focusable="false" data-prefix="far" data-icon="check-square" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg=""><path fill="currentColor" d="M400 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V80c0-26.51-21.49-48-48-48zm0 400H48V80h352v352zm-35.864-241.724L191.547 361.48c-4.705 4.667-12.303 4.637-16.97-.068l-90.781-91.516c-4.667-4.705-4.637-12.303.069-16.971l22.719-22.536c4.705-4.667 12.303-4.637 16.97.069l59.792 60.277 141.352-140.216c4.705-4.667 12.303-4.637 16.97.068l22.536 22.718c4.667 4.706 4.637 12.304-.068 16.971z"></path></svg>'
			},
			{
				selector:'.fas.fa-circle',
				html:'<svg height="14" width="14"  aria-hidden="true" focusable="false" data-prefix="fas" data-icon="circle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-circle fa-w-14"><path fill="currentColor" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z" class=""></path></svg>'
			},
			{
				selector:'.far.fa-circle',
				html:'<svg height="14" width="14" aria-hidden="true" focusable="false" data-prefix="far" data-icon="circle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-circle fa-w-14"><path fill="currentColor" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200z" class=""></path></svg>'
			}
		],
		
		/*
		 * _init is called every time this widget is instanced
		 * 
		 */
		_init: function () {
			var self = this,
				options = self.options,
				$elem = this.element;
			
			/*
			 * Start processing
			 */
			$elem.processing({type: 'text'});
			
			self.createIframe();
			
			/*
			 * End processing
			 */
			$elem.processing();
		},

		createIframe: function () {
			var self = this,
				options = self.options,
				$elem = this.element;
			
			var $newIframe = $('<iframe>');
			
			$newIframe.hide();
			
			$newIframe
				.prop('id', 'printFrame')
				.prop('src', options.pathToPrint);
			
			$elem.append($newIframe);
			
			window.iframeDoc = $('#printFrame').contents();
			window.iframeWin = document.getElementById('printFrame').contentWindow;
			window.printIframe = $('#printFrame');
			//,
			//$.get('/font-awesome/css/all.css')
			$.when( 
				$.get('/css/style.css'),
				$.get('https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css')
			).then(function (cssR, bootstrapCssR) {
				var iframeDoc = window.iframeDoc;
				$(iframeDoc)
					.find('head')
						.append('<style>' + cssR[0] + '</style>')
						.append('<style>' + bootstrapCssR[0] + '</style>')
					.end();
				
				if(!!options.callback) {
					options.callback();
				}
			});
		},
		
		printIframe: function () {
			var self = this,
				options = self.options,
				$elem = this.element;
			
			if (!!window.iframeDoc && !!window.iframeWin) {
				window.iframeWin.print();
			}
			
			/*
			 * Remove the iframe just in case they want to reprint
			 */
//			setTimeout(function () {
//				$('#printFrame').remove();
//				$elem.processing('hideProcessing');
//			}, 2000);
			$('#printFrame').remove();
			$elem.processing('hideProcessing');
		},
		
		/*
		 * _create is called the first time a widget is instanced
		 */
		_create: function () {
			var self = this,
				options = self.options,
				$elem = this.element;
		},
		
		/*
		 * Remove any html that has the class dnp
		 * 
		 */
		filteredHtml: function( $targetToClone ){
			var self = this;
			var _clone = $targetToClone.clone();
			var $html = $(".dnp",_clone).remove().end()
						.find('.vpo').removeClass('vpo').end();
			$.each( self._fa_icons, function( i, icon ){
				$html.find(icon.selector).replaceWith( icon.html );
			});
			
			
			
			
			return $.trim( $html.html() );
		}
		
		
	});
});;$(function () {
	$.widget('sci.processing',{
		/*
		 * Add options/parameters that are not common
		 */
		options: {},
		
		/*
		 * _init is called every time this widget is instanced
		 */
		_init: function () {
			var self = this,
				options = self.options,
				$elem = this.element;
		},
		
		/*
		 * _create is called the first time a widget is instanced
		 */
		_create: function () {
			var self = this,
				options = self.options,
				$elem = this.element;
			
			self._addClass('processing-element');
			self.bindEvents();
			
			self.showProcessing();
		},
		
		_destroy: function () {
			var self = this,
				options = self.options,
				$elem = this.element;
			
			self._removeClass('processing-element');
			
			$elem.find('.processing-mask').remove();
			
			self._super();
			
		},
		
		bindEvents: function () {
			var self = this,
				options = self.options,
				$elem = this.element;
		},
		
		/*
		 * Private method that only creates the markup, nothing else
		 */
		_createProcessingMarkup: function () {
			var self = this,
				options = self.options,
				$elem = self.element;
			
			var type = options.type || '';
			
			var processingMarkup = '<div style="position: absolute; height: 100%; justify-content: center; align-items: center; display: grid; background-color: rgba(5, 5, 5, .6); width: 100%; z-index: 24;" class="pull-right processing-mask">';
				processingMarkup += '<div style="display: inline;">';
				
			var title = options.title || '',
				text = options.text || 'Processing: Please wait...';
			
			switch(type) {
				case 'graphic':
					processingMarkup += '<div class="col-sm-6">';
						processingMarkup += '<img style="filter: drop-shadow(2px 4px 6px black); width: 65%;" class="pull-right processing-branding" src="/resources/img/logos/logo.svg"/>';
					processingMarkup += '</div>';
					
					processingMarkup += '<div style="" class="col-sm-6">';
						processingMarkup += '<h3 style="color: #fff; margin-bottom: 0;">' + title + '</h3>';
						processingMarkup += '<span style="color: #fff;">' + text + '</span>';
					processingMarkup += '</div>';
					
					processingMarkup += '<div style="margin: 6px; padding: 0;" class="spinner">';				
						processingMarkup += '<div style="background-color: #fff; margin-right: 10%;" class="rect2"></div>';
						processingMarkup += '<div style="background-color: #fff; margin-right: 10%;" class="rect3"></div>';
						processingMarkup += '<div style="background-color: #fff; margin-right: 10%;" class="rect4"></div>';
						processingMarkup += '<div style="background-color: #fff; margin-right: 10%;" class="rect5"></div>';
					processingMarkup += '</div>';
				break;
				
				case 'text':
					processingMarkup += '<div style="text-align: center;">';
						processingMarkup += '<h3 style="color: #fff; margin-bottom: 0;">' + title + '</h3>';
						processingMarkup += '<span style="color: #fff;">' + text + '</span>';
					processingMarkup += '</div>';
					
					processingMarkup += '<div style="display: block; margin: auto; padding: 0;" class="spinner">';				
						processingMarkup += '<div style="background-color: #fff; margin-right: 10%;" class="rect2"></div>';
						processingMarkup += '<div style="background-color: #fff; margin-right: 10%;" class="rect3"></div>';
						processingMarkup += '<div style="background-color: #fff; margin-right: 10%;" class="rect4"></div>';
						processingMarkup += '<div style="background-color: #fff; margin-right: 10%;" class="rect5"></div>';
					processingMarkup += '</div>';
				break;
				
				default:
					processingMarkup += '<div style="text-align: center;">';
						processingMarkup += '<h3 style="color: #fff; margin-bottom: 0;">' + title + '</h3>';
						processingMarkup += '<span style="color: #fff;">' + text + '</span>';
					processingMarkup += '</div>';
					
					processingMarkup += '<div style="display: block; margin: auto; padding: 0;" class="spinner">';				
						processingMarkup += '<div style="background-color: #fff; margin-right: 10%;" class="rect2"></div>';
						processingMarkup += '<div style="background-color: #fff; margin-right: 10%;" class="rect3"></div>';
						processingMarkup += '<div style="background-color: #fff; margin-right: 10%;" class="rect4"></div>';
						processingMarkup += '<div style="background-color: #fff; margin-right: 10%;" class="rect5"></div>';
					processingMarkup += '</div>';
					
				break;
			}
				processingMarkup += '</div>';
			processingMarkup += '</div>'
;			
			return processingMarkup;
		},
		
		showProcessing: function () {
			var self = this,
				options = self.options,
				$elem = this.element;
			
			var processingMarkup = self._createProcessingMarkup();
			
			$elem.prepend(processingMarkup);
			
		},
		
		hideProcessing: function () {
			var self = this,
				options = self.options,
				$elem = this.element;
			
			self.destroy();
		}
	});
});;
;(function($){ 
	$.widget('dwf.timeSelect', {
		options: {
			timeClass:'time-range',
			timer: {
				timeFormat: 'h:mm p',
				dynamic: false,
				forceRoundTime: false,
				zindex: 100,
				interval: 15
			},
			range: 15
		},
		_create: function(){
			var self = this;
			self.initializeTimer();
		},
		initializeTimer: function(){
			var self = this;
			var timerParams = self.options.timer;
			if( typeof self.options.minTime !== 'undefined'){
				timerParams.minTime = self.options.minTime;
			}
			if( typeof self.options.maxTime !== 'undefined'){
				timerParams.maxTime = self.options.maxTime;
			}
			$(self.element).timepicker( $.extend( timerParams, {
				defaultTime: $(self.element).data('val') || ''
			}) );
		},
		updateRange: function( time, operation ){
			var self = this;
			var hours = Number(time.match(/^(\d+)/)[1]);
			var minutes = Number(time.match(/:(\d+)/)[1]);
			var AMPM = time.match(/\s(.*)$/)[1];
			if(AMPM === "PM" && hours<12) hours = hours+12;
			if(AMPM === "AM" && hours==12) hours = hours-12;
			if( operation === 'add' ){
				minutes = minutes + self.options.range;
			}else if( operation === 'subtract' ){
				minutes = minutes - self.options.range;
			}
			while( minutes > 60 ){
				hours ++;
				minutes = minutes-60;
			}
			while( minutes < 0 ){
				hours --;
				minutes = minutes+60;
			}
			while( hours > 24 ){
				hours = hours-24;
			}
			while( hours < 0 ){
				hours = hours+24;
			}
			var sHours = hours.toString();
			var sMinutes = minutes.toString();
			if(hours<10) sHours = '0' + sHours;
			if(minutes<10) sMinutes = '0' + sMinutes;
			return 	sHours+':'+sMinutes;
		},
		getHour: function(){
			var time = $(this.element).val();
			var hours = Number(time.match(/^(\d+)/)[1]);
			var AMPM = time.match(/\s(.*)$/)[1];
			if(AMPM === "PM" && hours<12) hours = hours+12;
			if(AMPM === "AM" && hours==12) hours = hours-12;
			return hours;
		},
		getMinutes: function(){
			var time = $(this.element).val();
			var minutes = Number(time.match(/:(\d+)/)[1]);
			return minutes;
		},
		getIsoTime: function(){
			var time = $(this.element).val();
			if( Utils.isEmpty( time ) ){
				return '';
			}
			var hours = Number(time.match(/^(\d+)/)[1]);
			var AMPM = time.match(/\s(.*)$/)[1];
			if(AMPM === "PM" && hours<12) hours = hours+12;
			if(AMPM === "AM" && hours==12) hours = hours-12;
			var minutes = Number(time.match(/:(\d+)/)[1]);
			if(hours<10) 	hours = '0' + hours;
			if(minutes<10)  minutes = '0' + minutes;
			return hours+':'+minutes+':00';
		}
	});
	
})(jQuery);;var _afterSchoolProgramController = {
	getAfterSchoolPrograms: function( page ){
		return $.get('/afterschoolprograms.json', page);
	},
	saveAfterSchoolProgram: function( afterSchoolProgram ){
		return $.ajax('/afterschoolprogram.json', {
			type: 'POST',
			data: JSON.stringify( afterSchoolProgram ),
			dataType: 'json',
			contentType: 'application/json'
		});
	},
	getEmployeeAfterSchoolPrograms: function(){
		return $.getJSON('/employee/afterschoolprograms');
	},
	setActiveProgramId: function( activeProgramId ){
		return $.ajax('/employee/afterschoolprogram/'+activeProgramId+'/activate', {
			type: 'POST',
			dataType: 'json',
			contentType: 'application/json'
		});
	}
};;var _billingController = {
	getBillingPlans: function( page ){
		return $.getJSON('/billing/plans', page );
	},
	getBillingPlanModels: function(){
		return $.getJSON('/billing/model/plans');
	},
	getBillingPlan: function( billingPlanId ){
		return $.getJSON('/billing/plan/'+billingPlanId);
	},
	saveBillingPlan: function( billingPlan ){
		billingPlan.percentage = parseInt( billingPlan.percentage );
		if( isNaN(billingPlan.percentage) ){
			delete billingPlan.percentage;
		}
		return $.ajax('/billing/plan', {
			type: 'POST',
			data: JSON.stringify( billingPlan ),
			dataType: 'json',
			contentType: 'application/json'
		});
	},
	deleteBillingPlan: function( billingPlanId ){
		return $.ajax('/delete/billing/plan/'+billingPlanId,{
			type: 'DELETE'
		});
	},
	saveBillingRecord: function( json ){
		return $.ajax('/billing/record', {
			type: 'POST',
			data: JSON.stringify( json ),
			dataType: 'json',
			contentType: 'application/json'
		});
	},
	getWeeklyBillingReport: function( ajaxData ){
		console.log(['getWeeklyBillingReport', ajaxData]);
		return $.getJSON('/program/weekly/deposit/report', ajaxData);
	},
	getWeeklySummaryBillingReport: function( ajaxData ){
		return $.getJSON('/program/weekly/deposit/summary/report', ajaxData);
	}
};;var _checkinController = {
	getActiveStudents: function( search, page ){
		return $.getJSON('/checkin/active/students', $.extend({
			search: search }, 
			page));
	},
	getActiveStudentCounts: function(){
		return $.getJSON('/checkin/active/students/count');
	},
	checkinStudent: function( studentId, override ){
		return $.post('/checkin/student/'+studentId, {override: override || false})
		.done(function( student ){
			$(document).trigger('checkin', [ student ]);
		});
	},
	checkoutStudent: function( studentId ){
		return $.post('/checkout/student/'+studentId)
		.done(function( checkoutResponse ){
			//if( checkoutResponse.studentCheckedOut ){
			if( typeof checkoutResponse.checkinLogs !== 'undefined' ){
				$.each( checkoutResponse.checkinLogs, function( index, student ){
					$(document).trigger('checkout', [ student ]);
				});
			}else{
				console.log(['checkoutResponse', checkoutResponse]);
			}
		});
	},
	deleteActiveCheckin: function( studentId ){
		return $.post('/active/student/'+studentId+'/checkin/delete');
	},
	guardianCheckout: function( json ){
		return $.ajax('/checkout/guardian', {
			type: 'POST',
			data: JSON.stringify( json ),
			dataType: 'json',
			contentType: 'application/json'
		}).done( function( checkoutResponse ){
			if( typeof checkoutResponse.checkinLogs !== 'undefined' ){
				$.each( checkoutResponse.checkinLogs, function( index, student ){
					$(document).trigger('checkout', [ student ]);
				});
			}else{
				console.log(['checkoutResponse', checkoutResponse]);
			}
		});
	},
	getStudentCheckinLedger: function( json ){
		return $.get('/student/checkin/log/ledger', json );
	},
	getAfterschoolProgramCheckinLedger: function( json ){
		return $.get('/program/checkin/log/ledger', json );
	}
};;var _checkinLogController = {
		getCheckinLog: function( search, _moment, page ){
			return $.getJSON('/checkin/daily/log', $.extend({
				search: search,
				date: _moment.format('DD.MM.YYYY')
			}, page ));
		},
		fetchUniqueStudentCheckinCount: function( _moment ){
			return $.getJSON('/checkin/daily/log/unique/count', { date: _moment.format('DD.MM.YYYY') } );
		},
		clearCheckinLog: function( _moment ){
			return $.post('/checkin/daily/log/clear', {
					date: _moment.format('DD.MM.YYYY')
				});
//			return $.ajax('/checkin/daily/log/clear', {
//				type: 'POST',
//				data: {
//					date: _moment.format('DD.MM.YYYY')
//				},
//				dataType: 'json',
//				contentType: 'application/json'
//			});
		},
		clearSingleCheckinLog: function( id ){
			return $.post('/checkin/daily/log/'+id+'/clear');
		},
		updateCheckinLog: function( json ){
			return $.post('/checkin/daily/log/update', json);
//			return $.ajax('/checkin/daily/log/update', {
//				type: 'POST',
//				data: json,
//				dataType: 'json',
//				contentType: 'application/json'
//			});
		},
		fetchManualCheckinLog: function( id ){
			return $.getJSON('/checkin/manual/log/'+id);
		},
		postManualCheckinLog: function( json ){
			return $.ajax('/checkin/manual/log', {
				type: 'POST',
				data: JSON.stringify( json ),
				dataType: 'json',
				contentType: 'application/json'
			});
			
		}
};;var _studentBillingController = {
	getStudentBilling: function( personId ){
		return $.getJSON('/student/'+personId);
	},
	getStudents: function( search, page ){
		return $.getJSON('/students', $.extend({
			search: search }, 
			page));
	},
	saveStudent: function( student ){
		return $.ajax('/student.json', { 
			type:'POST',
			data: JSON.stringify( student ),
			dataType: 'json',
			contentType: 'application/json'
		});
	},
	getBillingWeekOptionModels: function(){
		return $.getJSON('/billing/model/weeks');
	},
	getStudentBillingWeekOk: function( _moment, page ){
		return $.getJSON('/student/billing/week/of', $.extend({
			date: _moment.format('DD.MM.YYYY')
		}, page ));
	},
	getStudentBillingWeekOfEntry: function( _moment, studentId ){
		return $.getJSON('/student/billing/week/of/entry', {
			date: _moment.format('DD.MM.YYYY'),
			studentId: studentId
		});
	}
};;var _studentController = {
	getStudent: function( personId ){
		return $.getJSON('/student/'+personId);
	},
	getStudents: function( search, page ){
		return $.getJSON('/students', $.extend({
			search: search }, 
			page));
	},
	saveStudent: function( student ){
		return $.ajax('/student.json', { 
			type:'POST',
			data: JSON.stringify( student ),
			dataType: 'json',
			contentType: 'application/json'
		});
	},
	deleteStudent: function( personId ){
		return $.ajax('/delete/student/'+personId,{
			type: 'DELETE'
		});
	}
};;var _studentLedgerController = {
	getFamilyBillingLedger: function( json ){
		return $.get('/family/billing/ledger', json);
	},
	getFamilyBillingLedgerTotals: function( json ){
		return $.get('/family/billing/ledger/totals', json);
	},
	updateBillingLedger: function( ledgerId, billingTransactionModel ){
		return $.ajax('/billing/transaction/'+ledgerId, {
			type: 'POST',
			data: JSON.stringify( billingTransactionModel ),
			dataType: 'json',
			contentType: 'application/json'
		});
	},
	deleteBillingLedger: function( ledgerId ){
		return $.ajaxDelete('/billing/transaction/'+ledgerId);
	}	
};;;(function(app, $){
	var ActiveStudents,
	CheckinSorts = [
		{ name: 'Grade 0 -> 12', value: 'GradeAsc'},
		{ name: 'Grade 12 -> 0', value: 'GradeDesc'},
		{ name: 'Last Name A -> Z', value: 'LastNameAsc'},
		{ name: 'Last Name Z -> A', value: 'LastNameDesc'},
		{ name: 'School A -> Z', value: 'SchoolAsc'},
		{ name: 'School Z -> A', value: 'SchoolDesc'}
	],
	_activeStudentTimer;
	
	function loadActiveStudents( $target, search, page ){
		setActiveContainer( $target );
		page = page || getPageObj();
		_checkinController.getActiveStudents( search, page )
		.done( function( activeStudentsPage ){
			renderActiveStudents( $target, formatActiveStudents( activeStudentsPage ) );
		});
	}
	
	function loadActiveStudentRows( search, page ){
		_checkinController.getActiveStudents( search, page )
		.done( function( activeStudentsPage ){
			renderActiveStudentRows( formatActiveStudents( activeStudentsPage ) );
		});
	}
	
	function checkInStudent( studentId, override, retryCount ){
		retryCount = retryCount || 1;
		console.log(['checkInStudent studentId',  studentId, retryCount]);
		var programId = $('.active-program-ref').data('id'),
			checkinModel = {
				checkinDate: moment().format('YYYY-MM-DD'),
				checkinTime: moment().format('hh:mm a'),
				studentId: studentId
			},
			localStorageCheckin = false;
		
		try{
			_checkinLocalStorage.setProcessingCheckin( programId, studentId, checkinModel );
			$('#checkin-student-id').val('');
			$('#checkin-student-id').focus();
			localStorageCheckin = true;
		}catch( err ){
			localStorageCheckin = false;
		}
		
		_checkinController.checkinStudent( studentId, override )
		.done(function( student ){
			student.student.checkInTime = student.checkInTime;
			renderActiveStudent( formatStudent(student.student) );
			
			if( !localStorageCheckin ){
				$('#checkin-student-id').val('');
				$('#checkin-student-id').focus();
			}
			activeStudentPoll();
			_checkinLocalStorage.removeCheckin( programId, studentId );
		})
		.fail( function( xhr, textStatus, errorThrown){
			var retry = true;
			    switch (xhr.status) {
			        case 409:
			        	renderInactiveStudentWarningModal( studentId );
			        	retry = false;
			        	break;
			    }
			   if( retry && retryCount < 3 ){
				   retryCount++;
				   checkInStudent( studentId, override, retryCount );
			   }else{
				   try{
					   _checkinLocalStorage.setAwaitingCheckin( programId, studentId, checkinModel );
				   }catch( err ){}
				   console.log(['failure', xhr, textStatus, errorThrown]);
				   var message = 'Failed to checkin student: '+textStatus+' : '+errorThrown;
					toastr.error(message, {
						"timeOut": "5000",
					});
			   }
		});
	}
	
	function guardianCheckout( json ){
		_checkinController.guardianCheckout( json )
		.done( function( checkoutResponse ){
			if( typeof checkoutResponse.checkinLogs !== 'undefined' && checkoutResponse.checkinLogs !== null ){
				$.each( checkoutResponse.checkinLogs, function( index, ciLog ){
					$('.active-student-row[data-id='+ciLog.student.studentId+']').remove();
				});
				$('#checkout-student-id').val('');
				activeStudentPoll();
				$('#checkout-student-id').focus();
				console.log(['parent info', checkoutResponse ]);
			}
			$('#guardianCheckoutModal').modal('hide');
		});
	}
	
	function checkOutStudent( studentId ){
		if( typeof studentId === 'string' || studentId instanceof String ){
			studentId = studentId.trim();
		}
		_checkinController.checkoutStudent( studentId )
		.done(function( checkoutResponse ){
			console.log(['checkOutStudent checkoutResponse ', checkoutResponse]);
			if( checkoutResponse.studentCheckedOut ){
				$('.active-student-row[data-id='+studentId+']').remove();
				$('#checkout-student-id').val('');
				activeStudentPoll();
				$('#checkout-student-id').focus();
			}else if( typeof checkoutResponse.checkinLogs !== 'undefined' && checkoutResponse.checkinLogs !== null ){
				$.each( checkoutResponse.checkinLogs, function( index, ciLog ){
					$('.active-student-row[data-id='+ciLog.student.studentId+']').remove();
				});
				$('#checkout-student-id').val('');
				activeStudentPoll();
				$('#checkout-student-id').focus();
				console.log(['parent info', checkoutResponse ]);
			}else {
				console.log(['parent info else', checkoutResponse ]);
				if( typeof checkoutResponse.activeCheckins !=='undefined' && checkoutResponse.activeCheckins !== null && checkoutResponse.activeCheckins.length > 0 ){
					checkoutResponse.hasActiveCheckins = true;
					$.each( checkoutResponse.activeCheckins, function(index, activeCheckIn){
						if( typeof activeCheckIn.checkInTime !== 'undefined' ){
							activeCheckIn.formattedCheckInTime = timeFormatter.formatDate({
								date: activeCheckIn.checkInTime,
								pattern: 'h:mma',
								timezone: 'America/New_York'
							});
							checkoutResponse.defaultCheckInTime = activeCheckIn.formattedCheckInTime;
						}
					});
				}
				if( typeof checkoutResponse.inactiveStudents !== 'undefined' && checkoutResponse.inactiveStudents !== null && checkoutResponse.inactiveStudents.length > 0 ){
					checkoutResponse.hasInactiveCheckins = true;
				}
				
				if( checkoutResponse.hasActiveCheckins || checkoutResponse.hasInactiveCheckins ){
					renderGuardianCheckoutModal( checkoutResponse );
				}else{
					//No parent or student found with that id
					$('#checkout-student-id').val('');
					activeStudentPoll();
					$('#checkout-student-id').focus();
				}
			}
		}).fail(function(){
			$('#checkout-student-id').val('');
			$('#checkout-student-id').focus();
		});
	} 
	
	function renderActiveStudentRows( activeStudents ){
		ActiveStudents.render('tempStudentRowWrap', $('#active-table').find('tbody'), activeStudents, ['tempStudentRow'])
		.done( function(){
			renderActiveStudentPagination( activeStudents.page );
			bindCheckoutRows();
			bindEditStudent();
			bindViewBillingLedger();
			bindViewCheckinLedger();
		});
	}
	
	function renderAwaitingCheckins(){
		var programId = $('.active-program-ref').data('id');
		var awaitingCheckins = _checkinLocalStorage.getAwaitingCheckinsList( programId );
		if( awaitingCheckins.length ){
			ActiveStudents.render('tempAwaitingCheckins', $('#awaiting-checkin-wrap').find('.card-body'), { awaitingCheckins: awaitingCheckins } );
			$('#awaiting-checkin-wrap').show();
		}else{
			$('#awaiting-checkin-wrap').find('.card-body').html('');
			$('#awaiting-checkin-wrap').hide();
		}
		bindHideShowAwaitingCheckins();
	}
	
	function renderActiveStudents( $target, activeStudents ){
		ActiveStudents.render('tempActiveStudentsTable', $target, activeStudents, ['tempStudentRow'])
		.done( function(){
			renderActiveStudentPagination( activeStudents.page );
			bindTable();
			$('#checkin-student-id').focus();
		});
	}
	
	function renderActiveStudent( student ){
		ActiveStudents.getRenderedString('tempStudentRow', student )
		.done( function( renderedString ){
			$('#active-table').find('tbody').prepend(renderedString);
			bindCheckoutRows();
			bindEditStudent();
			bindViewBillingLedger();
			bindViewCheckinLedger();
		});
		
	}
	
	function renderActiveStudentPagination( _page ){
		return app.getComponent('Pagination').getFn('loadPagination', ['tempChevronSpans', $('#students-pagination'), _page ])
		.done( function( $container, page ){
			$container.pagination({
				overrideLoadFunction: function(data){
					loadActiveStudentRows( data.search, data.ajaxData );
				},
				filterClass: 'student-filter',
				ajaxData: page
			});
		});
	}
	
	function renderInactiveStudentWarningModal( studentId ){
		ActiveStudents.getRenderedString('tempInactiveStudentWarningModal', studentId)
		.done( function( renderedString ){
			$('#modal-wrapper').html( renderedString );
			$('#inactiveStudentWarningModal').modal('show');
			$('#modal-wrapper').find('.bs-toggle').bootstrapToggle();
			
			$('#override-checkin-btn')
			.off('click')
			.on('click', function(){
				checkInStudent( studentId, true);
				$('#inactiveStudentWarningModal').modal('hide');
			});
			
			$('#inactiveStudentWarningModal').on('hidden.bs.modal', function(){
				$('#checkin-student-id').focus();
			});
		});
	}
	
	function renderGuardianCheckoutModal( json ){
		ActiveStudents.getRenderedString('tempGuardianCheckoutModal', json)
		.done( function( renderedString ){
			$('#modal-wrapper').html( renderedString );
			$('#guardianCheckoutModal').modal('show');
			$('#modal-wrapper').find('.bs-toggle').bootstrapToggle();
			$('#guardianCheckoutModal')
				.find('.time-range').each(function(){
					$(this).inputmask('datetime', {  
						'inputFormat': 'hh:MM TT',
						'outputFormat': 'HH:MM:ss'
					});
			});
			$('#modal-checkout-btn')
			.off('click')
			.on('click', function(){
				console.log(['clicked']);
				var $form = $('#guardianCheckoutModal').find('form');
				var requestJson = {
					activeCheckoutIds: [],
					inactiveCheckouts: [],
					parentId: json.id
				};
				$form.find('.activeStudentCheckout:checkbox:checked').each(function(){
					requestJson.activeCheckoutIds.push( $(this).val() );
				});
				
				$form.find('.inactiveStudentCheckout:checkbox:checked').each(function(){
					requestJson.inactiveCheckouts.push( {
						studentId: $(this).val(),
						checkinTime: $(this).closest('tr').find('.checkin-time').val()
					});
				});
				guardianCheckout( requestJson );
			});
			
			$('#guardianCheckoutModal').on('hidden.bs.modal', function(){
				$('#checkout-student-id').focus();
			});
		});
		
	}

	function bindTable( ){
		bindScannerMode();
		bindCheckin();
		bindCheckout();
	}
	
	function bindScannerMode(){
		$('.scanner-mode').click(function(){
			if( !$(this).hasClass('btn-blue') ){
				$('.scanner-mode').toggleClass('btn-blue btn-default');
				$('.checkin-form').toggleClass('d-none');
				if( $(this).data('mode') === 'checkout' ){
					$('#checkout-student-id').focus();
				}else if( $(this).data('mode') === 'checkin' ){
					$('#checkin-student-id').focus();
				}
			}
		});
	}
	
	function bindCheckin(){
		$('#checkin-student-id').scannerDetection({
			minLength: 5,
			onComplete: function(){
				checkInStudent( $('#checkin-student-id').val() );
			}
		});
			
		$('#checkin-student-btn')
			.off('click')
			.on('click', function(){
				checkInStudent( $('#checkin-student-id').val() );
			});
	}
	
	function bindCheckout(){
		$('#checkout-student-id').scannerDetection({
				minLength: 5,
				onComplete: function(){
					checkOutStudent( $('#checkout-student-id').val() );
				}
			});
		$('#checkout-student-btn')
			.off('click')
			.on('click', function(){
				checkOutStudent( $('#checkout-student-id').val() );
			});
		bindCheckoutRows();
		bindEditStudent();
		bindViewBillingLedger();
		bindViewCheckinLedger();
	}
	
	
	function bindEditStudent(){
		$('.user-edit')
			.off('click')
			.on('click', function(){
				console.log(['bindEditStudent']);
				App.getComponent('AddStudent').getFn('loadEditStudent', [$('#student-edit-container'), $(this).data('id'), 'main-content'] );
			});
		console.log(['binding remove active checkin']);
		$('.remove-active-checking')
			.off('click')
			.on('click', function(){
				var studentId = $(this).data('id');
				_checkinController.deleteActiveCheckin( studentId )
				.always(function(){
					console.log(['always after the deleteActiveCheckin', studentId ]);
					$('.active-student-row[data-id='+studentId+']').remove();	
				});
			});
	}
	
	function bindViewBillingLedger(){
		app.getComponent('StudentLedger').getFn('bindStudentLedgerModal');
	}
	
	function bindViewCheckinLedger(){
		app.getComponent('CheckinLog').getFn('bindCheckinLedgerModal');
	}
	
	function bindHideShowAwaitingCheckins(){
		$('#show-awaiting-uploads')
			.off('click')
			.on('click', function(){
				$('#awaiting-checkin-wrap').find('.card-body').show();
				$('#show-awaiting-uploads').hide();
				$('#hide-awaiting-uploads').show();
				
			});
		$('#hide-awaiting-uploads')
			.off('click')
			.on('click', function(){
				$('#awaiting-checkin-wrap').find('.card-body').hide();
				$('#show-awaiting-uploads').show();
				$('#hide-awaiting-uploads').hide();
			});
	}
	
	function bindCheckoutRows(){
		$('.student-row-checkout')
		.off('click')
		.on('click', function(){
			checkOutStudent( $(this).data('id') );
		});
	}
		
	function formatActiveStudents( activeStudentsPage ){
		var activeStudents = {
			activeCheckins: activeStudentsPage.content,
			page: getPageObj( activeStudentsPage )
		};
		
		if( typeof activeStudents.activeCheckins !== 'undefined' ){
			activeStudents.activeCheckins.forEach( function(student){
				formatStudent( student );
			});
		}
		
		activeStudents.pageSizeOptions = [];
		$.each( [10, 25, 50, 100, 500], function(index, value){
			activeStudents.pageSizeOptions.push({
				val: value,
				name: value,
				selected: ( activeStudents.page.size === value ? 'selected' : '')
			});
		});
		
		activeStudents.studentSortOptions = [];
		$.each( CheckinSorts, function( index, val ){
			activeStudents.studentSortOptions.push({
				val: val.value,
				name: val.name,
				selected: ( activeStudents.studentSort === val.value ? 'selected': '' )
			});
		});
		
		return activeStudents;
	}
	 
	function formatStudent( student ){
		console.log(['formatStudent', student]);
		if( typeof student.checkInTime !== 'undefined' ){
			student.formattedCheckInTime = timeFormatter.formatDate({
				date: student.checkInTime,
				pattern: 'h:mma',
				timezone: 'America/New_York'
			});
		}
		
		if( typeof student.student !== 'undefined' && typeof student.student.guardians !== 'undefined' ){
			student.authorizedCheckouts = [];
			$.each( student.student.guardians, function( i, guardian ){
				student.authorizedCheckouts.push( guardian.firstName );
			});
			student.formattedCheckoutNames = student.authorizedCheckouts.join(', ');
		}
		
		return student;
	}
	
	function activeStudentPoll(){
		if( typeof _activeStudentTimer !== 'undefined' ){
			clearInterval(_activeStudentTimer);
		}
		_checkinController.getActiveStudentCounts()
		.done(function(counts){
			$('.active-user-header-count').find('span').html( counts.activeUserCount );
			$('.active-header-count').find('span').html(counts.activeProgramCount);
		});
		
		if( $('#students-pagination').length ){
			try{
				console.log(['active student controller loadPage 109']);
				$('#students-pagination').pagination('loadPage');
			}catch( err ){}
		}
		renderAwaitingCheckins();
		_activeStudentTimer = setInterval( activeStudentPoll, 10000 );
	}
	
	
	var publicFunctions = {
		loadActiveStudents: loadActiveStudents,
		activeStudentPoll: activeStudentPoll,
		checkInStudent: checkInStudent,
		checkOutStudent: checkOutStudent
	};
	ActiveStudents = App.addComponent('ActiveStudents', '/students/active-students', publicFunctions);
	return ActiveStudents;
})(App, jQuery);;;(function(app, $){
	var AddStudent,
	DefaultBillingTypes = [
		{ name: 'One Day', value: 'DAILY_RATE'},
		{ name: 'Two To Three Days', value: 'TWO_TO_THREE_DAYS'},
		{ name: 'Four To Five Days', value: 'FOUR_TO_FIVE_DAYS'},
		{ name: 'Before + After Four To Five', value: 'FOUR_TO_FIVE_DAYS_BEFORE_AND_AFTER'},
		{ name: 'Before + After Two To Three', value: 'TWO_TO_THREE_DAYS_BEFORE_AND_AFTER'},
		{ name: 'Morning Only', value: 'MORNING' },
		{ name: 'Two Day', value: 'TWO_DAY' },
		{ name: 'Three Day', value: 'THREE_DAY' },
		{ name: 'Four Day', value: 'FOUR_DAY' },
		{ name: 'Five Day', value: 'FIVE_DAY' }
	],
	StatusTypes = [
		{ name: 'Active', value: true},
		{ name: 'Inactive', value: false}
	],
	PhotoOptions = [
		{name: 'Allow Photos', value:false},
		{name: 'No Photos', value:true}
	],
	IdCardOptions = [
		{name: 'ID Card Printed ', value:false},
		{name: 'Requires ID Card', value:true}
	];
	
	
	function loadAddStudent( $target ){
		setActiveContainer( $target );
		_billingController.getBillingPlanModels()
		.done( function( billingPlans ){
			console.log(['billingPlans', billingPlans]);
			var student = {};
			student.bilingPlanOptions = [];
			if( typeof billingPlans !== 'undefined' ){
				$.each( billingPlans, function(i,v){
					student.bilingPlanOptions.push({
						value: v.id,
						label: v.billingPlanName + ( v.defaultRate  ? ' (default)': '' ),
						selected: isBillingPlanSelected( student.billingPlanId, v )
					});
				});
			}
			renderStudentForm( $target, student );
		});
		
	}
	
	function loadEditStudent( $target, personId, backTargetId ){
		setActiveContainer( $target );
		console.log(['loadEditStudent', personId]);
		$.when( 
			_studentController.getStudent( personId ),
			_billingController.getBillingPlanModels()
		).done( function( studentResponse, billingPlanResponse ){
			var student = studentResponse[0];
			var billingPlans = billingPlanResponse[0];
			renderStudentForm( $target, formatStudent(student, billingPlans), backTargetId );
		});
	}
	
	function renderAddParent(){
		AddStudent.getRenderedString('tempGuardianForm', formatParent({}), ['tempContactForm'] )
		.done(function( renderedString ){
			$('.parent-wrap').append( renderedString );
			//TODO: bind
			
			bindEditParent();
		});
	}
	
	function renderAddParentContact( $target ){
		AddStudent.getRenderedString('tempContactForm', formatContact({}) )
		.done(function( renderedString ){
			$target.append( renderedString );
			//TODO: bind
			
			//bindEditParent();
		});
	}
	
	function renderStudentForm( $target, student, backTargetId ){
		student = student || {};
		student = formatForm(student);
		
		
		if( typeof backTargetId !== 'undefined' ){
			student.showBack = true;
		}
		
		AddStudent.render('tempNewStudentForm', $target, student, ['tempGuardianForm', 'tempContactForm'] )
		.done( function(){
			bindEditStudent();
			$('#edit-student-back')
				.off('click')
				.on('click', function(){
					setActiveContainer( $('#'+backTargetId) );
					$target.empty();
				});
		});
	}
	
	function renderStudentSavedAlert( student ){
		var message = student.firstName+' '+student.lastName+' successfully saved.';
		toastr.info(message, {
			"timeOut": "5000",
		});
//		student.alertId = 'added-student-alert-'+student.id;
//		AddStudent.getRenderedString('tempNewStudentSuccessMessage', student )
//		.done(function( renderedString ){
//			$('#alert-wrapper').find('.wrapper').append( renderedString );
//			setTimeout( function(){
//				$('#added-student-alert-'+student.id).remove();			
//			}, 5000);
//		});
	}
	
	function renderStudentDeleteAlert( student ){
		var message = student.firstName+' '+student.lastName+' successfully deleted.';
		toastr.error(message, {
			"timeOut": "5000",
		});
//		student.alertId = 'added-student-alert-'+student.id;
//		AddStudent.getRenderedString('tempDeleteStudentMessage', student )
//		.done(function( renderedString ){
//			$('#alert-wrapper').find('.wrapper').append( renderedString );
//			setTimeout( function(){
//				$('#added-student-alert-'+student.id).remove();			
//			}, 5000);
//		});
	}
	
	function bindEditContact(){
		//TODO: delete contact
		
	}
	
	function bindEditParent(){
		$('.delete-guardian')
		.off('click')
		.on('click', function(){
			$(this).closest('.guardian-form-wrap').remove();
		});
		$('.add-guardian-contact')
		.off('click')
		.on('click', function(){
			renderAddParentContact( $(this).closest('.guardian-form-wrap').find('.guardian-contact-wrap')  );
		});
		bindEditContact();
	}
	
	function bindEditStudent(){
		$('#submit-student')
			.off('click')
			.on('click', function(){
				var student = buildStudent();
				console.log(['bindEditStudent', student]);
				_studentController.saveStudent( student ).done(function( student ){
					renderStudentSavedAlert( student );
				});
			});
		$('#delete-student')
			.off('click')
			.on('click', function(){
				var student = buildStudent();
				var studentId = $(this).data('id');
				console.log(['delete student', studentId]);
				AddStudent.getRenderedString('tempDeleteStudentWarningModal', {} )
				.done(function( renderedString ){
					$('#modal-wrapper').html( renderedString );
					$('#deleteStudentWarningModal').modal('show');
					$('#confirm-delete-student-btn')
						.off('click')
						.on('click', function(){
							_studentController.deleteStudent( studentId ).done(function( ){
								renderStudentDeleteAlert( student );
								$('#deleteStudentWarningModal').modal('hide');
							});
						});
				});
			});
		
		$('#add-parent')
			.off('click')
			.on('click', function(){
				renderAddParent();
			});
		bindEditParent();
	}
	
	function formatStudent( student, billingPlans ){
		student = student || {};
		student.bilingPlanOptions = [];
		student.showDelete = typeof student.id !== 'undefined';
		student = formatForm( student );
		if( typeof student.guardians !== 'undefined' ){
			$.each( student.guardians, function(i,v){
				formatParent(v);
			});
		}
		if( typeof billingPlans !== 'undefined' ){
			$.each( billingPlans, function(i,v){
				student.bilingPlanOptions.push({
					value: v.id,
					label: v.billingPlanName + ( v.defaultRate  ? ' (default)': '' ),
					selected: isBillingPlanSelected( student.billingPlanId, v )
				});
			});
		}
		student.defaultBillingTypes = [{
			value: '',
			label: 'Not Set'
		}];
		$.each( DefaultBillingTypes, function(i,v){
			student.defaultBillingTypes.push({
				value: v.value,
				label: v.name,
				selected: v.value === student.defaultWeeklyBillingType ? 'selected' : ''
			});
		});
		student.statusTypes =[];
		$.each( StatusTypes, function(i,v){
			student.statusTypes.push({
				value: v.value,
				label: v.name,
				selected: v.value === student.active ? 'selected' : ''
			});
		});
		student.photoOptions = [];
		$.each( PhotoOptions, function(i,v){
			student.photoOptions.push({
				value: v.value,
				label: v.name,
				selected: v.value === student.noPhoto ? 'selected' : ''
			});
		});
		student.idCardOptions = [];
		$.each( IdCardOptions, function(i,v){
			student.idCardOptions.push({
				value: v.value,
				label: v.name,
				selected: v.value === student.requiresIdCard ? 'selected' : ''
			});
		});
		
		console.log(['formatStudent', student]);
		return student;
	}
	
	function isBillingPlanSelected( studentBillingPlanId, billingPlan ){
		console.log(['isBillingPlanSelected', studentBillingPlanId, billingPlan]);
		if( studentBillingPlanId !== null){
			return billingPlan.id === studentBillingPlanId ? 'selected': '';
		}else{
			return billingPlan.defaultRate ? 'selected': '';
		}
		
	}
	
	function formatParent( parent ){
		console.log(['formatParent', parent]);
		parent = parent || {};
		parent = formatForm( parent );
		parent.relationshipTypes = [];
		$.each(['Mother', 'Father', 'Guardian', 'Grandmother', 'Grandfather'], function( i, v ){
			parent.relationshipTypes.push({
				value: v,
				label: v,
				selected: v===parent.relationship? 'selected':''
			});
		});
		if( typeof parent.contacts !== 'undefined' ){
			$.each( parent.contacts, function(i,v){
				formatContact(v);
			});
		}
		
		return parent;
	}
	
	function formatContact( contact ){
		contact = contact || {};
		contact = formatForm( contact );
		contact.contactTypes = [];
		$.each(['Phone', 'Email'], function(i,v){
			contact.contactTypes.push({
				value: v,
				label: v,
				selected: v===contact.contactType? 'selected':''
			});
		});
		return contact;
	}
	
	function buildStudent(){
		var student = $('#new-student-form').serializeJSON( serializeJSON_Defaults );
		student.guardians = [];
		$('form.guardian-form').each( function(){
			student.guardians.push( buildParent( $(this) ) );
		});
		return student;
	}
	
	function buildParent( $form ){
		var parent = $form.serializeJSON( serializeJSON_Defaults );
		parent.contacts = [];
		$form.closest('.guardian-form-wrap').find('form.contact-form').each(function(){
			parent.contacts.push( $(this).serializeJSON( serializeJSON_Defaults ) );
		});
		return parent;
	}
	
	var publicFunctions = {
		loadAddStudent: loadAddStudent,
		loadEditStudent: loadEditStudent	
	};
	AddStudent = App.addComponent('AddStudent', '/students/add-student', publicFunctions);
	return AddStudent;
})(App, jQuery);;;(function(app, $){
	var AfterSchoolProgram;
	
	function loadAfterSchoolPrograms( $target ){
		setActiveContainer( $target );
		_afterSchoolProgramController.getAfterSchoolPrograms()
		.done(function( afterSchoolProgramPage ){
			renderAfterSchoolPrograms( $target, formatAfterSchoolProgramsPage( afterSchoolProgramPage ) );
		});
	}
	
	function loadAfterSchoolProgramForm(){
		renderAfterSchoolProgramForm();
	}
	
	function loadActiveEmployeeProgramDropDown(){
		_afterSchoolProgramController.getEmployeeAfterSchoolPrograms()
		.done( function( programs ){
			renderActiveEmployeeProgramDropDown( formatEmployeePrograms( programs ) );
		});
	}
	
	function renderAfterSchoolPrograms( $target, json ){
		AfterSchoolProgram.render('tempAfterSchoolProgramsWrap', $target, json, ['tempAfterSchoolProgram'] )
		.done(function(){
			bindAfterSchoolPrograms();
		});
	}
	
	function renderActiveEmployeeProgramDropDown( programs ){
		AfterSchoolProgram.render('tempEmployeeProgramDropDown', $('#active-program-dropdown'), programs )
		.done(function(){
			bindActiveEmployeeProgramDropDown();
		});
	}
	
	function renderAfterSchoolProgram( afterSchoolProgram ){
		AfterSchoolProgram.getRenderedString('tempAfterSchoolProgram', afterSchoolProgram )
		.done( function( renderedString ){
			$('#after-school-program-wrap').find('ul').append(renderedString);
		});
	}
	
	function renderAfterSchoolProgramForm(){
		AfterSchoolProgram.render('tempAfterSchoolProgramForm', $('#add-after-school-program-wrap'), {} )
		.done(function(){
			bindAfterSchoolProgramForm();
		});	
	}
	
	function formatAfterSchoolProgramsPage( afterSchoolProgramPage ){
		var json = {
			afterSchoolPrograms: afterSchoolProgramPage.content,
			page: getPageObj( afterSchoolProgramPage )	
		};
		return json;
	}
	
	function formatEmployeePrograms( programs ){
		var json = {
			programs: programs	
		};
		
		if(  programs.length > 1 ){
			json.hasMultiple = true;
		}
		
		$.each( programs, function(i,p){
			if( p.isActive ){
				json.activeProgram = p;
				return false;
			}
		});
		
		return json;
	}
	
	function bindAfterSchoolPrograms(){
		$('.add-after-school-program')
		.off('click.AfterSchoolProgram')
		.on('click.AfterSchoolProgram', function(){
			loadAfterSchoolProgramForm();
			$('.add-after-school-program').hide();
		});
	}
	
	function bindAfterSchoolProgramForm(){
		$('#submit-after-school-program')
		.off('click.AfterSchoolProgram')
		.on('click.AfterSchoolProgram', function(){
			var afterSchoolProgram = $('#after-school-program-form').serializeJSON( serializeJSON_Defaults );
			_afterSchoolProgramController.saveAfterSchoolProgram( afterSchoolProgram ).done(function( afterSchoolProgram ){
				renderAfterSchoolProgram( afterSchoolProgram );
				$('#add-after-school-program-wrap').empty();
				$('.add-after-school-program').show();
			});
		});
	}
	
	function bindActiveEmployeeProgramDropDown(){
		$('.active-program:not(.active)')
		.off('click.AfterSchoolProgram')
		.on('click.AfterSchoolProgram', function(){
			_afterSchoolProgramController.setActiveProgramId( $(this).data('id') )
			.done(function( programs ){
				//renderActiveEmployeeProgramDropDown( formatEmployeePrograms( programs ) );
				location.reload();
			});
		});
	}
	
	var publicFunctions = {
		loadAfterSchoolPrograms: loadAfterSchoolPrograms,
		loadActiveEmployeeProgramDropDown: loadActiveEmployeeProgramDropDown
			
	};
	AfterSchoolProgram = App.addComponent('AfterSchoolProgram', '/program/after-school-program', publicFunctions);
	return AfterSchoolProgram;
})(App, jQuery);;;(function(app, $){
	var AttendanceSummary,
	CheckinSorts = [
		{ name: 'Grade 0 -> 12', value: 'GradeAsc'},
		{ name: 'Grade 12 -> 0', value: 'GradeDesc'},
		{ name: 'Last Name A -> Z', value: 'LastNameAsc'},
		{ name: 'Last Name Z -> A', value: 'LastNameDesc'},
		{ name: 'School A -> Z', value: 'SchoolAsc'},
		{ name: 'School Z -> A', value: 'SchoolDesc'}
	],
	StudentFilters = [
		{ name: 'Show All', value:'ALL' },
		{ name: 'Morning', value:'MORNING' },
		{ name: 'Afterschool', value:'AFTERSCHOOL' },
		{ name: 'CCPS', value:'CCPS'}, 
		{ name: 'Scholarship', value:'SCHOLARSHIP'},
		{ name: 'ELC', value:'ELC'},
		{ name: 'Regular Rate', value:'DEFAULT_RATE'}
	];
	
	function loadAttendanceSummary( $target, ajaxData ){
		setActiveContainer( $target );
		ajaxData = ajaxData || {};
		ajaxData.startDate  =  moment().startOf('month').format('DD.MM.YYYY');
		ajaxData.endDate    = moment().endOf('month').format('DD.MM.YYYY');
		
		_checkinController.getAfterschoolProgramCheckinLedger( ajaxData )
		.done( function( attendaceSummary ){
			console.log(['attendaceSummary', attendaceSummary]);
			var json = formatAttendaceSummary( attendaceSummary, ajaxData );
			renderStudentAttendanceSummary( $target, ajaxData, json );
		});
	}
	
	function reloadAttendanceSummary( ajaxData ){
		_checkinController.getAfterschoolProgramCheckinLedger( ajaxData )
		.done( function( attendaceSummary ){
			console.log(['attendaceSummary', attendaceSummary]);
			var json = formatAttendaceSummary( attendaceSummary, ajaxData );
			rerenderStudentAttendanceSummary( ajaxData, json );
			$('#active-filter-row').html( json.activeFilter );
			$('#attendance-summary-range').html(json.attendanceRange);
			
		});
	}
	
	function renderStudentAttendanceSummary( $target, ajaxData, json ){
		AttendanceSummary.render('tempProgramAttendanceSummary', $target, json, ['tempStudentAttendanceTable','tempStudentAttendanceRow'])
		.done( function(){
			$('.checkin-ledger-date').datepicker({
				dateFormat: 'mm/dd/yy'
			});
			bindPrintAttendanceSummary();
			renderAttendaceSummaryPagination( ajaxData );
		});
	}
	
	function rerenderStudentAttendanceSummary( ajaxData, json ){
		AttendanceSummary.render('tempStudentAttendanceTable', $('#attendance-summary-table'), json, ['tempStudentAttendanceRow'])
		.done( function(){
			renderAttendaceSummaryPagination( ajaxData );
		});
	}
	
	
	function renderAttendaceSummaryPagination( _page ){
		return app.getComponent('Pagination').getFn('loadPagination', ['tempChevronSpans', $('#attendance-summary-pagination'), _page ])
		.done( function( $container, page ){
			$container.pagination({
				overrideLoadFunction: function(data){
					page = $.extend( page, data.ajaxData );
					console.log(['overrideLoadFunction', data, page]);
					if( typeof page.startDate !== 'undefined' && page.startDate !== '' ){
						_startMoment = moment( page.startDate, 'MM/DD/YYYY');
						page.startDate = _startMoment.format('DD.MM.YYYY');
					}
					if( typeof page.endDate !== 'undefined' && page.endDate !== '' ){
						_endMoment = moment( page.endDate, 'MM/DD/YYYY');
						page.endDate = _endMoment.format('DD.MM.YYYY');
					}
					reloadAttendanceSummary( page );
				},
				filterClass: 'attendance-summary-checkin-log-filter',
				ajaxData: page
			});
		});
	}
	
	
	function formatAttendaceSummary( attendaceSummary, ajaxData ){
		ajaxData = ajaxData || {};
		var startMoment = moment( ajaxData.startDate, 'DD.MM.YYYY');
		var endMoment   = moment( ajaxData.endDate, 'DD.MM.YYYY');
		
		var json = {
			program: formatAfterSchoolProgram( attendaceSummary.program ),
			headerColumns: formatHeaderColumns( startMoment, endMoment ),
			totalChildrenCount: attendaceSummary.students.length,
			halfDayCount: 0,
			fullDayCount: 0,
			students: [],
			activeFilter: ''
		};
		
		json.attendanceRange = startMoment.format('dddd, MMMM Do YYYY')+' to '+endMoment.format('dddd, MMMM Do YYYY');
		json.formattedStartDate = startMoment.format('MM/DD/YYYY');
		json.formattedEndDate = endMoment.format('MM/DD/YYYY');
		json.filterOptions = [];
		$.each( StudentFilters, function( index, val ){
			json.filterOptions.push({
				val: val.value,
				name: val.name,
				selected: ( ajaxData.filter === val.value ? 'selected': '' )
			});
			if( typeof ajaxData.filter !== 'undefined' && ajaxData.filter !== 'ALL' && ajaxData.filter === val.value ){
				json.activeFilter = val.name;	
			}
		});
		
		
		
		$.each( attendaceSummary.students, function( i , studentModel ){
			json.students.push( formatStudentRow( json, studentModel, startMoment, endMoment ) );
		});
		
		return json;
	}
	
	function formatAfterSchoolProgram( program ){
		var json={};
		if( typeof program.programFullName !== 'undefined' ){
			json.programFullName = program.programFullName;
		}else{
			json.programFullName = program.programName;
		}
		if( typeof program.address !== 'undefined' ){
			json.street = program.address.street;
			json.address = program.address.city+', '+program.address.state+' '+program.address.zipcode;
		}
		if( typeof program.phone !== 'undefined' ){
			json.phone = program.phone.contactValue;
		}
		if( typeof program.email !== 'undefined' ){
			json.email = program.email.contactValue;
		}
		return json;
	}
	
	function formatStudentRow( json, studentModel, startMoment, endMoment ){
		var student = {
			childTitle: formatChildTitle( studentModel ),
			attendanceColumns: [],
			halfDayCount: 0,
			fullDayCount: 0
		};
		
		var attendanceMap = {};
		$.each( studentModel.checkinLogs, function( i , checkinLog ){
			var _checkinMoment = timeFormatter.getMomentFullDate({
				date: checkinLog.checkInTime,
				timezone: 'America/New_York'
			});
			var attendanceMapKey = _checkinMoment.format('DD.MM.YYYY');
			if( typeof attendanceMap[attendanceMapKey] === 'undefined' ){
				attendanceMap[attendanceMapKey] = [];
			}
			attendanceMap[attendanceMapKey].push( checkinLog );
		});
		
		var mom = startMoment.clone();
		var index = 0;
		do{
			var columnKey = mom.format('DD.MM.YYYY');
			if( typeof attendanceMap[columnKey] !== 'undefined' ){
				var attendanceColumn = formatAttendaceColumn( attendanceMap[columnKey] );
				if( attendanceColumn.isFullDay ){
					student.fullDayCount++;
					json.fullDayCount++;
					json.headerColumns[index].total++;
				}
				if( attendanceColumn.isHalfDay ){
					student.halfDayCount ++;
					json.halfDayCount ++;
					json.headerColumns[index].total++;
				}
				student.attendanceColumns.push( attendanceColumn );
			}else{
				student.attendanceColumns.push({ didNotAttend : true });
			}
			mom.add(1, 'd');
			index++;
		}while( mom.isSameOrBefore( endMoment, 'day') );
		return student;
	}
	
	function formatAttendaceColumn( checkinLogs ){
		var hours = 0;
		var json = {};
		if( typeof checkinLogs !== 'undefined' ){
			$.each( checkinLogs, function( i, checkinLog){
				var checkinMoment =  timeFormatter.getMomentFullDate({
					date: checkinLog.checkInTime,
					timezone: 'America/New_York'
				});
				var checkoutMoment =  timeFormatter.getMomentFullDate({
					date: checkinLog.checkOutTime,
					timezone: 'America/New_York'
				});
				hours += checkoutMoment.diff(checkinMoment, 'hours', true);
			});

			if( hours >= 6 ){
				json.isFullDay = true;
			}else{
				json.isHalfDay = true;
			}	
		}else{
			json.didNotAttend = true;
		}
		return json;
	}
	
	function formatChildTitle( studentModel ){
		console.log(['studentModel', studentModel]);
		var title = studentModel.student.lastName+', '+studentModel.student.firstName;
		if( typeof studentModel.student.school !== 'undefined' ){
			title += ' ('+studentModel.student.school.name+')';
		}
		return title;
	}
	
	function formatAttendanceColumns( studentModel, startMoment, endMoment ){
		var mom = startMoment.clone();
		var json = [];
		do{
			json.push({
				title: mom.format('DD'),
				total: 0
			});
			mom.add(1, 'd');
		}while( mom.isSameOrBefore( endMoment, 'day') );
		return json;
	}
	
	function formatHeaderColumns( startMoment, endMoment ){
		var mom = startMoment.clone();
		var json = [];
		do{
			json.push({
				title: mom.format('DD'),
				total: 0
			});
			mom.add(1, 'd');
		}while( mom.isSameOrBefore( endMoment, 'day') );
		return json;
	}
	
	
	
	function bindPrintAttendanceSummary(){
		$('#print-students')
		.off('click')
		.on('click', function( e ){
			e.preventDefault();
				var $this = $(this);
				
				$('#print-students').print({
					pathToPrint: 'about:blank'
				});
				
				var thisHTML = $('#print-students').print('filteredHtml', $('#attendance-summary-print-wrap') );
				
				$('#printFrame').contents()
					.find('body')
						.html(thisHTML);
				
				setTimeout(function () {						
					$('#print-students').print('printIframe');
				}, 500);
		});
		
	}
	
	var publicFunctions = {
		loadAttendanceSummary: loadAttendanceSummary	
	};
	AttendanceSummary = App.addComponent('AttendanceSummary', '/students/attendance-summary', publicFunctions);
	return AttendanceSummary;
})(App, jQuery);;;(function(app, $){
	var BillingPlans,
	SpecializedBillingPlanOptions = [
		{ name: 'Collier School District', value: 'ColllierSchoolDistrict'},
		{ name: 'Sports Club', value: 'SportsClub'},
		{ name: 'CCPS Rate', value: 'CCPSRate'},
		{ name: 'ELC Weekly', value:'ELCWeekly'},
		{ name: 'Scholarship Weekly', value: 'ScholarshipWeekly'}
		
	];
	
	function loadAddBillingPlan( $target ){
		setActiveContainer( $target );
		var json = formatBillingPlan({});
		renderBillingPlanForm( $target, json, 'main-content' );
	}
	
	function loadEditBillingPlan( $target, planId, backTargetId ){
		setActiveContainer( $target );
		_billingController.getBillingPlan( planId )
		.done( function( billingPlan ){
			renderBillingPlanForm( $target, formatBillingPlan(billingPlan), backTargetId);
		});
	}
	
	function loadBillingPlans( $target, page ){
		setActiveContainer( $target );
		page = page || getPageObj();
		
		_billingController.getBillingPlans( page )
		.done( function( billingPlansPage ){
			renderBillingPlans( $target, formatBillingPlans( billingPlansPage ) );
		});	
	}
	
	function loadBillingPlanPage( page ){
		_billingController.getBillingPlans( page )
		.done( function( billingPlansPage ){
			renderBillingPlansPage( formatBillingPlans( billingPlansPage ) );
		});
		
	}
	
	function renderBillingPlans( $target, billingPlans ){
		BillingPlans.render('tempBilling', $target, billingPlans, ['tempBillingPlanPage','tempBillingPlan'] )
		.done( function(){
			bindBillingPlans();
			
			$('.add-new-billing-plan-btn')
				.off('click')
				.on('click', function(){
					loadAddBillingPlan( $('#billing-plan-edit-container') );
				});
		});
	}
		
	function renderBillingPlansPage( billingPlans ){
		BillingPlans.render('tempBillingPlanPage', $('#billing-plans-container'), billingPlans, ['tempBillingPlan'] )
		.done( function(){
			bindBillingPlans();
		});
	}
	
	function renderBillingPlan( billingPlan ){
		BillingPlans.getRenderedString('tempBillingPlan', billingPlan  )
		.done( function( renderedString ){
			if( $('.billing-plan-container[data-id='+billingPlan.id+']').length ){
				$('.billing-plan-container[data-id='+billingPlan.id+']').replaceWith( renderedString );
			}else{
				$('#billing-plans-container').append( renderedString );
			}
			bindBillingPlans();
		});
	}
		
	function renderBillingPagination( _page ){
		return app.getComponent('Pagination').getFn('loadPagination', ['tempChevronSpans', $('#billing-plan-pagination'), _page ])
		.done( function( $container, page ){
			$container.pagination({
				overrideLoadFunction: function(data){
					page = $.extend( page, data.ajaxData );
					console.log(['overrideLoadFunction', data, page]);
					loadStudentRows( page.search, page );
				},
				filterClass: 'student-filter',
				ajaxData: page
			});
		});
	}
	
	function renderBillingPlanForm( $target, billingPlan, backTargetId ){
		billingPlan = billingPlan || {};
		billingPlan = formatForm( billingPlan );
		if( typeof backTargetId !== 'undefined' ){
			billingPlan.showBack = true;
		}
		if( typeof billingPlan.id !== 'undefined' ){
			billingPlan.showDelete = true;
		}
		BillingPlans.render('tempEditBillingPlan', $target, billingPlan )
		.done( function(){
			$('#billing-plan-form').find('.bs-toggle').bootstrapToggle();
			bindEditBilling( $target, billingPlan, backTargetId );
			$('#edit-billing-plan-back')
				.off('click')
				.on('click', function(){
					setActiveContainer( $('#'+backTargetId) );
					$target.empty();
				});
		});
	}
	
	function renderBillingPlanSavedAlert( billingPlan ){
		var message = 'Billing Plan '+billingPlan.planName+' successfully saved.';
		toastr.info(message, {
			"timeOut": "5000",
		});
	}
	
	function formatBillingPlans( billingPlansPage ){
		var billingPlans = {
			billingPlans: billingPlansPage.content,
			page: getPageObj( billingPlansPage )
		};
		
		$.each( billingPlans.billingPlans, function( i, billingPlan ){
			formatBillingPlan( billingPlan );
		});
		
		return billingPlans;
	}
	
	function formatBillingPlan( billingPlan ){
		
		billingPlan.specializedBillingPlanOptions = [];
		billingPlan.specializedBillingPlanOptions.push({
			value: 'None',
			label: 'None'
		});
		
		$.each( SpecializedBillingPlanOptions, function( i, v){
			billingPlan.specializedBillingPlanOptions.push({
				value: v.value,
				label: v.name,
				selected: v.value === billingPlan.specializedBillingPlan ? 'selected' : ''
			});
			if( v.value === billingPlan.specializedBillingPlan ){
				billingPlan.specializedBillingPlanName = v.name;
			}
		});
		
		return billingPlan;
	}
	
	function bindBillingPlans(){
		//TODO: bind edit button
		$('.edit-billing-plan')
		.off('click')
		.on('click', function(){
			loadEditBillingPlan( $('#billing-plan-edit-container'), $(this).data('id'), 'main-content' );
		});
	}
	
	function bindEditBilling( $target, billingPlan, backTargetId  ){
		$('#submit-billing-plan')
			.off('click')
			.on('click', function(){
				var billingPlan = buildBillingPlan();
				console.log(['bindEditBillingPlan', billingPlan]);
				_billingController.saveBillingPlan( billingPlan ).done(function( billingPlan ){
					billingPlan = formatBillingPlan( billingPlan );
					renderBillingPlanSavedAlert( billingPlan );
		//			renderBillingPlanForm( $target, billingPlan, backTargetId);
					renderBillingPlan( billingPlan );
					setActiveContainer( $('#'+backTargetId) );
					$target.empty();
				});
			});
		$('#delete-billing-plan')
			.off('click')
			.on('click', function(){
				var billingPlanId = $(this).data('id');
				_billingController.deleteBillingPlan( billingPlanId )
				.done( function(){
					$('.billing-plan-container[data-id='+billingPlanId+']').remove();
					setActiveContainer( $('#'+backTargetId) );
					$target.empty();
				});
			});
	}
	
	function buildBillingPlan(){
		var billingPlan = $('#billing-plan-form').serializeJSON( serializeJSON_Defaults );
		if( 'None' === billingPlan.specializedBillingPlan ){
			delete billingPlan.specializedBillingPlan;
		}
		return billingPlan;
	}
	
	var publicFunctions = {
		loadBillingPlans: loadBillingPlans,
		loadAddBillingPlan: loadAddBillingPlan
	};
	BillingPlans = App.addComponent('BillingPlans', '/billing/billing-plans', publicFunctions);
	return BillingPlans;
})(App, jQuery);;;(function(app, $){
	var BillingReports,
	CheckinSorts = [
		{ name: 'Grade 0 -> 12', value: 'GradeAsc'},
		{ name: 'Grade 12 -> 0', value: 'GradeDesc'},
		{ name: 'Last Name A -> Z', value: 'LastNameAsc'},
		{ name: 'Last Name Z -> A', value: 'LastNameDesc'},
		{ name: 'School A -> Z', value: 'SchoolAsc'},
		{ name: 'School Z -> A', value: 'SchoolDesc'}
	],
	StudentFilters = [
		{ name: 'Show All', value:'ALL' },
		{ name: 'Morning', value:'MORNING' },
		{ name: 'Afterschool', value:'AFTERSCHOOL' },
		{ name: 'CCPS', value:'CCPS'}, 
		{ name: 'Scholarship', value:'SCHOLARSHIP'},
		{ name: 'ELC', value:'ELC'},
		{ name: 'Regular Rate', value:'DEFAULT_RATE'}
	];
	
	function loadWeeklyDepositReport( $target, ajaxData ){
		setActiveContainer( $target );
		ajaxData = ajaxData || {};
		ajaxData.startDate  =  moment().startOf('week').format('DD.MM.YYYY');
		ajaxData.endDate    = moment().endOf('week').format('DD.MM.YYYY');
		
		console.log(['loadWeeklyDepositReport', ajaxData]);
		_billingController.getWeeklyBillingReport( ajaxData )
		.done( function( depositReport ){
			console.log(['depositReport', depositReport]);
			var json = formatDepositReport( depositReport, ajaxData );
			renderBilingReportSummary( $target, ajaxData, json );
		});
	}
	
	function reloadWeeklyDepositSummary( ajaxData ){
		_billingController.getWeeklyBillingReport( ajaxData )
		.done( function( depositReport ){
			console.log(['depositReport', depositReport]);
			var json = formatDepositReport( depositReport, ajaxData );
			rerenderBilingReportSummary( ajaxData, json );
			//$('#active-filter-row').html( json.activeFilter );
			$('#billing-report-summary-range').html(json.depositRange);
		});
	}
	
	
	function loadWeeklySummaryDepositReport( $target, ajaxData ){
		setActiveContainer( $target );
		ajaxData = ajaxData || {};
		ajaxData.startDate  =  moment().startOf('week').format('DD.MM.YYYY');
		ajaxData.endDate    = moment().endOf('week').format('DD.MM.YYYY');
		console.log(['loadWeeklySummaryDepositReport', ajaxData]);
		_billingController.getWeeklySummaryBillingReport( ajaxData )
		.done( function( depositReport ){
			console.log(['depositReport 2', depositReport]);
			var json = formatDepositSummaryReport( depositReport, ajaxData );
			renderBilingSummaryReportSummary( $target, ajaxData, json );
		});
		
	}
	
	
	function reloadWeeklySummaryDepositSummary(ajaxData ){
		_billingController.getWeeklySummaryBillingReport( ajaxData )
		.done( function( depositReport ){
			console.log(['depositReport', depositReport]);
			var json = formatDepositSummaryReport( depositReport, ajaxData );
			rerenderBilingSummaryReportSummary( ajaxData, json );
			//$('#active-filter-row').html( json.activeFilter );
			$('#billing-report-summary-range').html(json.depositRange);
		});
	}
		
	function renderBilingReportSummary( $target, ajaxData, json ){
		BillingReports.render('tempDepositReportSummary', $target, json, ['tempWeeklyDepositReportTables','tempWeeklyReportRow'])
		.done( function(){
			$('.billing-ledger-date').datepicker({
				dateFormat: 'mm/dd/yy'
			});
			bindPrintBillingReportSummary();
			renderDepositReportSummaryPagination( ajaxData );
		});
	}
	
	function rerenderBilingReportSummary( ajaxData, json ){
		BillingReports.render('tempWeeklyDepositReportTables', $('#billing-report-table-wrap'), json, ['tempWeeklyReportRow'])
		.done( function(){
			renderDepositReportSummaryPagination( ajaxData );
		});
	}
	
	function renderBilingSummaryReportSummary( $target, ajaxData, json ){
		BillingReports.render('tempDepositSummaryReportSummary', $target, json, ['tempWeeklyDepositSummaryReportTables'])
		.done( function(){
			$('.billing-ledger-date').datepicker({
				dateFormat: 'mm/dd/yy'
			});
			bindPrintBillingSummaryReportSummary();
			renderDepositSummaryReportSummaryPagination( ajaxData );
		});
	}
	
	function rerenderBilingSummaryReportSummary( ajaxData, json ){
		BillingReports.render('tempWeeklyDepositSummaryReportTables', $('#billing-summary-report-table-wrap'), json )
		.done( function(){
			renderDepositSummaryReportSummaryPagination( ajaxData );
		});
	}
	
	
	function renderDepositReportSummaryPagination( _page ){
		return app.getComponent('Pagination').getFn('loadPagination', ['tempChevronSpans', $('#deposit-report-summary-pagination'), _page ])
		.done( function( $container, page ){
			$container.pagination({
				overrideLoadFunction: function(data){
					page = $.extend( page, data.ajaxData );
					console.log(['overrideLoadFunction', data, page]);
					if( typeof page.startDate !== 'undefined' && page.startDate !== '' ){
						_startMoment = moment( page.startDate, 'MM/DD/YYYY');
						page.startDate = _startMoment.format('DD.MM.YYYY');
					}
					if( typeof page.endDate !== 'undefined' && page.endDate !== '' ){
						_endMoment = moment( page.endDate, 'MM/DD/YYYY');
						page.endDate = _endMoment.format('DD.MM.YYYY');
					}
					reloadWeeklyDepositSummary( page );
				},
				filterClass: 'deposit-report-summary-checkin-log-filter',
				ajaxData: page
			});
		});
	}
	
	function renderDepositSummaryReportSummaryPagination( _page ){
		return app.getComponent('Pagination').getFn('loadPagination', ['tempChevronSpans', $('#deposit-summary-report-summary-pagination'), _page ])
		.done( function( $container, page ){
			$container.pagination({
				overrideLoadFunction: function(data){
					page = $.extend( page, data.ajaxData );
					console.log(['overrideLoadFunction', data, page]);
					if( typeof page.startDate !== 'undefined' && page.startDate !== '' ){
						_startMoment = moment( page.startDate, 'MM/DD/YYYY');
						page.startDate = _startMoment.format('DD.MM.YYYY');
					}
					if( typeof page.endDate !== 'undefined' && page.endDate !== '' ){
						_endMoment = moment( page.endDate, 'MM/DD/YYYY');
						page.endDate = _endMoment.format('DD.MM.YYYY');
					}
					reloadWeeklySummaryDepositSummary( page );
				},
				filterClass: 'deposit-report-summary-checkin-log-filter',
				ajaxData: page
			});
		});
	}
	
	
	function formatDepositReport( depositReport, ajaxData ){
		ajaxData = ajaxData || {};
		var startMoment = moment( ajaxData.startDate, 'DD.MM.YYYY');
		var endMoment   = moment( ajaxData.endDate, 'DD.MM.YYYY');
		
		var json = {
			program: formatAfterSchoolProgram( depositReport.program ),
			achTotals: thousandsSeparators( depositReport.achTotals.toFixed(2) ),
			achCount: depositReport.achCount,
			creditcardTotals: thousandsSeparators( depositReport.creditcardTotals.toFixed(2) ),
			creditcardCount: depositReport.creditcardCount,
			checkTotals: thousandsSeparators( depositReport.checkTotals.toFixed(2) ),
			checkCount: depositReport.checkCount,
			achPayments: [],
			creditcardPayments: [],
			checkPayments: [],
			activeFilter: '',
			hasAchTrx: depositReport.achCount>0,
			hasCardTrx: depositReport.creditcardCount>0,
			hasCheckTrx: depositReport.checkCount>0
		};
		
		json.depositRange = 'Deposit Report: '+startMoment.format('MM/DD/YYYY')+' to '+endMoment.format('MM/DD/YYYY');
		json.formattedStartDate = startMoment.format('MM/DD/YYYY');
		json.formattedEndDate = endMoment.format('MM/DD/YYYY');
		json.filterOptions = [];
		$.each( StudentFilters, function( index, val ){
			json.filterOptions.push({
				val: val.value,
				name: val.name,
				selected: ( ajaxData.filter === val.value ? 'selected': '' )
			});
			if( typeof ajaxData.filter !== 'undefined' && ajaxData.filter !== 'ALL' && ajaxData.filter === val.value ){
				json.activeFilter = val.name;	
			}
		});
		
		$.each( depositReport.achPayments, function( i , trx ){
			json.achPayments.push( formatTransaction( trx ) );
		});
		$.each( depositReport.creditcardPayments, function( i , trx ){
			json.creditcardPayments.push( formatTransaction( trx ) );
		});
		$.each( depositReport.checkPayments, function( i , trx ){
			json.checkPayments.push( formatTransaction( trx ) );
		});
		
		return json;
	}
	
	function formatDepositSummaryReport( depositReport, ajaxData ){
		ajaxData = ajaxData || {};
		var startMoment = moment( ajaxData.startDate, 'DD.MM.YYYY');
		var endMoment   = moment( ajaxData.endDate, 'DD.MM.YYYY');
		
		var json = {
			program: formatAfterSchoolProgram( depositReport.program ),
			total: thousandsSeparators( depositReport.total.toFixed(2) ),
			postDate: moment().format('MM/DD/YYYY')
		};
		json.summaryRange = startMoment.format('MM/DD/YYYY')+' to '+endMoment.format('MM/DD/YYYY');
		json.depositRange = 'Deposit Report: '+json.summaryRange;
		json.formattedStartDate = startMoment.format('MM/DD/YYYY');
		json.formattedEndDate = endMoment.format('MM/DD/YYYY');
		json.filterOptions = [];
		$.each( StudentFilters, function( index, val ){
			json.filterOptions.push({
				val: val.value,
				name: val.name,
				selected: ( ajaxData.filter === val.value ? 'selected': '' )
			});
			if( typeof ajaxData.filter !== 'undefined' && ajaxData.filter !== 'ALL' && ajaxData.filter === val.value ){
				json.activeFilter = val.name;	
			}
		});
		return json;
	}
	
	function formatTransaction( trx ){
		trx.formattedDate = timeFormatter.formatDate({
			date: trx.date,
			pattern: 'MM/DD/YYYY',
			timezone: 'America/New_York'
		});
		if( typeof trx.amount !== 'undefined' ){
			trx.amount = trx.amount.toFixed(2);
		}
		return trx;	
	}
	
	function formatAfterSchoolProgram( program ){
		var json={};
		if( typeof program.programFullName !== 'undefined' ){
			json.programFullName = program.programFullName;
		}else{
			json.programFullName = program.programName;
		}
		if( typeof program.address !== 'undefined' ){
			json.street = program.address.street;
			json.address = program.address.city+', '+program.address.state+' '+program.address.zipcode;
		}
		if( typeof program.phone !== 'undefined' ){
			json.phone = program.phone.contactValue;
		}
		if( typeof program.email !== 'undefined' ){
			json.email = program.email.contactValue;
		}
		return json;
	}
	
	function formatChildTitle( studentModel ){
		console.log(['studentModel', studentModel]);
		var title = studentModel.student.lastName+', '+studentModel.student.firstName;
		if( typeof studentModel.student.school !== 'undefined' ){
			title += ' ('+studentModel.student.school.name+')';
		}
		return title;
	}
	
	
	function bindPrintBillingReportSummary(){
		$('#print-report')
		.off('click')
		.on('click', function( e ){
			e.preventDefault();
				var $this = $(this);
				
				$('#print-report').print({
					pathToPrint: 'about:blank'
				});
				
				var thisHTML = $('#print-report').print('filteredHtml', $('#deposit-report-summary-print-wrap') );
				
				$('#printFrame').contents()
					.find('body')
						.html(thisHTML);
				
				setTimeout(function () {						
					$('#print-report').print('printIframe');
				}, 500);
		});
	}
	
	function bindPrintBillingSummaryReportSummary(){
		$('#print-summary-report')
		.off('click')
		.on('click', function( e ){
			e.preventDefault();
				var $this = $(this);
				
				$('#print-summary-report').print({
					pathToPrint: 'about:blank'
				});
				
				var thisHTML = $('#print-summary-report').print('filteredHtml', $('#deposit-summary-report-summary-print-wrap') );
				
				$('#printFrame').contents()
					.find('body')
						.html(thisHTML);
				
				setTimeout(function () {						
					$('#print-summary-report').print('printIframe');
				}, 500);
		});
	}
	
	var publicFunctions = {
		loadWeeklyDepositReport: loadWeeklyDepositReport,
		loadWeeklySummaryDepositReport: loadWeeklySummaryDepositReport
	};
	BillingReports = App.addComponent('BillingReports', '/billing/billing-reports', publicFunctions);
	return BillingReports;
})(App, jQuery);;;(function(app, $){
	var CheckinLog,
	_activeStudentTimer,
	studentOptions =[],
	CheckinSorts = [
		{ name: 'Grade 0 -> 12', value: 'GradeAsc'},
		{ name: 'Grade 12 -> 0', value: 'GradeDesc'},
		{ name: 'Last Name A -> Z', value: 'LastNameAsc'},
		{ name: 'Last Name Z -> A', value: 'LastNameDesc'},
		{ name: 'School A -> Z', value: 'SchoolAsc'},
		{ name: 'School Z -> A', value: 'SchoolDesc'}
	],
	FilterTypes= [
		{ name: 'Show All', value: 'All'},
		{ name: 'Morning Checkins', value: 'Morning'},
		{ name: 'Afterschool Checkins', value: 'Afterschool'}
	]
	;
	
	
	function loadCheckinLog( $target, search, _moment, page ){
		setActiveContainer( $target );
		_moment = _moment || moment();
		page = page || getPageObj();
		page.size = 500;
		_checkinLogController.getCheckinLog( search, _moment, page )
		.done( function( checkinLog ){
			console.log(['loadCheckinLog', loadCheckinLog]);
			renderCheckinLogs( $target, formatCheckinLogs( checkinLog, _moment, page ), _moment );
		});
	}
	
	function loadCheckinLogRows( search, _moment, page ){
		_checkinLogController.getCheckinLog( search, _moment, page )
		.done( function( checkinLog ){
			renderCheckinLogRows( formatCheckinLogs( checkinLog, _moment, page ), _moment );
		});
	}
	
	
	function loadStudentCheckinLedgerModal( ajaxData ){
		_checkinController.getStudentCheckinLedger( ajaxData )
		.done( function( checkinPage ){
			console.log(['checkinPage', checkinPage]);
			var json = formatCheckinLedger( checkinPage, ajaxData );
			renderStudentCheckinLedgerModal( ajaxData, json );
			
		});
	}
	
	function reloadStudentCheckinLedgerModal(){
		var ajaxData = $('#student-checkin-log-modal-pagination').pagination('getAjaxData');
		if( typeof ajaxData.startDate !== 'undefined' && ajaxData.startDate !== '' ){
			_startMoment = moment( ajaxData.startDate, 'MM/DD/YYYY');
			ajaxData.startDate = _startMoment.format('DD.MM.YYYY');
		}
		if( typeof ajaxData.endDate !== 'undefined' && ajaxData.endDate !== '' ){
			_endMoment = moment( ajaxData.endDate, 'MM/DD/YYYY');
			ajaxData.endDate = _endMoment.format('DD.MM.YYYY');
		}
		if( typeof ajaxData.familyFilter !== 'undefined' && 'All' !== ajaxData.familyFilter ){
			ajaxData.studentId = parseInt( ajaxData.familyFilter );
		}
		console.log(['reloadStudentCheckinLedgerModal ', ajaxData ]);
		_checkinController.getStudentCheckinLedger( ajaxData )
		.done( function( checkinPage ){
			console.log(['checkinPage', checkinPage]);
			var json = formatCheckinLedger( checkinPage, ajaxData );
			rerenderStudentCheckinLedgerModal( ajaxData, json );
			
		});
	}
	
	function loadStudentCheckinLedgerModalRows( ajaxData ){
		_checkinController.getStudentCheckinLedger(ajaxData)
			.done( function( checkinPage ){
			console.log(['checkinPage', checkinPage]);
			var json = formatCheckinLedger( checkinPage, ajaxData );
			rerenderStudentLedgerModalTotals( json );
			renderCheckinLedgerModalRows( ajaxData, json );
		});
	}
	
	function loadEditManualCheckin( json ){
		if( typeof json !== 'undefined' ){
			json.isEdit = true;
		}else{
			json = {
				isEdit: false,
				students: studentOptions,
				checkinTime: '03:00 pm',
				checkoutTime: '05:00 pm'
			};
		}
		console.log(['loadEditManualCheckin', json]);
		renderEditManualCheckin( json );
		
	}
	
	function rerenderStudentLedgerModalTotals( json ){
		CheckinLog.render('tempLedgerTotals', $('#student-ledger-modal-totals'), json);
	}
	
	function renderCheckinLogRows( checkInLogs, _moment ){
		CheckinLog.render('tempStudentRowWrap', $('#checkin-log-table').find('tbody'), checkInLogs, ['tempStudentRow'])
		.done( function(){
			renderCheckinLogPagination( checkInLogs.page );
			uniqueStudentCheckinCount( _moment );
			bindDeleteCheckinLog();
			bindEditCheckinLog();
		});
	}
	
	function renderCheckinLogs( $target, checkInLogs, _moment ){
		CheckinLog.render('tempCheckinLogTable', $target, checkInLogs, ['tempStudentRow'])
		.done( function(){
			$('.checkin-log-date').datepicker({
				dateFormat: 'mm/dd/yy'
			});
			renderCheckinLogPagination( checkInLogs.page );
			uniqueStudentCheckinCount( _moment );
			bindDeleteCheckinLog();
			bindEditCheckinLog();
			bindPrintCheckinLog();
			$('#clear-daily-logs')
				.off('click')
				.on('click', function(){
					renderClearDailyLogsModal();
				});
		});
	}
	
	function renderCheckinLog( checkinLog ){
		CheckinLog.getRenderedString('tempStudentRow', checkinLog )
		.done(function( renderedString ){
			$('#checkin-log-row-'+checkinLog.id).replaceWith( renderedString );
			bindDeleteCheckinLog();
			bindEditCheckinLog();
		});
		
	}
	
	function renderEditCheckinLogModal( json ){
		CheckinLog.getRenderedString('tempEditCheckinLogModal', json)
		.done( function( renderedString ){
			$('#modal-wrapper').html( renderedString );
			$('#editCheckinLogModal').modal('show');
			$('#editCheckinLogModal')
				.find('.time-range').each(function(){
					$(this).inputmask('datetime', {  
						'inputFormat': 'hh:MM TT',
						'outputFormat': 'HH:MM:ss'
					});
			});
			$('#modal-edit-checkin-log-btn')
			.off('click')
			.on('click', function(){
				console.log(['clicked']);
				var $form = $('#editCheckinLogModal').find('form');
				var json = $form.serializeJSON( serializeJSON_Defaults );
				
				console.log(['edit checkout json ', json ]);
				_checkinLogController.updateCheckinLog(json)
				.done( function( checkinLog ){
					renderCheckinLog( formatStudent( checkinLog ) );
					$('#editCheckinLogModal').modal('hide');
				});
			});
		});
		
	}
	
	function renderStudentCheckinLedgerModal( ajaxData, json ){
		CheckinLog.getRenderedString('tempStudentCheckinLogModal', json, ['tempLedgerTableBody', 'tempLedgerTableRow', 'tempLedgerTotals'])
		.done( function( renderedString ){
			$('#modal-wrapper').html( renderedString );
			$('#checkinLedgerModal').modal('show');
			$('.checkin-ledger-date').datepicker({
				dateFormat: 'mm/dd/yy'
			});
			
			renderCheckinLedgerModalPagination( ajaxData,  json.page );
			bindPrintStudentLedgerModal();
			bindAddManualCheckinLog();
			bindManualEditDeleteCheckinLog();
		});
	}
	
	function rerenderStudentCheckinLedgerModal( ajaxData, json ){
		CheckinLog.getRenderedString('tempStudentCheckinLogModal', json, ['tempLedgerTableBody', 'tempLedgerTableRow', 'tempLedgerTotals'])
		.done( function( renderedString ){
			$('#modal-wrapper').find('.modal-body').html( $(renderedString).find('.modal-body') );
			$('.checkin-ledger-date').datepicker({
				dateFormat: 'mm/dd/yy'
			});
			
			renderCheckinLedgerModalPagination( ajaxData,  json.page );
			bindPrintStudentLedgerModal();
			bindAddManualCheckinLog();
			bindManualEditDeleteCheckinLog();
		});
	}
	
	function renderEditManualCheckin( json ){
		json.fn = _mustacheHelper;
		CheckinLog.render('tempEditManualCheckin', $('.edit-checkin-log-wrap'), json )
		.done( function(){
			//$('#add-transation-btn').hide();
			$('.manual-checkin-date').datepicker({
				dateFormat: 'mm/dd/yy'
			});
			bindEditManualCheckinButtons();
			
		});
	}
	
//	function renderActiveStudent( student ){
//		CheckinLog.getRenderedString('tempStudentRow', student )
//		.done( function( renderedString ){
//			$('#active-table').find('tbody').prepend(renderedString);
//			bindCheckoutRows();
//		});
//		
//	}
	function renderCheckinLedgerModalRows( ajaxData, json ){
		CheckinLog.getRenderedString('tempLedgerTableBody', json, ['tempLedgerTableRow'])
		.done( function( renderedString ){
			$('#modal-wrapper').find('tbody').html( renderedString );
			renderCheckinLedgerModalPagination( ajaxData, json.page );
			bindPrintStudentLedgerModal();
			bindAddManualCheckinLog();
			bindManualEditDeleteCheckinLog();
		});
	}
	
	function renderCheckinLedgerModalPagination( _ajaxData, _page ){
		return app.getComponent('Pagination').getFn('loadPagination', ['tempChevronSpans', $('#student-checkin-log-modal-pagination'), _page ])
		.done( function( $container, page ){
			$container.pagination({
				overrideLoadFunction: function(data){
					console.log(['overrideLoadFunction', data.ajaxData]);
					if( typeof data.ajaxData.startDate !== 'undefined' && data.ajaxData.startDate !== '' ){
						_startMoment = moment( data.ajaxData.startDate, 'MM/DD/YYYY');
						data.ajaxData.startDate = _startMoment.format('DD.MM.YYYY');
						//delete data.ajaxData.date;
					}
					if( typeof data.ajaxData.endDate !== 'undefined' && data.ajaxData.endDate !== '' ){
						_endMoment = moment( data.ajaxData.endDate, 'MM/DD/YYYY');
						data.ajaxData.endDate = _endMoment.format('DD.MM.YYYY');
						//delete data.ajaxData.date;
					}
					if( typeof data.ajaxData.transactionType !== 'undefined' && 'All' === data.ajaxData.transactionType ){
						delete data.ajaxData.transactionType;
					}
					if( typeof data.ajaxData.familyFilter !== 'undefined' && 'All' !== data.ajaxData.familyFilter ){
						data.ajaxData.studentId = parseInt( data.ajaxData.familyFilter );
					}
					
					loadStudentCheckinLedgerModalRows( data.ajaxData );
				},
				filterClass: 'student-checkin-log-modal-filter',
				ajaxData: _ajaxData
			});
		});
	}
	
	
	function renderCheckinLogPagination( _page ){
		return app.getComponent('Pagination').getFn('loadPagination', ['tempChevronSpans', $('#checkin-log-pagination'), _page ])
		.done( function( $container, page ){
			$container.pagination({
				overrideLoadFunction: function(data){
					//TODO: get this from UI
					console.log(['pagination ', data ]);
					var _moment;
					if( typeof data.ajaxData.date !== 'undefined' ){
						_moment = moment( data.ajaxData.date, 'MM/DD/YYYY');
						delete data.ajaxData.date;
					}else{
						_moment = moment();
					}
					loadCheckinLogRows( data.search, _moment, data.ajaxData );
				}, 
				filterClass: 'checkin-log-filter',
				ajaxData: page
			});
		});
	}
	
	function renderClearDailyLogsModal( ){
		var _moment = moment( $('.checkin-log-date').val(), 'MM/DD/YYYY');
		var json = {
			formattedDate: _moment.format('MM/DD/YYYY')
		};
		CheckinLog.getRenderedString('tempClearCheckinLogModal', json )
		.done( function( renderedString ){
			$('#modal-wrapper').html( renderedString );
			$('#clearCheckinLogModal').modal('show');
			$('#modal-checkin-clear-btn')
				.off('click')
				.on('click', function(){
					var confirmation = $('#clearCheckinLogModal').find('input.confirmation').val();
					if( confirmation === 'CLEAR' ){
						$('#clearCheckinLogModal').find('input.confirmation').removeClass('is-invalid');
						_checkinLogController.clearCheckinLog( _moment ).done(function(){
							$('#clearCheckinLogModal').modal('hide');
							console.log(['checking log controller loadPage 109']);
							$('#checkin-log-pagination').pagination('loadPage');
						});
					}else{
						$('#clearCheckinLogModal').find('input.confirmation').addClass('is-invalid');
					}
				});
			$('#clearCheckinLogModal').find('input.confirmation')
			.off('keyup')
			.on('keyup', function(){
				var confirmation = $('#clearCheckinLogModal').find('input.confirmation').val();
				if( confirmation === 'CLEAR' ){
					$('#clearCheckinLogModal').find('input.confirmation').removeClass('is-invalid');
				}else{
					$('#clearCheckinLogModal').find('input.confirmation').addClass('is-invalid');
				}
			});
		});
		
	}
	
	
	function formatCheckinLogs( checkinLogPage, _moment, ajaxData ){
		console.log(['formatCheckinLogs', checkinLogPage, _moment, ajaxData ]);
		var checkinLogs = {
			checkIns: checkinLogPage.content,
			page: getPageObj( checkinLogPage ),
			formattedDate: _moment.format('MM/DD/YYYY')
		};
		
		if( typeof checkinLogs.checkIns !== 'undefined' ){
			checkinLogs.checkIns.forEach( function(student){
				formatStudent( student );
			});
		}
		
		checkinLogs.pageSizeOptions = [];
		$.each( [10, 25, 50, 100, 500], function(index, value){
			checkinLogs.pageSizeOptions.push({
				val: value,
				name: value,
				selected: ( checkinLogs.page.size === value ? 'selected' : '')
			});
		});
		
		checkinLogs.studentSortOptions = [];
		$.each( CheckinSorts, function( index, val ){
			checkinLogs.studentSortOptions.push({
				val: val.value,
				name: val.name,
				selected: ( checkinLogs.studentSort === val.value ? 'selected': '' )
			});
		});
		checkinLogs.studentFilterOptions = [];
		$.each( FilterTypes, function( index, val ){
			checkinLogs.studentFilterOptions.push({
				val: val.value,
				name: val.name,
				selected: ( checkinLogs.studentFilter === val.value ? 'selected': '' )
			});
		});
		
		
		if( typeof ajaxData !== 'undefined' && 
			typeof ajaxData.studentFilter !== 'undefined' && 
			ajaxData.studentFilter !== 'All' ){
			$('.active-filter-student-log-count').html( checkinLogPage.totalElements );
			$('.active-filter-student-log-count-wrap').show();
		}else{
			$('.active-filter-student-log-count-wrap').hide();
		}
		
		console.log(['formatCheckinLogs', checkinLogs, CheckinSorts]);
		
		
		
		return checkinLogs;
	}
	
	function bindPrintStudentLedgerModal( ){
		$('#print-student-checkin-ledger')
		.off('click')
		.on('click', function( e ){
			e.preventDefault();
//					var _clone = $('#billingLedgerModal').find('.modal-body').clone();
//					var $this = $(this),
//						thisHTML = $.trim($(".dnp",_clone).remove().end().html());
				var $this = $(this);
					$('#checkinLedgerModal').print({
						pathToPrint: 'about:blank'
					});
					
					var thisHTML = $('#checkinLedgerModal').print('filteredHtml', $('#checkinLedgerModal').find('.modal-body'));
					
					$('#printFrame').contents()
						.find('body')
							.html(thisHTML);
					
					setTimeout(function () {						
						$('#checkinLedgerModal').print('printIframe');
					}, 500);
		});
	
}
	
	function bindAddManualCheckinLog(){
		$('#add-checkin-log-btn') 
		.off('click')
		.on('click', function( e ){
			e.preventDefault();
			$('#add-checkin-log-btn').hide();
			loadEditManualCheckin();
			
			
		});
	}
	
	function bindManualEditDeleteCheckinLog(){
		$('.checkin-ledger-edit')
			.off('click')
			.on('click', function( e ){
				e.preventDefault();
				var $elem = $(this);
				_checkinLogController.fetchManualCheckinLog( $(this).data('id') )
				.done(function( json ){
					$('#add-checkin-log-btn').hide();
					loadEditManualCheckin( json );
				});
			});
		$('.checkin-ledger-remove')
			.off('click')
			.on('click', function( e ){
				var logId  = $(this).data('id');
				$('.manual-checkin-ledger-row[data-id='+logId+']').after(
					'<tr class="delete-manual-checkin-row" data-id="'+logId+'" >'+
						'<td colspan="4">Delete Record and Reverse Billed Amounts?</td>'+
						'<td>'+
							'<button class="btn btn-danger btn-cancel-delete-manual-checkin" data-id="'+logId+'" style="margin-right: 15px;">Cancel</button>'+
							'<button class="btn btn-success btn-confirm-delete-manual-checkin" data-id="'+logId+'">Confirm</button>'+
						'</td>'+
					'</tr>'
				);
				$('.btn-cancel-delete-manual-checkin')
					.off('click')
					.on('click', function(){
						var deleteLogId = $(this).data('id');
						$('.delete-manual-checkin-row[data-id='+deleteLogId+']').remove();
						
						
					});
				$('.btn-confirm-delete-manual-checkin')
				.off('click')
				.on('click', function(){
					var deleteLogId = $(this).data('id');
					$('.delete-manual-checkin-row[data-id='+deleteLogId+']').remove();
					_checkinLogController.clearSingleCheckinLog( deleteLogId )
					.done(function(){
						//$elem.closest('tr').remove();
						//uniqueStudentCheckinCount( moment( $('.checkin-log-date').val(), 'MM/DD/YYYY') );
						$(document).trigger('manualCheckinLog');
						reloadStudentCheckinLedgerModal();
					});
					$('.manual-checkin-ledger-row[data-id='+deleteLogId+']').remove();
				});
			});	
	}
	
	function bindEditManualCheckinButtons(){
		$('.checkinRecordType-select')
		.off('change')
		.on('change', function(){
			var recordType = $(this).find('option:selected').val();
			if( recordType === 'Afterschool' ){
				$('#edit-manual-checkin-form').find('.checkinTime').val('03:00 pm');
				$('#edit-manual-checkin-form').find('.checkoutTime').val('05:00 pm');
				
			}else{
				$('#edit-manual-checkin-form').find('.checkinTime').val('07:00 am');
				$('#edit-manual-checkin-form').find('.checkoutTime').val('07:50 am');
			}
		});
		
		$('.checkinDate')
		.off('change')
		.on('change', function(){
			$('#edit-manual-checkin-form').find('.checkoutDate').val( $('#edit-manual-checkin-form').find('.checkinDate').val() );
		});
		
		
		
		$('.cancel-manual-checkin-btn')
			.off('click')
			.on('click', function(){
				$('.edit-checkin-log-wrap').empty();
				$('#add-checkin-log-btn').show();
			});
		$('.save-manual-checkin-btn ')
			.off('click')
			.on('click', function(){
				var $form = $('.edit-checkin-log-wrap').find('form');
				var json = $form.serializeJSON( serializeJSON_Defaults );
				
				if( typeof json.checkinTime !== 'undefined' ){
					json.checkinTime = json.checkinTime.toUpperCase();
				}
				if( typeof json.checkoutTime !== 'undefined' ){
					json.checkoutTime = json.checkoutTime.toUpperCase();
				}
				
				_checkinLogController.postManualCheckinLog( json )
				.always( function(){
					$('.edit-checkin-log-wrap').empty();
					$('#add-checkin-log-btn').show();
					reloadStudentCheckinLedgerModal();
					$(document).trigger('manualCheckinLog');
				});
			});
	}
	
	function bindDeleteCheckinLog(){
		$('.delete-log-btn')
		.off('click')
		.on('click', function(){
			var $elem = $(this);
			_checkinLogController.clearSingleCheckinLog( $(this).data('id') )
			.done(function(){
				$elem.closest('tr').remove();
				uniqueStudentCheckinCount( moment( $('.checkin-log-date').val(), 'MM/DD/YYYY') );
			});
		});
	}
	
	function bindEditCheckinLog(){
		$('.checkin-log-edit').off('click')
		.on('click', function(){
			var $elem = $(this);
			
			var json = {
			  id: $elem.data('id'),
			  defaultCheckInTime: $elem.data('checkin'),
			  defaultCheckOutTime: $elem.data('checkout'),
			  studentName: $elem.closest('tr').find('.student-name').html()
			};
			
			console.log(['renderEditCheckinLogModal', json]);
			renderEditCheckinLogModal( json );
			
//			_checkinLogController.clearSingleCheckinLog( $(this).data('id') )
//			.done(function(){
//				$elem.closest('tr').remove();
//				uniqueStudentCheckinCount( moment( $('.checkin-log-date').val(), 'MM/DD/YYYY') );
//			});
		});
		
	}
	
	function bindPrintCheckinLog(){
		$('#print-students')
		.off('click')
		.on('click', function( e ){
			e.preventDefault();
				var $this = $(this);
				
				$('#print-students').print({
					pathToPrint: 'about:blank'
				});
				
				var thisHTML = $('#print-students').print('filteredHtml', $('#student-checkin-log-print-wrap') );
				
				$('#printFrame').contents()
					.find('body')
						.html(thisHTML);
				
				setTimeout(function () {						
					$('#print-students').print('printIframe');
				}, 500);
		});
	}
	
	function bindCheckinLedgerModal( clazz ){
		clazz = clazz || 'student-checkin-ledger';
		$('.'+clazz)
			.off('click')
			.on('click', function(){
				loadStudentCheckinLedgerModal( {
					startDate: moment().startOf('month').format('DD.MM.YYYY'),
					endDate:   moment().endOf('month').format('DD.MM.YYYY'),
					studentId: $(this).data('id')
				} );
			});
	}
	
	function formatCheckinLedger( ledgerModel, ajaxData ){
		console.log(['formatCheckinLedger', ledgerModel]);
		var json = {
			allowDelete: Auth.inAuthorizedGroup('OWNERS'),
			allowEdit: Auth.inAuthorizedGroup('OWNERS'),
			checkins: [],
			studentAccounts: [],
			page: {}
		};
		
		studentOptions = [];
		if( typeof ledgerModel.familyAccount !== 'undefined' ){
			json.hasFamilyAccount = true;
			json.familyCheckinCount = ledgerModel.familyAccount.checkinCount;
			json.familyAccountId = ledgerModel.familyAccount.billingBalanceId;
		}
		json.studentAccounts = ledgerModel.studentAccounts;
		if( typeof ledgerModel.studentAccounts !== 'undefined' ){
			$.each( ledgerModel.studentAccounts, function( i, studentAccount  ){
				studentOptions.push({
					studentId: studentAccount.person.id,
					name: studentAccount.person.firstName +' '+studentAccount.person.lastName,
					selected: studentAccount.person.id === ajaxData.studentId ? 'selected':''
				});
			});
		}
		json.studentOptions = studentOptions;
		
		if( typeof ledgerModel.checkinPage !== 'undefined' && ledgerModel.checkinPage.content ){
			json.page = getPageObj( ledgerModel.checkinPage );
			$.each( ledgerModel.checkinPage.content, function( index, checkinLog ){
				json.checkins.push( formatCheckinLedgerLog( checkinLog, json.allowDelete ) );
			});
		}
		json.pageSizeOptions = [];
		$.each( [10, 25, 50, 100, 500], function(index, value){
			json.pageSizeOptions.push({
				val: value,
				name: value,
				selected: ( json.page.size === value ? 'selected' : '')
			});
		});
		if( typeof ajaxData !== 'undefined'){
			if( typeof ajaxData.startDate !== 'undefined' ){
				_startMoment = moment( ajaxData.startDate, 'DD.MM.YYYY');
				json.formattedStartDate = _startMoment.format('MM/DD/YYYY');
			}
			if( typeof ajaxData.endDate !== 'undefined' ){
				_endMoment = moment( ajaxData.endDate, 'DD.MM.YYYY');
				json.formattedEndDate = _endMoment.format('MM/DD/YYYY');
			}
		}
		
		console.log(['formatCheckinLedger after', json]);
		return json;
	}
	
	function formatCheckinLedgerLog( checkinLog, allowDelete){
		if( typeof checkinLog.checkInTime !== 'undefined' ){
			checkinLog.formattedCheckInTime = timeFormatter.formatDate({
				date: checkinLog.checkInTime,
				pattern: 'MM/DD/YY h:mma',
				timezone: 'America/New_York'
			});
		}
		if( typeof checkinLog.checkOutTime !== 'undefined' ){
			checkinLog.formattedCheckOutTime = timeFormatter.formatDate({
				date: checkinLog.checkOutTime,
				pattern: 'MM/DD/YY h:mma',
				timezone: 'America/New_York'
			});
		}
		checkinLog.studentName = '';
		if( typeof checkinLog.student !== 'undefined' ){
			checkinLog.studentName = checkinLog.student.firstName+' '+checkinLog.student.lastName;
		}
		checkinLog.allowDelete = allowDelete;
		checkinLog.pickupName = checkinLog.pickupName || 'Self Checkout';
		return checkinLog;
	}
	
	function formatStudent( student ){
		if( typeof student.checkInTime !== 'undefined' ){
			student.formattedCheckInTime = timeFormatter.formatDate({
				date: student.checkInTime,
				pattern: 'h:mma',
				timezone: 'America/New_York'
			});
		}
		if( typeof student.checkOutTime !== 'undefined' ){
			student.formattedCheckOutTime = timeFormatter.formatDate({
				date: student.checkOutTime,
				pattern: 'h:mma',
				timezone: 'America/New_York'
			});
		}
		return student;
	}
	
	function uniqueStudentCheckinCount( _moment ){
		console.log(['uniqueStudentCheckinCount', _moment]);
		_checkinLogController.fetchUniqueStudentCheckinCount( _moment )
		.done(function( count ){
			$('.unique-student-log-count').html( count );
		});
	}
	
	
	
	
	
	
	var publicFunctions = {
			loadCheckinLog: loadCheckinLog,
			bindCheckinLedgerModal: bindCheckinLedgerModal
		};
		CheckinLog = App.addComponent('CheckinLog', '/students/checkin-log', publicFunctions);
		return CheckinLog;
	})(App, jQuery);;;(function(app, $){
	var EmployeeTimeclock;
	
	function loadEmployeeTimeclock( $target ){
		setActiveContainer( $target );
		EmployeeTimeclock.render('tempEmployeeTimeclock', $target, {} )
		.done( function(){
			
		});
	}
	
	var publicFunctions = {
		loadEmployeeTimeclock: loadEmployeeTimeclock
	};
	EmployeeTimeclock = App.addComponent('EmployeeTimeclock', '/employee/employee-timeclock', publicFunctions);
	return EmployeeTimeclock;
})(App, jQuery);;;(function(app, $){
	var Pagination;
	
	/**
	 * Renders html with Mustache.js from the templateId and inserts it into each container.
	 * 
	 * @param templateId
	 * @param $containers
	 * @param page - must contain fields
	 * 		page - current page number
	 * 		max - max page number
	 */
	loadPagination = function( templateId, $containers, page){
		var dfd = $.Deferred();
		//Only render template if more than one page exists
		if( page.max > 1 ){
			$containers.show();
			if( page.max == page.page ){
				page.next = page.max;
				page.hasNext = false;
			}else{
				page.next = page.page+1;
				page.hasNext = true;
			}
			if( 1 > page.page-1 ){
				page.prev = 1;
				page.hasPrev = false;
			}else{
				page.prev = page.page-1;
				page.hasPrev = true;
			}
			Pagination.render(templateId, $containers, page )
			.done(function( $containers, params ){
				dfd.resolve($containers, params);
			});
		}else{
			$containers.hide();
			dfd.resolve($containers, page);
		}
		return dfd.promise();
	};
	
		
	var publicFunctions = {
		loadPagination: loadPagination,
	};
	Pagination = App.addComponent('Pagination', '/utilities', publicFunctions);
	return Pagination;
})(App, jQuery);;;(function(app, $){
	var StudentBilling,
	CheckinSorts = [
		{ name: 'Grade 0 -> 12', value: 'GradeAsc'},
		{ name: 'Grade 12 -> 0', value: 'GradeDesc'},
		{ name: 'Last Name A -> Z', value: 'LastNameAsc'},
		{ name: 'Last Name Z -> A', value: 'LastNameDesc'},
		{ name: 'School A -> Z', value: 'SchoolAsc'},
		{ name: 'School Z -> A', value: 'SchoolDesc'}
	];
	
	function loadStudentBilling( $target ){
		setActiveContainer( $target );
		console.log(['loadStudentBilling']);
		_studentBillingController.getBillingWeekOptionModels()
		.done(function(weekOptions){
			console.log(['weekOptions', weekOptions]);
			var json = {
				page: getPageObj({})
			};
			json.weeklyOptions = formatWeekOptions(weekOptions);
			json.studentSortOptions = [];
			$.each( CheckinSorts, function( index, val ){
				json.studentSortOptions.push({
					val: val.value,
					name: val.name
					//selected: ( json.studentSort === val.value ? 'selected': '' )
				});
			});
			
			formatPageSizeOptions( json );
			
			var _moment = moment( weekOptions[0], 'MM/DD/YYYY');
			_studentBillingController.getStudentBillingWeekOk( _moment, json.page )
			.done(function( billingLogPage ){
				console.log(['billingLogPage', billingLogPage]);
				json.studentBillings = formatStudentBillings( billingLogPage.content );
				json.page = getPageObj( billingLogPage );
				StudentBilling.render('tempBilling', $target, json, ['tempStudentBillingPage', 'tempStudentBillingRow'] )
				.done( function(){
					bindEditBilling( _moment );
					bindViewBillingLedger();
					bindViewCheckinLedger();
					bindPrintBillingLedger();
					renderStudentBillingPagination( json.page );
				});
			});
		});
	}
	
	function loadStudentBillingRows( _moment, page ){
		var json = {
			page: page
		};
		_studentBillingController.getStudentBillingWeekOk( _moment, page )
		.done(function( billingLogPage ){
			console.log(['billingLogPage', billingLogPage]);
			json.studentBillings = formatStudentBillings( billingLogPage.content );
			json.page = getPageObj( billingLogPage );
			StudentBilling.render('tempStudentBillingPage', $('#student-billing-table').find('tbody'), json, ['tempStudentBillingRow'] )
			.done( function(){
				bindEditBilling( _moment );
				bindViewBillingLedger();
				bindViewCheckinLedger();
				bindPrintBillingLedger();
				renderStudentBillingPagination( json.page );
			});
		});
	}
	
	function renderStudentBillingPagination( _page ){
		return app.getComponent('Pagination').getFn('loadPagination', ['tempChevronSpans', $('#students-billing-pagination'), _page ])
		.done( function( $container, page ){
			$container.pagination({
				overrideLoadFunction: function(data){
					console.log(['page data', data]);
					var _moment = moment( data.ajaxData.weekOf, 'MM/DD/YYYY');
					loadStudentBillingRows( _moment, data.ajaxData );
				},
				filterClass: 'student-billing-filter',
				ajaxData: page
			});
		});
	}
	
	function formatStudentBillings( logs ){
		$.each( logs, function( i, v ){
			v = formatStudentBilling(v);
		});
		console.log(['formatStudentBillings', logs]);
		return logs;
	}
	
	function formatStudentBilling( studentBilling ){
		if( typeof studentBilling.dailyRecords !== 'undefined' ){
			$.each( studentBilling.dailyRecords, function(i, dailyRecord){
				formatStudentAttendanceDay( studentBilling, dailyRecord );
			});
		}
		
		switch( studentBilling.paymentStatus ){
			case 'DUE':
				studentBilling.formattedPaymentStatus = 'Due';
				break;
			case 'OUTSTANDING':
				studentBilling.formattedPaymentStatus = 'Outstanding';
				break;
			case 'PAID':
				studentBilling.formattedPaymentStatus = 'Paid';
				break;
		}
		console.log(['formatStudentBilling', studentBilling]);
		return studentBilling;
	}
	
	function formatStudentAttendanceDay( json, dailyRecord ){
		var _moment = moment( dailyRecord.attendanceDate, 'YYYY-MM-DD');
		switch( _moment.day() ){
			case 0: //Sunday
				json.isSundayAttendace = true;
				json.sundayAttendaceType = formatAttendanceType( dailyRecord.attendanceType );
				break;
			case 1:
				json.isMondayAttendace = true;
				json.mondayAttendaceType = formatAttendanceType( dailyRecord.attendanceType );
				break;
			case 2:
				json.isTuesdayAttendace = true;
				json.tuesdayAttendaceType = formatAttendanceType( dailyRecord.attendanceType );
				break;
			case 3:
				json.isWednesdayAttendace = true;
				json.wednesdayAttendaceType = formatAttendanceType( dailyRecord.attendanceType );
				break;
			case 4:
				json.isThursdayAttendace = true;
				json.thursdayAttendaceType = formatAttendanceType( dailyRecord.attendanceType );
				break;
			case 5:
				json.isFridayAttendace = true;
				json.fridayAttendaceType = formatAttendanceType( dailyRecord.attendanceType );
				break;
			case 6:
				json.isSaturdayAttendace = true;
				json.saturdayAttendaceType = formatAttendanceType( dailyRecord.attendanceType );
				break;
		}
		console.log(['formatStudentAttendanceDay', json]);
	}
	
	function formatAttendanceType( attendanceType ){
		switch( attendanceType ){
			case 'EARLY_RELEASE':
				return 'E';
			case 'ABSENT':
				return 'A';
			case 'FULL_DAY':
				return 'F';
			case 'HALF_DAY':
				return 'H';
			case 'DAILY_RATE':
				return 'D';
		}
	}
	
	
	function formatWeekOptions( weekOptions ){
		var options =[];
		$.each( weekOptions, function(i,v){
			options.push({
				val: v,
				name: v,
				selected: ( i === 0 ? 'selected' : '')
			});
		});
		return options;
	}
	
	function formatPageSizeOptions( json ){
		json.pageSizeOptions = [];
		$.each( [10, 25, 50, 100, 500], function(index, value){
			json.pageSizeOptions.push({
				val: value,
				name: value,
				selected: ( json.page.size === value ? 'selected' : '')
			});
		});
	}
	
	function bindEditBilling( _moment ){
		$('.user-billing-edit')
		.off('click')
		.on('click', function(){
			renderBillingModal( $(this).data('id'), _moment );
		});
	}
	
	function bindViewBillingLedger(){
		app.getComponent('StudentLedger').getFn('bindStudentLedgerModal');
		$(document)
			.off('manualCheckinLog.studentBilling')
			.on('manualCheckinLog.studentBilling', function(){
				var ajaxData = $('#students-billing-pagination').pagination('getAjaxData');
				var _moment = moment( ajaxData.weekOf, 'MM/DD/YYYY');
				loadStudentBillingRows( _moment, ajaxData );
			});
	}
	function bindViewCheckinLedger(){
		app.getComponent('CheckinLog').getFn('bindCheckinLedgerModal');
	}
	
	function bindPrintBillingLedger(){
		$('#print-student-billing')
		.off('click')
		.on('click', function( e ){
			e.preventDefault();
				var $this = $(this);
				
				$('#print-student-billing').print({
					pathToPrint: 'about:blank'
				});
				
				var thisHTML = $('#print-student-billing').print('filteredHtml', $('#student-billing-print-wrap') );
				
				$('#printFrame').contents()
					.find('body')
						.html(thisHTML);
				
				setTimeout(function () {						
					$('#print-student-billing').print('printIframe');
				}, 500);
		});
	}
	
	function renderBillingModal( studentId, _moment ){
		console.log(['renderBillingModal', studentId, _moment ]);
		StudentBilling.getRenderedString('tempBillingRecordModal', {
			studentId: studentId
		})
		.done( function( renderedString ){
			$('#modal-wrapper').html( renderedString );
			$('#billingRecordModal').modal('show');
			
			$('#save-billing-btn')
			.off('click')
			.on('click', function(){
				console.log(['clicked']);
				var $form = $('#billingRecordModal').find('form');
				var json = $form.serializeJSON( serializeJSON_Defaults );
				
				if( typeof json.type === 'undefined' ){
					json.type = 'Payment';
				}
				
				_billingController.saveBillingRecord( json )
				.always( function(){
					$('#billingRecordModal').modal('hide');
					_studentBillingController.getStudentBillingWeekOfEntry( _moment, studentId )
					.done(function( billingLog ){
						console.log(['billingLog', billingLog]);
						var responseJSON = {};
						responseJSON = formatStudentBilling( billingLog );
						StudentBilling.getRenderedString('tempStudentBillingRow', responseJSON )
						.done( function( renderedString ){
							console.log(['renderedString', renderedString]);
							$('tr.student-billing-row[data-id='+studentId+']').replaceWith( renderedString );
							bindEditBilling( _moment );
							bindViewBillingLedger();
							bindViewCheckinLedger();
						});
					});
				});
			});
			
			
		});
		
	}
	
	var publicFunctions = {
		loadStudentBilling: loadStudentBilling
	};
	StudentBilling = App.addComponent('StudentBilling', '/billing/student-billing', publicFunctions);
	return StudentBilling;
})(App, jQuery);;;(function(app, $){
	var studentOptions=[],
	PaymentMethodOptions=[
		{ name: 'Credit Card', value:'CreditCard'},
		{ name: 'ACH', value:'Ach'},
		{ name: 'Check', value:'Check'},
		{ name: 'Cash', value:'Cash'}
	];
		
	function bindStudentLedgerModal( clazz ){
		clazz = clazz || 'student-ledger';
		console.log(['bindStudentLedgerModal', clazz]);
		$('.'+clazz)
			.off('click')
			.on('click', function(){
				loadStudentLedgerModal( {
					studentId: $(this).data('id')
				} );
			});
	}
	
	function bindAddTransaction(){
		$('#add-transation-btn') 
			.off('click')
			.on('click', function( e ){
				e.preventDefault();
				$('#add-transation-btn').hide();
				loadNewCharge();
				
				
			});
			
	}
	
	function bindNewCharge(){
		$('.cancel-billing-btn')
			.off('click')
			.on('click', function(){
				$('.new-charge-wrap').empty();
				$('#add-transation-btn').show();
			});
		$('.save-billing-btn ')
			.off('click')
			.on('click', function(){
				var $form = $('.new-charge-wrap').find('form');
				var json = $form.serializeJSON( serializeJSON_Defaults );
				if( typeof json.type === 'undefined' ){
					json.type = 'Payment';
				}
				if( json.type !== 'Payment'){
					delete json.paymentMethodType;
				}
				
				json.updateLedger = json.updateLedger || false;
				
				_billingController.saveBillingRecord( json )
				.always( function(){
					$('.new-charge-wrap').empty();
					$('#add-transation-btn').show();
					reloadStudentLedgerModal();
				});
			});
		$('.transaction-type')
			.off('change')
			.on('change', function(){
				var selectedType = $(this).find('option:selected').val();
				if( selectedType === 'Payment'){
					$('.payment-method-type-wrap').show();
				}else{
					$('.payment-method-type-wrap').hide();
				}
			});
		
	}
	
	function bindDelete(){
		$('.billing-ledger-remove')
			.off('click')
			.on('click', function(){
				var ledgerId  = $(this).data('id');
				$('.billing-ledger-row[data-id='+ledgerId+']').after(
					'<tr class="delete-ledger-row" data-id="'+ledgerId+'" >'+
						'<td colspan="5">Delete Record and Reverse Amount?</td>'+
						'<td><button class="btn btn-danger btn-cancel-delete-ledger" data-id="'+ledgerId+'">Cancel</button></td>'+
						'<td><button class="btn btn-success btn-confirm-delete-ledger" data-id="'+ledgerId+'">Confirm</button></td>'+
					'</tr>'
				);
				$('.btn-cancel-delete-ledger')
					.off('click')
					.on('click', function(){
						var deleteLedgerId = $(this).data('id');
						$('.delete-ledger-row[data-id='+deleteLedgerId+']').remove();
						
						
					});
				$('.btn-confirm-delete-ledger')
				.off('click')
				.on('click', function(){
					var deleteLedgerId = $(this).data('id');
					$('.delete-ledger-row[data-id='+deleteLedgerId+']').remove();
					_studentLedgerController.deleteBillingLedger( deleteLedgerId )
					.done( function(){
						reloadStudentLedgerModalTotals();
					});
					$('.billing-ledger-row[data-id='+ledgerId+']').remove();
				});
			});	
	}
	
	function bindEditLedger(){
		$('.billing-ledger-edit')
		.off('click')
		.on('click', function(){
			var ledgerId  = $(this).data('id');
			var json ={
				ledgerId: ledgerId,
				description: $('.billing-ledger-row[data-id='+ledgerId+']').data('description'),
				amount: $('.billing-ledger-row[data-id='+ledgerId+']').data('amount'),
				type: $('.billing-ledger-row[data-id='+ledgerId+']').data('trxtype'),
				paymentMethodType: $('.billing-ledger-row[data-id='+ledgerId+']').data('paymentmethod'),
			};
			
			if( 'Payment'===json.type ){
				json.paymentMethodOptions = [];
				$.each( PaymentMethodOptions, function( index, val ){
					json.paymentMethodOptions.push({
						val: val.value,
						name: val.name,
						selected: ( json.paymentMethodType === val.value ? 'selected': '' )
					});
				});
				json.showMethodType = true;
			}
			
			
			StudentLedger.getRenderedString('tempEditLedgerRow', json)
			.done( function( renderedString ){
				$('.billing-ledger-row[data-id='+ledgerId+']').after( renderedString );
				$('.btn-cancel-edit-ledger')
					.off('click')
					.on('click', function(){
						var editLedgerId = $(this).data('id');
						$('.edit-ledger-row[data-id='+editLedgerId+']').remove();
					});
				$('.btn-confirm-edit-ledger')
					.off('click')
					.on('click', function(){
						var editLedgerId = $(this).data('id');
						var $editLedgerRow = $('.edit-ledger-row[data-id='+editLedgerId+']');
						var billingTransactionModel = {
							description: $editLedgerRow.find('.description').val(),
							amount: $editLedgerRow.find('.amount').val()
						};
						console.log(['$editLedgerRow', $editLedgerRow, $editLedgerRow.find('.payment-method-type').length ]);
						if( $editLedgerRow.find('.payment-method-type').length > -1  ){
							billingTransactionModel.paymentMethodType = $editLedgerRow.find('.payment-method-type').find('option:selected').val();							
						}
						
						console.log(['$editLedgerRow', billingTransactionModel ]);
						_studentLedgerController.updateBillingLedger( editLedgerId, billingTransactionModel )
						.done( function( editLedgerResponse ){
							$editLedgerRow.remove();
							reloadStudentLedgerModalTotals();
							rerenderStudentLedgerRow( formatTransaction( editLedgerResponse, true ) );
						});
					});
			});
			
		});	
	}
	
	function bindPrintStudentLedgerModal( ){
		$('#print-ledger')
			.off('click')
			.on('click', function( e ){
				e.preventDefault();
						
//						var _clone = $('#billingLedgerModal').find('.modal-body').clone();
//						var $this = $(this),
//							thisHTML = $.trim($(".dnp",_clone).remove().end().html());
					var $this = $(this);
						
						
						$('#billingLedgerModal').print({
							pathToPrint: 'about:blank'
						});
						
						var thisHTML = $('#billingLedgerModal').print('filteredHtml', $('#billingLedgerModal').find('.modal-body'));
						
						$('#printFrame').contents()
							.find('body')
								.html(thisHTML);
						
						setTimeout(function () {						
							$('#billingLedgerModal').print('printIframe');
						}, 500);
			});
		
	}
	
	function loadStudentLedgerModal( ajaxData ){
		_studentLedgerController.getFamilyBillingLedger( ajaxData )
		.done( function( ledgerModel ){
			console.log(['ledgerModel', ledgerModel]);
			var json = formatStudentLedger( ledgerModel, ajaxData );
			renderStudentLedgerModal( ajaxData, json );
		});
	}
	
	function reloadStudentLedgerModalTotals(){
		var ajaxData = $('#billing-ledger-modal-pagination').pagination('getAjaxData');
		if( typeof ajaxData.startDate !== 'undefined' && ajaxData.startDate !== '' ){
			_startMoment = moment( ajaxData.startDate, 'MM/DD/YYYY');
			ajaxData.startDate = _startMoment.format('DD.MM.YYYY');
		}
		if( typeof ajaxData.endDate !== 'undefined' && ajaxData.endDate !== '' ){
			_endMoment = moment( ajaxData.endDate, 'MM/DD/YYYY');
			ajaxData.endDate = _endMoment.format('DD.MM.YYYY');
		}
		if( typeof ajaxData.transactionType !== 'undefined' && 'All' === ajaxData.transactionType ){
			delete ajaxData.transactionType;
		}
		if( typeof ajaxData.familyFilter !== 'undefined' && 'All' !== ajaxData.familyFilter ){
			ajaxData.studentId = parseInt( ajaxData.familyFilter );
		}
		_studentLedgerController.getFamilyBillingLedgerTotals( ajaxData )
		.done( function( ledgerModel ){
			rerenderStudentLedgerModalTotals( formatStudentLedger( ledgerModel, ajaxData ) );
		});
		
	}
	
	function reloadStudentLedgerModal(){
		var ajaxData = $('#billing-ledger-modal-pagination').pagination('getAjaxData');
		if( typeof ajaxData.startDate !== 'undefined' && ajaxData.startDate !== '' ){
			_startMoment = moment( ajaxData.startDate, 'MM/DD/YYYY');
			ajaxData.startDate = _startMoment.format('DD.MM.YYYY');
		}
		if( typeof ajaxData.endDate !== 'undefined' && ajaxData.endDate !== '' ){
			_endMoment = moment( ajaxData.endDate, 'MM/DD/YYYY');
			ajaxData.endDate = _endMoment.format('DD.MM.YYYY');
		}
		if( typeof ajaxData.transactionType !== 'undefined' && 'All' === ajaxData.transactionType ){
			delete ajaxData.transactionType;
		}
		if( typeof ajaxData.familyFilter !== 'undefined' && 'All' !== ajaxData.familyFilter ){
			ajaxData.studentId = parseInt( ajaxData.familyFilter );
		}
		console.log(['reloadStudentLedgerModal ', ajaxData ]);
		_studentLedgerController.getFamilyBillingLedger( ajaxData )
		.done( function( ledgerModel ){
			console.log(['ledgerModel', ledgerModel]);
			var json = formatStudentLedger( ledgerModel, ajaxData );
			rerenderStudentLedgerModal( ajaxData, json );
		});
	}
	
	function loadStudentLedgerModalRows( ajaxData ){
		_studentLedgerController.getFamilyBillingLedger(ajaxData)
			.done( function( ledgerModel ){
			console.log(['ledgerModel', ledgerModel]);
			var json = formatStudentLedger( ledgerModel, ajaxData );
			renderStudentLedgerModalRows( ajaxData, json );
		});
	}
	
	function loadNewCharge( ){
		var json = {
			students: studentOptions
		};
		renderNewCharge( json );
	}
	
	function renderStudentLedgerModal( ajaxData, json ){
		StudentLedger.getRenderedString('tempBillingLedgerModal', json, ['tempLedgerTotals', 'tempLedgerTableBody', 'tempLedgerTableRow'])
		.done( function( renderedString ){
			$('#modal-wrapper').html( renderedString );
			$('#billingLedgerModal').modal('show');
			$('.billing-ledger-date').datepicker({
				dateFormat: 'mm/dd/yy'
			});
			
			//TODO: pagination
			renderStudentLedgerModalPagination( ajaxData,  json.page );
			bindPrintStudentLedgerModal();
			bindAddTransaction();
			bindEditLedger();
			bindDelete();
		});
	}
	
	function rerenderStudentLedgerRow( json ){
		StudentLedger.getRenderedString('tempLedgerTableRow', json )
		.done( function( renderedString ){
			$('.billing-ledger-row[data-id='+json.id+']').replaceWith( renderedString );
			bindAddTransaction();
			bindEditLedger();
			bindDelete();
		});
	}
	
	function rerenderStudentLedgerModal( ajaxData, json ){
		StudentLedger.getRenderedString('tempBillingLedgerModal', json, ['tempLedgerTotals', 'tempLedgerTableBody', 'tempLedgerTableRow'])
		.done( function( renderedString ){
			$('#modal-wrapper').find('.modal-body').html( $(renderedString).find('.modal-body') );
			$('.billing-ledger-modal-filter').datepicker({
				dateFormat: 'mm/dd/yy'
			});
			
			//TODO: pagination
			renderStudentLedgerModalPagination( ajaxData,  json.page );
			bindPrintStudentLedgerModal();
			bindAddTransaction();
			bindEditLedger();
			bindDelete();
		});
	}
	
	function rerenderStudentLedgerModalTotals( json ){
		StudentLedger.render('tempLedgerTotals', $('#student-ledger-modal-totals'), json);
	}
	
	function renderStudentLedgerModalRows( ajaxData, json ){
		StudentLedger.getRenderedString('tempLedgerTableBody', json, ['tempLedgerTableRow'])
		.done( function( renderedString ){
			$('#modal-wrapper').find('tbody').html( renderedString );
			renderStudentLedgerModalPagination( ajaxData, json.page );
			bindAddTransaction();
			bindEditLedger();
			bindDelete();
		});
	}
	
	function renderStudentLedgerModalPagination( _ajaxData, _page ){
		return app.getComponent('Pagination').getFn('loadPagination', ['tempChevronSpans', $('#billing-ledger-modal-pagination'), _page ])
		.done( function( $container, page ){
			$container.pagination({
				overrideLoadFunction: function(data){
					console.log(['overrideLoadFunction', data.ajaxData]);
					if( typeof data.ajaxData.startDate !== 'undefined' && data.ajaxData.startDate !== '' ){
						_startMoment = moment( data.ajaxData.startDate, 'MM/DD/YYYY');
						data.ajaxData.startDate = _startMoment.format('DD.MM.YYYY');
						//delete data.ajaxData.date;
					}
					if( typeof data.ajaxData.endDate !== 'undefined' && data.ajaxData.endDate !== '' ){
						_endMoment = moment( data.ajaxData.endDate, 'MM/DD/YYYY');
						data.ajaxData.endDate = _endMoment.format('DD.MM.YYYY');
						//delete data.ajaxData.date;
					}
					if( typeof data.ajaxData.transactionType !== 'undefined' && 'All' === data.ajaxData.transactionType ){
						delete data.ajaxData.transactionType;
					}
					if( typeof data.ajaxData.familyFilter !== 'undefined' && 'All' !== data.ajaxData.familyFilter ){
						data.ajaxData.studentId = parseInt( data.ajaxData.familyFilter );
					}
					
					loadStudentLedgerModalRows( data.ajaxData );
				},
				filterClass: 'billing-ledger-modal-filter',
				ajaxData: _ajaxData
			});
		});
	}
	
	function renderNewCharge( json ){
		StudentLedger.render('tempAddRecord', $('.new-charge-wrap'), json )
		.done( function(){
			//$('#add-transation-btn').hide();
			$('.payment-ledger-date').datepicker({
				dateFormat: 'mm/dd/yy'
			});
			bindNewCharge();
			
		});
	}
	
	function formatStudentLedger( ledgerModel, ajaxData ){
		var json = {
			allowDelete: Auth.inAuthorizedGroup('OWNERS'),	
			transactions: [],
			studentBillingAccounts: []
		};
		studentOptions = [];
		if( typeof ledgerModel.familyBillingAccount !== 'undefined' ){
			json.hasFamilyAccount = true;
			json.familyBalance = ledgerModel.familyBillingAccount.balance;
			json.familyAccountId = ledgerModel.familyBillingAccount.id;
		}
		json.studentBillingAccounts = ledgerModel.studentBillingAccounts;
		if( typeof ledgerModel.studentBillingAccounts !== 'undefined' ){
			$.each( ledgerModel.studentBillingAccounts, function( i, studentAccount  ){
				studentOptions.push({
					studentId: studentAccount.student.id,
					name: studentAccount.student.firstName +' '+studentAccount.student.lastName,
					selected: studentAccount.student.id === ajaxData.studentId ? 'selected':''
				});
			});
		}
		
		if( typeof ledgerModel.studentBillingAccount !== 'undefined' ){
			json.studentBalance = ledgerModel.studentBillingAccount.balance;
			json.studenAccountId = ledgerModel.studentBillingAccount.id;
			json.student = ledgerModel.studentBillingAccount.student;
			studentOptions.push({
				studentId: ledgerModel.studentBillingAccount.student.id,
				name: ledgerModel.studentBillingAccount.student.firstName +' '+ledgerModel.studentBillingAccount.student.lastName,
				selected: 'selected'
			});
		}
		json.page = {};
		if( typeof ledgerModel.billingTransactionPage !== 'undefined' && ledgerModel.billingTransactionPage.content ){
			$.each( ledgerModel.billingTransactionPage.content, function( index, trx ){
				json.transactions.push( formatTransaction( trx, json.allowDelete ) );
			});
			json.page = getPageObj( ledgerModel.billingTransactionPage );
		}
		json.pageSizeOptions = [];
		$.each( [10, 25, 50, 100, 500], function(index, value){
			json.pageSizeOptions.push({
				val: value,
				name: value,
				selected: ( json.page.size === value ? 'selected' : '')
			});
		});
		
		json.studentOptions = studentOptions;
		return json;
	}
	
	function formatTransaction( trx, allowDelete ){
		//TODO: format date
		trx.formattedDate = timeFormatter.formatDate({
			date: trx.date,
			pattern: 'MM/DD/YY',
			timezone: 'America/New_York'
		});
		trx.allowDelete = allowDelete;
		return trx;
	}
	
	var publicFunctions = {
		bindStudentLedgerModal: bindStudentLedgerModal	
	};
	StudentLedger = App.addComponent('StudentLedger', '/billing/student-ledger', publicFunctions);
	return StudentLedger;
})(App, jQuery);;;(function(app, $){
	var Students,
	CheckinSorts = [
		{ name: 'Grade 0 -> 12', value: 'GradeAsc'},
		{ name: 'Grade 12 -> 0', value: 'GradeDesc'},
		{ name: 'Last Name A -> Z', value: 'LastNameAsc'},
		{ name: 'Last Name Z -> A', value: 'LastNameDesc'},
		{ name: 'School A -> Z', value: 'SchoolAsc'},
		{ name: 'School Z -> A', value: 'SchoolDesc'}
	],
	DefaultBillingTypes = [
		{ name: 'One Day', value: 'DAILY_RATE'},
		{ name: 'Two To Three Days', value: 'TWO_TO_THREE_DAYS'},
		{ name: 'Four To Five Days', value: 'FOUR_TO_FIVE_DAYS'},
		{ name: 'Before + After Four To Five', value: 'FOUR_TO_FIVE_DAYS_BEFORE_AND_AFTER'},
		{ name: 'Before + After Two To Three', value: 'TWO_TO_THREE_DAYS_BEFORE_AND_AFTER'},
		{ name: 'Morning Only', value: 'MORNING' },
		{ name: 'Two Day', value: 'TWO_DAY' },
		{ name: 'Three Day', value: 'THREE_DAY' },
		{ name: 'Four Day', value: 'FOUR_DAY' },
		{ name: 'Five Day', value: 'FIVE_DAY' }
	],
	StudentFilters = [
		{ name: 'Active', value:'ACTIVE_STUDENTS' },
		{ name: 'Inactive', value:'INACTIVE_STUDENTS' },
		{ name: 'Morning Program', value:'MORNING_STUDENTS' },
		{ name: 'CCPS', value:'CCPS'}, 
		{ name: 'Regular Rate', value:'DEFAULT_RATE'},
		{ name: 'Scholarship', value:'SCHOLARSHIP'},
		{ name: 'ELC', value:'ELC'},
		{ name: 'Show All', value:'ALL_STUDENTS' }
	],
	BillingPlans;
	
	function loadStudents( $target, search, page ){
		setActiveContainer( $target );
		page = page || getPageObj();
		$.when(
			_studentController.getStudents( search, page ),
			loadBillingPlans()
		)
		.done(function( studentsPageResponse, billingPlanResponse ){
			renderStudents( $target, formatStudents( studentsPageResponse[0], billingPlanResponse[0] ) );
		});
	}
	
	function loadStudentRows( search, page ){
		$.when(
			_studentController.getStudents( search, page ),
			loadBillingPlans()
		).done(function( studentsPageResponse, billingPlanResponse ){
			renderStudentRows( formatStudents( studentsPageResponse[0] ) );
		});
	}
	
	function loadBillingPlans(){
		var dfd = $.Deferred();
		if( typeof BillingPlans !== 'undefined'){
			return dfd.resolve(BillingPlans);
		}else{
			_billingController.getBillingPlanModels()
			.done( function( billingPlans ){
				BillingPlans = billingPlans;
				dfd.resolve(BillingPlans);
			});
		}
		return dfd.promise();
	}
	
	function renderStudents( $target, students ){
		Students.render('tempStudents', $target, students, ['tempStudentRow'])
		.done(function(){
			renderStudentsPagination( students.page );
			bindEditStudent();
			bindViewBillingLedger();
			bindViewCheckinLedger();
			bindPrintStudents();
			bindViewAllergies();
		});
	}
	
	function renderStudentRows( students ){
		Students.render('tempStudentRowWrap', $('#student-table').find('tbody'), students, ['tempStudentRow'])
		.done(function(){
			renderStudentsPagination( students.page );
			bindEditStudent();
			bindViewBillingLedger();
			bindViewCheckinLedger();
			bindViewAllergies();
		});
		$('#all-student-count').html( students.totalStudents ); 
	}
	
	function renderStudentsPagination( _page ){
		return app.getComponent('Pagination').getFn('loadPagination', ['tempChevronSpans', $('#students-pagination'), _page ])
		.done( function( $container, page ){
			$container.pagination({
				overrideLoadFunction: function(data){
					page = $.extend( page, data.ajaxData );
					console.log(['overrideLoadFunction', data, page]);
					loadStudentRows( page.search, page );
				},
				filterClass: 'student-filter',
				ajaxData: page
			});
		});
	}
	
	function renderStudentAllergiesModal( allergies ){
		Students.getRenderedString('tempStudentAllergiesModal', {allergies: allergies})
		.done( function( renderedString ){
			$('#modal-wrapper').html( renderedString );
			$('#studentAllergiesModal').modal('show');
			$('#modal-wrapper').find('.bs-toggle').bootstrapToggle();
		});
	}
	
	function formatStudents( studentsPage, billingPlans ){
		var students = {
			students: studentsPage.content,
			page: getPageObj( studentsPage ),
			totalStudents: studentsPage.totalElements
		};
		var defaultBillingPlan = typeof billingPlans !== 'undefined' && billingPlans.length ? billingPlans[0].billingPlanName : 'Not Set (use default)';
		if( typeof billingPlans !== 'undefined' && billingPlans.length ){
			$.each( billingPlans, function( i, billingPlan ){
				if( billingPlan.defaultRate ){
					defaultBillingPlan = billingPlan.billingPlanName;
				}
			});
		}
		
		$.each(students.students, function(i, student){
			student = formatStudent( student, defaultBillingPlan );
		});
		
		
		
		students.pageSizeOptions = [];
		$.each( [10, 25, 50, 100, 500], function(index, value){
			students.pageSizeOptions.push({
				val: value,
				name: value,
				selected: ( students.page.size === value ? 'selected' : '')
			});
		});
		
		students.studentSortOptions = [];
		$.each( CheckinSorts, function( index, val ){
			students.studentSortOptions.push({
				val: val.value,
				name: val.name,
				selected: ( students.studentSort === val.value ? 'selected': '' )
			});
		});
		
		students.studentActiveOptions = [];
		$.each( StudentFilters, function( index, val ){
			students.studentActiveOptions.push({
				val: val.value,
				name: val.name,
				selected: ( students.studentsFilter === val.value ? 'selected': '' )
			});
		});
		return students;
	}
	
	function formatStudent( student, defaultBillingPlan ){
		if( typeof student.billingPlanId !== 'undefined' && student.billingPlanId !== null ){
			$.each( BillingPlans, function( i, v ){
				if( v.id === student.billingPlanId ){
					student.billingPlan = v.billingPlanName;
					return false;
				}
			});
		}else{
			student.billingPlan = defaultBillingPlan || 'Not Set (use default)';
		}
		if( typeof student.defaultWeeklyBillingType !== 'undefined' ){
			$.each( DefaultBillingTypes, function( i,v ){
				if( v.value === student.defaultWeeklyBillingType ){
					student.defaultWeeklyBillingTypeName = v.name;
					return false;
				}
			});
		}
		if( typeof student.allergies !== 'undefined' && student.allergies.trim() !== '' &&
			student.allergies.trim().toLowerCase() !== 'na' &&
			student.allergies.trim().toLowerCase() !== 'n/a' &&
			student.allergies.trim().toLowerCase() !== 'none' &&
			student.allergies.trim().toLowerCase() !== 'no known allergies.'
		){
			student.showAllergies = true;
		} 
		
		return student;
	}
	
	function bindEditStudent(){
		$('.user-edit')
			.off('click')
			.on('click', function(){
				App.getComponent('AddStudent').getFn('loadEditStudent', [$('#student-edit-container'), $(this).data('id'), 'main-content'] );
			});
		$('.check-in-out-btn')
			.off('click')
			.on('click', function(){
				var $elem = $(this);
				console.log(['_config.SignInClass', _config.SignInClass, $elem.find('.far').hasClass(_config.SignInClass) ]);
				if( $elem.find('.far').hasClass(_config.SignInClass) ){
					App.getComponent('ActiveStudents').getFn('checkInStudent', [$elem.data('id')] );
					$elem.find('.far').removeClass(_config.SignInClass).addClass(_config.SignOutClass);
				}else{
					App.getComponent('ActiveStudents').getFn('checkOutStudent', [$elem.data('id')] );
					$elem.find('.far').removeClass(_config.SignOutClass).addClass(_config.SignInClass);
				}
			});
	}
	
	function bindViewBillingLedger(){
		app.getComponent('StudentLedger').getFn('bindStudentLedgerModal');
	}
	function bindViewCheckinLedger(){
		app.getComponent('CheckinLog').getFn('bindCheckinLedgerModal');
	}
	
	function bindViewAllergies(){
		$('.show-allergies')
		.off('click')
		.on('click', function( e ){
			renderStudentAllergiesModal( $(this).data('allergies') );
		});
	}
	
	function bindPrintStudents(){
		$('#print-students')
		.off('click')
		.on('click', function( e ){
			e.preventDefault();
				var $this = $(this);
				
				$('#print-students').print({
					pathToPrint: 'about:blank'
				});
				
				var thisHTML = $('#print-students').print('filteredHtml', $('#student-print-wrap') );
				
				$('#printFrame').contents()
					.find('body')
						.html(thisHTML);
				
				setTimeout(function () {						
					$('#print-students').print('printIframe');
				}, 500);
		});
		
	}
	
	var publicFunctions = {
		loadStudents: loadStudents	
	};
	Students = App.addComponent('Students', '/students/students', publicFunctions);
	return Students;
})(App, jQuery);
//# sourceMappingURL=checkin.js.map