package com.myspartansoftware.login.model;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DepositReportModel {
	
	private AfterSchoolProgramModel program;
	private List<BillingTransactionModel> achPayments;
	private BigDecimal achTotals;
	private Long achCount;
	private List<BillingTransactionModel> creditcardPayments;
	private BigDecimal creditcardTotals;
	private Long creditcardCount;
	private List<BillingTransactionModel> checkPayments;
	private BigDecimal checkTotals;
	private Long checkCount;
	

}
