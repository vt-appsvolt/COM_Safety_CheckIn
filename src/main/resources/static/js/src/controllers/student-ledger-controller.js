var _studentLedgerController = {
	getFamilyBillingLedger: function( json ){
		return $.get('/family/billing/ledger', json);
	},
	getFamilyBillingLedgerTotals: function( json ){
		return $.get('/family/billing/ledger/totals', json);
	},
	updateBillingLedger: function( ledgerId, billingTransactionModel ){
		return $.ajax('/billing/transaction/'+ledgerId, {
			type: 'POST',
			data: JSON.stringify( billingTransactionModel ),
			dataType: 'json',
			contentType: 'application/json'
		});
	},
	deleteBillingLedger: function( ledgerId ){
		return $.ajaxDelete('/billing/transaction/'+ledgerId);
	}	
};