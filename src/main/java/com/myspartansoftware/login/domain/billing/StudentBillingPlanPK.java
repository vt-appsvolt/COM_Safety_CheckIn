package com.myspartansoftware.login.domain.billing;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Embeddable;

import lombok.Data;

@Data
@Embeddable
public class StudentBillingPlanPK implements Serializable {

	private static final long serialVersionUID = 1L;
	@Column(name="student_id")
	private Long studentId;
	@Column(name="billing_plan_id")
	private Long billingPlanId;

}
