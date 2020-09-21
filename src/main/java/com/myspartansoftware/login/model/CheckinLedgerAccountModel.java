package com.myspartansoftware.login.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CheckinLedgerAccountModel {

	private Long billingBalanceId;
	private PersonModel person;
	private Long checkinCount;
	
}
