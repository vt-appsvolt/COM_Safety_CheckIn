package com.myspartansoftware.login.model;

import java.util.List;

import com.myspartansoftware.login.domain.ActiveCheckin;

import lombok.Data;

@Data
public class CheckoutResponseModel {

	String id;
	
	Boolean studentCheckedOut;
	
	List<String> checkedOutIds;
	
	List<CheckinLogModel> checkinLogs;
	
	List<StudentModel> connectedStudents;
	
	List<ActiveCheckin> activeCheckins;
	
	List<StudentModel> inactiveStudents;
	
}
