$(function () {
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
});