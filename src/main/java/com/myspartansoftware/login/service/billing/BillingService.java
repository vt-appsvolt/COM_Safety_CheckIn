package com.myspartansoftware.login.service.billing;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.TimeZone;
import java.util.stream.Collectors;

import javax.persistence.criteria.Predicate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.myspartansoftware.login.domain.ActiveCheckin;
import com.myspartansoftware.login.domain.AfterSchoolProgram;
import com.myspartansoftware.login.domain.CheckinLog;
import com.myspartansoftware.login.domain.Guardian;
import com.myspartansoftware.login.domain.Guardian_;
import com.myspartansoftware.login.domain.School_;
import com.myspartansoftware.login.domain.Student;
import com.myspartansoftware.login.domain.StudentBillingAttendanceRecord;
import com.myspartansoftware.login.domain.StudentBillingAttendanceRecord_;
import com.myspartansoftware.login.domain.Student_;
import com.myspartansoftware.login.domain.WeeklyBillingLog;
import com.myspartansoftware.login.domain.WeeklyBillingLog_;
import com.myspartansoftware.login.domain.billing.BillingPlan;
import com.myspartansoftware.login.domain.billing.BillingPlan_;
import com.myspartansoftware.login.domain.billing.BillingRecord;
import com.myspartansoftware.login.domain.billing.BillingTransaction;
import com.myspartansoftware.login.domain.billing.BillingTransaction.PaymentMethodType;
import com.myspartansoftware.login.domain.billing.BillingTransaction.TransactionType;
import com.myspartansoftware.login.domain.billing.BillingTransaction_;
import com.myspartansoftware.login.domain.billing.FamilyBillingAccount;
import com.myspartansoftware.login.domain.billing.StudentBillingAccount;
import com.myspartansoftware.login.domain.billing.StudentBillingAccount_;
import com.myspartansoftware.login.domain.enums.BillingRecordType;
import com.myspartansoftware.login.domain.enums.CheckinRecordType;
import com.myspartansoftware.login.domain.enums.PaymentStatus;
import com.myspartansoftware.login.domain.enums.SpecializedBillingPlan;
import com.myspartansoftware.login.model.BillingRecordModel;
import com.myspartansoftware.login.model.DepositReportModel;
import com.myspartansoftware.login.model.DepositSummaryModel;
import com.myspartansoftware.login.model.StudentSort;
import com.myspartansoftware.login.repository.BillingPlanRepository;
import com.myspartansoftware.login.repository.BillingRecordRepository;
import com.myspartansoftware.login.repository.GuardianRepository;
import com.myspartansoftware.login.repository.StudentBillingAttendanceRecordRepository;
import com.myspartansoftware.login.repository.StudentRepository;
import com.myspartansoftware.login.repository.WeeklyBillingLogRepository;
import com.myspartansoftware.login.repository.billing.BillingTransactionRepository;
import com.myspartansoftware.login.repository.billing.FamilyBillingAccountRepository;
import com.myspartansoftware.login.repository.billing.StudentBillingAccountRepository;
import com.myspartansoftware.login.service.TokenizerUtility;
import com.myspartansoftware.login.service.builder.ModelBuilderService;
import com.myspartansoftware.login.service.utilities.DateTimeUtility;
import com.myspartansoftware.login.stripe.domian.StripeCustomer;
import com.myspartansoftware.login.stripe.domian.StripeCustomerCharge;
import com.myspartansoftware.login.stripe.domian.StripeTransaction;
import com.myspartansoftware.login.stripe.service.StripeCustomerChargeService;
import com.myspartansoftware.login.stripe.service.StripeCustomerService;
import com.myspartansoftware.login.stripe.service.StripeTransactionService;
import com.myspartansoftware.login.utils.TimezoneUtils;

@Service("billingService")
public class BillingService {

	private BillingPlanRepository billingPlanRepository;
	private WeeklyBillingLogRepository weeklyBillingLogRepository;
	private StudentBillingAccountRepository studentBillingAccountRepository;
	private StudentRepository studentRepository;
	private StudentBillingAttendanceRecordRepository studentBillingAttendanceRecordRepository;
	private BillingRecordRepository billingRecordRepository;
	private FamilyBillingAccountRepository familyBillingAccountRepository;
	private BillingTransactionRepository billingTransactionRepository;
	private ModelBuilderService modelBuilderService;
	private StripeCustomerService stripeCustomerService;
	private StripeTransactionService stripeTransactionService;
	private StripeCustomerChargeService stripeCustomerChargeService;
	private GuardianRepository guardianRepository;
	
	@Autowired
	public BillingService(BillingPlanRepository billingPlanRepository, WeeklyBillingLogRepository weeklyBillingLogRepository, 
				StudentBillingAccountRepository studentBillingBalanceRepository, StudentBillingAttendanceRecordRepository studentBillingAttendanceRecordRepository,
				StudentRepository studentRepository,
				BillingRecordRepository billingRecordRepository, FamilyBillingAccountRepository familyBillingAccountRepository, 
				BillingTransactionRepository billingTransactionRepository, ModelBuilderService modelBuilderService,
				StripeCustomerService stripeCustomerService, 
				StripeCustomerChargeService stripeCustomerChargeService,
				StripeTransactionService stripeTransactionService,
				GuardianRepository guardianRepository ) {
		this.billingPlanRepository = billingPlanRepository;
		this.weeklyBillingLogRepository = weeklyBillingLogRepository;
		this.studentBillingAccountRepository = studentBillingBalanceRepository;
		this.studentBillingAttendanceRecordRepository = studentBillingAttendanceRecordRepository;
		this.studentRepository = studentRepository;
		this.billingRecordRepository = billingRecordRepository;
		this.familyBillingAccountRepository = familyBillingAccountRepository;
		this.billingTransactionRepository = billingTransactionRepository;
		this.modelBuilderService = modelBuilderService;
		this.stripeCustomerService = stripeCustomerService;
		this.stripeTransactionService = stripeTransactionService;
		this.stripeCustomerChargeService = stripeCustomerChargeService;
		this.guardianRepository = guardianRepository;
	}
	
	public BillingPlan findBillingPlan( Long billingPlanId ) {
		return billingPlanRepository.findById(billingPlanId).orElse(null);
	}
	
	public BillingPlan getBillingPlan( Long billingPlanId, Long programId ) {
		if( billingPlanId != null ) {
			return findBillingPlan(billingPlanId);
		}
		return getDefaultBillingPlan(programId);
	}
	
