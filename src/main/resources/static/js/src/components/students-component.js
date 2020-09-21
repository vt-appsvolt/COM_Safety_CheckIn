;(function(app, $){
	var Students,
	CheckinSorts = [
		{ name: 'Grade 0 -> 12', value: 'GradeAsc'},
		{ name: 'Grade 12 -> 0', value: 'GradeDesc'},
		{ name: 'Last Name A -> Z', value: 'LastNameAsc'},
		{ name: 'Last Name Z -> A', value: 'LastNameDesc'},
		{ name: 'School A -> Z', value: 'SchoolAsc'},
		{ name: 'School Z -> A', value: 'SchoolDesc'}
	],
	DefaultBillingTypes = [
		{ name: 'One Day', value: 'DAILY_RATE'},
		{ name: 'Two To Three Days', value: 'TWO_TO_THREE_DAYS'},
		{ name: 'Four To Five Days', value: 'FOUR_TO_FIVE_DAYS'},
		{ name: 'Before + After Four To Five', value: 'FOUR_TO_FIVE_DAYS_BEFORE_AND_AFTER'},
		{ name: 'Before + After Two To Three', value: 'TWO_TO_THREE_DAYS_BEFORE_AND_AFTER'},
		{ name: 'Morning Only', value: 'MORNING' },
		{ name: 'Two Day', value: 'TWO_DAY' },
		{ name: 'Three Day', value: 'THREE_DAY' },
		{ name: 'Four Day', value: 'FOUR_DAY' },
		{ name: 'Five Day', value: 'FIVE_DAY' }
	],
	StudentFilters = [
		{ name: 'Active', value:'ACTIVE_STUDENTS' },
		{ name: 'Inactive', value:'INACTIVE_STUDENTS' },
		{ name: 'Morning Program', value:'MORNING_STUDENTS' },
		{ name: 'CCPS', value:'CCPS'}, 
		{ name: 'Regular Rate', value:'DEFAULT_RATE'},
		{ name: 'Scholarship', value:'SCHOLARSHIP'},
		{ name: 'ELC', value:'ELC'},
		{ name: 'Show All', value:'ALL_STUDENTS' }
	],
	BillingPlans;
	
	function loadStudents( $target, search, page ){
		setActiveContainer( $target );
		page = page || getPageObj();
		$.when(
			_studentController.getStudents( search, page ),
			loadBillingPlans()
		)
		.done(function( studentsPageResponse, billingPlanResponse ){
			renderStudents( $target, formatStudents( studentsPageResponse[0], billingPlanResponse[0] ) );
		});
	}
	
	function loadStudentRows( search, page ){
		$.when(
			_studentController.getStudents( search, page ),
			loadBillingPlans()
		).done(function( studentsPageResponse, billingPlanResponse ){
			renderStudentRows( formatStudents( studentsPageResponse[0] ) );
		});
	}
	
	function loadBillingPlans(){
		var dfd = $.Deferred();
		if( typeof BillingPlans !== 'undefined'){
			return dfd.resolve(BillingPlans);
		}else{
			_billingController.getBillingPlanModels()
			.done( function( billingPlans ){
				BillingPlans = billingPlans;
				dfd.resolve(BillingPlans);
			});
		}
		return dfd.promise();
	}
	
	function renderStudents( $target, students ){
		Students.render('tempStudents', $target, students, ['tempStudentRow'])
		.done(function(){
			renderStudentsPagination( students.page );
			bindEditStudent();
			bindViewBillingLedger();
			bindViewCheckinLedger();
			bindPrintStudents();
			bindViewAllergies();
		});
	}
	
	function renderStudentRows( students ){
		Students.render('tempStudentRowWrap', $('#student-table').find('tbody'), students, ['tempStudentRow'])
		.done(function(){
			renderStudentsPagination( students.page );
			bindEditStudent();
			bindViewBillingLedger();
			bindViewCheckinLedger();
			bindViewAllergies();
		});
		$('#all-student-count').html( students.totalStudents ); 
	}
	
	function renderStudentsPagination( _page ){
		return app.getComponent('Pagination').getFn('loadPagination', ['tempChevronSpans', $('#students-pagination'), _page ])
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
	
	function renderStudentAllergiesModal( allergies ){
		Students.getRenderedString('tempStudentAllergiesModal', {allergies: allergies})
		.done( function( renderedString ){
			$('#modal-wrapper').html( renderedString );
			$('#studentAllergiesModal').modal('show');
			$('#modal-wrapper').find('.bs-toggle').bootstrapToggle();
		});
	}
	
	function formatStudents( studentsPage, billingPlans ){
		var students = {
			students: studentsPage.content,
			page: getPageObj( studentsPage ),
			totalStudents: studentsPage.totalElements
		};
		var defaultBillingPlan = typeof billingPlans !== 'undefined' && billingPlans.length ? billingPlans[0].billingPlanName : 'Not Set (use default)';
		if( typeof billingPlans !== 'undefined' && billingPlans.length ){
			$.each( billingPlans, function( i, billingPlan ){
				if( billingPlan.defaultRate ){
					defaultBillingPlan = billingPlan.billingPlanName;
				}
			});
		}
		
		$.each(students.students, function(i, student){
			student = formatStudent( student, defaultBillingPlan );
		});
		
		
		
		students.pageSizeOptions = [];
		$.each( [10, 25, 50, 100, 500], function(index, value){
			students.pageSizeOptions.push({
				val: value,
				name: value,
				selected: ( students.page.size === value ? 'selected' : '')
			});
		});
		
		students.studentSortOptions = [];
		$.each( CheckinSorts, function( index, val ){
			students.studentSortOptions.push({
				val: val.value,
				name: val.name,
				selected: ( students.studentSort === val.value ? 'selected': '' )
			});
		});
		
		students.studentActiveOptions = [];
		$.each( StudentFilters, function( index, val ){
			students.studentActiveOptions.push({
				val: val.value,
				name: val.name,
				selected: ( students.studentsFilter === val.value ? 'selected': '' )
			});
		});
		return students;
	}
	
	function formatStudent( student, defaultBillingPlan ){
		if( typeof student.billingPlanId !== 'undefined' && student.billingPlanId !== null ){
			$.each( BillingPlans, function( i, v ){
				if( v.id === student.billingPlanId ){
					student.billingPlan = v.billingPlanName;
					return false;
				}
			});
		}else{
			student.billingPlan = defaultBillingPlan || 'Not Set (use default)';
		}
		if( typeof student.defaultWeeklyBillingType !== 'undefined' ){
			$.each( DefaultBillingTypes, function( i,v ){
				if( v.value === student.defaultWeeklyBillingType ){
					student.defaultWeeklyBillingTypeName = v.name;
					return false;
				}
			});
		}
		if( typeof student.allergies !== 'undefined' && student.allergies.trim() !== '' &&
			student.allergies.trim().toLowerCase() !== 'na' &&
			student.allergies.trim().toLowerCase() !== 'n/a' &&
			student.allergies.trim().toLowerCase() !== 'none' &&
			student.allergies.trim().toLowerCase() !== 'no known allergies.'
		){
			student.showAllergies = true;
		} 
		
		return student;
	}
	
	function bindEditStudent(){
		$('.user-edit')
			.off('click')
			.on('click', function(){
				App.getComponent('AddStudent').getFn('loadEditStudent', [$('#student-edit-container'), $(this).data('id'), 'main-content'] );
			});
		$('.check-in-out-btn')
			.off('click')
			.on('click', function(){
				var $elem = $(this);
				console.log(['_config.SignInClass', _config.SignInClass, $elem.find('.far').hasClass(_config.SignInClass) ]);
				if( $elem.find('.far').hasClass(_config.SignInClass) ){
					App.getComponent('ActiveStudents').getFn('checkInStudent', [$elem.data('id')] );
					$elem.find('.far').removeClass(_config.SignInClass).addClass(_config.SignOutClass);
				}else{
					App.getComponent('ActiveStudents').getFn('checkOutStudent', [$elem.data('id')] );
					$elem.find('.far').removeClass(_config.SignOutClass).addClass(_config.SignInClass);
				}
			});
	}
	
	function bindViewBillingLedger(){
		app.getComponent('StudentLedger').getFn('bindStudentLedgerModal');
	}
	function bindViewCheckinLedger(){
		app.getComponent('CheckinLog').getFn('bindCheckinLedgerModal');
	}
	
	function bindViewAllergies(){
		$('.show-allergies')
		.off('click')
		.on('click', function( e ){
			renderStudentAllergiesModal( $(this).data('allergies') );
		});
	}
	
	function bindPrintStudents(){
		$('#print-students')
		.off('click')
		.on('click', function( e ){
			e.preventDefault();
				var $this = $(this);
				
				$('#print-students').print({
					pathToPrint: 'about:blank'
				});
				
				var thisHTML = $('#print-students').print('filteredHtml', $('#student-print-wrap') );
				
				$('#printFrame').contents()
					.find('body')
						.html(thisHTML);
				
				setTimeout(function () {						
					$('#print-students').print('printIframe');
				}, 500);
		});
		
	}
	
	var publicFunctions = {
		loadStudents: loadStudents	
	};
	Students = App.addComponent('Students', '/students/students', publicFunctions);
	return Students;
})(App, jQuery);