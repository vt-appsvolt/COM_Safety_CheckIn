package com.myspartansoftware.login.domain.billing;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.myspartansoftware.login.domain.billing.BillingTransaction.PaymentMethodType;
import com.myspartansoftware.login.utils.ZonedDateTimeDeserializer;
import com.myspartansoftware.login.utils.ZonedDateTimeSerializer;

import lombok.Builder;
import lombok.Data;

@Data
@Entity
@Builder
@Table(name="billing_record")
public class BillingRecord {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO )
	@Column(name="id")
	private Long id;
	
	@Column(name="amount_paid")
	private BigDecimal amountPaid;
	@Column(name="last_four")
	private String lastFour;
	@Column(name = "payment_date")
	@JsonSerialize(converter = ZonedDateTimeSerializer.class)
	@JsonDeserialize(converter = ZonedDateTimeDeserializer.class)
	private ZonedDateTime paymentDate;
	@Column(name="student_id")
	private Long studentId;
	@Column(name="program_id")
	@NotNull(message = "*Billing Plan must be connected to a program")
	private Long programId;
	@Enumerated(EnumType.STRING)
	@Column(name="payment_method_type")
	private PaymentMethodType paymentMethodType;
//	
//	@ManyToOne
//	@JoinColumn(name="student_id", referencedColumnName="id", insertable=false, updatable=false)
//	private Student student;
	
}
