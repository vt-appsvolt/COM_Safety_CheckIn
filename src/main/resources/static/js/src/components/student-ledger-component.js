;(function(app, $){
	var studentOptions=[],
	PaymentMethodOptions=[
		{ name: 'Credit Card', value:'CreditCard'},
		{ name: 'ACH', value:'Ach'},
		{ name: 'Check', value:'Check'},
		{ name: 'Cash', value:'Cash'}
	];
		
	function bindStudentLedgerModal( clazz ){
		clazz = clazz || 'student-ledger';
		console.log(['bindStudentLedgerModal', clazz]);
		$('.'+clazz)
			.off('click')
			.on('click', function(){
				loadStudentLedgerModal( {
					studentId: $(this).data('id')
				} );
			});
	}
	
	function bindAddTransaction(){
		$('#add-transation-btn') 
			.off('click')
			.on('click', function( e ){
				e.preventDefault();
				$('#add-transation-btn').hide();
				loadNewCharge();
				
				
			});
			
	}
	
	function bindNewCharge(){
		$('.cancel-billing-btn')
			.off('click')
			.on('click', function(){
				$('.new-charge-wrap').empty();
				$('#add-transation-btn').show();
			});
		$('.save-billing-btn ')
			.off('click')
			.on('click', function(){
				var $form = $('.new-charge-wrap').find('form');
				var json = $form.serializeJSON( serializeJSON_Defaults );
				if( typeof json.type === 'undefined' ){
					json.type = 'Payment';
				}
				if( json.type !== 'Payment'){
					delete json.paymentMethodType;
				}
				
				json.updateLedger = json.updateLedger || false;
				
				_billingController.saveBillingRecord( json )
				.always( function(){
					$('.new-charge-wrap').empty();
					$('#add-transation-btn').show();
					reloadStudentLedgerModal();
				});
			});
		$('.transaction-type')
			.off('change')
			.on('change', function(){
				var selectedType = $(this).find('option:selected').val();
				if( selectedType === 'Payment'){
					$('.payment-method-type-wrap').show();
				}else{
					$('.payment-method-type-wrap').hide();
				}
			});
		
	}
	
	function bindDelete(){
		$('.billing-ledger-remove')
			.off('click')
			.on('click', function(){
				var ledgerId  = $(this).data('id');
				$('.billing-ledger-row[data-id='+ledgerId+']').after(
					'<tr class="delete-ledger-row" data-id="'+ledgerId+'" >'+
						'<td colspan="5">Delete Record and Reverse Amount?</td>'+
						'<td><button class="btn btn-danger btn-cancel-delete-ledger" data-id="'+ledgerId+'">Cancel</button></td>'+
						'<td><button class="btn btn-success btn-confirm-delete-ledger" data-id="'+ledgerId+'">Confirm</button></td>'+
					'</tr>'
				);
				$('.btn-cancel-delete-ledger')
					.off('click')
					.on('click', function(){
						var deleteLedgerId = $(this).data('id');
						$('.delete-ledger-row[data-id='+deleteLedgerId+']').remove();
						
						
					});
				$('.btn-confirm-delete-ledger')
				.off('click')
				.on('click', function(){
					var deleteLedgerId = $(this).data('id');
					$('.delete-ledger-row[data-id='+deleteLedgerId+']').remove();
					_studentLedgerController.deleteBillingLedger( deleteLedgerId )
					.done( function(){
						reloadStudentLedgerModalTotals();
					});
					$('.billing-ledger-row[data-id='+ledgerId+']').remove();
				});
			});	
	}
	
	function bindEditLedger(){
		$('.billing-ledger-edit')
		.off('click')
		.on('click', function(){
			var ledgerId  = $(this).data('id');
			var json ={
				ledgerId: ledgerId,
				description: $('.billing-ledger-row[data-id='+ledgerId+']').data('description'),
				amount: $('.billing-ledger-row[data-id='+ledgerId+']').data('amount'),
				type: $('.billing-ledger-row[data-id='+ledgerId+']').data('trxtype'),
				paymentMethodType: $('.billing-ledger-row[data-id='+ledgerId+']').data('paymentmethod'),
			};
			
			if( 'Payment'===json.type ){
				json.paymentMethodOptions = [];
				$.each( PaymentMethodOptions, function( index, val ){
					json.paymentMethodOptions.push({
						val: val.value,
						name: val.name,
						selected: ( json.paymentMethodType === val.value ? 'selected': '' )
					});
				});
				json.showMethodType = true;
			}
			
			
			StudentLedger.getRenderedString('tempEditLedgerRow', json)
			.done( function( renderedString ){
				$('.billing-ledger-row[data-id='+ledgerId+']').after( renderedString );
				$('.btn-cancel-edit-ledger')
					.off('click')
					.on('click', function(){
						var editLedgerId = $(this).data('id');
						$('.edit-ledger-row[data-id='+editLedgerId+']').remove();
					});
				$('.btn-confirm-edit-ledger')
					.off('click')
					.on('click', function(){
						var editLedgerId = $(this).data('id');
						var $editLedgerRow = $('.edit-ledger-row[data-id='+editLedgerId+']');
						var billingTransactionModel = {
							description: $editLedgerRow.find('.description').val(),
							amount: $editLedgerRow.find('.amount').val()
						};
						console.log(['$editLedgerRow', $editLedgerRow, $editLedgerRow.find('.payment-method-type').length ]);
						if( $editLedgerRow.find('.payment-method-type').length > -1  ){
							billingTransactionModel.paymentMethodType = $editLedgerRow.find('.payment-method-type').find('option:selected').val();							
						}
						
						console.log(['$editLedgerRow', billingTransactionModel ]);
						_studentLedgerController.updateBillingLedger( editLedgerId, billingTransactionModel )
						.done( function( editLedgerResponse ){
							$editLedgerRow.remove();
							reloadStudentLedgerModalTotals();
							rerenderStudentLedgerRow( formatTransaction( editLedgerResponse, true ) );
						});
					});
			});
			
		});	
	}
	
	function bindPrintStudentLedgerModal( ){
		$('#print-ledger')
			.off('click')
			.on('click', function( e ){
				e.preventDefault();
						
//						var _clone = $('#billingLedgerModal').find('.modal-body').clone();
//						var $this = $(this),
//							thisHTML = $.trim($(".dnp",_clone).remove().end().html());
					var $this = $(this);
						
						
						$('#billingLedgerModal').print({
							pathToPrint: 'about:blank'
						});
						
						var thisHTML = $('#billingLedgerModal').print('filteredHtml', $('#billingLedgerModal').find('.modal-body'));
						
						$('#printFrame').contents()
							.find('body')
								.html(thisHTML);
						
						setTimeout(function () {						
							$('#billingLedgerModal').print('printIframe');
						}, 500);
			});
		
	}
	
	function loadStudentLedgerModal( ajaxData ){
		_studentLedgerController.getFamilyBillingLedger( ajaxData )
		.done( function( ledgerModel ){
			console.log(['ledgerModel', ledgerModel]);
			var json = formatStudentLedger( ledgerModel, ajaxData );
			renderStudentLedgerModal( ajaxData, json );
		});
	}
	
	function reloadStudentLedgerModalTotals(){
		var ajaxData = $('#billing-ledger-modal-pagination').pagination('getAjaxData');
		if( typeof ajaxData.startDate !== 'undefined' && ajaxData.startDate !== '' ){
			_startMoment = moment( ajaxData.startDate, 'MM/DD/YYYY');
			ajaxData.startDate = _startMoment.format('DD.MM.YYYY');
		}
		if( typeof ajaxData.endDate !== 'undefined' && ajaxData.endDate !== '' ){
			_endMoment = moment( ajaxData.endDate, 'MM/DD/YYYY');
			ajaxData.endDate = _endMoment.format('DD.MM.YYYY');
		}
		if( typeof ajaxData.transactionType !== 'undefined' && 'All' === ajaxData.transactionType ){
			delete ajaxData.transactionType;
		}
		if( typeof ajaxData.familyFilter !== 'undefined' && 'All' !== ajaxData.familyFilter ){
			ajaxData.studentId = parseInt( ajaxData.familyFilter );
		}
		_studentLedgerController.getFamilyBillingLedgerTotals( ajaxData )
		.done( function( ledgerModel ){
			rerenderStudentLedgerModalTotals( formatStudentLedger( ledgerModel, ajaxData ) );
		});
		
	}
	
	function reloadStudentLedgerModal(){
		var ajaxData = $('#billing-ledger-modal-pagination').pagination('getAjaxData');
		if( typeof ajaxData.startDate !== 'undefined' && ajaxData.startDate !== '' ){
			_startMoment = moment( ajaxData.startDate, 'MM/DD/YYYY');
			ajaxData.startDate = _startMoment.format('DD.MM.YYYY');
		}
		if( typeof ajaxData.endDate !== 'undefined' && ajaxData.endDate !== '' ){
			_endMoment = moment( ajaxData.endDate, 'MM/DD/YYYY');
			ajaxData.endDate = _endMoment.format('DD.MM.YYYY');
		}
		if( typeof ajaxData.transactionType !== 'undefined' && 'All' === ajaxData.transactionType ){
			delete ajaxData.transactionType;
		}
		if( typeof ajaxData.familyFilter !== 'undefined' && 'All' !== ajaxData.familyFilter ){
			ajaxData.studentId = parseInt( ajaxData.familyFilter );
		}
		console.log(['reloadStudentLedgerModal ', ajaxData ]);
		_studentLedgerController.getFamilyBillingLedger( ajaxData )
		.done( function( ledgerModel ){
			console.log(['ledgerModel', ledgerModel]);
			var json = formatStudentLedger( ledgerModel, ajaxData );
			rerenderStudentLedgerModal( ajaxData, json );
		});
	}
	
	function loadStudentLedgerModalRows( ajaxData ){
		_studentLedgerController.getFamilyBillingLedger(ajaxData)
			.done( function( ledgerModel ){
			console.log(['ledgerModel', ledgerModel]);
			var json = formatStudentLedger( ledgerModel, ajaxData );
			renderStudentLedgerModalRows( ajaxData, json );
		});
	}
	
	function loadNewCharge( ){
		var json = {
			students: studentOptions
		};
		renderNewCharge( json );
	}
	
	function renderStudentLedgerModal( ajaxData, json ){
		StudentLedger.getRenderedString('tempBillingLedgerModal', json, ['tempLedgerTotals', 'tempLedgerTableBody', 'tempLedgerTableRow'])
		.done( function( renderedString ){
			$('#modal-wrapper').html( renderedString );
			$('#billingLedgerModal').modal('show');
			$('.billing-ledger-date').datepicker({
				dateFormat: 'mm/dd/yy'
			});
			
			//TODO: pagination
			renderStudentLedgerModalPagination( ajaxData,  json.page );
			bindPrintStudentLedgerModal();
			bindAddTransaction();
			bindEditLedger();
			bindDelete();
		});
	}
	
	function rerenderStudentLedgerRow( json ){
		StudentLedger.getRenderedString('tempLedgerTableRow', json )
		.done( function( renderedString ){
			$('.billing-ledger-row[data-id='+json.id+']').replaceWith( renderedString );
			bindAddTransaction();
			bindEditLedger();
			bindDelete();
		});
	}
	
	function rerenderStudentLedgerModal( ajaxData, json ){
		StudentLedger.getRenderedString('tempBillingLedgerModal', json, ['tempLedgerTotals', 'tempLedgerTableBody', 'tempLedgerTableRow'])
		.done( function( renderedString ){
			$('#modal-wrapper').find('.modal-body').html( $(renderedString).find('.modal-body') );
			$('.billing-ledger-modal-filter').datepicker({
				dateFormat: 'mm/dd/yy'
			});
			
			//TODO: pagination
			renderStudentLedgerModalPagination( ajaxData,  json.page );
			bindPrintStudentLedgerModal();
			bindAddTransaction();
			bindEditLedger();
			bindDelete();
		});
	}
	
	function rerenderStudentLedgerModalTotals( json ){
		StudentLedger.render('tempLedgerTotals', $('#student-ledger-modal-totals'), json);
	}
	
	function renderStudentLedgerModalRows( ajaxData, json ){
		StudentLedger.getRenderedString('tempLedgerTableBody', json, ['tempLedgerTableRow'])
		.done( function( renderedString ){
			$('#modal-wrapper').find('tbody').html( renderedString );
			renderStudentLedgerModalPagination( ajaxData, json.page );
			bindAddTransaction();
			bindEditLedger();
			bindDelete();
		});
	}
	
	function renderStudentLedgerModalPagination( _ajaxData, _page ){
		return app.getComponent('Pagination').getFn('loadPagination', ['tempChevronSpans', $('#billing-ledger-modal-pagination'), _page ])
		.done( function( $container, page ){
			$container.pagination({
				overrideLoadFunction: function(data){
					console.log(['overrideLoadFunction', data.ajaxData]);
					if( typeof data.ajaxData.startDate !== 'undefined' && data.ajaxData.startDate !== '' ){
						_startMoment = moment( data.ajaxData.startDate, 'MM/DD/YYYY');
						data.ajaxData.startDate = _startMoment.format('DD.MM.YYYY');
						//delete data.ajaxData.date;
					}
					if( typeof data.ajaxData.endDate !== 'undefined' && data.ajaxData.endDate !== '' ){
						_endMoment = moment( data.ajaxData.endDate, 'MM/DD/YYYY');
						data.ajaxData.endDate = _endMoment.format('DD.MM.YYYY');
						//delete data.ajaxData.date;
					}
					if( typeof data.ajaxData.transactionType !== 'undefined' && 'All' === data.ajaxData.transactionType ){
						delete data.ajaxData.transactionType;
					}
					if( typeof data.ajaxData.familyFilter !== 'undefined' && 'All' !== data.ajaxData.familyFilter ){
						data.ajaxData.studentId = parseInt( data.ajaxData.familyFilter );
					}
					
					loadStudentLedgerModalRows( data.ajaxData );
				},
				filterClass: 'billing-ledger-modal-filter',
				ajaxData: _ajaxData
			});
		});
	}
	
	function renderNewCharge( json ){
		StudentLedger.render('tempAddRecord', $('.new-charge-wrap'), json )
		.done( function(){
			//$('#add-transation-btn').hide();
			$('.payment-ledger-date').datepicker({
				dateFormat: 'mm/dd/yy'
			});
			bindNewCharge();
			
		});
	}
	
	function formatStudentLedger( ledgerModel, ajaxData ){
		var json = {
			allowDelete: Auth.inAuthorizedGroup('OWNERS'),	
			transactions: [],
			studentBillingAccounts: []
		};
		studentOptions = [];
		if( typeof ledgerModel.familyBillingAccount !== 'undefined' ){
			json.hasFamilyAccount = true;
			json.familyBalance = ledgerModel.familyBillingAccount.balance;
			json.familyAccountId = ledgerModel.familyBillingAccount.id;
		}
		json.studentBillingAccounts = ledgerModel.studentBillingAccounts;
		if( typeof ledgerModel.studentBillingAccounts !== 'undefined' ){
			$.each( ledgerModel.studentBillingAccounts, function( i, studentAccount  ){
				studentOptions.push({
					studentId: studentAccount.student.id,
					name: studentAccount.student.firstName +' '+studentAccount.student.lastName,
					selected: studentAccount.student.id === ajaxData.studentId ? 'selected':''
				});
			});
		}
		
		if( typeof ledgerModel.studentBillingAccount !== 'undefined' ){
			json.studentBalance = ledgerModel.studentBillingAccount.balance;
			json.studenAccountId = ledgerModel.studentBillingAccount.id;
			json.student = ledgerModel.studentBillingAccount.student;
			studentOptions.push({
				studentId: ledgerModel.studentBillingAccount.student.id,
				name: ledgerModel.studentBillingAccount.student.firstName +' '+ledgerModel.studentBillingAccount.student.lastName,
				selected: 'selected'
			});
		}
		json.page = {};
		if( typeof ledgerModel.billingTransactionPage !== 'undefined' && ledgerModel.billingTransactionPage.content ){
			$.each( ledgerModel.billingTransactionPage.content, function( index, trx ){
				json.transactions.push( formatTransaction( trx, json.allowDelete ) );
			});
			json.page = getPageObj( ledgerModel.billingTransactionPage );
		}
		json.pageSizeOptions = [];
		$.each( [10, 25, 50, 100, 500], function(index, value){
			json.pageSizeOptions.push({
				val: value,
				name: value,
				selected: ( json.page.size === value ? 'selected' : '')
			});
		});
		
		json.studentOptions = studentOptions;
		return json;
	}
	
	function formatTransaction( trx, allowDelete ){
		//TODO: format date
		trx.formattedDate = timeFormatter.formatDate({
			date: trx.date,
			pattern: 'MM/DD/YY',
			timezone: 'America/New_York'
		});
		trx.allowDelete = allowDelete;
		return trx;
	}
	
	var publicFunctions = {
		bindStudentLedgerModal: bindStudentLedgerModal	
	};
	StudentLedger = App.addComponent('StudentLedger', '/billing/student-ledger', publicFunctions);
	return StudentLedger;
})(App, jQuery);