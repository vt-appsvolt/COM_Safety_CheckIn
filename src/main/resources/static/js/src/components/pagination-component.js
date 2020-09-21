;(function(app, $){
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
})(App, jQuery);