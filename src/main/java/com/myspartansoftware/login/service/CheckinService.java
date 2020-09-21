package com.myspartansoftware.login.service;

import java.text.ParseException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

import javax.persistence.criteria.Predicate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.myspartansoftware.login.domain.ActiveCheckin;
import com.myspartansoftware.login.domain.ActiveCheckin_;
import com.myspartansoftware.login.domain.AfterSchoolProgram;
import com.myspartansoftware.login.domain.CheckinLog;
import com.myspartansoftware.login.domain.CheckinLog_;
import com.myspartansoftware.login.domain.School_;
import com.myspartansoftware.login.domain.Student;
import com.myspartansoftware.login.domain.Student_;
import com.myspartansoftware.login.domain.enums.CheckinRecordType;
import com.myspartansoftware.login.model.AfterSchoolProgramAttendanceModel;
import com.myspartansoftware.login.model.CheckinLogEditModel;
import com.myspartansoftware.login.model.StudentSort;
import com.myspartansoftware.login.repository.ActiveCheckinRepository;
import com.myspartansoftware.login.repository.CheckinLogRepository;
import com.myspartansoftware.login.service.billing.BillingService;
import com.myspartansoftware.login.service.builder.ModelBuilderService;
import com.myspartansoftware.login.service.utilities.DateTimeUtility;

@Service("checkinService")
public class CheckinService {

	private ActiveCheckinRepository activeCheckinRepository;
	
	private CheckinLogRepository checkinLogRepository;
	
	private BillingService billingService;
	
	private ModelBuilderService modelBuilderService;

	//TODO: Make a setting on the program
	private static final List<Long> morningPrograms = Arrays.asList( 2l, 3l, 4l, 5l, 6l, 7l );
	
	@Autowired
	public CheckinService(ActiveCheckinRepository activeCheckinRepository, CheckinLogRepository checkinLogRepository, BillingService billingService, ModelBuilderService modelBuilderService) {
		this.activeCheckinRepository = activeCheckinRepository;
		this.checkinLogRepository = checkinLogRepository;
		this.billingService = billingService;
		this.modelBuilderService = modelBuilderService;
	}
	
	public void checkinStudent( ActiveCheckin activeCheckin, AfterSchoolProgram activeProgram ) {
		ZonedDateTime now = ZonedDateTime.now( TimeZone.getTimeZone( activeProgram.getTimezone() != null ? activeProgram.getTimezone() : "America/New_York").toZoneId() );
		activeCheckin.setCheckinRecordType( getCheckinRecordType( activeProgram, now  ) );
		activeCheckinRepository.save(activeCheckin);
		//if( program setting to record billing on checkin  ) {
		billingService.recordStudentBillingAttendanceRecord(activeCheckin, activeProgram);
		//}
	}

	public Long getActiveProgramCount( Long programId ) {
		return activeCheckinRepository.count( (root, q, cb) -> { 
			return cb.equal(root.get(ActiveCheckin_.programId), programId);
		});
	}

	public Long getActiveUserCount( Long userId, Long programId  ) {
		return activeCheckinRepository.count( (root, q, cb) -> { 
			return cb.and(
				cb.equal(root.get(ActiveCheckin_.checkedInBy), userId),
				cb.equal(root.get(ActiveCheckin_.programId), programId)
			);
		});
	}
	
	public ActiveCheckin findByStudentId(Long id, String studentId, Long programId) {
		List<ActiveCheckin> activeCheckins = activeCheckinRepository.findAll( (root, q, cb) -> {
				return cb.and( 
				cb.equal(root.get(ActiveCheckin_.STUDENT).get(Student_.ID), id),
				cb.equal(root.get(ActiveCheckin_.student).get(Student_.studentId), studentId),
				cb.equal(root.get(ActiveCheckin_.PROGRAM_ID), programId)
			);
		});
		return activeCheckins != null && !activeCheckins.isEmpty() ? activeCheckins.iterator().next() : null;
//});
//		return activeCheckinRepository.findOne( (root, q, cb) -> {
//			return cb.and( 
//					cb.equal(root.get(ActiveCheckin_.STUDENT).get(Student_.ID), id),
//					cb.equal(root.get(ActiveCheckin_.student).get(Student_.studentId), studentId)
//			);
//		});
	}
	
