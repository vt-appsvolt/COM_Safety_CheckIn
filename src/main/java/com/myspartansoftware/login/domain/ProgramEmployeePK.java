package com.myspartansoftware.login.domain;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Embeddable;

import lombok.Data;

@Data
@Embeddable
public class ProgramEmployeePK implements Serializable {

	private static final long serialVersionUID = 1L;
	@Column(name="program_id")
	private Long programId;
	@Column(name="employee_id")
	private Long employeeId;
}
