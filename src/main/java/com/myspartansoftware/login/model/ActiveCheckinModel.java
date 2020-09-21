package com.myspartansoftware.login.model;

import java.time.ZonedDateTime;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.myspartansoftware.login.utils.ZonedDateTimeDeserializer;
import com.myspartansoftware.login.utils.ZonedDateTimeSerializer;

import lombok.Data;

@Data
public class ActiveCheckinModel {

	 private Long id;
	 @JsonSerialize(converter = ZonedDateTimeSerializer.class)
	 @JsonDeserialize(converter = ZonedDateTimeDeserializer.class)
	 private ZonedDateTime checkInTime;
	 private StudentModel student;
}
