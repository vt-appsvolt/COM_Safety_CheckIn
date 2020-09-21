package com.myspartansoftware.login.controller.utility;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.TimeZone;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.myspartansoftware.login.service.billing.BillingService;

@Controller
public class SchedulerController {

	@Autowired
	private BillingService billingService;
	
	@GetMapping("/scheduler/process/program/{programId}/transactions")
	public ResponseEntity<Void> processTransactions( @PathVariable("programId") Long programId ){
		//ZonedDateTime endDate = ZonedDateTime.of( LocalDate.now(TimeZone.getTimeZone("America/New_York").toZoneId()) , LocalTime.MIN, TimeZone.getTimeZone("America/New_York").toZoneId());
		ZonedDateTime endDate = ZonedDateTime.of( LocalDate.of(2020, 9, 18) , LocalTime.MIN, TimeZone.getTimeZone("America/New_York").toZoneId());
		ZonedDateTime startDate = endDate.minusDays(7);		
		LocalDateTime localStartDate = startDate.toLocalDateTime();
		LocalDateTime localEndDate = endDate.toLocalDateTime();
		billingService.processTransactions( programId, localStartDate, localEndDate, PageRequest.of(0, 100) );
		return ResponseEntity.ok().build();
	}
	
	
	
}

