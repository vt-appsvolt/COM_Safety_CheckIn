package com.myspartansoftware.login.utils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import com.fasterxml.jackson.databind.util.StdConverter;

public class LocalDateDeserializer extends StdConverter<String, LocalDate>{

	private static DateTimeFormatter LOCALDATE_FORMATTER = DateTimeFormatter.ofPattern("MM/dd/yyyy");
	
	@Override
	public LocalDate convert(String value) {
		return LocalDate.parse(value, LOCALDATE_FORMATTER);
	}

}
