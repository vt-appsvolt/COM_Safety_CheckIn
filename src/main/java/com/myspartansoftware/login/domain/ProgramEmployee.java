package com.myspartansoftware.login.domain;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import lombok.Data;

@Data
@Entity
@Table(name="program_employee")
public class ProgramEmployee {

	@Id
	private ProgramEmployeePK id;
	
	@ManyToOne
	@JoinColumn(name="program_id", referencedColumnName="program_id", insertable=false, updatable=false)
	private AfterSchoolProgram afterSchoolProgram;
	
	@Column(name="program_id", insertable=false, updatable=false)
	private Long afterSchoolProgramId;
	
	@ManyToOne
	@JoinColumn(name="employee_id", referencedColumnName="user_id", insertable=false, updatable=false)
	private User user;
	
	@Column(name="employee_id", insertable=false, updatable=false)
	private Long userId;
}
