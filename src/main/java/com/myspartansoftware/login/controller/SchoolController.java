package com.myspartansoftware.login.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;

import com.myspartansoftware.login.domain.School;
import com.myspartansoftware.login.service.SchoolService;

@Controller
public class SchoolController {

	@Autowired 
	private SchoolService schoolService;
	
	@PostMapping("/school")
	public ResponseEntity<School> createSchool( School school ){
		schoolService.saveSchool(school);
		return ResponseEntity.ok(school);
	}
	
}