	public BillingPlan getDefaultBillingPlan( Long programId ) {
		List<BillingPlan> defaultBillingPlans = billingPlanRepository.findAll( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			andPredicate.add(
				cb.equal( root.get(BillingPlan_.PROGRAM_ID), programId )
			);
			andPredicate.add(
				cb.isTrue( root.get(BillingPlan_.DEFAULT_RATE) )
			);
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			return q.getRestriction();
		});
		if( !defaultBillingPlans.isEmpty() ) {
			return defaultBillingPlans.iterator().next();
		}
		return null;
	}
	
	public BillingPlan saveBillingPlan(BillingPlan billingPlan) {
		return billingPlanRepository.saveAndFlush(billingPlan);
	}
	
	public Page<BillingPlan> findBillingPlans( Long programId, Pageable pageable ){
		return billingPlanRepository.findAll( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			andPredicate.add(
				cb.equal( root.get(BillingPlan_.PROGRAM_ID), programId )
			);
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			return q.getRestriction();
		}, pageable );
	}
	
	

	public List<BillingPlan> getBillingPlans(Long programId) {
		return billingPlanRepository.findAll( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			andPredicate.add(
				cb.equal( root.get(BillingPlan_.PROGRAM_ID), programId )
			);
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			return q.getRestriction();
		});
	}
	
	public void deleteBillingPlan( BillingPlan billingPlan ) {
		billingPlanRepository.delete(billingPlan);
	}
	
	
	public void recordStudentBillingAttendanceRecord( CheckinLog checkinLog, AfterSchoolProgram p ) {
		WeeklyBillingLog weeklyBillingLog = getWeeklyBillingLog( checkinLog.getCheckInTime(), checkinLog.getStudent(), checkinLog.getProgramId() );
		if( weeklyBillingLog.getDailyRecords() == null ) {
			weeklyBillingLog.setDailyRecords( new ArrayList<>() );
		}
		BillingRecordType billingRecordType = null;
		if( weeklyBillingLog.getDailyRecords() == null ) {
			weeklyBillingLog.setDailyRecords( new ArrayList<>() );
			billingRecordType = checkinLog.getStudent().getDefaultWeeklyBillingType();
			if( billingRecordType == null ) {
				if( checkinLog.getProgramId().equals(8l)) {
					billingRecordType = BillingRecordType.WEEKLY_RATE;
				}
			}
		}else {
			billingRecordType = checkinLog.getStudent().getDefaultWeeklyBillingType();
		}
		StudentBillingAttendanceRecord studentBillingAttendanceRecord = weeklyBillingLog.getDailyRecords().stream()
				.filter( r -> DateTimeUtility.isSameDay(r.getAttendanceDate(), checkinLog.getCheckInTime() ) && checkinLog.getCheckinRecordType().equals( r.getCheckinRecordType() )  )
				.findFirst().orElse( createStudentBillingAttendanceRecord(checkinLog.getCheckInTime(), checkinLog) );
		studentBillingAttendanceRecord.setCheckInLogId( checkinLog.getId() );
		weeklyBillingLog.setDailyRecords( weeklyBillingLog.getDailyRecords().stream().filter( r -> 
							!DateTimeUtility.isSameDay(r.getAttendanceDate(), checkinLog.getCheckInTime() ) ||
							( r.getCheckinRecordType() == null || !r.getCheckinRecordType().equals( checkinLog.getCheckinRecordType() ) )
				).collect(Collectors.toList() )  );
		
		//if( weeklyBillingLog.getIsFinalRecord() == null || !weeklyBillingLog.getIsFinalRecord() ) {	
		if( studentBillingAttendanceRecord.getIsFinalRecord() == null || !studentBillingAttendanceRecord.getIsFinalRecord() ) {
			BigDecimal previousRate = studentBillingAttendanceRecord.getDailyRate();
			studentBillingAttendanceRecord = calculateStudentBillingAttendanceRecord(studentBillingAttendanceRecord, checkinLog, billingRecordType, weeklyBillingLog, p);
			if( studentBillingAttendanceRecord != null && studentBillingAttendanceRecord.getDailyRate() != null && studentBillingAttendanceRecord.getDailyRate().compareTo( new BigDecimal(0) ) >= 0  ) {
				updateStudentBalance( checkinLog.getStudent().getId(), checkinLog.getStudent().getProgramId(), 
						studentBillingAttendanceRecord.getDailyRate(), previousRate, TransactionType.Charge, 
						TransactionType.Credit, null,
						studentBillingAttendanceRecord.getAttendanceTrxDescriptor(),
						ZonedDateTime.now(),
						studentBillingAttendanceRecord.getId(),
						null
					);
				weeklyBillingLog = updateWeeklyCharge( weeklyBillingLog, studentBillingAttendanceRecord.getDailyRate(), previousRate );
			}
		}else{
			BillingPlan billingPlan = getBillingPlan( checkinLog.getStudent().getBillingPlanId(), checkinLog.getProgramId() );
			if( SpecializedBillingPlan.CCPSRate.equals( billingPlan.getSpecializedBillingPlan() ) ) {
				ZonedDateTime cutoffTime = ZonedDateTime.of( checkinLog.getCheckOutTime().toLocalDate(), LocalTime.of(15, 40), checkinLog.getCheckOutTime().getZone() );
				if( checkinLog.getCheckOutTime().isBefore( cutoffTime ) ) {
					BigDecimal previousRate = studentBillingAttendanceRecord.getDailyRate();
					studentBillingAttendanceRecord.setIsFinalRecord(false);
					studentBillingAttendanceRecord = calculateStudentBillingAttendanceRecord(studentBillingAttendanceRecord, checkinLog, billingRecordType, weeklyBillingLog, p);
					if( studentBillingAttendanceRecord != null && studentBillingAttendanceRecord.getDailyRate() != null && studentBillingAttendanceRecord.getDailyRate().compareTo( new BigDecimal(0) ) >= 0  ) {
						if( studentBillingAttendanceRecord.getDailyRate().compareTo( previousRate ) == 1 ) {
							//amount to add
							BigDecimal amountToAdd = studentBillingAttendanceRecord.getDailyRate().subtract( previousRate ).setScale(2, RoundingMode.HALF_UP).abs();
							rebalanceStudentAccountFamilyAccount(studentBillingAttendanceRecord.getStudentId(), studentBillingAttendanceRecord.getProgramId(), amountToAdd, null);
							rebalanceAndRenameBillingTransaction(studentBillingAttendanceRecord.getId(), amountToAdd, null, studentBillingAttendanceRecord.getAttendanceTrxDescriptor() );
							weeklyBillingLog = updateWeeklyCharge( weeklyBillingLog, amountToAdd, null );
						}else if( studentBillingAttendanceRecord.getDailyRate().compareTo(previousRate)  == -1 ) {
							//amount to subtract
							BigDecimal amountToSubtract = studentBillingAttendanceRecord.getDailyRate().subtract(previousRate).setScale(2, RoundingMode.HALF_UP).abs();
							rebalanceStudentAccountFamilyAccount(studentBillingAttendanceRecord.getStudentId(), studentBillingAttendanceRecord.getProgramId(), null, amountToSubtract);
							rebalanceAndRenameBillingTransaction(studentBillingAttendanceRecord.getId(), null, amountToSubtract, studentBillingAttendanceRecord.getAttendanceTrxDescriptor() );
							weeklyBillingLog = updateWeeklyCharge( weeklyBillingLog, null, amountToSubtract );
						}
					}
				}
			}
		}
		if( studentBillingAttendanceRecord != null ) {
			weeklyBillingLog.getDailyRecords().add(studentBillingAttendanceRecord);
			weeklyBillingLog = weeklyBillingLogRepository.save(weeklyBillingLog);
			studentBillingAttendanceRecord.setWeeklyBillingLog(weeklyBillingLog);
			studentBillingAttendanceRecord = studentBillingAttendanceRecordRepository.save(studentBillingAttendanceRecord);
		}
	}
	
	public void recordStudentBillingAttendanceRecord( ActiveCheckin activeCheckin, AfterSchoolProgram p ) {
		WeeklyBillingLog weeklyBillingLog = getWeeklyBillingLog( activeCheckin.getCheckInTime(), activeCheckin.getStudent(), activeCheckin.getProgramId() );
		BillingRecordType billingRecordType = null;
		if( weeklyBillingLog.getDailyRecords() == null ) {
			weeklyBillingLog.setDailyRecords( new ArrayList<>() );
			billingRecordType = activeCheckin.getStudent().getDefaultWeeklyBillingType();
			if( billingRecordType == null ) {
				if( activeCheckin.getProgramId().equals(8l)) {
					billingRecordType = BillingRecordType.WEEKLY_RATE;
				}
			}
		}else {
			billingRecordType = activeCheckin.getStudent().getDefaultWeeklyBillingType();
		}
		
		StudentBillingAttendanceRecord studentBillingAttendanceRecord = weeklyBillingLog.getDailyRecords().stream()
					.filter( r -> DateTimeUtility.isSameDay(r.getAttendanceDate(), activeCheckin.getCheckInTime() ) && activeCheckin.getCheckinRecordType().equals( r.getCheckinRecordType() )  )
					.findFirst().orElse( createStudentBillingAttendanceRecord(activeCheckin.getCheckInTime(), activeCheckin) );
		//Only calculate if the daily attenance does not exist or is not final 
		if( Optional.ofNullable( studentBillingAttendanceRecord ).map( sbr -> sbr.getIsFinalRecord() == null || !sbr.getIsFinalRecord() ).orElse(true) ) {
			studentBillingAttendanceRecord = calculateStudentBillingAttendanceRecord(studentBillingAttendanceRecord, activeCheckin, billingRecordType, weeklyBillingLog, p );
			if( weeklyBillingLog.getIsFinalRecord() == null || !weeklyBillingLog.getIsFinalRecord() ) {
				if( BillingRecordType.WEEKLY_RATE.equals( studentBillingAttendanceRecord.getAttendanceType() ) ) {
					weeklyBillingLog.setIsFinalRecord(true);
					studentBillingAttendanceRecord.setIsFinalRecord(true);
				}
				
				//if( studentBillingAttendanceRecord.getDailyRate() != null && studentBillingAttendanceRecord.getDailyRate().compareTo( new BigDecimal(0) ) == 1  ) {
				if( studentBillingAttendanceRecord.getDailyRate() != null && studentBillingAttendanceRecord.getDailyRate().compareTo( new BigDecimal(0) ) == 1  ) {
					updateStudentBalance( activeCheckin.getStudent().getId(), activeCheckin.getStudent().getProgramId(), 
							studentBillingAttendanceRecord.getDailyRate(), null,
							TransactionType.Charge, TransactionType.Credit, null,
	//						studentBillingAttendanceRecord.getAttendanceType() != null ?
	//								studentBillingAttendanceRecord.getAttendanceType().toString() :
	//								"Attendance Record"
						  	studentBillingAttendanceRecord.getAttendanceTrxDescriptor() != null ? studentBillingAttendanceRecord.getAttendanceTrxDescriptor() :  BillingRecordType.MORNING.equals( studentBillingAttendanceRecord.getAttendanceType() ) ? "Morning" : "Daily Regular",
							ZonedDateTime.now(),
							studentBillingAttendanceRecord.getId(),
							null
					);
					weeklyBillingLog = updateWeeklyCharge( weeklyBillingLog, studentBillingAttendanceRecord.getDailyRate(), null );
				}else if( studentBillingAttendanceRecord.getDailyRate() != null  ) {
					updateStudentBalance( activeCheckin.getStudent().getId(), activeCheckin.getStudent().getProgramId(), 
							studentBillingAttendanceRecord.getDailyRate(), null,
							TransactionType.Charge, TransactionType.Credit, null,
	//						studentBillingAttendanceRecord.getAttendanceType() != null ?
	//								studentBillingAttendanceRecord.getAttendanceType().toString() :
	//								"Attendance Record"
							studentBillingAttendanceRecord.getAttendanceTrxDescriptor() != null ? studentBillingAttendanceRecord.getAttendanceTrxDescriptor() : BillingRecordType.MORNING.equals( studentBillingAttendanceRecord.getAttendanceType() ) ? "Morning NBD" : "Daily Regular NBD",
							ZonedDateTime.now(),
							studentBillingAttendanceRecord.getId(),
							null
					);
					weeklyBillingLog = updateWeeklyCharge( weeklyBillingLog, studentBillingAttendanceRecord.getDailyRate(), null );
				}
			}else{
				studentBillingAttendanceRecord = studentBillingAttendanceRecordRepository.save(studentBillingAttendanceRecord);
			}
		}
		
		
		
		
		weeklyBillingLog.setDailyRecords( weeklyBillingLog.getDailyRecords().stream()
					.filter( r -> !DateTimeUtility.isSameDay(r.getAttendanceDate(), activeCheckin.getCheckInTime() ) ||
							( r.getCheckinRecordType() == null || !r.getCheckinRecordType().equals( activeCheckin.getCheckinRecordType() ) )
					)
					.collect(Collectors.toList() )  );
		weeklyBillingLog.getDailyRecords().add(studentBillingAttendanceRecord);
		weeklyBillingLog = weeklyBillingLogRepository.save(weeklyBillingLog);
		studentBillingAttendanceRecord.setWeeklyBillingLog(weeklyBillingLog);
		studentBillingAttendanceRecord = studentBillingAttendanceRecordRepository.save(studentBillingAttendanceRecord);
	}
	
	private WeeklyBillingLog updateWeeklyCharge( WeeklyBillingLog weeklyBillingLog, BigDecimal amountToAdd, BigDecimal amountToSubtract ) {
		if( weeklyBillingLog.getWeeklyCharge() == null ) {
			weeklyBillingLog.setWeeklyCharge( new BigDecimal(0) );
		}
		if( amountToAdd != null ) {
			weeklyBillingLog.setWeeklyCharge( weeklyBillingLog.getWeeklyCharge().add( amountToAdd ) );
		}
		if( amountToSubtract != null  && amountToSubtract.compareTo( new BigDecimal(0) ) == 1 ) {
			weeklyBillingLog.setWeeklyCharge( weeklyBillingLog.getWeeklyCharge().subtract( amountToSubtract ));
		}
		//TODO: revisit logic
		if( weeklyBillingLog.getPriorBalance().compareTo(BigDecimal.ZERO) > 0 ) {
			weeklyBillingLog.setPaymentStatus(PaymentStatus.OUTSTANDING);
		}else if( weeklyBillingLog.getWeeklyCharge().compareTo(BigDecimal.ZERO) > 0 ) {
			weeklyBillingLog.setPaymentStatus(PaymentStatus.DUE);
		}else {
			weeklyBillingLog.setPaymentStatus(PaymentStatus.PAID);
		}
		
		return weeklyBillingLog;	
	}
	
	private StudentBillingAttendanceRecord createStudentBillingAttendanceRecord( ZonedDateTime attendanceDate, CheckinLog checkinLog ) {
		StudentBillingAttendanceRecord studentBillingAttendanceRecord = new StudentBillingAttendanceRecord();
		studentBillingAttendanceRecord.setAttendanceDate( attendanceDate );
		studentBillingAttendanceRecord.setProgramId(checkinLog.getProgramId());
		studentBillingAttendanceRecord.setStudentId( checkinLog.getStudent().getId() );
		studentBillingAttendanceRecord.setIsFinalRecord(false);
		studentBillingAttendanceRecord.setCheckInLogId(checkinLog.getId());
		studentBillingAttendanceRecord.setCheckinRecordType( checkinLog.getCheckinRecordType() );
		return studentBillingAttendanceRecord;
	}
	
	private StudentBillingAttendanceRecord createStudentBillingAttendanceRecord( ZonedDateTime attendanceDate, ActiveCheckin activeCheckin ) {
		StudentBillingAttendanceRecord studentBillingAttendanceRecord = new StudentBillingAttendanceRecord();
		studentBillingAttendanceRecord.setAttendanceDate( attendanceDate );
		studentBillingAttendanceRecord.setProgramId(activeCheckin.getProgramId());
		studentBillingAttendanceRecord.setStudentId( activeCheckin.getStudent().getId() );
		studentBillingAttendanceRecord.setCheckinRecordType( activeCheckin.getCheckinRecordType() );
		studentBillingAttendanceRecord.setIsFinalRecord(false);
		return studentBillingAttendanceRecord;
	}
	
	private StudentBillingAttendanceRecord calculateStudentBillingAttendanceRecord( StudentBillingAttendanceRecord studentBillingAttendanceRecord, CheckinLog checkinLog, BillingRecordType billingRecordType, WeeklyBillingLog weeklyBillingLog, AfterSchoolProgram p ) {
		BillingPlan billingPlan = getBillingPlan( checkinLog.getStudent().getBillingPlanId(), checkinLog.getProgramId() );
		Long familyAttendanceRecords = 0l;
		
		if( !studentBillingAttendanceRecord.getIsFinalRecord() ) {
			long checkedInMinutes = getStudentAttendanceInMinutes( checkinLog.getCheckInTime(), checkinLog.getCheckOutTime());
			if( billingPlan.getSpecializedBillingPlan() != null ) {
				switch( billingPlan.getSpecializedBillingPlan() ) {
				case ColllierSchoolDistrict:
					if( billingRecordType == null ) {
						billingRecordType = BillingRecordType.DAILY_RATE;
					}
					familyAttendanceRecords = countFamilyAttendanceRecords( checkinLog.getStudent().getId(), p, checkinLog.getCheckInTime(), checkinLog.getCheckinRecordType() );
					return calculateCollierBillingAttendanceRecord(studentBillingAttendanceRecord, checkinLog.getCheckInTime(), billingRecordType, weeklyBillingLog, billingPlan, familyAttendanceRecords);
				case SportsClub:
					if( billingRecordType == null ) {
						billingRecordType = BillingRecordType.DAILY_RATE;
					}
					familyAttendanceRecords = countFamilyAttendanceRecords( checkinLog.getStudent().getId(), p, checkinLog.getCheckInTime(), checkinLog.getCheckinRecordType() );
					return calculateSportsClubAttendanceRecord(studentBillingAttendanceRecord, checkinLog.getCheckInTime(), billingRecordType, weeklyBillingLog, billingPlan, familyAttendanceRecords);
				case CCPSRate:
					if( billingRecordType == null ) {
						billingRecordType = BillingRecordType.DAILY_RATE;
					}
					familyAttendanceRecords = countFamilyAttendanceRecords( checkinLog.getStudent().getId(), p, checkinLog.getCheckInTime(), checkinLog.getCheckinRecordType() );
					return calculateCCPSRateAttendanceRecord(studentBillingAttendanceRecord, checkinLog.getCheckInTime(), checkinLog.getCheckOutTime(), billingRecordType, weeklyBillingLog, billingPlan, familyAttendanceRecords);
				case ScholarshipWeekly:
				case ELCWeekly:
					if( weeklyBillingLog.getDailyRecords().stream().anyMatch(  d ->  BillingRecordType.WEEKLY_RATE.equals( d.getAttendanceType() ) ) ){
						studentBillingAttendanceRecord.setIsFinalRecord(true);
						studentBillingAttendanceRecord.setAttendanceType(BillingRecordType.WEEKLY_RATE);
						studentBillingAttendanceRecord.setDailyRate( new BigDecimal(0).setScale(2) );
						
						if( CheckinRecordType.Morning.equals( checkinLog.getCheckinRecordType() ) ) {
							studentBillingAttendanceRecord.setAttendanceTrxDescriptor("ELC Morning NBD");
						}else {
							studentBillingAttendanceRecord.setAttendanceTrxDescriptor("ELC NBD");
						}
					}else {
						studentBillingAttendanceRecord.setIsFinalRecord(true);
						studentBillingAttendanceRecord.setAttendanceType(BillingRecordType.WEEKLY_RATE);
						studentBillingAttendanceRecord.setDailyRate(billingPlan.getWeeklyRate());
						studentBillingAttendanceRecord.setAttendanceTrxDescriptor("ELC Rate");
					}
					break;
			}
			}else if( billingPlan != null ) {
				studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Daily Regular");
				if( billingPlan.getAllowEarlyRelease() != null && 
					billingPlan.getAllowEarlyRelease() && 
					billingPlan.getEarlyReleaseMinuteMaximum() != null &&
					billingPlan.getEarlyRelease() != null &&
					billingPlan.getEarlyReleaseMinuteMaximum() > checkedInMinutes
				) {
					studentBillingAttendanceRecord.setAttendanceType(BillingRecordType.EARLY_RELEASE);
					studentBillingAttendanceRecord.setDailyRate(billingPlan.getEarlyRelease());
				}else if( 
					billingPlan.getAllowFullDay() != null && 
					billingPlan.getAllowFullDay() && 
					billingPlan.getFullDayMinuteMinimum() != null &&
					billingPlan.getFullDay() != null &&
					billingPlan.getFullDayMinuteMinimum() < checkedInMinutes	
				) {
					studentBillingAttendanceRecord.setAttendanceType(BillingRecordType.FULL_DAY);
					studentBillingAttendanceRecord.setDailyRate(billingPlan.getFullDay());
				}else {
					studentBillingAttendanceRecord.setAttendanceType(BillingRecordType.DAILY_RATE);
					studentBillingAttendanceRecord.setDailyRate(billingPlan.getDailyRate());
				}
			}	
			studentBillingAttendanceRecord = studentBillingAttendanceRecordRepository.save(studentBillingAttendanceRecord);
		}
//		}else if( SpecializedBillingPlan.CCPSRate.equals( billingPlan.getSpecializedBillingPlan() ) ) {
//			ZonedDateTime cutoffTime = ZonedDateTime.of( checkinLog.getCheckOutTime().toLocalDate(), LocalTime.of(15, 40), checkinLog.getCheckOutTime().getZone() );
//			if( checkinLog.getCheckOutTime().isBefore( cutoffTime ) ) {
//				//TODO: Delete StudentBillingAttendanceRecord, update student and family balance, delete log
//				deleteWeeklyBillingLogEntry(checkinLog);
//				return null;
//			}
//		}
		return studentBillingAttendanceRecord;
	}
	
	private StudentBillingAttendanceRecord calculateStudentBillingAttendanceRecord( StudentBillingAttendanceRecord studentBillingAttendanceRecord, ActiveCheckin activeCheckin, BillingRecordType billingRecordType, WeeklyBillingLog weeklyBillingLog, AfterSchoolProgram p ) {
		if( !studentBillingAttendanceRecord.getIsFinalRecord() ) {
			BillingPlan billingPlan = getBillingPlan( activeCheckin.getStudent().getBillingPlanId(), activeCheckin.getProgramId() );
			Long familyAttendanceRecords = 0l;
			if( billingPlan != null ) {
				if( billingPlan.getSpecializedBillingPlan() != null ) {
					switch( billingPlan.getSpecializedBillingPlan() ) {
						case ColllierSchoolDistrict:
							if( billingRecordType == null ) {
								billingRecordType = BillingRecordType.DAILY_RATE;
							}
							familyAttendanceRecords = countFamilyAttendanceRecords( activeCheckin.getStudent().getId(), p, activeCheckin.getCheckInTime(), activeCheckin.getCheckinRecordType() );
							return calculateCollierBillingAttendanceRecord(studentBillingAttendanceRecord, activeCheckin.getCheckInTime(), billingRecordType, weeklyBillingLog, billingPlan, familyAttendanceRecords);
						case SportsClub:
							if( billingRecordType == null ) {
								billingRecordType = BillingRecordType.DAILY_RATE;
							}
							familyAttendanceRecords = countFamilyAttendanceRecords( activeCheckin.getStudent().getId(), p, activeCheckin.getCheckInTime(), activeCheckin.getCheckinRecordType() );
							return calculateSportsClubAttendanceRecord(studentBillingAttendanceRecord, activeCheckin.getCheckInTime(), billingRecordType, weeklyBillingLog, billingPlan, familyAttendanceRecords);
						case CCPSRate:
							if( billingRecordType == null ) {
								billingRecordType = BillingRecordType.DAILY_RATE;
							}
							familyAttendanceRecords = countFamilyAttendanceRecords( activeCheckin.getStudent().getId(), p, activeCheckin.getCheckInTime(), activeCheckin.getCheckinRecordType() );
							return calculateCCPSRateAttendanceRecord(studentBillingAttendanceRecord, activeCheckin.getCheckInTime(), null, billingRecordType, weeklyBillingLog, billingPlan, familyAttendanceRecords);
						case ScholarshipWeekly:
						case ELCWeekly:
							if( weeklyBillingLog.getDailyRecords().stream().anyMatch(  d ->  BillingRecordType.WEEKLY_RATE.equals( d.getAttendanceType() ) ) ){
								studentBillingAttendanceRecord.setIsFinalRecord(true);
								studentBillingAttendanceRecord.setAttendanceType(BillingRecordType.WEEKLY_RATE);
								studentBillingAttendanceRecord.setDailyRate( new BigDecimal(0).setScale(2) );
								studentBillingAttendanceRecord.setAttendanceTrxDescriptor("ELC NBD");
							}else {
								studentBillingAttendanceRecord.setIsFinalRecord(true);
								studentBillingAttendanceRecord.setAttendanceType(BillingRecordType.WEEKLY_RATE);
								studentBillingAttendanceRecord.setDailyRate(billingPlan.getWeeklyRate());
								studentBillingAttendanceRecord.setAttendanceTrxDescriptor("ELC Rate");
							}
							break;
					}
				}else if( billingRecordType != null ){
					switch ( billingRecordType ) {
						case ABSENT:
							break;
						case DAILY_RATE:
						case FIVE_DAY:
						case FOUR_DAY:
						case THREE_DAY:
						case TWO_DAY:
							studentBillingAttendanceRecord.setIsFinalRecord(true);
							studentBillingAttendanceRecord.setAttendanceType(BillingRecordType.DAILY_RATE);
							studentBillingAttendanceRecord.setDailyRate( billingPlan.getDailyRate() );
							break;
						case EARLY_RELEASE:
							break;
						case FULL_DAY:
							break;
						case HALF_DAY:
							break;
						case WEEKLY_RATE:
							studentBillingAttendanceRecord.setIsFinalRecord(true);
							studentBillingAttendanceRecord.setAttendanceType(BillingRecordType.WEEKLY_RATE);
							studentBillingAttendanceRecord.setDailyRate(billingPlan.getWeeklyRate());
							break;
						default:
							break;
					}
					studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Daily Regular");
				}else if ( billingRecordType == null ) {
					studentBillingAttendanceRecord.setIsFinalRecord(true);
					studentBillingAttendanceRecord.setAttendanceType(BillingRecordType.DAILY_RATE);
					studentBillingAttendanceRecord.setDailyRate( billingPlan.getDailyRate() );
				}
			}	
			studentBillingAttendanceRecord = studentBillingAttendanceRecordRepository.save(studentBillingAttendanceRecord);
		}
		return studentBillingAttendanceRecord;
	}
	
	private StudentBillingAttendanceRecord calculateCollierBillingAttendanceRecord( StudentBillingAttendanceRecord studentBillingAttendanceRecord, ZonedDateTime checkinTime,
			BillingRecordType billingRecordType, WeeklyBillingLog weeklyBillingLog, BillingPlan billingPlan, Long familyAttendanceRecords ) {
		if( studentBillingAttendanceRecord.getIsFinalRecord() == null || !studentBillingAttendanceRecord.getIsFinalRecord() ) {
			CheckinRecordType checkinRecordType = studentBillingAttendanceRecord.getCheckinRecordType();
			if( CheckinRecordType.Morning.equals( checkinRecordType ) ) {
				studentBillingAttendanceRecord = calculateCollierMorningRecordRates(studentBillingAttendanceRecord, checkinRecordType, weeklyBillingLog, checkinTime, billingRecordType, familyAttendanceRecords);
			}else {
				long weeklyAttendanceCount = weeklyBillingLog.getDailyRecords().stream()
						.filter( r -> !DateTimeUtility.isSameDay(r.getAttendanceDate(), checkinTime ) && checkinRecordType.equals( r.getCheckinRecordType() ) )
						.collect(Collectors.toList() ).size()+1;
				studentBillingAttendanceRecord.setDailyRate( getCollierCountyDailyRates( weeklyAttendanceCount, familyAttendanceRecords ) );
				switch ( billingRecordType ) {
					case FOUR_TO_FIVE_DAYS:
					case FOUR_TO_FIVE_DAYS_BEFORE_AND_AFTER:
						studentBillingAttendanceRecord.setAttendanceType( BillingRecordType.FOUR_TO_FIVE_DAYS );
						break;
					case TWO_TO_THREE_DAYS:
					case TWO_TO_THREE_DAYS_BEFORE_AND_AFTER:
						if( weeklyAttendanceCount > 3 ) {
							weeklyBillingLog.setRequiresReview(true);
						}
						studentBillingAttendanceRecord.setAttendanceType( BillingRecordType.TWO_TO_THREE_DAYS );
						break;
					case DAILY_RATE:
					default:
						if( weeklyAttendanceCount > 1 ) {
							weeklyBillingLog.setRequiresReview(true);
						}
						studentBillingAttendanceRecord.setAttendanceType( BillingRecordType.DAILY_RATE );
						break;
				}
				if( familyAttendanceRecords < 2 ) {
					studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Daily Regular");
				}else {
					studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Multi Child Regular");
				}
			}
			studentBillingAttendanceRecord.setIsFinalRecord(true);
			studentBillingAttendanceRecord = studentBillingAttendanceRecordRepository.save(studentBillingAttendanceRecord);
		}
		return studentBillingAttendanceRecord;
	}
	
	
	private StudentBillingAttendanceRecord calculateCollierMorningRecordRates( StudentBillingAttendanceRecord studentBillingAttendanceRecord, CheckinRecordType checkinRecordType, WeeklyBillingLog weeklyBillingLog, ZonedDateTime checkinTime, BillingRecordType billingRecordType, Long familyAttendanceRecords ) {
		long previousWeeklyMorningAttendanceCount = weeklyBillingLog.getDailyRecords().stream()
				.filter( r -> !DateTimeUtility.isSameDay(r.getAttendanceDate(), checkinTime ) &&  checkinRecordType.equals( r.getCheckinRecordType() )  )
				.collect(Collectors.toList() ).size();
		
		long weeklyAfterschoolAttendanceCount = weeklyBillingLog.getDailyRecords().stream()
				.filter( r -> !DateTimeUtility.isSameDay(r.getAttendanceDate(), checkinTime ) &&  CheckinRecordType.Afterschool.equals( r.getCheckinRecordType() )  )
				.collect(Collectors.toList() ).size();
		//assume if they have attendedAfterSchool in previous days of the week that they will attend after on current day
		if( weeklyAfterschoolAttendanceCount > 0 ) {
			weeklyAfterschoolAttendanceCount++;
		}
		
		studentBillingAttendanceRecord.setDailyRate( new BigDecimal(0).setScale(2) );
		studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning NBD");
		switch ( billingRecordType ) {
			case FOUR_TO_FIVE_DAYS:
			case FOUR_TO_FIVE_DAYS_BEFORE_AND_AFTER:
				if( previousWeeklyMorningAttendanceCount == 0 ) {
					if( familyAttendanceRecords < 2 ) {
						studentBillingAttendanceRecord.setDailyRate( new BigDecimal(10).setScale(2) );
						studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning");
					}else {
						//Multi family discounts
						studentBillingAttendanceRecord.setDailyRate( new BigDecimal(5).setScale(2) );
						studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning Multi Child Rate");
					}
				}
				break;
			case TWO_TO_THREE_DAYS:
			case TWO_TO_THREE_DAYS_BEFORE_AND_AFTER:
				if( previousWeeklyMorningAttendanceCount == 0 ) {
					if( weeklyAfterschoolAttendanceCount >= 4) {
						if( familyAttendanceRecords < 2 ) {
							studentBillingAttendanceRecord.setDailyRate( new BigDecimal(10).setScale(2) );
							studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning");
						}else { //Multi family discounts
							studentBillingAttendanceRecord.setDailyRate( new BigDecimal(5).setScale(2) );
							studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning Multi Child Rate");
						}
					}else {
						if( familyAttendanceRecords < 2 ) {
							studentBillingAttendanceRecord.setDailyRate( new BigDecimal(14).setScale(2) );
							studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning");
						}else { //Multi family discounts
							studentBillingAttendanceRecord.setDailyRate( new BigDecimal(7).setScale(2) );
							studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning Multi Child Rate");
						}
					}
					
				}else if( weeklyAfterschoolAttendanceCount >= 4) {
					checkAndRecalculateMorningCharge( weeklyBillingLog, weeklyAfterschoolAttendanceCount );
				}
				break;
			case DAILY_RATE:
			case MORNING:
			default:
				if( previousWeeklyMorningAttendanceCount == 0 ) {
					if( weeklyAfterschoolAttendanceCount >= 2 && weeklyAfterschoolAttendanceCount <= 3 ) {
						if( familyAttendanceRecords < 2 ) {
							studentBillingAttendanceRecord.setDailyRate( new BigDecimal(14).setScale(2) );
							studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning");
						}else { //Multi family discounts
							studentBillingAttendanceRecord.setDailyRate( new BigDecimal(7).setScale(2) );
							studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning Multi Child Rate");
						}
					}else if( weeklyAfterschoolAttendanceCount >= 4) {
						if( familyAttendanceRecords < 2 ) {
							studentBillingAttendanceRecord.setDailyRate( new BigDecimal(10).setScale(2) );
							studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning");
						}else { //Multi family discounts
							studentBillingAttendanceRecord.setDailyRate( new BigDecimal(5).setScale(2) );
							studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning Multi Child Rate");
						}
					}else {
						if( familyAttendanceRecords < 2 ) {
							studentBillingAttendanceRecord.setDailyRate( new BigDecimal(15).setScale(2) );
							studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning");
						}else { //Multi family discounts
							studentBillingAttendanceRecord.setDailyRate( new BigDecimal(7.5).setScale(2) );
							studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning Multi Child Rate");
						}
					}
				}else if( weeklyAfterschoolAttendanceCount >= 2) {
					// Check weeklyAfterschoolAttendanceCount check and recalculate existing studentBillingAttendanceRecord if needed
					checkAndRecalculateMorningCharge( weeklyBillingLog, weeklyAfterschoolAttendanceCount );
				}
				break;
		}
		studentBillingAttendanceRecord.setAttendanceType( BillingRecordType.MORNING );
		return studentBillingAttendanceRecord;
	}
	
	private StudentBillingAttendanceRecord calculateCCPSMorningRecordRates( StudentBillingAttendanceRecord studentBillingAttendanceRecord, CheckinRecordType checkinRecordType, WeeklyBillingLog weeklyBillingLog, ZonedDateTime checkinTime, BillingRecordType billingRecordType, Long familyAttendanceRecords ) {
		long previousWeeklyMorningAttendanceCount = weeklyBillingLog.getDailyRecords().stream()
				.filter( r -> !DateTimeUtility.isSameDay(r.getAttendanceDate(), checkinTime ) &&  checkinRecordType.equals( r.getCheckinRecordType() )  )
				.collect(Collectors.toList() ).size();
		
		long weeklyAfterschoolAttendanceCount = weeklyBillingLog.getDailyRecords().stream()
				.filter( r -> !DateTimeUtility.isSameDay(r.getAttendanceDate(), checkinTime ) &&  CheckinRecordType.Afterschool.equals( r.getCheckinRecordType() )  )
				.collect(Collectors.toList() ).size();
		//assume if they have attendedAfterSchool in previous days of the week that they will attend after on current day
		if( weeklyAfterschoolAttendanceCount > 0 ) {
			weeklyAfterschoolAttendanceCount++;
		}
		
		studentBillingAttendanceRecord.setDailyRate( new BigDecimal(0).setScale(2) );
		studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning NBD");
		switch ( billingRecordType ) {
			case FOUR_TO_FIVE_DAYS:
			case FOUR_TO_FIVE_DAYS_BEFORE_AND_AFTER:
				if( previousWeeklyMorningAttendanceCount == 0 ) {
					if( familyAttendanceRecords < 2 ) {
						studentBillingAttendanceRecord.setDailyRate( new BigDecimal(8).setScale(2) );
						studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning");
					}else {
						//Multi family discounts
						studentBillingAttendanceRecord.setDailyRate( new BigDecimal(4).setScale(2) );
						studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning Multi Child Rate");
					}
				}
				break;
			case TWO_TO_THREE_DAYS:
			case TWO_TO_THREE_DAYS_BEFORE_AND_AFTER:
				if( previousWeeklyMorningAttendanceCount == 0 ) {
					if( weeklyAfterschoolAttendanceCount >= 4) {
						if( familyAttendanceRecords < 2 ) {
							studentBillingAttendanceRecord.setDailyRate( new BigDecimal(8).setScale(2) );
							studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning");
						}else { //Multi family discounts
							studentBillingAttendanceRecord.setDailyRate( new BigDecimal(4).setScale(2) );
							studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning Multi Child Rate");
						}
					}else {
						if( familyAttendanceRecords < 2 ) {
							studentBillingAttendanceRecord.setDailyRate( new BigDecimal(14).setScale(2) );
							studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning");
						}else { //Multi family discounts
							studentBillingAttendanceRecord.setDailyRate( new BigDecimal(7).setScale(2) );
							studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning Multi Child Rate");
						}
					}
					
				}else if( weeklyAfterschoolAttendanceCount >= 4) {
					checkAndRecalculateCCPSMorningCharge( weeklyBillingLog, weeklyAfterschoolAttendanceCount );
				}
				break;
			case DAILY_RATE:
			case MORNING:
			default:
				if( previousWeeklyMorningAttendanceCount == 0 ) {
					if( weeklyAfterschoolAttendanceCount >= 2 && weeklyAfterschoolAttendanceCount <= 3 ) {
						if( familyAttendanceRecords < 2 ) {
							studentBillingAttendanceRecord.setDailyRate( new BigDecimal(14).setScale(2) );
							studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning");
						}else { //Multi family discounts
							studentBillingAttendanceRecord.setDailyRate( new BigDecimal(7).setScale(2) );
							studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning Multi Child Rate");
						}
					}else if( weeklyAfterschoolAttendanceCount >= 4) {
						if( familyAttendanceRecords < 2 ) {
							studentBillingAttendanceRecord.setDailyRate( new BigDecimal(8).setScale(2) );
							studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning");
						}else { //Multi family discounts
							studentBillingAttendanceRecord.setDailyRate( new BigDecimal(4).setScale(2) );
							studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning Multi Child Rate");
						}
					}else {
						if( familyAttendanceRecords < 2 ) {
							studentBillingAttendanceRecord.setDailyRate( new BigDecimal(15).setScale(2) );
							studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning");
						}else { //Multi family discounts
							studentBillingAttendanceRecord.setDailyRate( new BigDecimal(7.5).setScale(2) );
							studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Morning Multi Child Rate");
						}
					}
				}else if( weeklyAfterschoolAttendanceCount >= 2) {
					// Check weeklyAfterschoolAttendanceCount check and recalculate existing studentBillingAttendanceRecord if needed
					checkAndRecalculateCCPSMorningCharge( weeklyBillingLog, weeklyAfterschoolAttendanceCount );
				}
				break;
		}
		studentBillingAttendanceRecord.setAttendanceType( BillingRecordType.MORNING );
		return studentBillingAttendanceRecord;
	}
	
	private void checkAndRecalculateCCPSMorningCharge(WeeklyBillingLog weeklyBillingLog, long weeklyAfterschoolAttendanceCount) {
		StudentBillingAttendanceRecord chargedMorningRecord = weeklyBillingLog.getDailyRecords().stream().filter(  r -> 
			r.getCheckinRecordType().equals( CheckinRecordType.Morning ) && 
			r.getDailyRate().compareTo( new BigDecimal(0) ) == 1
		).findFirst().orElse( null );
		if( chargedMorningRecord != null ) {
			BigDecimal amountToSubtract = null;
			if( weeklyAfterschoolAttendanceCount >= 2 && weeklyAfterschoolAttendanceCount <= 3 ) {
				if( chargedMorningRecord.getDailyRate().compareTo( new BigDecimal( 15 ) ) == 0 ) {
					//Reset charge from 15 to 14, subtract 1
					amountToSubtract = new BigDecimal(1).setScale(2);
				}else if( chargedMorningRecord.getDailyRate().compareTo( new BigDecimal( 7.5 ) ) == 0 ) {
					//Reset charge from 7.5 to 7, subtract 0.5
					amountToSubtract = new BigDecimal(0.5).setScale(2);
				}
			}else if( weeklyAfterschoolAttendanceCount >= 4) {
				if( chargedMorningRecord.getDailyRate().compareTo( new BigDecimal( 15 ) ) == 0 ) {
					//Reset charge from 15 to 8, subtract 7
					amountToSubtract = new BigDecimal(7).setScale(2);
				}else if( chargedMorningRecord.getDailyRate().compareTo( new BigDecimal( 7.5 ) ) == 0 ) {
					//Reset charge from 7.5 to 4, subtract 3.5
					amountToSubtract = new BigDecimal(3.5).setScale(2);
				}else if( chargedMorningRecord.getDailyRate().compareTo( new BigDecimal( 7 ) ) == 0 ) {
					//Reset charge from 7 to 4, subtract 3
					amountToSubtract = new BigDecimal(3).setScale(2);
				}else if( chargedMorningRecord.getDailyRate().compareTo( new BigDecimal( 14 ) ) == 0 ) {
					//Reset charge from 14 to 8, subtract 6
					amountToSubtract = new BigDecimal(6).setScale(2);
				}
			}
			if( amountToSubtract != null ) {
				rebalanceStudentAttendanceRecord(chargedMorningRecord, weeklyBillingLog, null, amountToSubtract);
				rebalanceStudentAccountFamilyAccount(chargedMorningRecord.getStudentId(), chargedMorningRecord.getProgramId(), null, amountToSubtract);
				rebalanceBillingTransaction(chargedMorningRecord.getId(), null, amountToSubtract);
			}
		}
	}
	
	
	private void checkAndRecalculateMorningCharge(WeeklyBillingLog weeklyBillingLog, long weeklyAfterschoolAttendanceCount) {
		StudentBillingAttendanceRecord chargedMorningRecord = weeklyBillingLog.getDailyRecords().stream().filter(  r -> 
			r.getCheckinRecordType().equals( CheckinRecordType.Morning ) && 
			r.getDailyRate().compareTo( new BigDecimal(0) ) == 1
		).findFirst().orElse( null );
		if( chargedMorningRecord != null ) {
			BigDecimal amountToSubtract = null;
			if( weeklyAfterschoolAttendanceCount >= 2 && weeklyAfterschoolAttendanceCount <= 3 ) {
				if( chargedMorningRecord.getDailyRate().compareTo( new BigDecimal( 15 ) ) == 0 ) {
					//Reset charge from 15 to 14, subtract 1
					amountToSubtract = new BigDecimal(1).setScale(2);
				}else if( chargedMorningRecord.getDailyRate().compareTo( new BigDecimal( 7.5 ) ) == 0 ) {
					//Reset charge from 7.5 to 7, subtract 0.5
					amountToSubtract = new BigDecimal(0.5).setScale(2);
				}
			}else if( weeklyAfterschoolAttendanceCount >= 4) {
				if( chargedMorningRecord.getDailyRate().compareTo( new BigDecimal( 15 ) ) == 0 ) {
					//Reset charge from 15 to 10, subtract 5
					amountToSubtract = new BigDecimal(5).setScale(2);
				}else if( chargedMorningRecord.getDailyRate().compareTo( new BigDecimal( 7.5 ) ) == 0 ) {
					//Reset charge from 7.5 to 5, subtract 2.5
					amountToSubtract = new BigDecimal(2.5).setScale(2);
				}else if( chargedMorningRecord.getDailyRate().compareTo( new BigDecimal( 7 ) ) == 0 ) {
					//Reset charge from 7 to 5, subtract 2
					amountToSubtract = new BigDecimal(2).setScale(2);
				}else if( chargedMorningRecord.getDailyRate().compareTo( new BigDecimal( 14 ) ) == 0 ) {
					//Reset charge from 14 to 10, subtract 4
					amountToSubtract = new BigDecimal(4).setScale(2);
				}
			}
			if( amountToSubtract != null ) {
				rebalanceStudentAttendanceRecord(chargedMorningRecord, weeklyBillingLog, null, amountToSubtract);
				rebalanceStudentAccountFamilyAccount(chargedMorningRecord.getStudentId(), chargedMorningRecord.getProgramId(), null, amountToSubtract);
				rebalanceBillingTransaction(chargedMorningRecord.getId(), null, amountToSubtract);
			}
		}
	}

	private StudentBillingAttendanceRecord calculateCCPSRateAttendanceRecord( StudentBillingAttendanceRecord studentBillingAttendanceRecord, ZonedDateTime checkinTime, ZonedDateTime checkoutTime,
			BillingRecordType billingRecordType, WeeklyBillingLog weeklyBillingLog, BillingPlan billingPlan, Long familyAttendanceRecords ) {
		if( studentBillingAttendanceRecord.getIsFinalRecord() == null || !studentBillingAttendanceRecord.getIsFinalRecord() ) {
			CheckinRecordType checkinRecordType = studentBillingAttendanceRecord.getCheckinRecordType();
			if( CheckinRecordType.Morning.equals( checkinRecordType ) ) {
				ZonedDateTime cutoffTime = ZonedDateTime.of( checkinTime.toLocalDate(), LocalTime.of(7, 30), checkinTime.getZone() );
				if( checkinTime.isBefore( cutoffTime ) ) {
					studentBillingAttendanceRecord = calculateCCPSMorningRecordRates(studentBillingAttendanceRecord, checkinRecordType, weeklyBillingLog, checkinTime, billingRecordType, familyAttendanceRecords);
				}else {
					studentBillingAttendanceRecord.setDailyRate( new BigDecimal(0).setScale(2) );
					studentBillingAttendanceRecord.setAttendanceTrxDescriptor("CCPS Morning NBD");
				}
			}else {
				ZonedDateTime cutoffTime = ZonedDateTime.of( checkinTime.toLocalDate(), LocalTime.of(15, 40), checkinTime.getZone() );
				if( checkoutTime != null && checkoutTime.isBefore( cutoffTime ) ) {
					studentBillingAttendanceRecord.setDailyRate( new BigDecimal(0).setScale(2) );
					studentBillingAttendanceRecord.setAttendanceTrxDescriptor("CCPS Daily Regular NBD");
				}else {
					long weeklyAttendanceCount = weeklyBillingLog.getDailyRecords().stream()
							.filter( r -> !DateTimeUtility.isSameDay(r.getAttendanceDate(), checkinTime )  &&
										CheckinRecordType.Afterschool.equals( r.getCheckinRecordType() )
							).collect(Collectors.toList() ).size()+1;
					studentBillingAttendanceRecord.setDailyRate( getCCPSRateDailyRates( weeklyAttendanceCount, familyAttendanceRecords ) );
					switch ( billingRecordType ) {
						case DAILY_RATE:
							if( weeklyAttendanceCount > 1 ) {
								weeklyBillingLog.setRequiresReview(true);
							}
							studentBillingAttendanceRecord.setAttendanceType( BillingRecordType.DAILY_RATE );
							break;
						case FOUR_TO_FIVE_DAYS:
						case FOUR_TO_FIVE_DAYS_BEFORE_AND_AFTER:
							studentBillingAttendanceRecord.setAttendanceType( BillingRecordType.FOUR_TO_FIVE_DAYS );
							break;
						case TWO_TO_THREE_DAYS:
						case TWO_TO_THREE_DAYS_BEFORE_AND_AFTER:
							if( weeklyAttendanceCount > 3 ) {
								weeklyBillingLog.setRequiresReview(true);
							}
							studentBillingAttendanceRecord.setAttendanceType( BillingRecordType.TWO_TO_THREE_DAYS );
							break;
						default:
							break;
					}
					studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Daily Regular");
				}
			}
			studentBillingAttendanceRecord.setIsFinalRecord(true);
			studentBillingAttendanceRecord = studentBillingAttendanceRecordRepository.save(studentBillingAttendanceRecord);
		}
		return studentBillingAttendanceRecord;
	}
	
	private StudentBillingAttendanceRecord calculateSportsClubAttendanceRecord( StudentBillingAttendanceRecord studentBillingAttendanceRecord, ZonedDateTime checkinTime,
			BillingRecordType billingRecordType, WeeklyBillingLog weeklyBillingLog, BillingPlan billingPlan, Long familyAttendanceRecords ) {
		if( studentBillingAttendanceRecord.getIsFinalRecord() == null || !studentBillingAttendanceRecord.getIsFinalRecord() ) {
			long weeklyAttendanceCount = weeklyBillingLog.getDailyRecords().stream()
					.filter( r -> !DateTimeUtility.isSameDay(r.getAttendanceDate(), checkinTime ) &&
							CheckinRecordType.Afterschool.equals( r.getCheckinRecordType() )
						)
					.collect(Collectors.toList() ).size()+1;
			studentBillingAttendanceRecord.setDailyRate( getSportsClubDailyRate( weeklyAttendanceCount, billingPlan.getDailyRate(), familyAttendanceRecords ) );
			studentBillingAttendanceRecord.setAttendanceType( BillingRecordType.DAILY_RATE );
			studentBillingAttendanceRecord.setIsFinalRecord(true);
			studentBillingAttendanceRecord = studentBillingAttendanceRecordRepository.save(studentBillingAttendanceRecord);
			if( studentBillingAttendanceRecord.getDailyRate().compareTo( new BigDecimal(0) ) == 1 ) {
				if( familyAttendanceRecords < 2 ) {
					studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Daily Regular");
				}else {
					studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Multi Child Regular");
				}
			}else {
				if( familyAttendanceRecords < 2 ) {
					studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Daily Regular NBD");
				}else {
					studentBillingAttendanceRecord.setAttendanceTrxDescriptor("Multi Child Regular NBD");
				}
			}
		}
		return studentBillingAttendanceRecord;
	}
	
	private BigDecimal getCollierCountyDailyRates( long weeklyAttendanceCount, Long familyAttendanceRecords ) {
		if( weeklyAttendanceCount == 1l || weeklyAttendanceCount == 2l ) {
			if( familyAttendanceRecords < 2 ) {
				return new BigDecimal(18l).setScale(2, RoundingMode.HALF_UP);
			}else {
				return new BigDecimal(9l).setScale(2, RoundingMode.HALF_UP);
			}
		}else if ( weeklyAttendanceCount == 4l ) {
			if( familyAttendanceRecords < 2 ) {
				return new BigDecimal(14l).setScale(2, RoundingMode.HALF_UP);
			}else {
				return new BigDecimal(7l).setScale(2, RoundingMode.HALF_UP);
			}
		}
		//Zero for days 3 and 5
		return new BigDecimal(0l).setScale(2, RoundingMode.HALF_UP);
	}
	
	private BigDecimal getCCPSRateDailyRates( long weeklyAttendanceCount, Long familyAttendanceRecords ) {
		if( weeklyAttendanceCount == 1l || weeklyAttendanceCount == 2l ) {
			if( familyAttendanceRecords < 2 ) {
				return new BigDecimal(18l).setScale(2, RoundingMode.HALF_UP);
			}else {
				return new BigDecimal(9l).setScale(2, RoundingMode.HALF_UP);
			}
		}else if ( weeklyAttendanceCount == 4l ) {
			if( familyAttendanceRecords < 2 ) {
				return new BigDecimal(4l).setScale(2, RoundingMode.HALF_UP);
			}else {
				return new BigDecimal(2l).setScale(2, RoundingMode.HALF_UP);
			}
		}
		//Zero for days 3 and 5
		return new BigDecimal(0l).setScale(2, RoundingMode.HALF_UP);
	}
	
	private BigDecimal getSportsClubDailyRate( long weeklyAttendanceCount, BigDecimal rate, Long familyAttendanceRecords ) {
		if(  weeklyAttendanceCount <= 4l ) {
			if( familyAttendanceRecords < 2 ) {
				return rate.setScale(2, RoundingMode.HALF_UP);
			}else {
				return rate.divide( new BigDecimal(2), 2, RoundingMode.HALF_UP);
			}
		}
		//Zero for day 5
		return new BigDecimal(0l).setScale(2, RoundingMode.HALF_UP);
	}
	
	private long getStudentAttendanceInMinutes( ZonedDateTime checkInTime, ZonedDateTime checkOutTime ) {
		return ChronoUnit.MINUTES.between(checkInTime, checkOutTime);
	}
	/**
	 * Search for a WeeklyBillingLog for a student returning null if not present
	 * 
	 * @param attendanceDate
	 * @param student
	 * @param programId
	 * @return WeeklyBillingLog
	 */
	public WeeklyBillingLog findWeeklyBillingLog( ZonedDateTime attendanceDate, Student student, Long programId ) {
		attendanceDate = attendanceDate.with(WeekFields.of(Locale.US).dayOfWeek(), 1L);
		ZonedDateTime start =  ZonedDateTime.of( attendanceDate.toLocalDate().with(WeekFields.of(Locale.US).dayOfWeek(), 1L), LocalTime.MIN, TimeZone.getTimeZone("America/New_York").toZoneId() );
		ZonedDateTime end = ZonedDateTime.of( attendanceDate.toLocalDate().with(WeekFields.of(Locale.US).dayOfWeek(), 7L), LocalTime.MAX, TimeZone.getTimeZone("America/New_York").toZoneId() );
		Optional<WeeklyBillingLog> weeklyBillingLogOpt = weeklyBillingLogRepository.findOne( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			andPredicate.add( cb.equal( root.get(WeeklyBillingLog_.PROGRAM_ID), programId ) );
			andPredicate.add( cb.equal( root.get(WeeklyBillingLog_.STUDENT_ID), student.getId() ) );
			andPredicate.add( cb.greaterThanOrEqualTo( root.get(WeeklyBillingLog_.WEEK_OF), start ) );
			andPredicate.add( cb.lessThanOrEqualTo( root.get(WeeklyBillingLog_.WEEK_OF), end ) );
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			return q.getRestriction();
		});
		if( weeklyBillingLogOpt.isPresent() ) {
			return weeklyBillingLogOpt.get();
		}
		return null;
	}
	
	/**
	 * Find WeeklyBillingLog, if not found create and save a new instance for the week
	 * 
	 * @param attendanceDate
	 * @param student
	 * @param programId
	 * @return WeeklyBillingLog
	 */
	public WeeklyBillingLog getWeeklyBillingLog( ZonedDateTime attendanceDate, Student student, Long programId ) {
		attendanceDate = attendanceDate.with(WeekFields.of(Locale.US).dayOfWeek(), 1L);
		ZonedDateTime start =  ZonedDateTime.of( attendanceDate.toLocalDate().with(WeekFields.of(Locale.US).dayOfWeek(), 1L), LocalTime.MIN, TimeZone.getTimeZone("America/New_York").toZoneId() );
		ZonedDateTime end = ZonedDateTime.of( attendanceDate.toLocalDate().with(WeekFields.of(Locale.US).dayOfWeek(), 7L), LocalTime.MAX, TimeZone.getTimeZone("America/New_York").toZoneId() );
		Optional<WeeklyBillingLog> weeklyBillingLogOpt = weeklyBillingLogRepository.findOne( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			andPredicate.add( cb.equal( root.get(WeeklyBillingLog_.PROGRAM_ID), programId ) );
			andPredicate.add( cb.equal( root.get(WeeklyBillingLog_.STUDENT_ID), student.getId() ) );
			andPredicate.add( cb.greaterThanOrEqualTo( root.get(WeeklyBillingLog_.WEEK_OF), start ) );
			andPredicate.add( cb.lessThanOrEqualTo( root.get(WeeklyBillingLog_.WEEK_OF), end ) );
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			return q.getRestriction();
		});
		if( weeklyBillingLogOpt.isPresent() ) {
			return weeklyBillingLogOpt.get();
		}
		
		StudentBillingAccount studentBillingBalance = getStudentBillingAccount( student );
		WeeklyBillingLog weeklyBillingLog = new WeeklyBillingLog();
		weeklyBillingLog.setStudentId(student.getId());
		weeklyBillingLog.setWeeklyBillingType( student.getDefaultWeeklyBillingType() );
		weeklyBillingLog.setProgramId(programId);
		weeklyBillingLog.setPriorBalance( studentBillingBalance.getBalance() );
		weeklyBillingLog.setIsFinalRecord(false);
		weeklyBillingLog.setWeeklyCharge(new BigDecimal(0));
		weeklyBillingLog.setWeekOf( start.plusHours(4l) );
		weeklyBillingLog = weeklyBillingLogRepository.save(weeklyBillingLog);
		return weeklyBillingLog;
	}
	
	public void deleteWeeklyBillingLogEntry( CheckinLog checkInLog ) {
		deleteWeeklyBillingLogEntry( checkInLog.getCheckInTime(), checkInLog.getProgramId(), checkInLog.getStudent().getId(), checkInLog.getCheckinRecordType(), checkInLog.getId() );
	}
	
	public void deleteWeeklyBillingLogEntry( ZonedDateTime checkinTime, Long programId, Long studentId, CheckinRecordType checkingRecordType, Long checkInLogId ) {
		
		ZonedDateTime start =  ZonedDateTime.of( checkinTime.toLocalDate().with(WeekFields.of(Locale.US).dayOfWeek(), 1L), LocalTime.MIN, TimeZone.getTimeZone("America/New_York").toZoneId() );
		ZonedDateTime end = ZonedDateTime.of( checkinTime.toLocalDate().with(WeekFields.of(Locale.US).dayOfWeek(), 7L), LocalTime.MAX, TimeZone.getTimeZone("America/New_York").toZoneId() );
		
		Optional<WeeklyBillingLog> weeklyBillingLogOpt = weeklyBillingLogRepository.findOne( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			andPredicate.add( cb.equal( root.get(WeeklyBillingLog_.PROGRAM_ID), programId ) );
			andPredicate.add( cb.equal( root.get(WeeklyBillingLog_.STUDENT_ID), studentId ) );
			andPredicate.add( cb.greaterThanOrEqualTo( root.get(WeeklyBillingLog_.WEEK_OF), start ) );
			andPredicate.add( cb.lessThanOrEqualTo( root.get(WeeklyBillingLog_.WEEK_OF), end ) );
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			return q.getRestriction();
		});
		if( weeklyBillingLogOpt.isPresent() ) {
			WeeklyBillingLog weeklyBillingLog =weeklyBillingLogOpt.get();
			StudentBillingAttendanceRecord removingRecord = weeklyBillingLog.getDailyRecords().stream()
					.filter( r -> 
						( checkInLogId == null ||  checkInLogId.equals( r.getCheckInLogId() ) ) &&
						r.getAttendanceDate().toLocalDate().equals( checkinTime.toLocalDate() ) && 
						( checkingRecordType == null || checkingRecordType.equals( r.getCheckinRecordType() ) )  
					).findFirst().orElse(null);
			if( removingRecord == null ) {
				removingRecord = weeklyBillingLog.getDailyRecords().stream()
						.filter( r -> 
							r.getAttendanceDate().toLocalDate().equals( checkinTime.toLocalDate() ) && 
							( checkingRecordType == null || checkingRecordType.equals( r.getCheckinRecordType() ) )  
						).findFirst().orElse(null);
			}
			Long removingRecordId = removingRecord != null ? removingRecord.getId() : null;
			
			List<StudentBillingAttendanceRecord> remainingDayAndTypeRecords = weeklyBillingLog.getDailyRecords().stream()
					.filter( r -> 
						( removingRecordId == null ||  !removingRecordId.equals( r.getId() ) ) &&
						r.getAttendanceDate().toLocalDate().equals( checkinTime.toLocalDate() ) &&  
						( checkingRecordType == null || checkingRecordType.equals( r.getCheckinRecordType() ) ) 
					).collect(Collectors.toList() );
			//If a record is found to remove and there are no other StudentBillingAttendanceRecords for that day with the same type, then update balance
			if( remainingDayAndTypeRecords.isEmpty() && removingRecord != null ) {
				updateStudentBalanceRemovingLog(studentId, programId, removingRecord.getDailyRate(), TransactionType.Credit, ZonedDateTime.now(), removingRecord.getId());
				weeklyBillingLog.setIsFinalRecord(false);
				weeklyBillingLog = updateWeeklyCharge( weeklyBillingLog, null, removingRecord.getDailyRate() );
			}
			if( removingRecord != null ) {
				List<StudentBillingAttendanceRecord> remainingRecords = weeklyBillingLog.getDailyRecords().stream()
						.filter( r -> !r.getId().equals( removingRecordId ) ).collect(Collectors.toList() );
//				weeklyBillingLog.setDailyRecords(remainingRecords);
//				weeklyBillingLog = weeklyBillingLogRepository.save(weeklyBillingLog);
				studentBillingAttendanceRecordRepository.delete(removingRecord);
				if( remainingRecords.isEmpty() ) {
					weeklyBillingLogRepository.delete(weeklyBillingLog);
				}
			}
		}
	}
	
	public StudentBillingAccount getStudentBillingAccount( Student student ) {
		StudentBillingAccount studentBillingBalance = studentBillingAccountRepository.findById(student.getId()).orElse(null);
		if( studentBillingBalance != null) {
			if( student.getProgramId() != null && studentBillingBalance.getProgramId() == null ){
				studentBillingBalance.setProgramId(student.getProgramId());
				studentBillingBalance = studentBillingAccountRepository.save(studentBillingBalance);
			}
			return studentBillingBalance;
		}
		studentBillingBalance = new StudentBillingAccount();
		studentBillingBalance.setStudent(student);
		studentBillingBalance.setId( student.getId() );
		studentBillingBalance.setBalance(new BigDecimal(0));
		studentBillingBalance.setProgramId( student.getProgramId() );
		studentBillingBalance = studentBillingAccountRepository.saveAndFlush(studentBillingBalance);
		return studentBillingBalance;
	}
	
	public StudentBillingAccount getStudentBillingAccount( Long studentId, Long programId ) {
		StudentBillingAccount studentBillingBalance = studentBillingAccountRepository.findById(studentId).orElse(null);
		if( studentBillingBalance != null) {
			if( programId != null && studentBillingBalance.getProgramId() == null ){
				studentBillingBalance.setProgramId(programId);
				studentBillingBalance = studentBillingAccountRepository.save(studentBillingBalance);
			}
			return studentBillingBalance;
		}
		Student student = studentRepository.getOne(studentId);
		studentBillingBalance = new StudentBillingAccount();
		studentBillingBalance.setStudent(student);
		studentBillingBalance.setId( studentId );
		studentBillingBalance.setBalance(new BigDecimal(0));
		studentBillingBalance.setProgramId(programId);
		studentBillingBalance = studentBillingAccountRepository.saveAndFlush(studentBillingBalance);
		return studentBillingBalance;
	}
	
	public StudentBillingAccount linkFamilyAndStudentBillingAccounts( StudentBillingAccount studentBillingAccount, FamilyBillingAccount familyBillingAccount ) {
		if( studentBillingAccount.getFamilyBillingAccount() == null ) {
			studentBillingAccount.setFamilyBillingAccount(familyBillingAccount);
			studentBillingAccount = saveStudentBillingAccount(studentBillingAccount);
			if( studentBillingAccount.getBalance() != null ) {
				familyBillingAccount.setBalance( familyBillingAccount.getBalance().add( studentBillingAccount.getBalance() ) );
				familyBillingAccount = saveFamilyBillingAccount(familyBillingAccount);
			}
		}
		return studentBillingAccount;
	}
	
	public StudentBillingAccount saveStudentBillingAccount( StudentBillingAccount studentBillingAccount ) {
		return studentBillingAccountRepository.save(studentBillingAccount);
	}
	
	public FamilyBillingAccount findFamilyBillingAccountById( Long id ) {
		return familyBillingAccountRepository.getOne( id );
	}
	
	public FamilyBillingAccount findOrCreateFamilyBillingAccount( StudentBillingAccount studentBillingAccount ) {
		if( studentBillingAccount.getFamilyBillingAccount() != null ) {
			return studentBillingAccount.getFamilyBillingAccount();
		}
		FamilyBillingAccount familyBillingAccount = null;
		if( studentBillingAccount.getStudent().getGuardians() != null ) {
			Guardian guardianWithBillingAccount = studentBillingAccount.getStudent().getGuardians().stream().filter( g -> g.getFamilyBillingAccountId() != null ).findFirst().orElse(null);
			if( guardianWithBillingAccount != null ) {
				familyBillingAccount = getFamilyBillingAccount( guardianWithBillingAccount.getFamilyBillingAccountId() );
				if( familyBillingAccount.getProgramId() != null && 
					studentBillingAccount.getProgramId() != null && 
					familyBillingAccount.getProgramId() != studentBillingAccount.getProgramId() ) {
					familyBillingAccount = null;
				}
			}
			
			
		}
		if( familyBillingAccount == null ) {
			familyBillingAccount = new FamilyBillingAccount();
			familyBillingAccount.setProgramId( studentBillingAccount.getProgramId() );
			familyBillingAccount.setBalance( new BigDecimal(0) );
		}
		
		familyBillingAccount.setBalance( familyBillingAccount.getBalance().add( studentBillingAccount.getBalance() ) );
		familyBillingAccount = familyBillingAccountRepository.saveAndFlush( familyBillingAccount );
		return familyBillingAccount;
	}
	
	public FamilyBillingAccount saveFamilyBillingAccount( FamilyBillingAccount familyBillingAccount ) {
		return familyBillingAccountRepository.save(familyBillingAccount);
	}
	
	public StudentBillingAccount updateStudentBalance( Long studentId, Long programId, BigDecimal amountToAdd, BigDecimal amountToSubtract, TransactionType additionTransactionType, TransactionType subtractingTransactionType, String authorization, String trxDescription, ZonedDateTime paymentDate, Long studentBillingAttendanceRecordId, PaymentMethodType paymentMethodType  ) {
		StudentBillingAccount studentAccount = getStudentBillingAccount( studentId, programId );
		FamilyBillingAccount familyAccount = studentAccount.getFamilyBillingAccount();
		if( amountToAdd != null ) {
			studentAccount.setBalance( studentAccount.getBalance().add(amountToAdd) );
			if( familyAccount != null ) {
				familyAccount.setBalance(  familyAccount.getBalance().add(amountToAdd) );
			}
			if( additionTransactionType == null ) {
				additionTransactionType = TransactionType.Charge;
			}
			logBillingTransaction(amountToAdd, familyAccount, studentAccount, additionTransactionType, authorization, trxDescription, paymentDate, studentBillingAttendanceRecordId, paymentMethodType );
		}
		if( amountToSubtract != null && amountToSubtract.compareTo( new BigDecimal(0) ) == 1 ) {
			if( //TransactionType.Payment.equals( subtractingTransactionType ) && 
				studentAccount.getBalance().compareTo(amountToSubtract) == -1 &&
				familyAccount != null
			) {
				List<StudentBillingAccount> sibilingBillingAccounts = getSiblingBillingAccounts( studentAccount.getId(), familyAccount.getId());
				return postFamilyPaymentAcrossStudentAccounts(familyAccount, studentAccount, sibilingBillingAccounts, amountToSubtract, subtractingTransactionType, authorization, trxDescription, paymentDate, paymentMethodType, true);
			}
			studentAccount.setBalance( studentAccount.getBalance().subtract(amountToSubtract) );
			if( familyAccount != null ) {
				familyAccount.setBalance(  familyAccount.getBalance().subtract(amountToSubtract) );
			}
			if( subtractingTransactionType == null ) {
				subtractingTransactionType = TransactionType.Credit;
			}
			logBillingTransaction(amountToSubtract, familyAccount, studentAccount, subtractingTransactionType, authorization, trxDescription, paymentDate, studentBillingAttendanceRecordId, paymentMethodType );
		}
		
		studentAccount = studentBillingAccountRepository.save(studentAccount);
		if( familyAccount != null ) {
			familyAccount = familyBillingAccountRepository.save(familyAccount);
		}
		return studentAccount;
	}
	
	public StudentBillingAccount updateStudentBalanceRemovingLog( Long studentId, Long programId, BigDecimal amountToSubtract, TransactionType subtractingTransactionType, ZonedDateTime paymentDate, Long studentBillingAttendanceRecordId ) {
		StudentBillingAccount studentAccount = getStudentBillingAccount( studentId, programId );
		FamilyBillingAccount familyAccount = studentAccount.getFamilyBillingAccount();
		if( amountToSubtract != null ) {
			studentAccount.setBalance( studentAccount.getBalance().subtract(amountToSubtract) );
			if( familyAccount != null ) {
				familyAccount.setBalance(  familyAccount.getBalance().subtract(amountToSubtract) );
			}
			Optional<BillingTransaction> billingTransactionOpt = findBillingTransactionByStudentBillingAttendanceRecordId( studentBillingAttendanceRecordId );
			if( billingTransactionOpt.isPresent() ) {
				billingTransactionRepository.delete(billingTransactionOpt.get());
			}else if ( amountToSubtract.compareTo( new BigDecimal(0) ) == 1 ){
				if( subtractingTransactionType == null ) {
					subtractingTransactionType = TransactionType.Credit;
				}
				logBillingTransaction(amountToSubtract, familyAccount, studentAccount, subtractingTransactionType, null, null, paymentDate, studentBillingAttendanceRecordId, null );
			}
		}
		studentAccount = studentBillingAccountRepository.save(studentAccount);
		if( familyAccount != null ) {
			familyAccount = familyBillingAccountRepository.save(familyAccount);
		}
		return studentAccount;
	}
	
	public StudentBillingAccount postFamilyPaymentAcrossStudentAccounts( FamilyBillingAccount familyAccount, StudentBillingAccount primaryStudentAccount, List<StudentBillingAccount> sibilingBillingAccounts, BigDecimal amountToSubtract, TransactionType subtractingTransactionType,
			String authorization, String trxDescription, ZonedDateTime paymentDate, PaymentMethodType paymentMethodType, Boolean logOnce  ) {
		BigDecimal remainderToAccount = amountToSubtract;
		BigDecimal amountToSubtractFromPrimaryAccount = amountToSubtract;
		BigDecimal amountToSubtractToIndividualAccount = amountToSubtract;
		
		//Only reduce balances from active siblings. May make this a program specific setting in the future
		List<StudentBillingAccount> activeOnlySiblings = Optional.ofNullable( sibilingBillingAccounts ).orElse(Collections.emptyList())
				.stream().filter( s -> !s.getId().equals( primaryStudentAccount.getId() ) && ( s.getStudent().getActive() == null || s.getStudent().getActive() ) ).collect(Collectors.toList());
				
		
		//If students balance is already below 0 then try to subtract from siblings first
		//else if students balance is greater than 0 but less than the amount to subtract
		//bring their balance down to 0 and subtract the remainder from their siblings accounts
		if( primaryStudentAccount.getBalance().compareTo( new BigDecimal(0) ) == -1  ) {
			amountToSubtractFromPrimaryAccount = new BigDecimal(0).setScale(2);
		}else if( primaryStudentAccount.getBalance().compareTo(amountToSubtract) == -1 ) {
			amountToSubtractFromPrimaryAccount = primaryStudentAccount.getBalance();
			remainderToAccount = amountToSubtract.subtract( amountToSubtractFromPrimaryAccount );
		}
		
		
		//If remainderToAccount for is greater than 0 try to reduce it from active siblings
		if( remainderToAccount.compareTo( new BigDecimal(0) ) == 1 ) {
			for( StudentBillingAccount sibilingBillingAccount: activeOnlySiblings ) {
				//If sibling balance is greater than the the remaining amount to subtract, then subtract the remainder
				//else if sibling balance is less than 0 or equal to 0 then subtract 0
				//else sibiling balance is less than or equal to remaining amount and sibiling balance is greater than 0, bring siblings balance down to 0
				if( sibilingBillingAccount.getBalance().compareTo( remainderToAccount ) == 1 ) {
					amountToSubtractToIndividualAccount = remainderToAccount;
				}else if( sibilingBillingAccount.getBalance().compareTo(new BigDecimal(0)) <= 0 ) {
					amountToSubtractToIndividualAccount = new BigDecimal(0).setScale(2);
				}else {
					amountToSubtractToIndividualAccount = sibilingBillingAccount.getBalance();
				}
				
				//If amount to subtract is greater than 0 then record and log
				if( amountToSubtractToIndividualAccount.compareTo( new BigDecimal(0) ) == 1 ) {
					remainderToAccount = remainderToAccount.subtract(amountToSubtractToIndividualAccount);
					sibilingBillingAccount.setBalance( sibilingBillingAccount.getBalance().subtract(amountToSubtractToIndividualAccount) );
					if( !logOnce ) {
						logBillingTransaction(amountToSubtractToIndividualAccount, familyAccount, sibilingBillingAccount, subtractingTransactionType, authorization, trxDescription, paymentDate, null, paymentMethodType );
					}
				}
				if( remainderToAccount.compareTo( new BigDecimal(0) ) <= 0 ) {
					break;
				}
			}
		}
		if( remainderToAccount.compareTo( new BigDecimal(0) ) == 1 ) {
			amountToSubtractFromPrimaryAccount = amountToSubtractFromPrimaryAccount.add( remainderToAccount );
		}
		//If amount to subtract from primary is greater than 0 then record and log
		if( amountToSubtractFromPrimaryAccount.compareTo( new BigDecimal(0)) == 1 ) {
			primaryStudentAccount.setBalance( primaryStudentAccount.getBalance().subtract(amountToSubtractFromPrimaryAccount) );
			if( !logOnce ) {
				logBillingTransaction(amountToSubtractFromPrimaryAccount, familyAccount, primaryStudentAccount, subtractingTransactionType, authorization, trxDescription, paymentDate, null, paymentMethodType);
			}
		}
		if( familyAccount != null ) {
			familyAccount.setBalance(  familyAccount.getBalance().subtract(amountToSubtract) );
			if( logOnce ) {
				logBillingTransaction(amountToSubtract, familyAccount, null, subtractingTransactionType, authorization, trxDescription, paymentDate, null, paymentMethodType);
			}
		}
		return primaryStudentAccount;
	}
	
	public StudentBillingAccount postStudentPayment( Long studentId, Long programId, BigDecimal amountToSubtract, String trxDescription , ZonedDateTime paymentDate, PaymentMethodType paymentMethodType ) {
		StudentBillingAccount studentAccount = getStudentBillingAccount( studentId, programId );
		FamilyBillingAccount familyAccount = studentAccount.getFamilyBillingAccount();
		
		if( amountToSubtract != null  && amountToSubtract.compareTo( new BigDecimal(0) ) == 1 ) {
			studentAccount.setBalance( studentAccount.getBalance().subtract(amountToSubtract) );
			if( familyAccount != null ) {
				familyAccount.setBalance(  familyAccount.getBalance().subtract(amountToSubtract) );
			}
			logBillingTransaction(amountToSubtract, familyAccount, studentAccount, TransactionType.Payment, null, trxDescription, paymentDate, null, paymentMethodType );
		}
		studentAccount = studentBillingAccountRepository.save(studentAccount);
		if( familyAccount != null ) {
			familyAccount = familyBillingAccountRepository.save(familyAccount);
		}
		return studentAccount;
	}
	
	public BillingTransaction logBillingTransaction( BigDecimal amount, FamilyBillingAccount familyBillingAccount, StudentBillingAccount studentBillingAccount, TransactionType type, String authorization, String trxDescription, ZonedDateTime paymentDate, Long studentBillingAttendanceRecordId, PaymentMethodType paymentMethodType ) {
		BillingTransaction billingTransaction = BillingTransaction.builder()
				.amount(amount)
				.authorization(authorization)
				.date( paymentDate != null ? paymentDate : ZonedDateTime.now() )
				.familyBillingAccount(familyBillingAccount)
				.studentBillingAccount(studentBillingAccount)
				.description( trxDescription )
				.type(type)
				.studentBillingAttendanceRecordId( studentBillingAttendanceRecordId )
				.paymentMethodType( paymentMethodType )
				.build();
		return billingTransactionRepository.saveAndFlush(billingTransaction);
	}
	
	public Optional<BillingTransaction> findBillingTransactionByStudentBillingAttendanceRecordId( Long studentBillingAttendanceRecordId ) {
		if( studentBillingAttendanceRecordId == null ) {
			return Optional.empty();
		}
		return billingTransactionRepository.findOne( (root, q, cb ) -> {
			return cb.equal( root.get(BillingTransaction_.STUDENT_BILLING_ATTENDANCE_RECORD_ID), studentBillingAttendanceRecordId);
		});
	}
	
	public void deleteBillingTransaction( BillingTransaction billingTransaction ) {
		updateStudentBalanceDeleteBilling(billingTransaction.getStudentBillingAccountId(), billingTransaction.getStudentBillingAccount().getProgramId(), billingTransaction.getType(), billingTransaction.getAmount());
		billingTransactionRepository.delete(billingTransaction);
	}
	
	
	public BillingTransaction updateBillingTransaction( BillingTransaction billingTransaction, BillingTransaction originalBillingTransaction ) {
		BigDecimal amountChanged = billingTransaction.getAmount().subtract( originalBillingTransaction.getAmount() ).setScale(2, RoundingMode.HALF_UP);
		if( amountChanged.compareTo( new BigDecimal(0) ) == 1 ) {
			if( Arrays.asList( TransactionType.Credit, TransactionType.Refund, TransactionType.Payment ).contains( billingTransaction.getType() ) ) {
				//subtract
				updateStudentBalanceFromBillingTransaction( billingTransaction.getStudentBillingAccountId(), billingTransaction.getStudentBillingAccount().getProgramId(), null, amountChanged.abs(), billingTransaction.getStudentBillingAttendanceRecordId() );
			}else {
				//add
				updateStudentBalanceFromBillingTransaction( billingTransaction.getStudentBillingAccountId(), billingTransaction.getStudentBillingAccount().getProgramId(), amountChanged, null, billingTransaction.getStudentBillingAttendanceRecordId() );
			}
		}else if ( amountChanged.compareTo( new BigDecimal(0) ) == -1 ) {
			if( Arrays.asList( TransactionType.Credit, TransactionType.Refund, TransactionType.Payment ).contains( billingTransaction.getType() ) ) {
				//add
				updateStudentBalanceFromBillingTransaction( billingTransaction.getStudentBillingAccountId(), billingTransaction.getStudentBillingAccount().getProgramId(), amountChanged.abs(), null, billingTransaction.getStudentBillingAttendanceRecordId() );
			}else {
				//subtract
				updateStudentBalanceFromBillingTransaction( billingTransaction.getStudentBillingAccountId(), billingTransaction.getStudentBillingAccount().getProgramId(), null, amountChanged.abs(), billingTransaction.getStudentBillingAttendanceRecordId() );
			}
		}
		return billingTransactionRepository.save(billingTransaction);
	}
	
	
	public StudentBillingAccount updateStudentBalanceFromBillingTransaction( Long studentId, Long programId, BigDecimal amountToAdd, BigDecimal amountToSubtract, Long studentBillingAttendanceRecordId ) {
		StudentBillingAccount studentAccount = getStudentBillingAccount( studentId, programId );
		FamilyBillingAccount familyAccount = studentAccount.getFamilyBillingAccount();
		if( amountToAdd != null ) {
			studentAccount.setBalance( studentAccount.getBalance().add(amountToAdd) );
			if( familyAccount != null ) {
				familyAccount.setBalance(  familyAccount.getBalance().add(amountToAdd) );
			}
		}
		if( amountToSubtract != null  && amountToSubtract.compareTo( new BigDecimal(0) ) == 1 ) {
			studentAccount.setBalance( studentAccount.getBalance().subtract(amountToSubtract) );
			if( familyAccount != null ) {
				familyAccount.setBalance(  familyAccount.getBalance().subtract(amountToSubtract) );
			}
		}
		
		studentAccount = studentBillingAccountRepository.save(studentAccount);
		if( familyAccount != null ) {
			familyAccount = familyBillingAccountRepository.save(familyAccount);
		}
		if( studentBillingAttendanceRecordId != null ) {
			StudentBillingAttendanceRecord studentBillingAttendanceRecord = studentBillingAttendanceRecordRepository.findById( studentBillingAttendanceRecordId ).orElse(null);
			WeeklyBillingLog weeklyBillingLog = studentBillingAttendanceRecord.getWeeklyBillingLog();
			if( studentBillingAttendanceRecordId != null ) {
				rebalanceStudentAttendanceRecord(studentBillingAttendanceRecord, weeklyBillingLog, amountToAdd, amountToSubtract);
			}
		}
		return studentAccount;
	}
	
	
	public void updateStudentBalanceDeleteBilling( Long studentId, Long programId, TransactionType type, BigDecimal amount ) {
		StudentBillingAccount studentAccount = getStudentBillingAccount( studentId, programId );
		FamilyBillingAccount familyAccount = studentAccount.getFamilyBillingAccount();
		if( Arrays.asList( TransactionType.Charge, TransactionType.Refund ).contains( type ) ) {
			studentAccount.setBalance( studentAccount.getBalance().subtract(amount) );
			if( familyAccount != null ) {
				familyAccount.setBalance(  familyAccount.getBalance().subtract(amount) );
			}
		}else if( Arrays.asList( TransactionType.Credit, TransactionType.Payment ).contains( type ) ) {
			studentAccount.setBalance( studentAccount.getBalance().add(amount) );
			if( familyAccount != null ) {
				familyAccount.setBalance(  familyAccount.getBalance().add(amount) );
			}
		}
		studentAccount = studentBillingAccountRepository.save(studentAccount);
		if( familyAccount != null ) {
			familyAccount = familyBillingAccountRepository.save(familyAccount);
		}
	}
	
	public Page<BillingTransaction> getBillingTransactionsByFamilyAccount( FamilyBillingAccount familyBillingAccount, TransactionType transactionType, LocalDate startDate, LocalDate endDate, Pageable pageable ){
		ZonedDateTime dateStart =  ( startDate != null ) ? 
				ZonedDateTime.of( startDate, LocalTime.MIN, TimeZone.getTimeZone("America/New_York").toZoneId() )
				: null;
		
		ZonedDateTime dateEnd = ( endDate != null ) ? 
				ZonedDateTime.of( endDate, LocalTime.MAX, TimeZone.getTimeZone("America/New_York").toZoneId() )
				: null;
		
		return billingTransactionRepository.findAll( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			andPredicate.add( cb.equal( root.get(BillingTransaction_.FAMILY_BILLING_ACCOUNT_ID),  familyBillingAccount.getId()) );
			if( dateStart != null ) {
				andPredicate.add( cb.greaterThanOrEqualTo( root.get(BillingTransaction_.date), dateStart ) );
			}
			if( dateEnd != null ) {
				andPredicate.add( cb.lessThanOrEqualTo( root.get(BillingTransaction_.date), dateEnd ) );
			}
			if( transactionType != null ) {
				andPredicate.add( cb.equal( root.get(BillingTransaction_.TYPE), transactionType));
			}
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			q.orderBy( cb.desc( root.get(BillingTransaction_.DATE)  ) );
			return q.getRestriction();
		}, pageable);
	}
	
	public Page<BillingTransaction> getBillingTransactionsByStudentAccount( StudentBillingAccount studentBillingAccount, TransactionType transactionType, LocalDate startDate, LocalDate endDate, Pageable pageable ){
		ZonedDateTime dateStart =  ( startDate != null ) ? 
				ZonedDateTime.of( startDate, LocalTime.MIN, TimeZone.getTimeZone("America/New_York").toZoneId() )
				: null;
		
		ZonedDateTime dateEnd = ( endDate != null ) ? 
				ZonedDateTime.of( endDate, LocalTime.MAX, TimeZone.getTimeZone("America/New_York").toZoneId() )
				: null;
		
		return billingTransactionRepository.findAll( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			andPredicate.add( cb.equal( root.get(BillingTransaction_.STUDENT_BILLING_ACCOUNT_ID),  studentBillingAccount.getId()) );
			if( dateStart != null ) {
				andPredicate.add( cb.greaterThanOrEqualTo( root.get(BillingTransaction_.date), dateStart ) );
			}
			if( dateEnd != null ) {
				andPredicate.add( cb.lessThanOrEqualTo( root.get(BillingTransaction_.date), dateEnd ) );
			}
			if( transactionType != null ) {
				andPredicate.add( cb.equal( root.get(BillingTransaction_.TYPE), transactionType));
			}
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			return q.getRestriction();
		}, pageable);
	}
	
	public Page<WeeklyBillingLog> getWeeklyBillingLogs( LocalDate date, Long programId, Pageable pageable, String search, StudentSort studentSort ) {
		ZonedDateTime weekOfStart =  ZonedDateTime.of( date.with(WeekFields.of(Locale.US).dayOfWeek(), 1L), LocalTime.MIN, TimeZone.getTimeZone("America/New_York").toZoneId() );
		ZonedDateTime weekOfEnd = ZonedDateTime.of( date.with(WeekFields.of(Locale.US).dayOfWeek(), 7L), LocalTime.MAX, TimeZone.getTimeZone("America/New_York").toZoneId() );
		return weeklyBillingLogRepository.findAll( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			andPredicate.add( cb.equal( root.get(WeeklyBillingLog_.PROGRAM_ID), programId ) );
			andPredicate.add( cb.greaterThanOrEqualTo( root.get(WeeklyBillingLog_.WEEK_OF),weekOfStart ) );
			andPredicate.add( cb.lessThanOrEqualTo( root.get(WeeklyBillingLog_.WEEK_OF), weekOfEnd ) );
			
			
			if( search != null ) {
				if( search != null && !search.trim().isEmpty() ) {
					final String[] searchStrings = search.trim().split(" ");
					for( String searchString : searchStrings ) {
						if( searchString.length() == 1 ) {
							andPredicate.add(
								cb.equal(root.get(WeeklyBillingLog_.STUDENT).get(Student_.GRADE), searchString)
							);
						}else{
							String tokenizedSearch = TokenizerUtility.startsWith( searchString.toUpperCase() );
							andPredicate.add(
								cb.or(
									cb.like( root.get(WeeklyBillingLog_.STUDENT).get(Student_.FIRST_NAME), tokenizedSearch),
									cb.like( root.get(WeeklyBillingLog_.STUDENT).get(Student_.MIDDLE_NAME), tokenizedSearch),
									cb.like( root.get(WeeklyBillingLog_.STUDENT).get(Student_.LAST_NAME), tokenizedSearch),
									cb.like( root.get(WeeklyBillingLog_.STUDENT).get(Student_.STUDENT_ID), tokenizedSearch),
									cb.like( root.get(WeeklyBillingLog_.STUDENT).get(Student_.SCHOOL).get(School_.NAME), tokenizedSearch)
								)
							);	
						}
					}				
				}
			}
			
			
			if( studentSort != null ) {
				switch( studentSort ) {
					case GradeAsc:
						q.orderBy( cb.asc( root.get(WeeklyBillingLog_.STUDENT).get(Student_.GRADE) ) );
						break;
					case GradeDesc:
						q.orderBy( cb.desc( root.get(WeeklyBillingLog_.STUDENT).get(Student_.GRADE) ) );
						break;
					case LastNameAsc:
						q.orderBy( cb.asc( root.get(WeeklyBillingLog_.STUDENT).get(Student_.LAST_NAME) ) );
						break;
					case LastNameDesc:
						q.orderBy( cb.desc( root.get(WeeklyBillingLog_.STUDENT).get(Student_.LAST_NAME) ) );
						break;
					case SchoolAsc:
						q.orderBy( cb.asc( root.get(WeeklyBillingLog_.STUDENT).get(Student_.SCHOOL).get(School_.NAME) ) );
						break;
					case SchoolDesc:
						q.orderBy( cb.desc( root.get(WeeklyBillingLog_.STUDENT).get(Student_.SCHOOL).get(School_.NAME ) ) );
						break;
					default:
						q.orderBy( cb.desc( root.get(WeeklyBillingLog_.ID) ));
						break;
				}
			}else {
				q.orderBy( cb.desc( root.get(WeeklyBillingLog_.ID) ));
			}
			
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			return q.getRestriction();
		}, pageable);
	}

	public BillingRecord saveBillingRecord(BillingRecord billingRecord, Student student, TransactionType transactionType, String trxDescription, PaymentMethodType paymentMethodType) {
		if( billingRecord.getPaymentDate() == null ) {
			billingRecord.setPaymentDate( ZonedDateTime.now() );
		}
		try {
			billingRecord = billingRecordRepository.saveAndFlush(billingRecord);
		}catch( Exception e ) {
			e.printStackTrace();
		}
		boolean chargedAccount = false;
		StudentBillingAccount studentBillingBalance;
		if( TransactionType.Charge.equals( transactionType ) ) {
			chargedAccount = true;
			studentBillingBalance = updateStudentBalance( billingRecord.getStudentId(), student.getProgramId(), billingRecord.getAmountPaid(), null, transactionType,  null, billingRecord.getLastFour(), trxDescription, billingRecord.getPaymentDate(), null, paymentMethodType );
		}else {
			studentBillingBalance = updateStudentBalance( billingRecord.getStudentId(), student.getProgramId(), null, billingRecord.getAmountPaid(), null, transactionType, billingRecord.getLastFour(), trxDescription, billingRecord.getPaymentDate(), null, paymentMethodType );
		}
		
		WeeklyBillingLog weeklyBillingLog = findWeeklyBillingLog( billingRecord.getPaymentDate(), student, billingRecord.getProgramId() );
		if( weeklyBillingLog != null ) {
			if( studentBillingBalance.getBalance().doubleValue() <= 0 ) {
				weeklyBillingLog.setWeeklyCharge( new BigDecimal(0) );
				weeklyBillingLog.setPaymentStatus(PaymentStatus.PAID);
				weeklyBillingLog = weeklyBillingLogRepository.save(weeklyBillingLog);
			}else if( chargedAccount ) {
				weeklyBillingLog.setWeeklyCharge( weeklyBillingLog.getWeeklyCharge().add(  billingRecord.getAmountPaid() ) );
				if( PaymentStatus.PAID.equals( weeklyBillingLog.getPaymentStatus() )) {
					weeklyBillingLog.setPaymentStatus(PaymentStatus.DUE);
				}
				weeklyBillingLog = weeklyBillingLogRepository.save(weeklyBillingLog);
			}
		}
		return billingRecord;
	}

	public WeeklyBillingLog getWeeklyBillingLogs(LocalDate date, Long programId, Long studentId) {
		ZonedDateTime weekOfStart =  ZonedDateTime.of( date.with(WeekFields.of(Locale.US).dayOfWeek(), 1L), LocalTime.MIN, TimeZone.getTimeZone("America/New_York").toZoneId() );
		ZonedDateTime weekOfEnd = ZonedDateTime.of( date.with(WeekFields.of(Locale.US).dayOfWeek(), 7L), LocalTime.MAX, TimeZone.getTimeZone("America/New_York").toZoneId() );
		return weeklyBillingLogRepository.findOne( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			andPredicate.add( cb.equal( root.get(WeeklyBillingLog_.PROGRAM_ID), programId ) );
			andPredicate.add( cb.equal( root.get(WeeklyBillingLog_.STUDENT_ID), studentId ) );
			andPredicate.add( cb.greaterThanOrEqualTo( root.get(WeeklyBillingLog_.WEEK_OF),weekOfStart ) );
			andPredicate.add( cb.lessThanOrEqualTo( root.get(WeeklyBillingLog_.WEEK_OF), weekOfEnd ) );
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			return q.getRestriction();
		}).orElse(null);
	}

	public BillingRecord convert(BillingRecordModel billingRecordModel) {
		return BillingRecord.builder()
				.id(billingRecordModel.getId())
				.amountPaid(billingRecordModel.getAmountPaid())
				.lastFour( billingRecordModel.getAuthorization() )
				.paymentDate( billingRecordModel.getPaymentDate() != null ? billingRecordModel.getPaymentDate() :  ( billingRecordModel.getPaymentLocalDate() != null ? getBillingRecordZonedDateTime( billingRecordModel.getPaymentLocalDate() ) : null ) )
				.studentId( billingRecordModel.getStudentId() )
				.programId( billingRecordModel.getProgramId() )
				.paymentMethodType( billingRecordModel.getPaymentMethodType() )
				.build();
	}
	
	public ZonedDateTime getBillingRecordZonedDateTime(  LocalDate date ) {
		return ZonedDateTime.of(date, LocalTime.now(), TimeZone.getTimeZone("America/New_York").toZoneId() );
	}
	
	public FamilyBillingAccount getFamilyBillingAccount( Long id ) {
		return familyBillingAccountRepository.getOne(id);
	}

	public List<StudentBillingAccount> getStudentBillingAccountsByFamilyId( Long familyBillingId ){
		return studentBillingAccountRepository.findAll( (root, q, cb) ->{
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			andPredicate.add(
				cb.equal( root.get(StudentBillingAccount_.FAMILY_BILLING_ACCOUNT_ID), familyBillingId )
			);
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			return q.getRestriction();
		});
	}
	
	public List<StudentBillingAccount> getSiblingBillingAccounts( Long studentAccountId, Long familyBillingId ){
		return getStudentBillingAccountsByFamilyId(familyBillingId).stream().filter( sba -> !sba.getId().equals( studentAccountId ) ).collect(Collectors.toList());
	}
	
	
	public void updateStudentBilling( Pageable pageable ) {
		Page<StudentBillingAccount> studentBillingAccountPage = studentBillingAccountRepository.findAll( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			andPredicate.add( cb.notEqual( root.get(StudentBillingAccount_.PROGRAM_ID),root.get(StudentBillingAccount_.STUDENT).get(Student_.PROGRAM_ID) ));
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			return q.getRestriction();
		}, pageable);
		
		if( studentBillingAccountPage.hasContent() ) {
			for( StudentBillingAccount sba : studentBillingAccountPage.getContent() ) {
				try {
					sba.setProgramId( sba.getStudent().getProgramId() );
					studentBillingAccountRepository.save(sba);
				}catch( Exception e) {
					
				}
				
			}
		}
	}
	
	/**
	 * User inputted CheckinLogEditModel
	 * 
	 * @param checkinLog
	 */
	public void recordManualStudentBillingAttendanceRecord( CheckinLog checkinLog, AfterSchoolProgram p, boolean updateBillingLedger ) {
		WeeklyBillingLog weeklyBillingLog = getWeeklyBillingLog( checkinLog.getCheckInTime(), checkinLog.getStudent(), checkinLog.getProgramId() );
		if( weeklyBillingLog.getDailyRecords() == null ) {
			weeklyBillingLog.setDailyRecords( new ArrayList<>() );
		}
		BillingRecordType billingRecordType = null;
		if( weeklyBillingLog.getDailyRecords() == null ) {
			weeklyBillingLog.setDailyRecords( new ArrayList<>() );
			billingRecordType = checkinLog.getStudent().getDefaultWeeklyBillingType();
			if( billingRecordType == null ) {
				if( checkinLog.getProgramId().equals(8l)) {
					billingRecordType = BillingRecordType.WEEKLY_RATE;
				}
			}
		}else {
			billingRecordType = checkinLog.getStudent().getDefaultWeeklyBillingType();
		}
		StudentBillingAttendanceRecord studentBillingAttendanceRecord = weeklyBillingLog.getDailyRecords().stream()
				.filter( r -> DateTimeUtility.isSameDay(r.getAttendanceDate(), checkinLog.getCheckInTime() ) && checkinLog.getCheckinRecordType().equals( r.getCheckinRecordType() )  )
				.findFirst()
					.orElse( weeklyBillingLog.getDailyRecords().stream().filter(  r -> DateTimeUtility.isSameDay(r.getAttendanceDate(), checkinLog.getCheckInTime() ) && r.getCheckinRecordType() == null )
						.findFirst()
							.orElse( createStudentBillingAttendanceRecord(checkinLog.getCheckInTime(), checkinLog) ) );
		studentBillingAttendanceRecord.setCheckInLogId( checkinLog.getId() );
		weeklyBillingLog.setDailyRecords( weeklyBillingLog.getDailyRecords().stream().filter( r -> 
							!DateTimeUtility.isSameDay(r.getAttendanceDate(), checkinLog.getCheckInTime() ) ||
							( r.getCheckinRecordType() == null || !r.getCheckinRecordType().equals( checkinLog.getCheckinRecordType() ) )
				).collect(Collectors.toList() )  );
		
		if( updateBillingLedger ) {
			Long studentBillingAttendanceRecordId = studentBillingAttendanceRecord.getId() != null ? studentBillingAttendanceRecord.getId() : null;
			BillingTransaction existingBillingTransaction = studentBillingAttendanceRecord.getId() != null ? billingTransactionRepository.findOne( ( root, q, cb ) -> {
				return cb.equal( root.get(BillingTransaction_.STUDENT_BILLING_ATTENDANCE_RECORD_ID), studentBillingAttendanceRecordId  );
			}).orElse( null ) : null;
			
			if( existingBillingTransaction == null ) {
				BigDecimal previousRate = studentBillingAttendanceRecord.getDailyRate();
				studentBillingAttendanceRecord = calculateStudentBillingAttendanceRecord(studentBillingAttendanceRecord, checkinLog, billingRecordType, weeklyBillingLog, p);
				if( studentBillingAttendanceRecord != null && studentBillingAttendanceRecord.getDailyRate() != null && studentBillingAttendanceRecord.getDailyRate().compareTo( new BigDecimal(0) ) >= 0  ) {
					updateStudentBalance( checkinLog.getStudent().getId(), checkinLog.getStudent().getProgramId(), 
							studentBillingAttendanceRecord.getDailyRate(), previousRate, TransactionType.Charge, 
							TransactionType.Credit, null, 
							studentBillingAttendanceRecord.getAttendanceTrxDescriptor(),
							checkinLog.getCheckInTime(),
							studentBillingAttendanceRecord.getId(),
							null
						);
					weeklyBillingLog = updateWeeklyCharge( weeklyBillingLog, studentBillingAttendanceRecord.getDailyRate(), previousRate );
				}
			}else {
				studentBillingAttendanceRecord = calculateStudentBillingAttendanceRecord(studentBillingAttendanceRecord, checkinLog, billingRecordType, weeklyBillingLog, p);
				if( studentBillingAttendanceRecord != null ) {
					BillingTransaction billingTransaction = new BillingTransaction(existingBillingTransaction);
					billingTransaction.setAmount( studentBillingAttendanceRecord.getDailyRate() );
					updateBillingTransaction(billingTransaction, existingBillingTransaction);
				}
			}
			
			if( studentBillingAttendanceRecord != null ) {
				weeklyBillingLog.getDailyRecords().add(studentBillingAttendanceRecord);
				weeklyBillingLog = weeklyBillingLogRepository.save(weeklyBillingLog);
				studentBillingAttendanceRecord.setWeeklyBillingLog(weeklyBillingLog);
				studentBillingAttendanceRecord = studentBillingAttendanceRecordRepository.save(studentBillingAttendanceRecord);
			}
		}
	}
	
	
	public List<Long> findBillingPlanIdsByFilter(Long programId, String filter) {
		List<BillingPlan> billingPlans = billingPlanRepository.findAll( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			andPredicate.add( cb.equal( root.get(BillingPlan_.PROGRAM_ID), programId) );
			if( filter != null ) {
				switch( filter ) {
					case "CCPS":
						andPredicate.add( 
							root.get(BillingPlan_.SPECIALIZED_BILLING_PLAN).in( Arrays.asList( SpecializedBillingPlan.CCPSRate ) )
						);
						break;
					case "SCHOLARSHIP":
						andPredicate.add( 
								root.get(BillingPlan_.SPECIALIZED_BILLING_PLAN).in( Arrays.asList( SpecializedBillingPlan.ScholarshipWeekly) )
							);
							break;
					case "ELC":
						andPredicate.add( 
							root.get(BillingPlan_.SPECIALIZED_BILLING_PLAN).in( Arrays.asList( SpecializedBillingPlan.ELCWeekly) )
						);
						break;
					case "DEFAULT_RATE":
					default:
						andPredicate.add(
							cb.or( 
								cb.isNull( root.get( BillingPlan_.SPECIALIZED_BILLING_PLAN) ),
								cb.not( root.get(BillingPlan_.SPECIALIZED_BILLING_PLAN).in( Arrays.asList( SpecializedBillingPlan.CCPSRate, SpecializedBillingPlan.ScholarshipWeekly, SpecializedBillingPlan.ELCWeekly ) ) )
							)
						);
						break;
				}
			}
			
			q.where( andPredicate.toArray( new Predicate[andPredicate.size()]));
			return q.getRestriction();
		});
		return billingPlans.stream().map( p -> p.getId() ).collect(Collectors.toList());
	}
	
	public List<BillingTransaction> findBillingTransaction( Long studentId, String description, TransactionType transactionType ) {
		return billingTransactionRepository.findAll( (root, q, cb) -> { 
			return cb.and( 
				cb.equal( root.get(BillingTransaction_.STUDENT_BILLING_ACCOUNT_ID), studentId),
				cb.equal( root.get(BillingTransaction_.DESCRIPTION), description ),
				cb.equal( root.get(BillingTransaction_.TYPE) , transactionType)
			);
		});
	}
	
	
	public void rebalanceStudentsEndOfWeekLedger( Long programId ) {
		Pageable page = PageRequest.of(0, 50);
		Page<StudentBillingAccount> studentBillingAccounts = getProgramNegativeStudentBillingAccounts(programId, page);
		if( studentBillingAccounts.hasContent() ) {
			boolean hasNext = false;
			do {
				for( StudentBillingAccount sba : studentBillingAccounts.getContent() ) {
					rebalanceStudentBillingAccount( sba );
				}
				if( studentBillingAccounts.hasNext() ) {
					hasNext = true;
					studentBillingAccounts = getProgramNegativeStudentBillingAccounts( programId, PageRequest.of( studentBillingAccounts.getNumber()+1 , studentBillingAccounts.getSize()));
				}else {
					hasNext = false;
				}
			}while( hasNext );
		}
	}
	
	public StudentBillingAccount rebalanceStudentBillingAccount( StudentBillingAccount sba ) {
		List<StudentBillingAccount> sibilingBillingAccounts = getSiblingBillingAccounts( sba.getId(), sba.getFamilyBillingAccountId());
		//Only look at active siblings. May make this a program specific setting in the future
		List<StudentBillingAccount> activeOnlySiblings = Optional.ofNullable( sibilingBillingAccounts ).orElse(Collections.emptyList())
				.stream().filter( s -> !s.getId().equals( sba.getId() ) && ( s.getStudent().getActive() == null || s.getStudent().getActive() ) ).collect(Collectors.toList());
		BigDecimal studentBalance = sba.getBalance().setScale(2, RoundingMode.HALF_UP);
		//Check if any sibling has a remaining balance
		if( activeOnlySiblings.stream().anyMatch( s -> s.getBalance().compareTo( new BigDecimal(0)) == 1 ) ) {
			for( StudentBillingAccount siblingAccount : activeOnlySiblings ) {
				if( siblingAccount.getBalance().compareTo( new BigDecimal(0)) == 1  ) {
					BigDecimal combinedBalance = studentBalance.add( siblingAccount.getBalance() );
					int zeroComparison = combinedBalance.compareTo( new BigDecimal( 0 ) );
					if( zeroComparison == 0 ) {
						//Combined balance = 0, reset both student balance and sibling balance accounts to 0 and return no adjustment needed;
						studentBalance = new BigDecimal(0).setScale(2);
						sba.setBalance(new BigDecimal(0).setScale(2) );
						siblingAccount.setBalance( new BigDecimal(0).setScale(2) );
						studentBillingAccountRepository.save( siblingAccount );
						return studentBillingAccountRepository.save(sba);
					}else if( zeroComparison == 1 ) {
						//Combined balance means family still owes money, update both accounts and return no adjustment needed
						studentBalance = new BigDecimal(0).setScale(2);
						sba.setBalance(new BigDecimal(0).setScale(2) );
						siblingAccount.setBalance( combinedBalance );
						studentBillingAccountRepository.save( siblingAccount );
						return studentBillingAccountRepository.save(sba);
					}else if( zeroComparison == -1 ) {
						//Combined balance means family still has a credit, update both accounts and look at the new sibling
						studentBalance = combinedBalance;
						sba.setBalance( combinedBalance );
						siblingAccount.setBalance( new BigDecimal(0).setScale(2) );
						studentBillingAccountRepository.save( siblingAccount );
					}
				}
			}
		}
		
		//Check that student balance is still negative after checking against siblings
		if( studentBalance.compareTo( new BigDecimal(0)) == -1 ) {
			//TEMP
			ZonedDateTime paymentDate = ZonedDateTime.of(LocalDate.of(2020, 9, 4), LocalTime.of(10, 0), TimeZone.getTimeZone("America/New_York").toZoneId() );
			return updateStudentBalance( sba.getId(), sba.getProgramId(), studentBalance.abs(), null, TransactionType.Charge, null, null, "Weekly Balance Adjustment", paymentDate, null, null);
		}
		
		
		
		
		return sba;
	}
	
	
	public Page<StudentBillingAccount> getProgramNegativeStudentBillingAccounts( Long programId, Pageable pageable ){
		return studentBillingAccountRepository.findAll(( root, q, cb ) -> {
			return cb.and( 
				cb.equal( root.get(StudentBillingAccount_.PROGRAM_ID), programId),
				cb.lt( root.get(StudentBillingAccount_.BALANCE), new BigDecimal(0))
			);
		},pageable);
	}
	
	public Long countFamilyAttendanceRecords( Long studentId, AfterSchoolProgram program, ZonedDateTime checkinTime, CheckinRecordType checkinRecordType  ) {
		StudentBillingAccount studentAccount = getStudentBillingAccount( studentId, program.getId() );
		FamilyBillingAccount familyAccount = studentAccount.getFamilyBillingAccount();
		if( familyAccount == null ) {
			return 0l;
		}
		try {
			ZonedDateTime startOfDay = ZonedDateTime.of( checkinTime.toLocalDate(), LocalTime.MIN, TimezoneUtils.getActiveProgramZoneId(program) );
			ZonedDateTime endOfDay = ZonedDateTime.of( checkinTime.toLocalDate(), LocalTime.MAX, TimezoneUtils.getActiveProgramZoneId(program) );
			List<Long> siblingIds = getSiblingBillingAccounts( studentAccount.getId(), familyAccount.getId()).stream().map( sa -> sa.getId() ).collect(Collectors.toList());
			if( siblingIds.isEmpty() ) {
				return 0l;
			}
			List<StudentBillingAttendanceRecord> siblingAttendanceRecords = studentBillingAttendanceRecordRepository.findAll( (root, q, cb) ->{
				final List<Predicate> andPredicate = new ArrayList<Predicate>();
				andPredicate.add( cb.greaterThanOrEqualTo( root.get(StudentBillingAttendanceRecord_.ATTENDANCE_DATE), startOfDay ) );
				andPredicate.add( cb.lessThanOrEqualTo( root.get(StudentBillingAttendanceRecord_.ATTENDANCE_DATE), endOfDay ) );
				andPredicate.add( cb.equal( root.get(StudentBillingAttendanceRecord_.CHECKIN_RECORD_TYPE), checkinRecordType) );
				andPredicate.add( root.get(StudentBillingAttendanceRecord_.STUDENT_ID).in( siblingIds ) );
				//q.groupBy( root.get(StudentBillingAttendanceRecord_.STUDENT_ID) );
				q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
				return q.getRestriction();
			});
			return siblingAttendanceRecords.stream().map( r -> r.getStudentId() ).distinct().count();
		}catch( Exception e ) {
			e.printStackTrace();
			return 0l;
		}
	}
	
	private void rebalanceStudentAttendanceRecord( StudentBillingAttendanceRecord studentBillingAttendanceRecord, WeeklyBillingLog weeklyBillingLog, BigDecimal amountToAdd, BigDecimal amountToSubtract ) {
		if( amountToAdd != null ) {
			studentBillingAttendanceRecord.setDailyRate(  studentBillingAttendanceRecord.getDailyRate().add( amountToAdd ) );
			if( weeklyBillingLog != null ) {
				weeklyBillingLog.setWeeklyCharge(  weeklyBillingLog.getWeeklyCharge().add( amountToAdd ) );
			}
		}
		if( amountToSubtract != null  && amountToSubtract.compareTo( new BigDecimal(0) ) == 1 ) {
			studentBillingAttendanceRecord.setDailyRate(  studentBillingAttendanceRecord.getDailyRate().subtract( amountToSubtract ) );
			if( weeklyBillingLog != null ) {
				weeklyBillingLog.setWeeklyCharge(  weeklyBillingLog.getWeeklyCharge().subtract( amountToSubtract ) );
			}
		}
		studentBillingAttendanceRecordRepository.save(studentBillingAttendanceRecord);
		if( weeklyBillingLog != null ) {
			weeklyBillingLogRepository.save(weeklyBillingLog);
		}
	}
	
	private void rebalanceStudentAccountFamilyAccount( Long studentId, Long programId, BigDecimal amountToAdd, BigDecimal amountToSubtract ) {
		StudentBillingAccount studentAccount = getStudentBillingAccount( studentId, programId );
		FamilyBillingAccount familyAccount = studentAccount.getFamilyBillingAccount();
		if( amountToAdd != null ) {
			studentAccount.setBalance( studentAccount.getBalance().add( amountToAdd ) );
			if( familyAccount != null ) {
				familyAccount.setBalance( familyAccount.getBalance().add( amountToAdd ) );
			}
		}
		if( amountToSubtract != null  && amountToSubtract.compareTo( new BigDecimal(0) ) == 1 ) {
			studentAccount.setBalance( studentAccount.getBalance().subtract( amountToSubtract ) );
			if( familyAccount != null ) {
				familyAccount.setBalance( familyAccount.getBalance().subtract( amountToSubtract ) );
			}
		}
		
		studentBillingAccountRepository.save(studentAccount);
		if( familyAccount != null ) {
			familyBillingAccountRepository.save(familyAccount);
		}
	}
	
	private void rebalanceBillingTransaction( Long studentBillingAttendanceRecordId, BigDecimal amountToAdd, BigDecimal amountToSubtract ) {
		if( studentBillingAttendanceRecordId != null ) {
			try {
				BillingTransaction billingTransaction = billingTransactionRepository.findOne( (root, q, cb)  -> {
					return cb.and( 
							cb.equal( root.get(BillingTransaction_.STUDENT_BILLING_ATTENDANCE_RECORD_ID) , studentBillingAttendanceRecordId)
					);
				}).orElse(null);
				if( billingTransaction != null ) {
					if( amountToAdd != null ) {
						billingTransaction.setAmount( billingTransaction.getAmount().add(amountToAdd) );
					}
					if( amountToSubtract != null  && amountToSubtract.compareTo( new BigDecimal(0) ) == 1 ) {
						billingTransaction.setAmount( billingTransaction.getAmount().subtract(amountToSubtract) );
					}
					billingTransactionRepository.save(billingTransaction);
				}
			}catch( Exception e ) {
				e.printStackTrace();
				//TODO: check that STUDENT_BILLING_ATTENDANCE_RECORD_ID is unique
			}
		}
	}
	
	private void rebalanceAndRenameBillingTransaction( Long studentBillingAttendanceRecordId, BigDecimal amountToAdd, BigDecimal amountToSubtract, String description ) {
		if( studentBillingAttendanceRecordId != null ) {
			try {
				BillingTransaction billingTransaction = billingTransactionRepository.findOne( (root, q, cb)  -> {
					return cb.and( 
							cb.equal( root.get(BillingTransaction_.STUDENT_BILLING_ATTENDANCE_RECORD_ID) , studentBillingAttendanceRecordId)
					);
				}).orElse(null);
				if( billingTransaction != null ) {
					if( amountToAdd != null ) {
						billingTransaction.setAmount( billingTransaction.getAmount().add(amountToAdd) );
					}
					if( amountToSubtract != null  && amountToSubtract.compareTo( new BigDecimal(0) ) == 1 ) {
						billingTransaction.setAmount( billingTransaction.getAmount().subtract(amountToSubtract) );
					}
					billingTransaction.setDescription( description );
					billingTransactionRepository.save(billingTransaction);
				}
			}catch( Exception e ) {
				e.printStackTrace();
				//TODO: check that STUDENT_BILLING_ATTENDANCE_RECORD_ID is unique
			}
		}
	}

	public DepositReportModel getWeeklyDepositReport(AfterSchoolProgram p, LocalDate startDate, LocalDate endDate,
			String filter) {
		ZonedDateTime dateStart =  ( startDate != null ) ? 
				ZonedDateTime.of( startDate, LocalTime.MIN, TimeZone.getTimeZone("America/New_York").toZoneId() )
				: null;
		ZonedDateTime dateEnd = ( endDate != null ) ? 
				ZonedDateTime.of( endDate, LocalTime.MAX, TimeZone.getTimeZone("America/New_York").toZoneId() )
				: null;
		List<BillingTransaction> achTransactions = getWeeklyBillingTransactions( p, dateStart, dateEnd, PaymentMethodType.Ach, null );
		List<BillingTransaction> checkTransactions = getWeeklyBillingTransactions( p, dateStart, dateEnd, PaymentMethodType.Check, null );
		List<BillingTransaction> cardTransactions = getWeeklyBillingTransactions( p, dateStart, dateEnd, PaymentMethodType.CreditCard, null );
		return modelBuilderService.buildDepositReportModel(p, achTransactions, checkTransactions, cardTransactions);
	}
	
	public DepositSummaryModel getWeeklyDepositSummaryReport(AfterSchoolProgram p, LocalDate startDate, LocalDate endDate,
			String filter) {
		ZonedDateTime dateStart =  ( startDate != null ) ? 
				ZonedDateTime.of( startDate, LocalTime.MIN, TimeZone.getTimeZone("America/New_York").toZoneId() )
				: null;
		ZonedDateTime dateEnd = ( endDate != null ) ? 
				ZonedDateTime.of( endDate, LocalTime.MAX, TimeZone.getTimeZone("America/New_York").toZoneId() )
				: null;
		List<BillingTransaction> transactions = getWeeklyBillingTransactions( p, dateStart, dateEnd, null, null );
		return modelBuilderService.buildDepositSummaryModel(p, transactions);
	}
	
	public List<BillingTransaction> getWeeklyBillingTransactions(AfterSchoolProgram activeProgram, ZonedDateTime dateStart, ZonedDateTime dateEnd, PaymentMethodType paymentMethodType,
			String filter) {
			return billingTransactionRepository.findAll( (root, q, cb) -> {
				final List<Predicate> andPredicate = new ArrayList<Predicate>();
				andPredicate.add( cb.equal(root.get(BillingTransaction_.STUDENT_BILLING_ACCOUNT).get(StudentBillingAttendanceRecord_.PROGRAM_ID), activeProgram.getId()) );
				andPredicate.add( cb.equal( root.get(BillingTransaction_.TYPE), TransactionType.Payment ));
				if( paymentMethodType != null ) {
					if( PaymentMethodType.CreditCard.equals( paymentMethodType ) ) {
						andPredicate.add(
							cb.or( 
								cb.isNull( root.get(BillingTransaction_.PAYMENT_METHOD_TYPE)),
								cb.equal( root.get(BillingTransaction_.PAYMENT_METHOD_TYPE), paymentMethodType)	
							)
						);
					}else {
						andPredicate.add( cb.equal( root.get(BillingTransaction_.PAYMENT_METHOD_TYPE), paymentMethodType) );
					}
				}
				
				
				if( dateStart != null ) {
					andPredicate.add( cb.greaterThanOrEqualTo( root.get(BillingTransaction_.DATE), dateStart ) );
				}
				if( dateEnd != null ) {
					andPredicate.add( cb.lessThanOrEqualTo( root.get(BillingTransaction_.DATE), dateEnd ) );
				}
				
//					if( filter != null ) {
//						switch( filter ) {
//							case "MORNING":
//								andPredicate.add( cb.equal( root.get(CheckinLog_.CHECKIN_RECORD_TYPE), CheckinRecordType.Morning ) );
//								break;
//							case "AFTERSCHOOL":
//								andPredicate.add( cb.equal( root.get(CheckinLog_.CHECKIN_RECORD_TYPE), CheckinRecordType.Afterschool ) );
//								break;
//							case "CCPS":
//							case "SCHOLARSHIP":
//							case "DEFAULT_RATE":
//								if( billingPlanIds != null ) {
//									andPredicate.add( root.get(CheckinLog_.STUDENT).get(Student_.BILLING_PLAN_ID).in( billingPlanIds ) );
//								}
//								break;
//							case "ALL":
//							default:
//								break;
//						}
//					}
//					
				q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
				q.orderBy( cb.asc( root.get(BillingTransaction_.DATE) ) );
				return q.getRestriction();
			});	
	}
	
	
	
	
	public void cleanupDuplicateBilling( ) {
		 List<Long>  sbaIds = getStudentBillingAttendaceRecordsToRemove().stream().map( s -> s.getId() ).collect(Collectors.toList());
		 sbaIds.stream().forEach( sbaId -> {
			 BillingTransaction bt = findBillingTransactionBySBAID(sbaId);
			 if( bt != null ) {
				 deleteBillingTransaction(bt);
			 }
		 });
		 
	
	
	
	}
	
	public BillingTransaction findBillingTransactionBySBAID( Long sbaId ) {
		return billingTransactionRepository.findOne( (root,q,cb) -> {
			return cb.equal( root.get(BillingTransaction_.STUDENT_BILLING_ATTENDANCE_RECORD_ID), sbaId);
		}).orElse(null);
	}
	
	
	public List<StudentBillingAttendanceRecord> getStudentBillingAttendaceRecordsToRemove(){
		ZonedDateTime dateStart =  ZonedDateTime.of( LocalDate.of(2020, 9, 8), LocalTime.MIN, TimeZone.getTimeZone("America/New_York").toZoneId() );
		ZonedDateTime dateEnd = ZonedDateTime.of( LocalDate.of(2020, 9, 8), LocalTime.MAX, TimeZone.getTimeZone("America/New_York").toZoneId() );
		
		return studentBillingAttendanceRecordRepository.findAll((root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			andPredicate.add( cb.greaterThanOrEqualTo(root.get(StudentBillingAttendanceRecord_.ATTENDANCE_DATE) , dateStart) );
			andPredicate.add( cb.lessThanOrEqualTo(root.get(StudentBillingAttendanceRecord_.ATTENDANCE_DATE), dateEnd) );
			andPredicate.add( cb.isNull( root.get(StudentBillingAttendanceRecord_.WEEKLY_BILLING_LOG) ) );
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			return q.getRestriction();
		});
	}

	public void linkFamilyBillingAccountsToStripeCustomer(Long programId) {
		Page<StripeCustomer> stripeCustomersPage = stripeCustomerService.findUnlinkedStripeCustomers(programId, PageRequest.of(0, 100));
		List<StripeCustomer> processed = new ArrayList<>();
		
		if( stripeCustomersPage.hasContent() ) {
			for( StripeCustomer cust : stripeCustomersPage.getContent() ) {
				List<Guardian> guardiansFound = findStripeGuardians( programId, cust.getName() );
				if( !guardiansFound.isEmpty() ) {
					if( guardiansFound.size() > 1 ) {
						System.out.println("Found Multiple Guardians for Customer Name "+ cust.getName() );
					}else {
						cust.setFamilyBillingAccountId( guardiansFound.get(0).getFamilyBillingAccountId().toString() );
						processed.add( cust );
					}
				}
			}
		}
		
		if( !processed.isEmpty() ) {
			stripeCustomerService.saveAll(processed);
		}
	}

	private List<Guardian> findStripeGuardians(Long programId, String name) {
		String[] nameParts = name.split(" ", 2);
		String first = nameParts[0];
		if( nameParts.length > 1 ) {
			String last = nameParts[1];
			return guardianRepository.findAll( (root, q, cb) -> {
				return cb.and(
					cb.equal( root.get(Guardian_.PROGRAM_ID), programId),
					cb.equal( root.get(Guardian_.FIRST_NAME), first),
					cb.equal( root.get(Guardian_.LAST_NAME), last),
					cb.isNotNull( root.get(Guardian_.FAMILY_BILLING_ACCOUNT_ID) )
				);
			});
		}
		return guardianRepository.findAll( (root, q, cb) -> {
			return cb.and(
				cb.equal( root.get(Guardian_.PROGRAM_ID), programId),
				cb.equal( root.get(Guardian_.FIRST_NAME), first),
				cb.isNotNull( root.get(Guardian_.FAMILY_BILLING_ACCOUNT_ID) )
			);
		});
		
	}

	public void processTransactions(Long programId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable ) {
		Page<StripeCustomerCharge> charges = stripeCustomerChargeService.findStripeCustomerChargesWithinDateRange( programId, startDate, endDate, Arrays.asList("succeeded"), pageable );
		while( charges.hasContent() ) {
			for( StripeCustomerCharge stripeCharge : charges.getContent() ) {
				processStripeCustomerCharge( stripeCharge );
			}
			if( !charges.hasNext()) {
				break;
			}
			charges = stripeCustomerChargeService.findStripeCustomerChargesWithinDateRange( programId, startDate, endDate, Arrays.asList("succeeded"), charges.nextPageable() );
		}
	}

	
	public void processStripeCustomerCharge( StripeCustomerCharge charge ) {
		StripeTransaction stripeTransaction = stripeTransactionService.findByTransactionId( charge.getTransactionId() );
		StripeCustomer stripeCustomer = stripeCustomerService.findByCustomerId( charge.getCustomerId() );
		if( stripeTransaction != null && stripeCustomer != null && stripeCustomer.getFamilyBillingAccountId() != null ) {
			FamilyBillingAccount familyBillingAccount = findFamilyBillingAccountById( Long.valueOf( stripeCustomer.getFamilyBillingAccountId() ) );
			if( !hasExistingStripeRecord( familyBillingAccount, charge.getPaymentIntent() ) ) {
				List<StudentBillingAccount> studentAccounts = getStudentBillingAccountsByFamilyId(familyBillingAccount.getId());
				StudentBillingAccount primaryAccount = studentAccounts.iterator().next();
				List<StudentBillingAccount> sibilingBillingAccounts = studentAccounts.stream().filter( a -> !a.getId().equals( primaryAccount.getId() ) ).collect(Collectors.toList());
				BigDecimal paymentAmount =  stripeTransaction.getAmount().subtract( stripeTransaction.getFee() ).setScale(2, RoundingMode.HALF_UP);
				ZonedDateTime paymentDate = ZonedDateTime.of(charge.getCreated(), TimeZone.getTimeZone("America/New_York").toZoneId() ); 
				postFamilyPaymentAcrossStudentAccounts(familyBillingAccount, primaryAccount, sibilingBillingAccounts, paymentAmount, 
						TransactionType.Payment, charge.getPaymentIntent(), "STRIPE TEST DESCRIPTION", paymentDate, 
						stripeTransaction.getType().equals("charge") ? PaymentMethodType.CreditCard : PaymentMethodType.Ach,
						true);
			}
		}
	}

	
	public boolean hasExistingStripeRecord( FamilyBillingAccount familyBillingAccount, String paymentIntent ) {
		return !findBillingTransactionsWithPaymentIntent(familyBillingAccount, paymentIntent).isEmpty();
	}
	
	public List<BillingTransaction> findBillingTransactionsWithPaymentIntent( FamilyBillingAccount familyBillingAccount, String paymentIntent ) {
		return billingTransactionRepository.findAll( (root, q, cb) -> {
			return cb.and( 
				cb.equal( root.get(BillingTransaction_.FAMILY_BILLING_ACCOUNT_ID), familyBillingAccount.getId() ),
				cb.equal( root.get(BillingTransaction_.AUTHORIZATION), paymentIntent)
			);
		});
	}
	
	
}
