package com.myspartansoftware.login.utils;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

import com.fasterxml.jackson.databind.util.StdConverter;

public class ZonedDateTimeSerializer extends StdConverter<ZonedDateTime, String> {
	 // static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofLocalizedDateTime(FormatStyle.MEDIUM);
	
	 // static final DateTimeFormatter DATE_FORMATTER=DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'"); //"MM/dd/yy hh:mm:ss Z");
	static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_OFFSET_DATE_TIME;
	
	  @Override
	  public String convert(ZonedDateTime value) {
	      return value.format(DATE_FORMATTER);
	  }
}

//extends JsonSerializer< ZonedDateTime > {
//
//	@Override
//	public void serialize(ZonedDateTime value, JsonGenerator gen, SerializerProvider serializers)
//			throws IOException, JsonProcessingException {
//		static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofLocalizedDateTime(FormatStyle.MEDIUM);
//
//	  @Override
//	  public String convert(LocalDateTime value) {
//	      return value.format(DATE_FORMATTER);
//	  }
//	  
//		if( value != null ) {
//			gen.writeString( value.toString() );
//		}
//	}
//	
//}
