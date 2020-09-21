package com.myspartansoftware.login.model;

import java.time.LocalDate;

import com.myspartansoftware.login.domain.Person.Sex;

import lombok.Data;

@Data
public class PersonModel {

	private String firstName;
	private String lastName;
	private String middleName;
//	@JsonSerialize(converter = ZonedDateTimeSerializer.class)
//	@JsonDeserialize(converter = ZonedDateTimeDeserializer.class)
	private LocalDate dateOfBirth;
	private Sex sex;

}
