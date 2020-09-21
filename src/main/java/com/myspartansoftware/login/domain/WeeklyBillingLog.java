package com.myspartansoftware.login.domain;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.myspartansoftware.login.domain.enums.BillingRecordType;
import com.myspartansoftware.login.domain.enums.PaymentStatus;
import com.myspartansoftware.login.utils.ZonedDateTimeDeserializer;
import com.myspartansoftware.login.utils.ZonedDateTimeSerializer;

import lombok.Data;

@Data
@Entity
@Table(name="weekly_billing_log")
public class WeeklyBillingLog {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name="weekly_billing_log_id")
	private Long id;
	@Column(name="student_id")
	private Long studentId;
	
	@ManyToOne
	@JoinColumn(name="student_id", referencedColumnName="id", insertable=false, updatable=false)
	private Student student;
	@Column(name="program_id")
	private Long programId;
	@Column(name="week_of")
	@JsonSerialize(converter = ZonedDateTimeSerializer.class)
	@JsonDeserialize(converter = ZonedDateTimeDeserializer.class)
	private ZonedDateTime weekOf;
	
	/**
	 * Requires EAGER FetchType to work with scheduled task that runs outside of a transaction
	 */
	@OneToMany( fetch = FetchType.EAGER, mappedBy = "weeklyBillingLog" )
//	@JoinTable(name = "weekly_billing_log_daily_records",
//	          joinColumns = {@JoinColumn(name = "weekly_billing_log_id")},
//	          inverseJoinColumns = {@JoinColumn(name = "id")}
//	  )
	private List<StudentBillingAttendanceRecord> dailyRecords;
	
	@Column(name="weekly_charge")
	private BigDecimal weeklyCharge;
	@Column(name="prior_balance")
	private BigDecimal priorBalance;
	
	@Column(name="payment_status")
	@Enumerated(EnumType.STRING)
	private PaymentStatus paymentStatus;
	@Column(name="is_final_record")
	private Boolean isFinalRecord;
	@Enumerated(EnumType.STRING)
	@Column(name="weekly_billing_type")
	private BillingRecordType weeklyBillingType;
	@Column(name="requires_review")
	private Boolean requiresReview;
	
	
	
}
