package com.myspartansoftware.login.scheduler;

import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.TimeZone;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.myspartansoftware.login.domain.AfterSchoolProgram;
import com.myspartansoftware.login.service.AfterSchoolProgramService;
import com.myspartansoftware.login.service.CheckinService;

/**
 * Single scheduler service that handles cron or fixed rate schedules
 * 
 * For Cron schedules
 * Ref: https://docs.oracle.com/cd/E12058_01/doc/doc.1014/e12030/cron_expressions.htm
 * Validate your cron https://crontab.guru/#50_7-8_*_*_*
 * @Scheduled(cron="sec min hour dayOfMonth month dayOfWeek year")
 * 
 * Fixed rate
 * @Scheduled(fixedRate = milliseconds ) 
 */
@Component
public class Scheduler {
	
	@Autowired private AfterSchoolProgramService afterSchoolProgramService;
	@Autowired private CheckinService checkinservice;
	
	/**
	 * Automatically checks out each active student when fired of
	 * Scheduler that runs at 11:50 and 12:50 UTC every day
	 * Correlates to the two possible EST times of 7:50am during Daylight Savings Time
	 * Uses LocalTime in EST to double check that the hour is currently 7:50am otherwise ignores
	 *  
	 * 
	 */
	@Scheduled(cron="0 50 11-12 * * ?")
	//@Scheduled(fixedRate = 60000 )
	public void morningProgramAutoCheckoutSch() {
		//ZonedDateTime now = ZonedDateTime.now( TimeZone.getTimeZone( activeProgram.getTimezone() != null ? activeProgram.getTimezone() : "America/New_York").toZoneId() );
		ZonedDateTime now = ZonedDateTime.now( TimeZone.getTimeZone("America/New_York").toZoneId() );
		if( now.getHour() == 7 ) {
			System.out.println("MORNING SCHEDULE "+now.getHour() );
			List<Long> programIds = Arrays.asList( 2l, 3l, 4l, 5l, 6l, 7l );
			programIds.stream().forEach( programId -> {
				Optional<AfterSchoolProgram> programOpt = afterSchoolProgramService.findAfterSchoolProgram(programId);
				if( programOpt.isPresent() ) {
					try {
						checkinservice.checkoutActiveStudentsForProgram( programOpt.get() );
					}catch( Exception e) {
						e.printStackTrace();
					}
				}
			});
		}else {
			System.out.println("MORNING SCHEDULE DID NOT RUN "+now.getHour() );
		}
	}
	
	/**
	 * Automatically checks out each active student when fired of
	 * Scheduler that runs at 3:00 and 4:00 UTC every day
	 * Correlates to the two possible EST times of 11:00pm during Daylight Savings Time
	 * Uses LocalTime in EDT to double check that the hour is currently 11:00pm otherwise ignores
	 *  
	 * 
	 */
	@Scheduled(cron="0 0 3-4 * * ?")
	//@Scheduled(fixedRate = 60000 )
	public void nightlyProgramAutoCheckoutSch() {
		ZonedDateTime now = ZonedDateTime.now( TimeZone.getTimeZone("America/New_York").toZoneId() );
		if( now.getHour() == 23 ) {
			System.out.println("NIGHTLY CHECKOUT SCHEDULER "+now.getHour() );
			List<Long> programIds = Arrays.asList( 1l, 2l, 3l, 4l, 5l, 6l, 7l, 8l );
			//List<Long> programIds = Arrays.asList( 1l, 8l );
			programIds.stream().forEach( programId -> {
				Optional<AfterSchoolProgram> programOpt = afterSchoolProgramService.findAfterSchoolProgram(programId);
				if( programOpt.isPresent() ) {
					try {
						checkinservice.checkoutActiveStudentsForProgram( programOpt.get() );
					}catch( Exception e) {
						e.printStackTrace();
					}
				}
			});
		}else {
			System.out.println("NIGHTLY CHECKOUT SCHEDULE DID NOT RUN "+now.getHour() );
		}
	}
}
