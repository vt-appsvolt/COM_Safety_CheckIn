package com.myspartansoftware.login.domain;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.NotEmpty;

import lombok.Data;

@Data
@Entity
@Table(name="after_school_program")
public class AfterSchoolProgram {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "program_id")
    private Long id;
	
	@Column(name="program_name")
	@NotEmpty(message = "*Please provide the program name")
	private String programName;
	
	@Column(name="timezone")
	private String timezone;
	
}