	public List<ActiveCheckin> findByStudentIds(List<String> studentIds, Long programId ){
		if( studentIds == null || studentIds.isEmpty() ) {
			return Collections.emptyList();
		}
		return activeCheckinRepository.findAll( (root, q, cb) -> {
			return cb.and(
				cb.equal(root.get(ActiveCheckin_.PROGRAM_ID), programId),
				root.get(ActiveCheckin_.STUDENT).get(Student_.STUDENT_ID).in( studentIds )
			);
		});
	}

	public List<ActiveCheckin> findActiveCheckinsForProgram(Long programId ){
		return activeCheckinRepository.findAll( (root, q, cb) -> {
			return cb.and(
				cb.equal(root.get(ActiveCheckin_.PROGRAM_ID), programId)
			);
		});
	}
	
	public CheckinLog saveCheckinLog( CheckinLog checkinLog ) {
		return checkinLogRepository.save(checkinLog);
	}
	
	public CheckinLog checkoutStudent(ActiveCheckin activeCheckin, Long activeUserId, String pickupName, Long guardianPickupId, AfterSchoolProgram activeProgram ) {
		ZonedDateTime zonedStartDate = ZonedDateTime.of(LocalDate.now(), LocalTime.MIN, DateTimeUtility.getActiveProgramZoneId(activeProgram) );
		ZonedDateTime zonedEndDate = ZonedDateTime.of(LocalDate.now(), LocalTime.MAX, DateTimeUtility.getActiveProgramZoneId(activeProgram) );
		CheckinLog checkinLog = new CheckinLog();
		List<CheckinLog> checkinLogs = findCheckinLogsByDateAndStudentId(zonedStartDate, zonedEndDate, activeCheckin.getStudent().getId(), activeProgram.getId(), activeCheckin.getCheckinRecordType() );
		if( !checkinLogs.isEmpty() ) {
			checkinLog.setRemoved(true);
		}else {
			checkinLog.setRemoved(false);
		}
		checkinLog.setCheckInTime( activeCheckin.getCheckInTime() );
		checkinLog.setStudent( activeCheckin.getStudent() );
		checkinLog.setProgramId( activeCheckin.getProgramId() );
		checkinLog.setCheckOutTime(ZonedDateTime.now());
		checkinLog.setCheckedOutBy( activeUserId );
		checkinLog.setPickupName(pickupName);
		checkinLog.setGuardianPickupId(guardianPickupId);
		checkinLog.setCheckinRecordType( activeCheckin.getCheckinRecordType() );
		checkinLogRepository.save(checkinLog);
		activeCheckinRepository.delete(activeCheckin);
		if( !checkinLog.getRemoved() ) {
			billingService.recordStudentBillingAttendanceRecord(checkinLog, activeProgram);
		}
		return checkinLog;
	}
	
	public void checkoutActiveStudentsForProgram( AfterSchoolProgram program ) {
		List<ActiveCheckin> activeCheckins = findActiveCheckinsForProgram( program.getId() );
		activeCheckins.stream().forEach( checkin -> {
			checkoutStudent( checkin, null, "Automated Checkout", null, program );
		});
	}
	
	
	public void removeActiveCheckin( ActiveCheckin activeCheckin, AfterSchoolProgram activeProgram ) {
		ZonedDateTime zonedStartDate = ZonedDateTime.of(LocalDate.now(), LocalTime.MIN, DateTimeUtility.getActiveProgramZoneId(activeProgram) );
		ZonedDateTime zonedEndDate = ZonedDateTime.of(LocalDate.now(), LocalTime.MAX, DateTimeUtility.getActiveProgramZoneId(activeProgram) );
		List<CheckinLog> checkinLogs = findCheckinLogsByDateAndStudentId(zonedStartDate, zonedEndDate, activeCheckin.getStudent().getId(), activeProgram.getId(), null );
		if( checkinLogs.isEmpty() ) {
			try {
				billingService.deleteWeeklyBillingLogEntry(activeCheckin.getCheckInTime(), activeCheckin.getProgramId(), activeCheckin.getStudent().getId(), activeCheckin.getCheckinRecordType(), activeCheckin.getId() );
			}catch( Exception e) {
				e.printStackTrace();
			}
		}
		activeCheckinRepository.delete(activeCheckin);
	}
	
