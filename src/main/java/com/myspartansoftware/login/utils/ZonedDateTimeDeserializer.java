package com.myspartansoftware.login.utils;

import java.time.ZonedDateTime;

import com.fasterxml.jackson.databind.util.StdConverter;

public class ZonedDateTimeDeserializer extends StdConverter<String, ZonedDateTime> {

	  @Override
	  public ZonedDateTime convert(String value) {
	      return ZonedDateTime.parse(value, ZonedDateTimeSerializer.DATE_FORMATTER);
	  }
}

//extends JsonDeserializer<ZonedDateTime> {
//
//	@Override
//	public ZonedDateTime deserialize(JsonParser p, DeserializationContext ctxt)
//			throws IOException, JsonProcessingException {
//		return ZonedDateTime.parse(p.getText());
//	}
//
//}

