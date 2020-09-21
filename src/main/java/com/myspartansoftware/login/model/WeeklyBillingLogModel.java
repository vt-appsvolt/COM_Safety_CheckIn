package com.myspartansoftware.login.model;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.myspartansoftware.login.domain.enums.PaymentStatus;
import com.myspartansoftware.login.utils.ZonedDateTimeDeserializer;
import com.myspartansoftware.login.utils.ZonedDateTimeSerializer;

import lombok.Data;

@Data
public class WeeklyBillingLogModel {

	private Long id;
	private Long studentId;
	private Long programId;
	private StudentModel student;
	@JsonSerialize(converter = ZonedDateTimeSerializer.class)
	@JsonDeserialize(converter = ZonedDateTimeDeserializer.class)
	private ZonedDateTime weekOf;
	private List<StudentBillingAttendanceRecordModel> dailyRecords;
	private BigDecimal weeklyCharge;
	private BigDecimal priorBalance;
	private BigDecimal studentBalance;
	private PaymentStatus paymentStatus;
	private Boolean isFinalRecord;
	
}
