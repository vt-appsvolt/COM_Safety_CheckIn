package com.myspartansoftware.login.domain;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;

import com.myspartansoftware.login.domain.EmployeeRole.EmployeeRoleType;

import lombok.Data;

@Data
@Embeddable
public class EmployeeRolePK implements Serializable {

	private static final long serialVersionUID = 1L;
	@Column(name="program_id")
	private Long programId;
	@Column(name="employee_id")
	private Long employeeId;
	@Column(name="role")
	@Enumerated(EnumType.STRING)
	private EmployeeRoleType role;

}
