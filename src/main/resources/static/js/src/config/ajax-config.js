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
});