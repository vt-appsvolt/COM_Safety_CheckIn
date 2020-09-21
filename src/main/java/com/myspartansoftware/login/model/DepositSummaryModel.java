package com.myspartansoftware.login.model;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DepositSummaryModel {

	private AfterSchoolProgramModel program;
	private BigDecimal total;
	
}
