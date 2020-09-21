package com.myspartansoftware.login.domain;

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
import com.myspartansoftware.login.domain.enums.CheckinRecordType;
import com.myspartansoftware.login.utils.ZonedDateTimeDeserializer;
import com.myspartansoftware.login.utils.ZonedDateTimeSerializer;

import lombok.Data;

@Data
@Entity
@Table(name="check_in_log")
public class CheckinLog {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "active_checkin_id")
    private Long id;
	@Column(name="checked_in")
	@JsonSerialize(converter = ZonedDateTimeSerializer.class)
	@JsonDeserialize(converter = ZonedDateTimeDeserializer.class)
	private ZonedDateTime checkInTime;
	@Column(name="checked_out")
	@JsonSerialize(converter = ZonedDateTimeSerializer.class)
	@JsonDeserialize(converter = ZonedDateTimeDeserializer.class)
	private ZonedDateTime checkOutTime;
	@Column(name="program_id")
	private Long programId;
	@Column(name="checked_in_by")
	private Long checkedInBy;
	@Column(name="checked_out_by")
	private Long checkedOutBy;
	@ManyToOne
	@JoinColumn(name="student_id", referencedColumnName="id")
	private Student student;
	@Column(name="removed")
	private Boolean removed;
	@Column(name="guardian_pickup_id")
	private Long guardianPickupId;
	@Column(name="pickup_name")
	private String pickupName;
	@Enumerated(EnumType.STRING)
	@Column(name="checkin_record_type")
	private CheckinRecordType checkinRecordType;
	
}
