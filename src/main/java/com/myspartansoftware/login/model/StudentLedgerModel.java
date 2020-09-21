package com.myspartansoftware.login.model;

import java.util.List;

import org.springframework.data.domain.Page;

import com.myspartansoftware.login.domain.billing.FamilyBillingAccount;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StudentLedgerModel {

	private FamilyBillingAccount familyBillingAccount;
	private List<StudentBillingAccountModel> studentBillingAccounts;
	
	private StudentBillingAccountModel studentBillingAccount;
	private Page<BillingTransactionModel> billingTransactionPage;
	
}
