package com.myspartansoftware.login.model;

import lombok.Data;

@Data
public class BillingPlanModel {

	private Long id;
	private String billingPlanName;
	private Boolean defaultRate;
}
