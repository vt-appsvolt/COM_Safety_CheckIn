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
public class StudentBillingAccountModel {

	private Long id;
	private StudentModel student;
	private BigDecimal balance;
	private Long programId;
	
}
