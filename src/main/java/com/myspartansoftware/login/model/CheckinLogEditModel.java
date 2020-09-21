package com.myspartansoftware.login.model;

import com.myspartansoftware.login.domain.enums.CheckinRecordType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckinLogEditModel {

	private Long id;
	private String checkinDate;
	private String checkinTime;
	private String checkoutDate;
	private String checkoutTime;
	private Long programId;
	private Long studentId;
	private String pickupName;
	private CheckinRecordType checkinRecordType;
	private Boolean removed;
	private Boolean updateLedger;
	
}
