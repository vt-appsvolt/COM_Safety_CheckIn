package com.myspartansoftware.login.stripe.utils;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

public class DateUtils {

	// Convert unix time to Eastern Time (GMT -4)
	public static LocalDateTime convertUnixToEasternTime(long unixTime) {
		LocalDateTime dateTime = LocalDateTime.ofInstant(Instant.ofEpochSecond(unixTime), ZoneId.of("GMT-04:00"));
		return dateTime;
	}
}
