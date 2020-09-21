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
@Table(name = "stripe_transaction")
public class StripeTransaction {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "id")
	public Long id;

	@Column(name = "transaction_id")	
	public String transactionId;

	@Column(name = "amount")
	public BigDecimal amount;

	@Column(name = "available_on")
	public LocalDateTime availableOn;

	@Column(name = "created")
	public LocalDateTime created;

	@Column(name = "currency")
	public String currency;

	@Column(name = "description")
	public String description;

	@Column(name = "fee")
	public BigDecimal fee;

	@Column(name = "net")
	public BigDecimal net;

	@Column(name = "source")
	public String source;

	@Column(name = "status")
	public String status;

	@Column(name = "type")
	public String type;
	
	@Column(name="program_id")
	public String programId;

}
