;(function($) {
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
})(jQuery);