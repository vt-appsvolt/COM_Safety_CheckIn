package com.myspartansoftware.login.utils;

import java.time.ZoneId;

import com.myspartansoftware.login.domain.AfterSchoolProgram;

public class TimezoneUtils {

	public static final ZoneId getActiveProgramZoneId( AfterSchoolProgram p ) {
		return p.getTimezone() != null ? 
				ZoneId.of(p.getTimezone()) : 
				ZoneId.of("America/New_York");
//		if( afterSchoolProgram.getTimezone() != null ) {
//			return ZoneId.of(afterSchoolProgram.getTimezone());
//		}
//		return ZoneId.of("America/New_York");
	}
	
}
