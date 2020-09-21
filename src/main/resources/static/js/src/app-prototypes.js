function Utils() {}
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
}