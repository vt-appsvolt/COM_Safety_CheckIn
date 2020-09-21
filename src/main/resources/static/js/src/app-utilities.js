/**
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

