package com.myspartansoftware.login.domain;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.myspartansoftware.login.domain.enums.BillingRecordType;
import com.myspartansoftware.login.domain.enums.CheckinRecordType;
import com.myspartansoftware.login.utils.ZonedDateTimeDeserializer;
import com.myspartansoftware.login.utils.ZonedDateTimeSerializer;

import lombok.Data;

@Data
@Entity
@Table(name="student_billing_attendance_record")
public class StudentBillingAttendanceRecord {
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name="id")
	private Long id;
	@Column(name="student_id")
	private Long studentId;
	@Column(name="program_id")
	private Long programId;
	@Column(name="check_in_log")
	private Long checkInLogId;
	@Column(name="attendance_type")
	@Enumerated(EnumType.STRING)
	private BillingRecordType attendanceType;
	
	@Column(name = "attendance_date")
	@JsonSerialize(converter = ZonedDateTimeSerializer.class)
	@JsonDeserialize(converter = ZonedDateTimeDeserializer.class)
	private ZonedDateTime attendanceDate;
	@Column(name="daily_rate")
	private BigDecimal dailyRate;  
	@Column(name="is_final_record")
	private Boolean isFinalRecord;
	@Enumerated(EnumType.STRING)
	@Column(name="checkin_record_type")
	private CheckinRecordType checkinRecordType;
	@ManyToOne
	@JoinColumn(name = "weekly_billing_log_id", referencedColumnName="weekly_billing_log_id")
	private WeeklyBillingLog weeklyBillingLog;
	@Column(name="attendance_trx_descriptor")
	private String attendanceTrxDescriptor;
	
	
}
