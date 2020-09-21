package com.myspartansoftware.login.model;

import java.util.List;

import com.myspartansoftware.login.domain.enums.BillingRecordType;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper=false)
public class StudentModel extends PersonModel {

	private Long id;
	private String studentId;
	private String grade;
	private Long programId;
	private String schoolName;
	private Boolean isCheckedIn;
	private SchoolModel school;
	private List<GuardianModel> guardians;
	private Long billingPlanId;
	private BillingPlanModel billingPlan;
	private BillingRecordType defaultWeeklyBillingType; 
	private String allergies;
	private String teachersName;
	private Boolean noPhoto;
	private Boolean requiresIdCard;
	private Boolean active; 
	private Boolean isCCPS;
}
