package com.myspartansoftware.login.model;

import java.util.List;

import lombok.Data;

@Data
public class GuardianCheckoutModel {

	String parentId;
	
	List<String> activeCheckoutIds;
	
	List<InactiveCheckoutModel> inactiveCheckouts;
}
