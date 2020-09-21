package com.myspartansoftware.login.domain;

import java.time.LocalDate;

import javax.persistence.Column;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.MappedSuperclass;
import javax.validation.constraints.NotEmpty;

import lombok.Data;

@Data
@MappedSuperclass
public abstract class Person {

	public enum Sex{
		MALE, FEMALE
	}
	
	@Column(name = "first_name")
	@NotEmpty(message = "*Please provide your first name")
    private String firstName;
	@Column(name = "last_name")
	@NotEmpty(message = "*Please provide your last name")
    private String lastName;
	@Column(name = "middle_name")
    private String middleName;
	@Column(name="date_of_birth")
	private LocalDate dateOfBirth;
	@Enumerated(EnumType.STRING)
	@Column(name="sex")
	private Sex sex;
	
}
