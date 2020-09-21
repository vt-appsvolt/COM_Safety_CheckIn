package com.myspartansoftware.login.domain.billing;

import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.Data;

@Data
@Entity
@Table(name="family_billing_account")
public class FamilyBillingAccount {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name="id")
	private Long id;
	
	@Column(name="balance")
	private BigDecimal balance;
	
//	@JsonIgnore
//	@OneToMany( mappedBy = "familyBillingAccount")
//	private List<StudentBillingAccount> studentBilingAccount;
	
	@Column(name="program_id")
	private Long programId;
	
	@Column(name="last_name")
	private String lastName;
	
	@Column(name="student_count")
	private Long studentCount;
	
	@Column(name="stripe_account")
	private String stripeAccount;
	
	
}
