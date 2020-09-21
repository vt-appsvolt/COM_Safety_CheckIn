$(function () {
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
});