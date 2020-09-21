package com.myspartansoftware.login.model;

import java.util.List;

import org.springframework.data.domain.Page;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CheckinLedgerModel {

	private CheckinLedgerAccountModel familyAccount;
	private List<CheckinLedgerAccountModel> studentAccounts;
	
	private Page<CheckinLogModel> checkinPage;
	
	
}
