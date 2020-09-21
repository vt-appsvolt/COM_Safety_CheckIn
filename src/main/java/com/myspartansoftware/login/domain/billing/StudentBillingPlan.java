package com.myspartansoftware.login.domain.billing;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.myspartansoftware.login.domain.Student;

import lombok.Data;

@Data
@Entity
@Table(name="student_billing_plan")
public class StudentBillingPlan {

	@Id
	private StudentBillingPlanPK id;
	
	@ManyToOne
	@JoinColumn(name="student_id", referencedColumnName="id", insertable=false, updatable=false)
	private Student student;
	
	@ManyToOne
	@JoinColumn(name="billing_plan_id", referencedColumnName="id", insertable=false, updatable = false)
	private BillingPlan billingPlan;
}