	public CheckinLog checkoutStudent( ZonedDateTime checkInTime, Student student, Long activeUserId, AfterSchoolProgram activeProgram, String pickupName, Long guardianPickupId  ) {
		ZonedDateTime zonedStartDate = ZonedDateTime.of(LocalDate.now(), LocalTime.MIN, DateTimeUtility.getActiveProgramZoneId(activeProgram) );
		ZonedDateTime zonedEndDate = ZonedDateTime.of(LocalDate.now(), LocalTime.MAX, DateTimeUtility.getActiveProgramZoneId(activeProgram) );
		CheckinLog checkinLog = new CheckinLog();
		CheckinRecordType checkinRecordType =  getCheckinRecordType( activeProgram, checkInTime );
		List<CheckinLog> checkinLogs = findCheckinLogsByDateAndStudentId(zonedStartDate, zonedEndDate, student.getId(), activeProgram.getId(), checkinRecordType );
		if( !checkinLogs.isEmpty() ) {
			checkinLog.setRemoved(true);
		}else {
			checkinLog.setRemoved(false);
		}
		checkinLog.setCheckInTime( checkInTime );
		checkinLog.setStudent( student );
		checkinLog.setProgramId( activeProgram.getId() );
		checkinLog.setCheckOutTime(ZonedDateTime.now());
		checkinLog.setCheckedOutBy( activeUserId );
		checkinLog.setPickupName(pickupName);
		checkinLog.setGuardianPickupId(guardianPickupId);
		checkinLog.setCheckinRecordType( checkinRecordType );
		
		checkinLogRepository.save(checkinLog);
		if( !checkinLog.getRemoved() ) {
			billingService.recordStudentBillingAttendanceRecord(checkinLog, activeProgram);
		}
		return checkinLog;
	}
	
	public List<CheckinLog> removeCheckinLogs( List<CheckinLog> logs ){
		logs.stream().forEach( l -> {
			l.setRemoved(true);
			try {
				billingService.deleteWeeklyBillingLogEntry(l);
			}catch(Exception e) {
				e.printStackTrace();
			}
		});
		checkinLogRepository.saveAll(logs);
		return logs;
	}
	 
	public CheckinLog removeCheckinLog( CheckinLog checkinLog ) {
		checkinLog.setRemoved(true);
		checkinLogRepository.save(checkinLog);
		try {
			billingService.deleteWeeklyBillingLogEntry(checkinLog);
		}catch(Exception e) {
			e.printStackTrace();
		}
		return checkinLog;
	}
	
	
	

