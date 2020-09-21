package com.myspartansoftware.login.model;

import lombok.Data;

@Data
public class AfterSchoolProgramModel {

	Long id;
	String programName;
	String programFullName;
	Boolean isActive;
	ContactModel phone;
	ContactModel email;
	AddressModel address;
	
}
