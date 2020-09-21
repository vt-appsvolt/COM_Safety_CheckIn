;(function(app, $){
	var AddStudent,
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
	StatusTypes = [
		{ name: 'Active', value: true},
		{ name: 'Inactive', value: false}
	],
	PhotoOptions = [
		{name: 'Allow Photos', value:false},
		{name: 'No Photos', value:true}
	],
	IdCardOptions = [
		{name: 'ID Card Printed ', value:false},
		{name: 'Requires ID Card', value:true}
	];
	
	
	function loadAddStudent( $target ){
		setActiveContainer( $target );
		_billingController.getBillingPlanModels()
		.done( function( billingPlans ){
			console.log(['billingPlans', billingPlans]);
			var student = {};
			student.bilingPlanOptions = [];
			if( typeof billingPlans !== 'undefined' ){
				$.each( billingPlans, function(i,v){
					student.bilingPlanOptions.push({
						value: v.id,
						label: v.billingPlanName + ( v.defaultRate  ? ' (default)': '' ),
						selected: isBillingPlanSelected( student.billingPlanId, v )
					});
				});
			}
			renderStudentForm( $target, student );
		});
		
	}
	
	function loadEditStudent( $target, personId, backTargetId ){
		setActiveContainer( $target );
		console.log(['loadEditStudent', personId]);
		$.when( 
			_studentController.getStudent( personId ),
			_billingController.getBillingPlanModels()
		).done( function( studentResponse, billingPlanResponse ){
			var student = studentResponse[0];
			var billingPlans = billingPlanResponse[0];
			renderStudentForm( $target, formatStudent(student, billingPlans), backTargetId );
		});
	}
	
	function renderAddParent(){
		AddStudent.getRenderedString('tempGuardianForm', formatParent({}), ['tempContactForm'] )
		.done(function( renderedString ){
			$('.parent-wrap').append( renderedString );
			//TODO: bind
			
			bindEditParent();
		});
	}
	
	function renderAddParentContact( $target ){
		AddStudent.getRenderedString('tempContactForm', formatContact({}) )
		.done(function( renderedString ){
			$target.append( renderedString );
			//TODO: bind
			
			//bindEditParent();
		});
	}
	
	function renderStudentForm( $target, student, backTargetId ){
		student = student || {};
		student = formatForm(student);
		
		
		if( typeof backTargetId !== 'undefined' ){
			student.showBack = true;
		}
		
		AddStudent.render('tempNewStudentForm', $target, student, ['tempGuardianForm', 'tempContactForm'] )
		.done( function(){
			bindEditStudent();
			$('#edit-student-back')
				.off('click')
				.on('click', function(){
					setActiveContainer( $('#'+backTargetId) );
					$target.empty();
				});
		});
	}
	
	function renderStudentSavedAlert( student ){
		var message = student.firstName+' '+student.lastName+' successfully saved.';
		toastr.info(message, {
			"timeOut": "5000",
		});
//		student.alertId = 'added-student-alert-'+student.id;
//		AddStudent.getRenderedString('tempNewStudentSuccessMessage', student )
//		.done(function( renderedString ){
//			$('#alert-wrapper').find('.wrapper').append( renderedString );
//			setTimeout( function(){
//				$('#added-student-alert-'+student.id).remove();			
//			}, 5000);
//		});
	}
	
	function renderStudentDeleteAlert( student ){
		var message = student.firstName+' '+student.lastName+' successfully deleted.';
		toastr.error(message, {
			"timeOut": "5000",
		});
//		student.alertId = 'added-student-alert-'+student.id;
//		AddStudent.getRenderedString('tempDeleteStudentMessage', student )
//		.done(function( renderedString ){
//			$('#alert-wrapper').find('.wrapper').append( renderedString );
//			setTimeout( function(){
//				$('#added-student-alert-'+student.id).remove();			
//			}, 5000);
//		});
	}
	
	function bindEditContact(){
		//TODO: delete contact
		
	}
	
	function bindEditParent(){
		$('.delete-guardian')
		.off('click')
		.on('click', function(){
			$(this).closest('.guardian-form-wrap').remove();
		});
		$('.add-guardian-contact')
		.off('click')
		.on('click', function(){
			renderAddParentContact( $(this).closest('.guardian-form-wrap').find('.guardian-contact-wrap')  );
		});
		bindEditContact();
	}
	
	function bindEditStudent(){
		$('#submit-student')
			.off('click')
			.on('click', function(){
				var student = buildStudent();
				console.log(['bindEditStudent', student]);
				_studentController.saveStudent( student ).done(function( student ){
					renderStudentSavedAlert( student );
				});
			});
		$('#delete-student')
			.off('click')
			.on('click', function(){
				var student = buildStudent();
				var studentId = $(this).data('id');
				console.log(['delete student', studentId]);
				AddStudent.getRenderedString('tempDeleteStudentWarningModal', {} )
				.done(function( renderedString ){
					$('#modal-wrapper').html( renderedString );
					$('#deleteStudentWarningModal').modal('show');
					$('#confirm-delete-student-btn')
						.off('click')
						.on('click', function(){
							_studentController.deleteStudent( studentId ).done(function( ){
								renderStudentDeleteAlert( student );
								$('#deleteStudentWarningModal').modal('hide');
							});
						});
				});
			});
		
		$('#add-parent')
			.off('click')
			.on('click', function(){
				renderAddParent();
			});
		bindEditParent();
	}
	
	function formatStudent( student, billingPlans ){
		student = student || {};
		student.bilingPlanOptions = [];
		student.showDelete = typeof student.id !== 'undefined';
		student = formatForm( student );
		if( typeof student.guardians !== 'undefined' ){
			$.each( student.guardians, function(i,v){
				formatParent(v);
			});
		}
		if( typeof billingPlans !== 'undefined' ){
			$.each( billingPlans, function(i,v){
				student.bilingPlanOptions.push({
					value: v.id,
					label: v.billingPlanName + ( v.defaultRate  ? ' (default)': '' ),
					selected: isBillingPlanSelected( student.billingPlanId, v )
				});
			});
		}
		student.defaultBillingTypes = [{
			value: '',
			label: 'Not Set'
		}];
		$.each( DefaultBillingTypes, function(i,v){
			student.defaultBillingTypes.push({
				value: v.value,
				label: v.name,
				selected: v.value === student.defaultWeeklyBillingType ? 'selected' : ''
			});
		});
		student.statusTypes =[];
		$.each( StatusTypes, function(i,v){
			student.statusTypes.push({
				value: v.value,
				label: v.name,
				selected: v.value === student.active ? 'selected' : ''
			});
		});
		student.photoOptions = [];
		$.each( PhotoOptions, function(i,v){
			student.photoOptions.push({
				value: v.value,
				label: v.name,
				selected: v.value === student.noPhoto ? 'selected' : ''
			});
		});
		student.idCardOptions = [];
		$.each( IdCardOptions, function(i,v){
			student.idCardOptions.push({
				value: v.value,
				label: v.name,
				selected: v.value === student.requiresIdCard ? 'selected' : ''
			});
		});
		
		console.log(['formatStudent', student]);
		return student;
	}
	
	function isBillingPlanSelected( studentBillingPlanId, billingPlan ){
		console.log(['isBillingPlanSelected', studentBillingPlanId, billingPlan]);
		if( studentBillingPlanId !== null){
			return billingPlan.id === studentBillingPlanId ? 'selected': '';
		}else{
			return billingPlan.defaultRate ? 'selected': '';
		}
		
	}
	
	function formatParent( parent ){
		console.log(['formatParent', parent]);
		parent = parent || {};
		parent = formatForm( parent );
		parent.relationshipTypes = [];
		$.each(['Mother', 'Father', 'Guardian', 'Grandmother', 'Grandfather'], function( i, v ){
			parent.relationshipTypes.push({
				value: v,
				label: v,
				selected: v===parent.relationship? 'selected':''
			});
		});
		if( typeof parent.contacts !== 'undefined' ){
			$.each( parent.contacts, function(i,v){
				formatContact(v);
			});
		}
		
		return parent;
	}
	
	function formatContact( contact ){
		contact = contact || {};
		contact = formatForm( contact );
		contact.contactTypes = [];
		$.each(['Phone', 'Email'], function(i,v){
			contact.contactTypes.push({
				value: v,
				label: v,
				selected: v===contact.contactType? 'selected':''
			});
		});
		return contact;
	}
	
	function buildStudent(){
		var student = $('#new-student-form').serializeJSON( serializeJSON_Defaults );
		student.guardians = [];
		$('form.guardian-form').each( function(){
			student.guardians.push( buildParent( $(this) ) );
		});
		return student;
	}
	
	function buildParent( $form ){
		var parent = $form.serializeJSON( serializeJSON_Defaults );
		parent.contacts = [];
		$form.closest('.guardian-form-wrap').find('form.contact-form').each(function(){
			parent.contacts.push( $(this).serializeJSON( serializeJSON_Defaults ) );
		});
		return parent;
	}
	
	var publicFunctions = {
		loadAddStudent: loadAddStudent,
		loadEditStudent: loadEditStudent	
	};
	AddStudent = App.addComponent('AddStudent', '/students/add-student', publicFunctions);
	return AddStudent;
})(App, jQuery);