	public Page<ActiveCheckin> findActiveCheckins(Long programId, String search, StudentSort studentSort, Pageable pageable) {
		return activeCheckinRepository.findAll( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			if( search != null && !search.trim().isEmpty() ) {
				final String[] searchStrings = search.trim().split(" ");
				for( String searchString : searchStrings ) {
					if( searchString.length() == 1 ) {
						andPredicate.add(
							cb.equal(root.get(ActiveCheckin_.student).get(Student_.GRADE), searchString)
						);
					}else{
						String tokenizedSearch = TokenizerUtility.startsWith( searchString.toUpperCase() );
						andPredicate.add(
							cb.or(
								cb.like( root.get(ActiveCheckin_.student).get(Student_.firstName), tokenizedSearch),
								cb.like( root.get(ActiveCheckin_.student).get(Student_.middleName), tokenizedSearch),
								cb.like( root.get(ActiveCheckin_.student).get(Student_.lastName), tokenizedSearch),
								cb.like( root.get(ActiveCheckin_.student).get(Student_.STUDENT_ID), tokenizedSearch),
								cb.like( root.get(ActiveCheckin_.student).get(Student_.SCHOOL).get(School_.NAME), tokenizedSearch)
							)
						);	
					}
				}				
			}
			andPredicate.add(
				cb.equal(root.get(ActiveCheckin_.PROGRAM_ID), programId)
			);
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			
			if( studentSort != null ) {
				switch( studentSort ) {
					case GradeAsc:
						q.orderBy( cb.asc( root.get(ActiveCheckin_.student).get(Student_.GRADE) ) );
						break;
					case GradeDesc:
						q.orderBy( cb.desc( root.get(ActiveCheckin_.student).get(Student_.GRADE) ) );
						break;
					case LastNameAsc:
						q.orderBy( cb.asc( root.get(ActiveCheckin_.student).get(Student_.LAST_NAME) ) );
						break;
					case LastNameDesc:
						q.orderBy( cb.desc( root.get(ActiveCheckin_.student).get(Student_.LAST_NAME) ) );
						break;
					case SchoolAsc:
						q.orderBy( cb.asc( root.get(ActiveCheckin_.student).get(Student_.SCHOOL).get(School_.NAME) ) );
						break;
					case SchoolDesc:
						q.orderBy( cb.desc( root.get(ActiveCheckin_.student).get(Student_.SCHOOL).get(School_.NAME ) ) );
						break;
					default:
						q.orderBy( cb.desc( root.get(ActiveCheckin_.ID) ));
						break;
				}
			}else {
				q.orderBy( cb.desc( root.get(ActiveCheckin_.ID) ));
			}
			return q.getRestriction();
		}, pageable);
		
	}

	public Page<CheckinLog> findDailyCheckinLog(Long programId, LocalDate date, String search, StudentSort studentSort, String studentFilter, Pageable pageable) throws ParseException {
		ZonedDateTime zonedStartDate = ZonedDateTime.of(date, LocalTime.MIN, TimeZone.getTimeZone("America/New_York").toZoneId() );
		ZonedDateTime zonedEndDate   = ZonedDateTime.of(date, LocalTime.MAX, TimeZone.getTimeZone("America/New_York").toZoneId() );
		
		//java.util.Date endDate = dateFormat.parse( endLocalDate.format( localDateFormat ) );
		
		return checkinLogRepository.findAll( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			if( search != null && !search.trim().isEmpty() ) {
				final String[] searchStrings = search.trim().split(" ");
				for( String searchString : searchStrings ) {
					if( searchString.length() == 1 ) {
						andPredicate.add(
							cb.equal(root.get(CheckinLog_.student).get(Student_.GRADE), searchString)
						);
					}else{
						String tokenizedSearch = TokenizerUtility.startsWith( searchString.toUpperCase() );
						andPredicate.add(
							cb.or(
								cb.like( root.get(CheckinLog_.student).get(Student_.firstName), tokenizedSearch),
								cb.like( root.get(CheckinLog_.student).get(Student_.middleName), tokenizedSearch),
								cb.like( root.get(CheckinLog_.student).get(Student_.lastName), tokenizedSearch),
								cb.like( root.get(CheckinLog_.student).get(Student_.STUDENT_ID), tokenizedSearch),
								cb.like( root.get(CheckinLog_.student).get(Student_.SCHOOL).get(School_.NAME), tokenizedSearch)
							)
						);	
					}
				}				
			}
			andPredicate.add(
				cb.equal(root.get(CheckinLog_.PROGRAM_ID), programId)
			);
			andPredicate.add( 
				cb.isFalse( root.get(CheckinLog_.REMOVED) )
			);
		
//			andPredicate.add( 
//					cb.equal(root.get(CheckinLog_.checkOutTime).as(java.sql.Date.class), startDate)
//			);
			andPredicate.add( 
				cb.and(  
					cb.greaterThanOrEqualTo( root.get(CheckinLog_.CHECK_OUT_TIME), zonedStartDate ),
					cb.lessThanOrEqualTo( root.get(CheckinLog_.CHECK_OUT_TIME), zonedEndDate )	
				)
			);
			
			if( studentFilter != null ) {
				switch( studentFilter ) {
					case "Morning":
						andPredicate.add(
							cb.equal(root.get(CheckinLog_.CHECKIN_RECORD_TYPE), CheckinRecordType.Morning)
						);
						break;
					case "Afterschool":
						andPredicate.add(
							cb.equal(root.get(CheckinLog_.CHECKIN_RECORD_TYPE), CheckinRecordType.Afterschool)
						);
						break;
					case "All":
					default:
						break;
				}
				
			}
			
			
			if( studentSort != null ) {
				switch( studentSort ) {
					case GradeAsc:
						q.orderBy( cb.asc( root.get(CheckinLog_.student).get(Student_.GRADE) ) );
						break;
					case GradeDesc:
						q.orderBy( cb.desc( root.get(CheckinLog_.student).get(Student_.GRADE) ) );
						break;
					case LastNameAsc:
						q.orderBy( cb.asc( root.get(CheckinLog_.student).get(Student_.LAST_NAME) ) );
						break;
					case LastNameDesc:
						q.orderBy( cb.desc( root.get(CheckinLog_.student).get(Student_.LAST_NAME) ) );
						break;
					case SchoolAsc:
						q.orderBy( cb.asc( root.get(CheckinLog_.student).get(Student_.SCHOOL).get(School_.NAME) ) );
						break;
					case SchoolDesc:
						q.orderBy( cb.desc( root.get(CheckinLog_.student).get(Student_.SCHOOL).get(School_.NAME ) ) );
						break;
					default:
						break;
				}
			}else {
				q.orderBy( cb.desc( root.get(CheckinLog_.ID) ));
			}
			
			
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			return q.getRestriction();
		}, pageable);
	}
	
	public List<CheckinLog> findDailyCheckinLogs(Long programId, LocalDate date ) throws ParseException {
//		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy MM dd");
//		DateTimeFormatter localDateFormat = DateTimeFormatter.ofPattern("yyyy MM dd");
//		java.util.Date startDate = dateFormat.parse(date.format(localDateFormat));
		
		ZonedDateTime zonedStartDate = ZonedDateTime.of(date, LocalTime.MIN, TimeZone.getTimeZone("America/New_York").toZoneId() );
		ZonedDateTime zonedEndDate   = ZonedDateTime.of(date, LocalTime.MAX, TimeZone.getTimeZone("America/New_York").toZoneId() );
		
		
		return checkinLogRepository.findAll( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			andPredicate.add(
				cb.equal(root.get(CheckinLog_.PROGRAM_ID), programId)
			);
			andPredicate.add( 
				cb.isFalse( root.get(CheckinLog_.REMOVED) )
			);
		
			andPredicate.add( 
				cb.and(  
					cb.greaterThanOrEqualTo( root.get(CheckinLog_.CHECK_OUT_TIME), zonedStartDate ),
					cb.lessThanOrEqualTo( root.get(CheckinLog_.CHECK_OUT_TIME), zonedEndDate )	
				)
			);
//			andPredicate.add( 
//					cb.equal(root.get(CheckinLog_.checkOutTime).as(java.sql.Date.class), startDate)
//			);
			
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			return q.getRestriction();
		});
	}

	public Long getUniqueStudentDailyLogCount(Long programId, LocalDate date) throws ParseException {
//		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy MM dd");
//		DateTimeFormatter localDateFormat = DateTimeFormatter.ofPattern("yyyy MM dd");
//		java.util.Date startDate = dateFormat.parse(date.format(localDateFormat));
		
		ZonedDateTime zonedStartDate = ZonedDateTime.of(date, LocalTime.MIN, TimeZone.getTimeZone("America/New_York").toZoneId() );
		ZonedDateTime zonedEndDate   = ZonedDateTime.of(date, LocalTime.MAX, TimeZone.getTimeZone("America/New_York").toZoneId() );
		
		
		return checkinLogRepository.count( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			
			andPredicate.add(
				cb.equal(root.get(CheckinLog_.PROGRAM_ID), programId)
			);
			andPredicate.add( 
				cb.and(  
					cb.greaterThanOrEqualTo( root.get(CheckinLog_.CHECK_OUT_TIME), zonedStartDate ),
					cb.lessThanOrEqualTo( root.get(CheckinLog_.CHECK_OUT_TIME), zonedEndDate )	
				)
			);
			andPredicate.add( cb.isFalse( root.get(CheckinLog_.REMOVED) ));
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			return q.getRestriction();
		});
	}
	
	public CheckinLog findCheckinLog( Long id ) {
		return checkinLogRepository.findOne( (root, q, cb) -> {
			return cb.equal( root.get(CheckinLog_.ID), id);
		}).orElse(null);
	}
	
	public List<CheckinLog> findCheckinLogsByDateAndStudentId( ZonedDateTime zonedStartDate, ZonedDateTime zonedEndDate, Long studentId, Long programId, CheckinRecordType checkinRecordType ) {
		return checkinLogRepository.findAll( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			andPredicate.add( 
				cb.and(
					cb.greaterThanOrEqualTo( root.get(CheckinLog_.CHECK_OUT_TIME), zonedStartDate ),
					cb.lessThanOrEqualTo( root.get(CheckinLog_.CHECK_OUT_TIME), zonedEndDate ),
					cb.isFalse( root.get(CheckinLog_.REMOVED)),
					cb.equal(root.get(CheckinLog_.PROGRAM_ID), programId),
					cb.equal( root.get(CheckinLog_.STUDENT).get(Student_.ID), studentId)	
				)
			);
			if( checkinRecordType != null ) {
				andPredicate.add( cb.equal( root.get(CheckinLog_.CHECKIN_RECORD_TYPE), checkinRecordType) );
			}
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			return q.getRestriction();
		});
	}
	
	public Page<CheckinLog> findCheckinLog(Long programId, LocalDate date, String search, StudentSort studentSort, Pageable pageable) throws ParseException {
		ZonedDateTime zonedStartDate = ZonedDateTime.of(date, LocalTime.MIN, TimeZone.getTimeZone("America/New_York").toZoneId() );
		ZonedDateTime zonedEndDate   = ZonedDateTime.of(date, LocalTime.MAX, TimeZone.getTimeZone("America/New_York").toZoneId() );
		
		//java.util.Date endDate = dateFormat.parse( endLocalDate.format( localDateFormat ) );
		
		return checkinLogRepository.findAll( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			if( search != null && !search.trim().isEmpty() ) {
				final String[] searchStrings = search.trim().split(" ");
				for( String searchString : searchStrings ) {
					if( searchString.length() == 1 ) {
						andPredicate.add(
							cb.equal(root.get(CheckinLog_.student).get(Student_.GRADE), searchString)
						);
					}else{
						String tokenizedSearch = TokenizerUtility.startsWith( searchString.toUpperCase() );
						andPredicate.add(
							cb.or(
								cb.like( root.get(CheckinLog_.student).get(Student_.firstName), tokenizedSearch),
								cb.like( root.get(CheckinLog_.student).get(Student_.middleName), tokenizedSearch),
								cb.like( root.get(CheckinLog_.student).get(Student_.lastName), tokenizedSearch),
								cb.like( root.get(CheckinLog_.student).get(Student_.STUDENT_ID), tokenizedSearch),
								cb.like( root.get(CheckinLog_.student).get(Student_.SCHOOL).get(School_.NAME), tokenizedSearch)
							)
						);	
					}
				}				
			}
			andPredicate.add(
				cb.equal(root.get(CheckinLog_.PROGRAM_ID), programId)
			);
			andPredicate.add( 
				cb.isFalse( root.get(CheckinLog_.REMOVED) )
			);
		
//			andPredicate.add( 
//					cb.equal(root.get(CheckinLog_.checkOutTime).as(java.sql.Date.class), startDate)
//			);
			andPredicate.add( 
				cb.and(  
					cb.greaterThanOrEqualTo( root.get(CheckinLog_.CHECK_OUT_TIME), zonedStartDate ),
					cb.lessThanOrEqualTo( root.get(CheckinLog_.CHECK_OUT_TIME), zonedEndDate )	
				)
			);
			
			if( studentSort != null ) {
				switch( studentSort ) {
					case GradeAsc:
						q.orderBy( cb.asc( root.get(CheckinLog_.student).get(Student_.GRADE) ) );
						break;
					case GradeDesc:
						q.orderBy( cb.desc( root.get(CheckinLog_.student).get(Student_.GRADE) ) );
						break;
					case LastNameAsc:
						q.orderBy( cb.asc( root.get(CheckinLog_.student).get(Student_.LAST_NAME) ) );
						break;
					case LastNameDesc:
						q.orderBy( cb.desc( root.get(CheckinLog_.student).get(Student_.LAST_NAME) ) );
						break;
					case SchoolAsc:
						q.orderBy( cb.asc( root.get(CheckinLog_.student).get(Student_.SCHOOL).get(School_.NAME) ) );
						break;
					case SchoolDesc:
						q.orderBy( cb.desc( root.get(CheckinLog_.student).get(Student_.SCHOOL).get(School_.NAME ) ) );
						break;
					default:
						break;
				}
			}else {
				q.orderBy( cb.desc( root.get(CheckinLog_.ID) ));
			}
			
			
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			return q.getRestriction();
		}, pageable);
	}

	public Page<CheckinLog> findStudentDailyCheckinLog( Long programId, Long studentId,
			LocalDate startDate, LocalDate endDate, Pageable pageable) {
		ZonedDateTime dateStart =  ( startDate != null ) ? 
				ZonedDateTime.of( startDate, LocalTime.MIN, TimeZone.getTimeZone("America/New_York").toZoneId() )
				: null;
		
		ZonedDateTime dateEnd = ( endDate != null ) ? 
				ZonedDateTime.of( endDate, LocalTime.MAX, TimeZone.getTimeZone("America/New_York").toZoneId() )
				: null;
				
		return checkinLogRepository.findAll( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			andPredicate.add( cb.equal( root.get(CheckinLog_.STUDENT).get(Student_.ID),  studentId ) );
			andPredicate.add( cb.equal(root.get(CheckinLog_.PROGRAM_ID), programId) );
			andPredicate.add( cb.isFalse( root.get(CheckinLog_.REMOVED) ));
			
			if( dateStart != null ) {
				andPredicate.add( cb.greaterThanOrEqualTo( root.get(CheckinLog_.CHECK_IN_TIME), dateStart ) );
			}
			if( dateEnd != null ) {
				andPredicate.add( cb.lessThanOrEqualTo( root.get(CheckinLog_.CHECK_OUT_TIME), dateEnd ) );
			}
			
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			//q.orderBy( cb.desc( root.get(CheckinLog_.)  ) );
			return q.getRestriction();
		}, pageable);
	}
	
	public Long countStudentDailyCheckinLogs( Long programId, Long studentId,
			LocalDate startDate, LocalDate endDate ) {
		ZonedDateTime dateStart =  ( startDate != null ) ? 
				ZonedDateTime.of( startDate, LocalTime.MIN, TimeZone.getTimeZone("America/New_York").toZoneId() )
				: null;
		
		ZonedDateTime dateEnd = ( endDate != null ) ? 
				ZonedDateTime.of( endDate, LocalTime.MAX, TimeZone.getTimeZone("America/New_York").toZoneId() )
				: null;
				
		return checkinLogRepository.count( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			andPredicate.add( cb.equal( root.get(CheckinLog_.STUDENT).get(Student_.ID),  studentId ) );
			andPredicate.add( cb.equal(root.get(CheckinLog_.PROGRAM_ID), programId) );
			andPredicate.add( cb.isFalse( root.get( CheckinLog_.REMOVED ) ) );
			
			if( dateStart != null ) {
				andPredicate.add( cb.greaterThanOrEqualTo( root.get(CheckinLog_.CHECK_IN_TIME), dateStart ) );
			}
			if( dateEnd != null ) {
				andPredicate.add( cb.lessThanOrEqualTo( root.get(CheckinLog_.CHECK_OUT_TIME), dateEnd ) );
			}
			
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			//q.orderBy( cb.desc( root.get(CheckinLog_.)  ) );
			return q.getRestriction();
		});
	}
	
	public Page<CheckinLog> findStudentsDailyCheckinLog( Long programId, List<Long> studentIds,
			LocalDate startDate, LocalDate endDate, Pageable pageable) {
		ZonedDateTime dateStart =  ( startDate != null ) ? 
				ZonedDateTime.of( startDate, LocalTime.MIN, TimeZone.getTimeZone("America/New_York").toZoneId() )
				: null;
		
		ZonedDateTime dateEnd = ( endDate != null ) ? 
				ZonedDateTime.of( endDate, LocalTime.MAX, TimeZone.getTimeZone("America/New_York").toZoneId() )
				: null;
				
		return checkinLogRepository.findAll( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			andPredicate.add( root.get(CheckinLog_.STUDENT).get(Student_.ID).in( studentIds )  );
			andPredicate.add( cb.equal(root.get(CheckinLog_.PROGRAM_ID), programId) );
			andPredicate.add( cb.isFalse( root.get(CheckinLog_.REMOVED) ));
			
			if( dateStart != null ) {
				andPredicate.add( cb.greaterThanOrEqualTo( root.get(CheckinLog_.CHECK_IN_TIME), dateStart ) );
			}
			if( dateEnd != null ) {
				andPredicate.add( cb.lessThanOrEqualTo( root.get(CheckinLog_.CHECK_OUT_TIME), dateEnd ) );
			}
			
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			q.orderBy( cb.asc( root.get(CheckinLog_.CHECK_IN_TIME) ) );
			return q.getRestriction();
		}, pageable);
	}
	
	public CheckinRecordType getCheckinRecordType( AfterSchoolProgram afterSchoolProgram, ZonedDateTime checkinTime ) {
		if( morningPrograms.contains( afterSchoolProgram.getId() ) ) {
			ZonedDateTime morningCutOff = ZonedDateTime.of(checkinTime.toLocalDate(), LocalTime.of(7, 45), checkinTime.getZone() );
			if( checkinTime.isBefore(morningCutOff) ) {
				return CheckinRecordType.Morning;
			}
		}
		return CheckinRecordType.Afterschool;
	}
	
	public CheckinLog createManualCheckinLog( CheckinLogEditModel checkinLogEditModel,  Student student, AfterSchoolProgram afterSchoolProgram ) {
		CheckinLog checkinLog = checkinLogEditModel.getId() != null ? checkinLogRepository.findById( checkinLogEditModel.getId() ).orElse(null) : null;
		checkinLog = modelBuilderService.buildCheckinLog(checkinLogEditModel, checkinLog, student, afterSchoolProgram);
		checkinLog = checkinLogRepository.saveAndFlush(checkinLog);
		billingService.recordManualStudentBillingAttendanceRecord(checkinLog, afterSchoolProgram, checkinLogEditModel.getUpdateLedger() );
		return checkinLog;
	}

	public AfterSchoolProgramAttendanceModel getAfterSchoolProgramAttendanceModel(AfterSchoolProgram activeProgram, LocalDate startDate, LocalDate endDate, String filter) {
		ZonedDateTime dateStart =  ( startDate != null ) ? 
				ZonedDateTime.of( startDate, LocalTime.MIN, TimeZone.getTimeZone("America/New_York").toZoneId() )
				: null;
		
		ZonedDateTime dateEnd = ( endDate != null ) ? 
				ZonedDateTime.of( endDate, LocalTime.MAX, TimeZone.getTimeZone("America/New_York").toZoneId() )
				: null;
				
				
		Map<Long, List<CheckinLog>>	studentCheckinLogMap = new HashMap<Long, List<CheckinLog>>();
		List<Long> billingPlanIds = ( filter != null && Arrays.asList("CCPS","SCHOLARSHIP","ELC","DEFAULT_RATE").contains( filter ) ) ? 
				billingService.findBillingPlanIdsByFilter(activeProgram.getId(), filter) 
				: null;
				
		if( filter != null && Arrays.asList("CCPS","SCHOLARSHIP","ELC","DEFAULT_RATE").contains( filter ) && ( billingPlanIds == null || billingPlanIds.isEmpty() ) ) {
			return modelBuilderService.buildAfterSchoolProgramAttendanceModel( activeProgram, studentCheckinLogMap );
		}
				
		List<CheckinLog> checkins = checkinLogRepository.findAll( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			andPredicate.add( cb.equal(root.get(CheckinLog_.PROGRAM_ID), activeProgram.getId()) );
			andPredicate.add( cb.isFalse( root.get(CheckinLog_.REMOVED) ));
			
			if( dateStart != null ) {
				andPredicate.add( cb.greaterThanOrEqualTo( root.get(CheckinLog_.CHECK_IN_TIME), dateStart ) );
			}
			if( dateEnd != null ) {
				andPredicate.add( cb.lessThanOrEqualTo( root.get(CheckinLog_.CHECK_OUT_TIME), dateEnd ) );
			}
			
			if( filter != null ) {
				switch( filter ) {
					case "MORNING":
						andPredicate.add( cb.equal( root.get(CheckinLog_.CHECKIN_RECORD_TYPE), CheckinRecordType.Morning ) );
						break;
					case "AFTERSCHOOL":
						andPredicate.add( cb.equal( root.get(CheckinLog_.CHECKIN_RECORD_TYPE), CheckinRecordType.Afterschool ) );
						break;
					case "CCPS":
					case "SCHOLARSHIP":
					case "ELC":
					case "DEFAULT_RATE":
						if( billingPlanIds != null ) {
							andPredicate.add( root.get(CheckinLog_.STUDENT).get(Student_.BILLING_PLAN_ID).in( billingPlanIds ) );
						}
						break;
					case "ALL":
					default:
						break;
				}
			}
			
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			q.orderBy( cb.asc( root.get(CheckinLog_.CHECK_IN_TIME) ) );
			return q.getRestriction();
		});
		
		for( CheckinLog c : checkins ) {
			if( c.getStudent() != null && c.getStudent().getId() != null ) {
				if( !studentCheckinLogMap.containsKey( c.getStudent().getId() ) ) {
					studentCheckinLogMap.put( c.getStudent().getId(), new ArrayList<CheckinLog>());
				}
				studentCheckinLogMap.get( c.getStudent().getId() ).add( c );
			}
		}
		
//		checkins.stream().forEach( c -> {
//			
//		});
				
		return modelBuilderService.buildAfterSchoolProgramAttendanceModel( activeProgram, studentCheckinLogMap );
	}
	
}
