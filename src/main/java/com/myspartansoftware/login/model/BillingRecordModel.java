package com.myspartansoftware.login.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import com.myspartansoftware.login.domain.billing.BillingTransaction.PaymentMethodType;
import com.myspartansoftware.login.domain.billing.BillingTransaction.TransactionType;
import com.myspartansoftware.login.utils.LocalDateDeserializer;
import com.myspartansoftware.login.utils.ZonedDateTimeDeserializer;
import com.myspartansoftware.login.utils.ZonedDateTimeSerializer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillingRecordModel {

	private Long id;
	private BigDecimal amountPaid;
	private String authorization;
	@JsonSerialize(converter = ZonedDateTimeSerializer.class)
	@JsonDeserialize(converter = ZonedDateTimeDeserializer.class)
	private ZonedDateTime paymentDate;
	private Long studentId;
	private Long programId;
	private TransactionType type;
	private String description;
	@JsonDeserialize(converter = LocalDateDeserializer.class)  
	@JsonSerialize(using = LocalDateSerializer.class)  
	private LocalDate paymentLocalDate;
	private PaymentMethodType paymentMethodType;
}
