package com.myspartansoftware.login.service.utilities;

import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.TimeZone;

import com.myspartansoftware.login.domain.AfterSchoolProgram;

public class DateTimeUtility {

	public static final ZoneId getActiveProgramZoneId( AfterSchoolProgram activeProgram ) {
		if( activeProgram.getTimezone() != null ) {
			return TimeZone.getTimeZone(activeProgram.getTimezone()).toZoneId();
		}else {
			return TimeZone.getTimeZone("America/New_York").toZoneId();
		}
	}
	
	public static final boolean isSameDay( ZonedDateTime date1, ZonedDateTime date2 ) {
		try {
//			return date1.truncatedTo(ChronoUnit.YEARS).equals(date2.truncatedTo(ChronoUnit.YEARS)) &&
//			date1.truncatedTo(ChronoUnit.DAYS).equals(date2.truncatedTo(ChronoUnit.DAYS));
			return date1.getYear() ==  date2.getYear() && date1.getDayOfYear() == date2.getDayOfYear();
		}catch( Exception e ) {
			return false;
		}
	}
	
	public static final ZonedDateTime resetToBeginningOfTheDay( ZonedDateTime date ) {
		return ZonedDateTime.of( date.toLocalDate(), LocalTime.MIN, TimeZone.getTimeZone("America/New_York").toZoneId() );
	}
	
	public static final ZonedDateTime resetToEndOfTheDay( ZonedDateTime date ) {
		return ZonedDateTime.of( date.toLocalDate(), LocalTime.MAX, TimeZone.getTimeZone("America/New_York").toZoneId() );
	}
}
