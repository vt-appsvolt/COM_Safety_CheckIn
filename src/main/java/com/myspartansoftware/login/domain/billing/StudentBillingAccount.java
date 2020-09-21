package com.myspartansoftware.login.domain.billing;

import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.myspartansoftware.login.domain.Student;

import lombok.Data;

@Data
@Entity
@Table(name="student_billing_account")
public class StudentBillingAccount {

	@Id
	@Column(name="id")
	private Long id;
	
	@ManyToOne
	@JoinColumn(name="id", referencedColumnName="id", insertable=false, updatable=false)
	private Student student;
	
	@Column(name="balance")
	private BigDecimal balance;
	
	@JsonIgnore
	@ManyToOne
	@JoinColumn(name="family_billing_balance_id",referencedColumnName="id")
	private FamilyBillingAccount familyBillingAccount;
	
	@Column(name="family_billing_balance_id", insertable = false, updatable = false)
	private Long familyBillingAccountId;
	
	@Column(name="program_id")
	private Long programId;
	
	
}
