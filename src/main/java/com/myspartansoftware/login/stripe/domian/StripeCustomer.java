package com.myspartansoftware.login.stripe.domian;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.Data;

@Data
@Entity
@Table(name = "stripe_customer")
public class StripeCustomer {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "id")
	public Long id;

	@Column(name = "customer_id")
	
	public String customerId;

	@Column(name = "description")
	public String description;
	
	@Column(name = "email")
	public String email;
	
	@Column(name = "family_billing_account_id")
	public String familyBillingAccountId;
	
	@Column(name = "name")
	public String name;
	
	@Column(name = "phone")
	public String phone;

	@Column(name = "balance")
	public BigDecimal balance;
	
	@Column(name = "created")
	public LocalDateTime created;
	
	@Column(name = "currency")
	public String currency;
	
	@Column(name="program_id")
	public String programId;

}