package com.myspartansoftware.login.model;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.myspartansoftware.login.domain.enums.BillingRecordType;
import com.myspartansoftware.login.utils.ZonedDateTimeDeserializer;
import com.myspartansoftware.login.utils.ZonedDateTimeSerializer;

import lombok.Data;

@Data
public class StudentBillingAttendanceRecordModel {

	private Long id;
	private Long studentId;
	private Long programId;
	private Long checkInLogId;
	private BillingRecordType attendanceType;
	@JsonSerialize(converter = ZonedDateTimeSerializer.class)
	@JsonDeserialize(converter = ZonedDateTimeDeserializer.class)
	private ZonedDateTime attendanceDate;
	private BigDecimal dailyRate;
	private Boolean isFinalRecord;
}
