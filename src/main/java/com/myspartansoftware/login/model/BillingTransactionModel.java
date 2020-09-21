package com.myspartansoftware.login.model;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.myspartansoftware.login.domain.billing.BillingTransaction.PaymentMethodType;
import com.myspartansoftware.login.domain.billing.BillingTransaction.TransactionType;
import com.myspartansoftware.login.utils.ZonedDateTimeDeserializer;
import com.myspartansoftware.login.utils.ZonedDateTimeSerializer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillingTransactionModel {

	private Long id;
	private BigDecimal amount;
	private TransactionType type;
	@JsonSerialize(converter = ZonedDateTimeSerializer.class)
	@JsonDeserialize(converter = ZonedDateTimeDeserializer.class)
	private ZonedDateTime date;
	private Long studentBillingAccountId;
	private Long familyBillingAccountId;
	private String authorization;
	private String studentName;
	private String description;
	private PaymentMethodType paymentMethodType;
	private StudentModel studentModel;
}
