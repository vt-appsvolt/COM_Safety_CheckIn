package com.myspartansoftware.login.controller.webhooks;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.myspartansoftware.login.domain.forms.ZohoStudentForm;
import com.myspartansoftware.login.model.forms.ZohoStudentFormModel;
import com.myspartansoftware.login.service.forms.ZohoStudentFormService;

//%&3KX!4t@DStP%^f6!Cd8U9

@Controller
public class StudentFormController {

	private final String PrivateToken = "3KX64t_DStP9f6_Cd8U9";
	@Autowired private ZohoStudentFormService zohoStudentFormService;
	
	@GetMapping("/webhook/student/registration/form")
	public ResponseEntity<String> processStudentRegistrationForm(
		@RequestBody ZohoStudentFormModel model
	){
		if( !PrivateToken.equals( model.getToken() ) ) {
			return ResponseEntity.badRequest().build();
		}
		try {
			ZohoStudentForm zohoStudentForm = zohoStudentFormService.convert(model);
			zohoStudentFormService.saveZohoStudentForm(zohoStudentForm);
		}catch( Exception e ) {
			e.printStackTrace();
		}
		return ResponseEntity.ok("processed");
	}

	@GetMapping("/webhook/{token}/{location}/student/registration/form")
	public ResponseEntity<String> processStudentRegistrationFormTwoGet(
		@PathVariable("token") String token,
		@PathVariable("location") String location,
		@RequestBody ZohoStudentFormModel model
	){
		if( !PrivateToken.equals( token ) ) {
			return ResponseEntity.badRequest().build();
		}
		model.setLocation(location);
		try {
			ZohoStudentForm zohoStudentForm = zohoStudentFormService.convert(model);
			zohoStudentFormService.saveZohoStudentForm(zohoStudentForm);
		}catch( Exception e ) {
			e.printStackTrace();
		}
		return ResponseEntity.ok("processed");
	}
	
	@PostMapping("/webhook/{token}/{location}/student/registration/form")
	public ResponseEntity<String> processStudentRegistrationFormTwo(
		@PathVariable("token") String token,
		@PathVariable("location") String location,
		@RequestBody ZohoStudentFormModel model
	){
		if( !PrivateToken.equals( token ) ) {
			return ResponseEntity.badRequest().build();
		}
		model.setLocation(location);
		try {
			ZohoStudentForm zohoStudentForm = zohoStudentFormService.convert(model);
			zohoStudentFormService.saveZohoStudentForm(zohoStudentForm);
			zohoStudentFormService.processForm( zohoStudentForm, true, true );
		}catch( Exception e ) {
			e.printStackTrace();
		}
		return ResponseEntity.ok("processed");
	}
	
}
