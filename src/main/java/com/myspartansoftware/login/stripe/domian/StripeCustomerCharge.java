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
@Table(name="stripe_customer_charge")
public class StripeCustomerCharge {
	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	@Column(name="id")
	public Long id;
	
	@Column(name="charge_id")
	public String chargeId;
	
	@Column(name="customer_id")
	public String customerId;
	
	@Column(name="transaction_id")
	public String transactionId;
	
	@Column(name="amount")
	public BigDecimal amount;
	
	@Column(name="currency")
	public String currency;
	
	@Column(name="description")
	public String description;
	
	@Column(name="receipt_email")
	public String receiptEmail;
	
	@Column(name="refunded")
	public Boolean refunded;
	
	@Column(name="statement_descriptor")
	public String statementDescriptor;
	
	@Column(name="status")
	public String status;
	
	@Column(name="amount_refunded")
	public BigDecimal amountRefunded;
	
	@Column(name="application_fee_amount")
	public BigDecimal applicationFeeAmount;
	
	@Column(name="calculated_statement_descriptor")
	public String calculatedStatementDescriptor;
	
	@Column(name="captured")
	public Boolean captured;
	
	@Column(name="created")
	public LocalDateTime created;
	
	@Column(name="failure_code")
	public String failureCode;
	
	@Column(name="failure_message")
	public String failureMessage;
	
	@Column(name="paid")
	public Boolean paid;
	
	@Column(name="payment_intent")
	public String paymentIntent;
	
	@Column(name="payment_method")
	public String paymentMethod;
	
	@Column(name="receipt_number")
	public String receiptNumber;
	
	@Column(name="receipt_url")
	public String receiptUrl;
	
	@Column(name="program_id")
	public String programId;
	
	
}