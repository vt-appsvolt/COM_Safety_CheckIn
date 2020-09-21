;(function(app, $){
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
})(App, jQuery);