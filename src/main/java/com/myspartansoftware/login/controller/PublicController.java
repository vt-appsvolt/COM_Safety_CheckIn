package com.myspartansoftware.login.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class PublicController {
	
	@GetMapping("/import-helper")
	public ModelAndView landingPage() {
		ModelAndView modelAndView = new ModelAndView();
		
		
		
		 modelAndView.setViewName("landing");
	     return modelAndView;
	}

}
