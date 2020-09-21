;(function(app, $){
	var BillingReports,
	CheckinSorts = [
		{ name: 'Grade 0 -> 12', value: 'GradeAsc'},
		{ name: 'Grade 12 -> 0', value: 'GradeDesc'},
		{ name: 'Last Name A -> Z', value: 'LastNameAsc'},
		{ name: 'Last Name Z -> A', value: 'LastNameDesc'},
		{ name: 'School A -> Z', value: 'SchoolAsc'},
		{ name: 'School Z -> A', value: 'SchoolDesc'}
	],
	StudentFilters = [
		{ name: 'Show All', value:'ALL' },
		{ name: 'Morning', value:'MORNING' },
		{ name: 'Afterschool', value:'AFTERSCHOOL' },
		{ name: 'CCPS', value:'CCPS'}, 
		{ name: 'Scholarship', value:'SCHOLARSHIP'},
		{ name: 'ELC', value:'ELC'},
		{ name: 'Regular Rate', value:'DEFAULT_RATE'}
	];
	
	function loadWeeklyDepositReport( $target, ajaxData ){
		setActiveContainer( $target );
		ajaxData = ajaxData || {};
		ajaxData.startDate  =  moment().startOf('week').format('DD.MM.YYYY');
		ajaxData.endDate    = moment().endOf('week').format('DD.MM.YYYY');
		
		console.log(['loadWeeklyDepositReport', ajaxData]);
		_billingController.getWeeklyBillingReport( ajaxData )
		.done( function( depositReport ){
			console.log(['depositReport', depositReport]);
			var json = formatDepositReport( depositReport, ajaxData );
			renderBilingReportSummary( $target, ajaxData, json );
		});
	}
	
	function reloadWeeklyDepositSummary( ajaxData ){
		_billingController.getWeeklyBillingReport( ajaxData )
		.done( function( depositReport ){
			console.log(['depositReport', depositReport]);
			var json = formatDepositReport( depositReport, ajaxData );
			rerenderBilingReportSummary( ajaxData, json );
			//$('#active-filter-row').html( json.activeFilter );
			$('#billing-report-summary-range').html(json.depositRange);
		});
	}
	
	
	function loadWeeklySummaryDepositReport( $target, ajaxData ){
		setActiveContainer( $target );
		ajaxData = ajaxData || {};
		ajaxData.startDate  =  moment().startOf('week').format('DD.MM.YYYY');
		ajaxData.endDate    = moment().endOf('week').format('DD.MM.YYYY');
		console.log(['loadWeeklySummaryDepositReport', ajaxData]);
		_billingController.getWeeklySummaryBillingReport( ajaxData )
		.done( function( depositReport ){
			console.log(['depositReport 2', depositReport]);
			var json = formatDepositSummaryReport( depositReport, ajaxData );
			renderBilingSummaryReportSummary( $target, ajaxData, json );
		});
		
	}
	
	
	function reloadWeeklySummaryDepositSummary(ajaxData ){
		_billingController.getWeeklySummaryBillingReport( ajaxData )
		.done( function( depositReport ){
			console.log(['depositReport', depositReport]);
			var json = formatDepositSummaryReport( depositReport, ajaxData );
			rerenderBilingSummaryReportSummary( ajaxData, json );
			//$('#active-filter-row').html( json.activeFilter );
			$('#billing-report-summary-range').html(json.depositRange);
		});
	}
		
	function renderBilingReportSummary( $target, ajaxData, json ){
		BillingReports.render('tempDepositReportSummary', $target, json, ['tempWeeklyDepositReportTables','tempWeeklyReportRow'])
		.done( function(){
			$('.billing-ledger-date').datepicker({
				dateFormat: 'mm/dd/yy'
			});
			bindPrintBillingReportSummary();
			renderDepositReportSummaryPagination( ajaxData );
		});
	}
	
	function rerenderBilingReportSummary( ajaxData, json ){
		BillingReports.render('tempWeeklyDepositReportTables', $('#billing-report-table-wrap'), json, ['tempWeeklyReportRow'])
		.done( function(){
			renderDepositReportSummaryPagination( ajaxData );
		});
	}
	
	function renderBilingSummaryReportSummary( $target, ajaxData, json ){
		BillingReports.render('tempDepositSummaryReportSummary', $target, json, ['tempWeeklyDepositSummaryReportTables'])
		.done( function(){
			$('.billing-ledger-date').datepicker({
				dateFormat: 'mm/dd/yy'
			});
			bindPrintBillingSummaryReportSummary();
			renderDepositSummaryReportSummaryPagination( ajaxData );
		});
	}
	
	function rerenderBilingSummaryReportSummary( ajaxData, json ){
		BillingReports.render('tempWeeklyDepositSummaryReportTables', $('#billing-summary-report-table-wrap'), json )
		.done( function(){
			renderDepositSummaryReportSummaryPagination( ajaxData );
		});
	}
	
	
	function renderDepositReportSummaryPagination( _page ){
		return app.getComponent('Pagination').getFn('loadPagination', ['tempChevronSpans', $('#deposit-report-summary-pagination'), _page ])
		.done( function( $container, page ){
			$container.pagination({
				overrideLoadFunction: function(data){
					page = $.extend( page, data.ajaxData );
					console.log(['overrideLoadFunction', data, page]);
					if( typeof page.startDate !== 'undefined' && page.startDate !== '' ){
						_startMoment = moment( page.startDate, 'MM/DD/YYYY');
						page.startDate = _startMoment.format('DD.MM.YYYY');
					}
					if( typeof page.endDate !== 'undefined' && page.endDate !== '' ){
						_endMoment = moment( page.endDate, 'MM/DD/YYYY');
						page.endDate = _endMoment.format('DD.MM.YYYY');
					}
					reloadWeeklyDepositSummary( page );
				},
				filterClass: 'deposit-report-summary-checkin-log-filter',
				ajaxData: page
			});
		});
	}
	
	function renderDepositSummaryReportSummaryPagination( _page ){
		return app.getComponent('Pagination').getFn('loadPagination', ['tempChevronSpans', $('#deposit-summary-report-summary-pagination'), _page ])
		.done( function( $container, page ){
			$container.pagination({
				overrideLoadFunction: function(data){
					page = $.extend( page, data.ajaxData );
					console.log(['overrideLoadFunction', data, page]);
					if( typeof page.startDate !== 'undefined' && page.startDate !== '' ){
						_startMoment = moment( page.startDate, 'MM/DD/YYYY');
						page.startDate = _startMoment.format('DD.MM.YYYY');
					}
					if( typeof page.endDate !== 'undefined' && page.endDate !== '' ){
						_endMoment = moment( page.endDate, 'MM/DD/YYYY');
						page.endDate = _endMoment.format('DD.MM.YYYY');
					}
					reloadWeeklySummaryDepositSummary( page );
				},
				filterClass: 'deposit-report-summary-checkin-log-filter',
				ajaxData: page
			});
		});
	}
	
	
	function formatDepositReport( depositReport, ajaxData ){
		ajaxData = ajaxData || {};
		var startMoment = moment( ajaxData.startDate, 'DD.MM.YYYY');
		var endMoment   = moment( ajaxData.endDate, 'DD.MM.YYYY');
		
		var json = {
			program: formatAfterSchoolProgram( depositReport.program ),
			achTotals: thousandsSeparators( depositReport.achTotals.toFixed(2) ),
			achCount: depositReport.achCount,
			creditcardTotals: thousandsSeparators( depositReport.creditcardTotals.toFixed(2) ),
			creditcardCount: depositReport.creditcardCount,
			checkTotals: thousandsSeparators( depositReport.checkTotals.toFixed(2) ),
			checkCount: depositReport.checkCount,
			achPayments: [],
			creditcardPayments: [],
			checkPayments: [],
			activeFilter: '',
			hasAchTrx: depositReport.achCount>0,
			hasCardTrx: depositReport.creditcardCount>0,
			hasCheckTrx: depositReport.checkCount>0
		};
		
		json.depositRange = 'Deposit Report: '+startMoment.format('MM/DD/YYYY')+' to '+endMoment.format('MM/DD/YYYY');
		json.formattedStartDate = startMoment.format('MM/DD/YYYY');
		json.formattedEndDate = endMoment.format('MM/DD/YYYY');
		json.filterOptions = [];
		$.each( StudentFilters, function( index, val ){
			json.filterOptions.push({
				val: val.value,
				name: val.name,
				selected: ( ajaxData.filter === val.value ? 'selected': '' )
			});
			if( typeof ajaxData.filter !== 'undefined' && ajaxData.filter !== 'ALL' && ajaxData.filter === val.value ){
				json.activeFilter = val.name;	
			}
		});
		
		$.each( depositReport.achPayments, function( i , trx ){
			json.achPayments.push( formatTransaction( trx ) );
		});
		$.each( depositReport.creditcardPayments, function( i , trx ){
			json.creditcardPayments.push( formatTransaction( trx ) );
		});
		$.each( depositReport.checkPayments, function( i , trx ){
			json.checkPayments.push( formatTransaction( trx ) );
		});
		
		return json;
	}
	
	function formatDepositSummaryReport( depositReport, ajaxData ){
		ajaxData = ajaxData || {};
		var startMoment = moment( ajaxData.startDate, 'DD.MM.YYYY');
		var endMoment   = moment( ajaxData.endDate, 'DD.MM.YYYY');
		
		var json = {
			program: formatAfterSchoolProgram( depositReport.program ),
			total: thousandsSeparators( depositReport.total.toFixed(2) ),
			postDate: moment().format('MM/DD/YYYY')
		};
		json.summaryRange = startMoment.format('MM/DD/YYYY')+' to '+endMoment.format('MM/DD/YYYY');
		json.depositRange = 'Deposit Report: '+json.summaryRange;
		json.formattedStartDate = startMoment.format('MM/DD/YYYY');
		json.formattedEndDate = endMoment.format('MM/DD/YYYY');
		json.filterOptions = [];
		$.each( StudentFilters, function( index, val ){
			json.filterOptions.push({
				val: val.value,
				name: val.name,
				selected: ( ajaxData.filter === val.value ? 'selected': '' )
			});
			if( typeof ajaxData.filter !== 'undefined' && ajaxData.filter !== 'ALL' && ajaxData.filter === val.value ){
				json.activeFilter = val.name;	
			}
		});
		return json;
	}
	
	function formatTransaction( trx ){
		trx.formattedDate = timeFormatter.formatDate({
			date: trx.date,
			pattern: 'MM/DD/YYYY',
			timezone: 'America/New_York'
		});
		if( typeof trx.amount !== 'undefined' ){
			trx.amount = trx.amount.toFixed(2);
		}
		return trx;	
	}
	
	function formatAfterSchoolProgram( program ){
		var json={};
		if( typeof program.programFullName !== 'undefined' ){
			json.programFullName = program.programFullName;
		}else{
			json.programFullName = program.programName;
		}
		if( typeof program.address !== 'undefined' ){
			json.street = program.address.street;
			json.address = program.address.city+', '+program.address.state+' '+program.address.zipcode;
		}
		if( typeof program.phone !== 'undefined' ){
			json.phone = program.phone.contactValue;
		}
		if( typeof program.email !== 'undefined' ){
			json.email = program.email.contactValue;
		}
		return json;
	}
	
	function formatChildTitle( studentModel ){
		console.log(['studentModel', studentModel]);
		var title = studentModel.student.lastName+', '+studentModel.student.firstName;
		if( typeof studentModel.student.school !== 'undefined' ){
			title += ' ('+studentModel.student.school.name+')';
		}
		return title;
	}
	
	
	function bindPrintBillingReportSummary(){
		$('#print-report')
		.off('click')
		.on('click', function( e ){
			e.preventDefault();
				var $this = $(this);
				
				$('#print-report').print({
					pathToPrint: 'about:blank'
				});
				
				var thisHTML = $('#print-report').print('filteredHtml', $('#deposit-report-summary-print-wrap') );
				
				$('#printFrame').contents()
					.find('body')
						.html(thisHTML);
				
				setTimeout(function () {						
					$('#print-report').print('printIframe');
				}, 500);
		});
	}
	
	function bindPrintBillingSummaryReportSummary(){
		$('#print-summary-report')
		.off('click')
		.on('click', function( e ){
			e.preventDefault();
				var $this = $(this);
				
				$('#print-summary-report').print({
					pathToPrint: 'about:blank'
				});
				
				var thisHTML = $('#print-summary-report').print('filteredHtml', $('#deposit-summary-report-summary-print-wrap') );
				
				$('#printFrame').contents()
					.find('body')
						.html(thisHTML);
				
				setTimeout(function () {						
					$('#print-summary-report').print('printIframe');
				}, 500);
		});
	}
	
	var publicFunctions = {
		loadWeeklyDepositReport: loadWeeklyDepositReport,
		loadWeeklySummaryDepositReport: loadWeeklySummaryDepositReport
	};
	BillingReports = App.addComponent('BillingReports', '/billing/billing-reports', publicFunctions);
	return BillingReports;
})(App, jQuery);