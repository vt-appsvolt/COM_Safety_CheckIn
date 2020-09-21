;(function(app, $){
	var ActiveStudents,
	CheckinSorts = [
		{ name: 'Grade 0 -> 12', value: 'GradeAsc'},
		{ name: 'Grade 12 -> 0', value: 'GradeDesc'},
		{ name: 'Last Name A -> Z', value: 'LastNameAsc'},
		{ name: 'Last Name Z -> A', value: 'LastNameDesc'},
		{ name: 'School A -> Z', value: 'SchoolAsc'},
		{ name: 'School Z -> A', value: 'SchoolDesc'}
	],
	_activeStudentTimer;
	
	function loadActiveStudents( $target, search, page ){
		setActiveContainer( $target );
		page = page || getPageObj();
		_checkinController.getActiveStudents( search, page )
		.done( function( activeStudentsPage ){
			renderActiveStudents( $target, formatActiveStudents( activeStudentsPage ) );
		});
	}
	
	function loadActiveStudentRows( search, page ){
		_checkinController.getActiveStudents( search, page )
		.done( function( activeStudentsPage ){
			renderActiveStudentRows( formatActiveStudents( activeStudentsPage ) );
		});
	}
	
	function checkInStudent( studentId, override, retryCount ){
		retryCount = retryCount || 1;
		console.log(['checkInStudent studentId',  studentId, retryCount]);
		var programId = $('.active-program-ref').data('id'),
			checkinModel = {
				checkinDate: moment().format('YYYY-MM-DD'),
				checkinTime: moment().format('hh:mm a'),
				studentId: studentId
			},
			localStorageCheckin = false;
		
		try{
			_checkinLocalStorage.setProcessingCheckin( programId, studentId, checkinModel );
			$('#checkin-student-id').val('');
			$('#checkin-student-id').focus();
			localStorageCheckin = true;
		}catch( err ){
			localStorageCheckin = false;
		}
		
		_checkinController.checkinStudent( studentId, override )
		.done(function( student ){
			student.student.checkInTime = student.checkInTime;
			renderActiveStudent( formatStudent(student.student) );
			
			if( !localStorageCheckin ){
				$('#checkin-student-id').val('');
				$('#checkin-student-id').focus();
			}
			activeStudentPoll();
			_checkinLocalStorage.removeCheckin( programId, studentId );
		})
		.fail( function( xhr, textStatus, errorThrown){
			var retry = true;
			    switch (xhr.status) {
			        case 409:
			        	renderInactiveStudentWarningModal( studentId );
			        	retry = false;
			        	break;
			    }
			   if( retry && retryCount < 3 ){
				   retryCount++;
				   checkInStudent( studentId, override, retryCount );
			   }else{
				   try{
					   _checkinLocalStorage.setAwaitingCheckin( programId, studentId, checkinModel );
				   }catch( err ){}
				   console.log(['failure', xhr, textStatus, errorThrown]);
				   var message = 'Failed to checkin student: '+textStatus+' : '+errorThrown;
					toastr.error(message, {
						"timeOut": "5000",
					});
			   }
		});
	}
	
	function guardianCheckout( json ){
		_checkinController.guardianCheckout( json )
		.done( function( checkoutResponse ){
			if( typeof checkoutResponse.checkinLogs !== 'undefined' && checkoutResponse.checkinLogs !== null ){
				$.each( checkoutResponse.checkinLogs, function( index, ciLog ){
					$('.active-student-row[data-id='+ciLog.student.studentId+']').remove();
				});
				$('#checkout-student-id').val('');
				activeStudentPoll();
				$('#checkout-student-id').focus();
				console.log(['parent info', checkoutResponse ]);
			}
			$('#guardianCheckoutModal').modal('hide');
		});
	}
	
	function checkOutStudent( studentId ){
		if( typeof studentId === 'string' || studentId instanceof String ){
			studentId = studentId.trim();
		}
		_checkinController.checkoutStudent( studentId )
		.done(function( checkoutResponse ){
			console.log(['checkOutStudent checkoutResponse ', checkoutResponse]);
			if( checkoutResponse.studentCheckedOut ){
				$('.active-student-row[data-id='+studentId+']').remove();
				$('#checkout-student-id').val('');
				activeStudentPoll();
				$('#checkout-student-id').focus();
			}else if( typeof checkoutResponse.checkinLogs !== 'undefined' && checkoutResponse.checkinLogs !== null ){
				$.each( checkoutResponse.checkinLogs, function( index, ciLog ){
					$('.active-student-row[data-id='+ciLog.student.studentId+']').remove();
				});
				$('#checkout-student-id').val('');
				activeStudentPoll();
				$('#checkout-student-id').focus();
				console.log(['parent info', checkoutResponse ]);
			}else {
				console.log(['parent info else', checkoutResponse ]);
				if( typeof checkoutResponse.activeCheckins !=='undefined' && checkoutResponse.activeCheckins !== null && checkoutResponse.activeCheckins.length > 0 ){
					checkoutResponse.hasActiveCheckins = true;
					$.each( checkoutResponse.activeCheckins, function(index, activeCheckIn){
						if( typeof activeCheckIn.checkInTime !== 'undefined' ){
							activeCheckIn.formattedCheckInTime = timeFormatter.formatDate({
								date: activeCheckIn.checkInTime,
								pattern: 'h:mma',
								timezone: 'America/New_York'
							});
							checkoutResponse.defaultCheckInTime = activeCheckIn.formattedCheckInTime;
						}
					});
				}
				if( typeof checkoutResponse.inactiveStudents !== 'undefined' && checkoutResponse.inactiveStudents !== null && checkoutResponse.inactiveStudents.length > 0 ){
					checkoutResponse.hasInactiveCheckins = true;
				}
				
				if( checkoutResponse.hasActiveCheckins || checkoutResponse.hasInactiveCheckins ){
					renderGuardianCheckoutModal( checkoutResponse );
				}else{
					//No parent or student found with that id
					$('#checkout-student-id').val('');
					activeStudentPoll();
					$('#checkout-student-id').focus();
				}
			}
		}).fail(function(){
			$('#checkout-student-id').val('');
			$('#checkout-student-id').focus();
		});
	} 
	
	function renderActiveStudentRows( activeStudents ){
		ActiveStudents.render('tempStudentRowWrap', $('#active-table').find('tbody'), activeStudents, ['tempStudentRow'])
		.done( function(){
			renderActiveStudentPagination( activeStudents.page );
			bindCheckoutRows();
			bindEditStudent();
			bindViewBillingLedger();
			bindViewCheckinLedger();
		});
	}
	
	function renderAwaitingCheckins(){
		var programId = $('.active-program-ref').data('id');
		var awaitingCheckins = _checkinLocalStorage.getAwaitingCheckinsList( programId );
		if( awaitingCheckins.length ){
			ActiveStudents.render('tempAwaitingCheckins', $('#awaiting-checkin-wrap').find('.card-body'), { awaitingCheckins: awaitingCheckins } );
			$('#awaiting-checkin-wrap').show();
		}else{
			$('#awaiting-checkin-wrap').find('.card-body').html('');
			$('#awaiting-checkin-wrap').hide();
		}
		bindHideShowAwaitingCheckins();
	}
	
	function renderActiveStudents( $target, activeStudents ){
		ActiveStudents.render('tempActiveStudentsTable', $target, activeStudents, ['tempStudentRow'])
		.done( function(){
			renderActiveStudentPagination( activeStudents.page );
			bindTable();
			$('#checkin-student-id').focus();
		});
	}
	
	function renderActiveStudent( student ){
		ActiveStudents.getRenderedString('tempStudentRow', student )
		.done( function( renderedString ){
			$('#active-table').find('tbody').prepend(renderedString);
			bindCheckoutRows();
			bindEditStudent();
			bindViewBillingLedger();
			bindViewCheckinLedger();
		});
		
	}
	
	function renderActiveStudentPagination( _page ){
		return app.getComponent('Pagination').getFn('loadPagination', ['tempChevronSpans', $('#students-pagination'), _page ])
		.done( function( $container, page ){
			$container.pagination({
				overrideLoadFunction: function(data){
					loadActiveStudentRows( data.search, data.ajaxData );
				},
				filterClass: 'student-filter',
				ajaxData: page
			});
		});
	}
	
	function renderInactiveStudentWarningModal( studentId ){
		ActiveStudents.getRenderedString('tempInactiveStudentWarningModal', studentId)
		.done( function( renderedString ){
			$('#modal-wrapper').html( renderedString );
			$('#inactiveStudentWarningModal').modal('show');
			$('#modal-wrapper').find('.bs-toggle').bootstrapToggle();
			
			$('#override-checkin-btn')
			.off('click')
			.on('click', function(){
				checkInStudent( studentId, true);
				$('#inactiveStudentWarningModal').modal('hide');
			});
			
			$('#inactiveStudentWarningModal').on('hidden.bs.modal', function(){
				$('#checkin-student-id').focus();
			});
		});
	}
	
	function renderGuardianCheckoutModal( json ){
		ActiveStudents.getRenderedString('tempGuardianCheckoutModal', json)
		.done( function( renderedString ){
			$('#modal-wrapper').html( renderedString );
			$('#guardianCheckoutModal').modal('show');
			$('#modal-wrapper').find('.bs-toggle').bootstrapToggle();
			$('#guardianCheckoutModal')
				.find('.time-range').each(function(){
					$(this).inputmask('datetime', {  
						'inputFormat': 'hh:MM TT',
						'outputFormat': 'HH:MM:ss'
					});
			});
			$('#modal-checkout-btn')
			.off('click')
			.on('click', function(){
				console.log(['clicked']);
				var $form = $('#guardianCheckoutModal').find('form');
				var requestJson = {
					activeCheckoutIds: [],
					inactiveCheckouts: [],
					parentId: json.id
				};
				$form.find('.activeStudentCheckout:checkbox:checked').each(function(){
					requestJson.activeCheckoutIds.push( $(this).val() );
				});
				
				$form.find('.inactiveStudentCheckout:checkbox:checked').each(function(){
					requestJson.inactiveCheckouts.push( {
						studentId: $(this).val(),
						checkinTime: $(this).closest('tr').find('.checkin-time').val()
					});
				});
				guardianCheckout( requestJson );
			});
			
			$('#guardianCheckoutModal').on('hidden.bs.modal', function(){
				$('#checkout-student-id').focus();
			});
		});
		
	}

	function bindTable( ){
		bindScannerMode();
		bindCheckin();
		bindCheckout();
	}
	
	function bindScannerMode(){
		$('.scanner-mode').click(function(){
			if( !$(this).hasClass('btn-blue') ){
				$('.scanner-mode').toggleClass('btn-blue btn-default');
				$('.checkin-form').toggleClass('d-none');
				if( $(this).data('mode') === 'checkout' ){
					$('#checkout-student-id').focus();
				}else if( $(this).data('mode') === 'checkin' ){
					$('#checkin-student-id').focus();
				}
			}
		});
	}
	
	function bindCheckin(){
		$('#checkin-student-id').scannerDetection({
			minLength: 5,
			onComplete: function(){
				checkInStudent( $('#checkin-student-id').val() );
			}
		});
			
		$('#checkin-student-btn')
			.off('click')
			.on('click', function(){
				checkInStudent( $('#checkin-student-id').val() );
			});
	}
	
	function bindCheckout(){
		$('#checkout-student-id').scannerDetection({
				minLength: 5,
				onComplete: function(){
					checkOutStudent( $('#checkout-student-id').val() );
				}
			});
		$('#checkout-student-btn')
			.off('click')
			.on('click', function(){
				checkOutStudent( $('#checkout-student-id').val() );
			});
		bindCheckoutRows();
		bindEditStudent();
		bindViewBillingLedger();
		bindViewCheckinLedger();
	}
	
	
	function bindEditStudent(){
		$('.user-edit')
			.off('click')
			.on('click', function(){
				console.log(['bindEditStudent']);
				App.getComponent('AddStudent').getFn('loadEditStudent', [$('#student-edit-container'), $(this).data('id'), 'main-content'] );
			});
		console.log(['binding remove active checkin']);
		$('.remove-active-checking')
			.off('click')
			.on('click', function(){
				var studentId = $(this).data('id');
				_checkinController.deleteActiveCheckin( studentId )
				.always(function(){
					console.log(['always after the deleteActiveCheckin', studentId ]);
					$('.active-student-row[data-id='+studentId+']').remove();	
				});
			});
	}
	
	function bindViewBillingLedger(){
		app.getComponent('StudentLedger').getFn('bindStudentLedgerModal');
	}
	
	function bindViewCheckinLedger(){
		app.getComponent('CheckinLog').getFn('bindCheckinLedgerModal');
	}
	
	function bindHideShowAwaitingCheckins(){
		$('#show-awaiting-uploads')
			.off('click')
			.on('click', function(){
				$('#awaiting-checkin-wrap').find('.card-body').show();
				$('#show-awaiting-uploads').hide();
				$('#hide-awaiting-uploads').show();
				
			});
		$('#hide-awaiting-uploads')
			.off('click')
			.on('click', function(){
				$('#awaiting-checkin-wrap').find('.card-body').hide();
				$('#show-awaiting-uploads').show();
				$('#hide-awaiting-uploads').hide();
			});
	}
	
	function bindCheckoutRows(){
		$('.student-row-checkout')
		.off('click')
		.on('click', function(){
			checkOutStudent( $(this).data('id') );
		});
	}
		
	function formatActiveStudents( activeStudentsPage ){
		var activeStudents = {
			activeCheckins: activeStudentsPage.content,
			page: getPageObj( activeStudentsPage )
		};
		
		if( typeof activeStudents.activeCheckins !== 'undefined' ){
			activeStudents.activeCheckins.forEach( function(student){
				formatStudent( student );
			});
		}
		
		activeStudents.pageSizeOptions = [];
		$.each( [10, 25, 50, 100, 500], function(index, value){
			activeStudents.pageSizeOptions.push({
				val: value,
				name: value,
				selected: ( activeStudents.page.size === value ? 'selected' : '')
			});
		});
		
		activeStudents.studentSortOptions = [];
		$.each( CheckinSorts, function( index, val ){
			activeStudents.studentSortOptions.push({
				val: val.value,
				name: val.name,
				selected: ( activeStudents.studentSort === val.value ? 'selected': '' )
			});
		});
		
		return activeStudents;
	}
	 
	function formatStudent( student ){
		console.log(['formatStudent', student]);
		if( typeof student.checkInTime !== 'undefined' ){
			student.formattedCheckInTime = timeFormatter.formatDate({
				date: student.checkInTime,
				pattern: 'h:mma',
				timezone: 'America/New_York'
			});
		}
		
		if( typeof student.student !== 'undefined' && typeof student.student.guardians !== 'undefined' ){
			student.authorizedCheckouts = [];
			$.each( student.student.guardians, function( i, guardian ){
				student.authorizedCheckouts.push( guardian.firstName );
			});
			student.formattedCheckoutNames = student.authorizedCheckouts.join(', ');
		}
		
		return student;
	}
	
	function activeStudentPoll(){
		if( typeof _activeStudentTimer !== 'undefined' ){
			clearInterval(_activeStudentTimer);
		}
		_checkinController.getActiveStudentCounts()
		.done(function(counts){
			$('.active-user-header-count').find('span').html( counts.activeUserCount );
			$('.active-header-count').find('span').html(counts.activeProgramCount);
		});
		
		if( $('#students-pagination').length ){
			try{
				console.log(['active student controller loadPage 109']);
				$('#students-pagination').pagination('loadPage');
			}catch( err ){}
		}
		renderAwaitingCheckins();
		_activeStudentTimer = setInterval( activeStudentPoll, 10000 );
	}
	
	
	var publicFunctions = {
		loadActiveStudents: loadActiveStudents,
		activeStudentPoll: activeStudentPoll,
		checkInStudent: checkInStudent,
		checkOutStudent: checkOutStudent
	};
	ActiveStudents = App.addComponent('ActiveStudents', '/students/active-students', publicFunctions);
	return ActiveStudents;
})(App, jQuery);