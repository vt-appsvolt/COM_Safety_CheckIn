var _mustacheHelper = {
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
};