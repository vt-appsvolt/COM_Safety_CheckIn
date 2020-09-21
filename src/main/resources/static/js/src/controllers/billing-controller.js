var _billingController = {
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
};