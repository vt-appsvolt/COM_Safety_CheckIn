package com.myspartansoftware.login.service.builder;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.TimeZone;
import java.util.stream.Collectors;

import org.hibernate.LazyInitializationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.myspartansoftware.login.domain.ActiveCheckin;
import com.myspartansoftware.login.domain.AfterSchoolProgram;
import com.myspartansoftware.login.domain.CheckinLog;
import com.myspartansoftware.login.domain.Contact;
import com.myspartansoftware.login.domain.Guardian;
import com.myspartansoftware.login.domain.Person;
import com.myspartansoftware.login.domain.School;
import com.myspartansoftware.login.domain.Student;
import com.myspartansoftware.login.domain.StudentBillingAttendanceRecord;
import com.myspartansoftware.login.domain.WeeklyBillingLog;
import com.myspartansoftware.login.domain.billing.BillingPlan;
import com.myspartansoftware.login.domain.billing.BillingTransaction;
import com.myspartansoftware.login.domain.billing.StudentBillingAccount;
import com.myspartansoftware.login.model.ActiveCheckinModel;
import com.myspartansoftware.login.model.AddressModel;
import com.myspartansoftware.login.model.AfterSchoolProgramAttendanceModel;
import com.myspartansoftware.login.model.AfterSchoolProgramModel;
import com.myspartansoftware.login.model.BillingPlanModel;
import com.myspartansoftware.login.model.BillingTransactionModel;
import com.myspartansoftware.login.model.CheckinLogEditModel;
import com.myspartansoftware.login.model.CheckinLogModel;
import com.myspartansoftware.login.model.ContactModel;
import com.myspartansoftware.login.model.DepositReportModel;
import com.myspartansoftware.login.model.DepositSummaryModel;
import com.myspartansoftware.login.model.GuardianModel;
import com.myspartansoftware.login.model.PersonModel;
import com.myspartansoftware.login.model.SchoolModel;
import com.myspartansoftware.login.model.StudentAttendanceModel;
import com.myspartansoftware.login.model.StudentBillingAccountModel;
import com.myspartansoftware.login.model.StudentBillingAttendanceRecordModel;
import com.myspartansoftware.login.model.StudentModel;
import com.myspartansoftware.login.model.WeeklyBillingLogModel;
import com.myspartansoftware.login.repository.StudentRepository;
import com.myspartansoftware.login.utils.TimezoneUtils;

@Service("modelBuilderService")
public class ModelBuilderService {

	private StudentRepository studentRepository;
	
	@Autowired
	public ModelBuilderService( StudentRepository studentRepository ) {
		this.studentRepository = studentRepository;
	}
	
	private PersonModel buildPerson( PersonModel model, Person person) {
		model.setDateOfBirth( person.getDateOfBirth() );
		model.setFirstName( person.getFirstName() );
		model.setLastName( person.getLastName() );
		model.setMiddleName( person.getMiddleName() );
		model.setSex( person.getSex() );
		return model;
	}
	
	public PersonModel buildPersonModel( Person person ) {
		PersonModel model = new PersonModel();
		model = buildPerson(model, person);
		return model;
	}
	
	public GuardianModel buildGuardianModel( Guardian guardian ) {
		GuardianModel model = new GuardianModel();
		model = (GuardianModel) buildPerson(model, guardian);
		model.setContacts( Optional.ofNullable( guardian.getContacts() ).orElse( new ArrayList<Contact>() ).stream().map( c -> buildContactModel( c ) ).collect(Collectors.toList()) );
		model.setDriversLicenseNumber( guardian.getDriversLicenseNumber() );
		model.setEmployer( guardian.getEmployer() );
		model.setId( guardian.getId() );
		model.setParentId( guardian.getParentId() );
		model.setProgramId( guardian.getProgramId() );
		model.setRelationship( guardian.getRelationship() );
		return model;
	}
	
	public ContactModel buildContactModel( Contact contact ) {
		ContactModel model = new ContactModel();
		model.setContactType( contact.getContactType() );
		model.setContactValue( contact.getContactValue() );
		model.setId( contact.getId() );
		model.setLabel( contact.getLabel() );
		model.setPreferred( contact.getPreferred() );
		return model;
	}
	
	public BillingPlanModel buildBillingPlanModel( BillingPlan billingPlan ) {
		BillingPlanModel model = new BillingPlanModel();
		model.setBillingPlanName( billingPlan.getPlanName() );
		model.setId( billingPlan.getId() );
		model.setDefaultRate( billingPlan.getDefaultRate() );
		return model;
	}
	
	public StudentModel buildStudentModel( Student student ) {
		StudentModel model = new StudentModel();
		model = (StudentModel) buildPerson(model, student);
		model.setStudentId(student.getStudentId());
		model.setId( student.getId() );
		model.setGrade(student.getGrade());
		model.setProgramId( student.getProgramId() );
		model.setSchoolName( student.getSchoolName() );
		model.setBillingPlanId( student.getBillingPlanId() );
		model.setDefaultWeeklyBillingType( student.getDefaultWeeklyBillingType() );
		model.setAllergies( student.getAllergies() );
		model.setRequiresIdCard( student.getRequiresIdCard() );
		model.setActive( student.getActive() );
		model.setNoPhoto( student.getNoPhoto() );
		if( student.getSchool() != null ) {
			model.setSchool( buildSchoolModel( student.getSchool() ) );
		}
		
		try {
			if( student.getGuardians() != null ) {
				model.setGuardians( student.getGuardians().stream().map( g -> buildGuardianModel(g) ).collect(Collectors.toList()) );
			}
		}catch( LazyInitializationException e) {
			student = studentRepository.findById( student.getId() ).orElse(null);
			if( student != null && student.getGuardians() != null ) {
				model.setGuardians( student.getGuardians().stream().map( g -> buildGuardianModel(g) ).collect(Collectors.toList()) );
			}
		}
			
		return model; 
	}
	
	public StudentModel buildStudentModel( Student student, BillingPlan billingPlan ) {
		StudentModel model = buildStudentModel(student);
		if( billingPlan != null ) {
			model.setBillingPlan( buildBillingPlanModel(billingPlan) );
		}
		return model; 
	}
	
	public StudentModel buildStudentModel( Student student, Boolean isCheckedIn ) {
		StudentModel model = buildStudentModel(student);
		model.setIsCheckedIn(isCheckedIn);
		return model;
	}
	
	public ActiveCheckinModel buildActiveCheckinModel( ActiveCheckin activeCheckin ) {
		ActiveCheckinModel model = new ActiveCheckinModel();
		model.setId(activeCheckin.getId());
		model.setCheckInTime( activeCheckin.getCheckInTime() );
		model.setStudent( buildStudentModel(activeCheckin.getStudent()) );
		return model;
	}
	
	public CheckinLogModel buildCheckinLogModel( CheckinLog checkingLog, Student student, AfterSchoolProgram p ) {
		CheckinLogModel model = new CheckinLogModel();
		ZoneId zone = p.getTimezone() != null ? TimeZone.getTimeZone(p.getTimezone()).toZoneId() : TimeZone.getTimeZone("America/New_York").toZoneId();
		model.setId( checkingLog.getId() );
		model.setCheckInTime( checkingLog.getCheckInTime().withZoneSameInstant(zone) );
		model.setCheckOutTime( checkingLog.getCheckOutTime().withZoneSameInstant(zone) );
		model.setPickupName( checkingLog.getPickupName() );
		if( student != null ) {
			model.setStudent( buildStudentModel( student ) );
		}
		return model;
	}
	
	public WeeklyBillingLogModel buildWeeklyBillingLogModel( WeeklyBillingLog weeklyBillingLog, Student student, StudentBillingAccount studentBillingBalance ) {
		WeeklyBillingLogModel model = new WeeklyBillingLogModel();
		model.setId( weeklyBillingLog.getId() );
		model.setStudentId( weeklyBillingLog.getStudentId() );
		model.setProgramId( weeklyBillingLog.getProgramId() );
		model.setWeekOf( weeklyBillingLog.getWeekOf() );
		model.setWeeklyCharge( weeklyBillingLog.getWeeklyCharge() );
		model.setPriorBalance( weeklyBillingLog.getPriorBalance() );
		model.setPaymentStatus( weeklyBillingLog.getPaymentStatus() );
		model.setIsFinalRecord( weeklyBillingLog.getIsFinalRecord() );
		if( weeklyBillingLog.getDailyRecords() != null ) {
			model.setDailyRecords( weeklyBillingLog.getDailyRecords().stream().map( r -> buildStudentBillingAttendanceRecordModel(r) ).collect(Collectors.toList()) ); 
		}
		model.setStudent( buildStudentModel(student) );
		model.setStudentBalance( studentBillingBalance.getBalance() );
		return model;
	}
	
	public StudentBillingAttendanceRecordModel buildStudentBillingAttendanceRecordModel( StudentBillingAttendanceRecord studentBillingAttendanceRecord ) {
		StudentBillingAttendanceRecordModel model = new StudentBillingAttendanceRecordModel();
		model.setId( studentBillingAttendanceRecord.getId() );
		model.setStudentId( studentBillingAttendanceRecord.getStudentId() );
		model.setProgramId( studentBillingAttendanceRecord.getProgramId() );
		model.setCheckInLogId( studentBillingAttendanceRecord.getCheckInLogId() );
		model.setAttendanceDate( studentBillingAttendanceRecord.getAttendanceDate() );
		model.setAttendanceType( studentBillingAttendanceRecord.getAttendanceType() );
		model.setDailyRate( studentBillingAttendanceRecord.getDailyRate() );
		model.setIsFinalRecord( studentBillingAttendanceRecord.getIsFinalRecord() );
		return model;
	}

	public AfterSchoolProgramModel buildAfterSchoolProgramModel( AfterSchoolProgram afterSchoolProgram, boolean isActive) {
		AfterSchoolProgramModel model = new AfterSchoolProgramModel();
		model.setId( afterSchoolProgram.getId() );
		model.setProgramName( afterSchoolProgram.getProgramName() );
		model.setIsActive(isActive);
		return model;
	}
	
	public AfterSchoolProgramModel buildFullAfterSchoolProgramModel( AfterSchoolProgram afterSchoolProgram) {
		AfterSchoolProgramModel model = new AfterSchoolProgramModel();
		model.setId( afterSchoolProgram.getId() );
		model.setProgramName( afterSchoolProgram.getProgramName() );
		
		if( afterSchoolProgram.getId().equals( 1l ) ) {
			model.setProgramFullName("Sports Club Center Afterschool");
			model.setEmail( ContactModel.builder().contactValue("SCC@sportsclubnaples.org").build() );
			model.setPhone( ContactModel.builder().contactValue("239-566-2582").build() );
			model.setAddress( AddressModel.builder().street("3275 Pine Ridge Rd").city("Naples").state("FL").zipcode("34109").build() );
		}else if( afterSchoolProgram.getId().equals( 2l ) ) {
			model.setProgramFullName("PME");
			model.setEmail( ContactModel.builder().contactValue("pme@sportsclubnaples.org").build() );
			model.setPhone( ContactModel.builder().contactValue("239-594-3046").build() );
			model.setAddress( AddressModel.builder().street("9480 Airport-Pulling Rd").city("Naples").state("FL").zipcode("34109").build() );
		}else if( afterSchoolProgram.getId().equals( 3l ) ) {
			model.setProgramFullName("PES");
			model.setEmail( ContactModel.builder().contactValue("pes@sportsclubnaples.org").build() );
			model.setPhone( ContactModel.builder().contactValue("239-263-3968").build() );
			model.setAddress( AddressModel.builder().street("2825 Airport-Pulling Rd").city("Naples").state("FL").zipcode("34105").build() );
		}else if( afterSchoolProgram.getId().equals( 4l ) ) {
			model.setProgramFullName("SPE");
			model.setEmail( ContactModel.builder().contactValue("spe@sportsclubnaples.org").build() );
			model.setPhone( ContactModel.builder().contactValue("239-377-8200").build() );
			model.setAddress( AddressModel.builder().street("4095 18th Ave NE").city("Naples").state("FL").zipcode("34120").build() );
		}else if( afterSchoolProgram.getId().equals( 5l ) ) {
			model.setProgramFullName("EES");
			model.setEmail( ContactModel.builder().contactValue("ees@sportsclubnaples.org").build() );
			model.setPhone( ContactModel.builder().contactValue("239-348-2389").build() );
			model.setAddress( AddressModel.builder().street("5945 Everglades Blvd N").city("Naples").state("FL").zipcode("34120").build() );
		}else if( afterSchoolProgram.getId().equals( 6l ) ) {
			model.setProgramFullName("OES");
			model.setEmail( ContactModel.builder().contactValue("oes@sportsclubnaples.org").build() );
			model.setPhone( ContactModel.builder().contactValue("239-566-7200").build() );
			model.setAddress( AddressModel.builder().street("5770 Osceola Trail").city("Naples").state("FL").zipcode("34109").build() );
		}else if( afterSchoolProgram.getId().equals( 7l ) ) {
			model.setProgramFullName("VES");
			model.setEmail( ContactModel.builder().contactValue("ves@sportsclubnaples.org").build() );
			model.setPhone( ContactModel.builder().contactValue("239-455-3005").build() );
			model.setAddress( AddressModel.builder().street("6225 Arbor Blvd W").city("Naples").state("FL").zipcode("34119").build() );
		}else if( afterSchoolProgram.getId().equals( 8l ) ) {
			model.setProgramFullName("Sports Club Center Summer");
			model.setEmail( ContactModel.builder().contactValue("SCC@sportsclubnaples.org").build() );
			model.setPhone( ContactModel.builder().contactValue("239-566-2582").build() );
			model.setAddress( AddressModel.builder().street("3275 Pine Ridge Rd").city("Naples").state("FL").zipcode("34109").build() );
		}
		return model;
	}
	
	public SchoolModel buildSchoolModel( School school ) {
		SchoolModel model = new SchoolModel();
		model.setId( school.getId() );
		model.setName( school.getName() );
		model.setProgramId( school.getProgramId() );
		return model;
	}
	
	public StudentBillingAccountModel buildStudentBillingAccountModel( StudentBillingAccount studentBillingAccount ) {
		return StudentBillingAccountModel.builder()
				.id( studentBillingAccount.getId() )
				.student( buildStudentModel( studentBillingAccount.getStudent() ) )
				.balance( studentBillingAccount.getBalance() )
				.programId( studentBillingAccount.getProgramId() )
				.build();
	}
	
	public BillingTransactionModel buildBillingTransactionModel(BillingTransaction t, AfterSchoolProgram p ) {
		ZoneId zone = TimezoneUtils.getActiveProgramZoneId(p);
		return BillingTransactionModel.builder()
		.amount(t.getAmount().setScale(2, RoundingMode.HALF_UP))
		.authorization(t.getAuthorization())
		.date(t.getDate().withZoneSameInstant(zone))
		.familyBillingAccountId(t.getFamilyBillingAccountId())
		.studentBillingAccountId(t.getStudentBillingAccountId())
		.id(t.getId())
		.type(t.getType())
		.description( t.getDescription() )
		.paymentMethodType(t.getPaymentMethodType())
		.studentName( 
				t.getStudentBillingAccount() != null && t.getStudentBillingAccount().getStudent() != null ? 
				( t.getStudentBillingAccount().getStudent().getFirstName()+" "+t.getStudentBillingAccount().getStudent().getLastName() ) :
				"Family"	
		)
		.build();
	}
	
	
	public CheckinLogEditModel buildCheckinLogEditModel( CheckinLog c, AfterSchoolProgram p ) {
		DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("MM/dd/yyyy");
		DateTimeFormatter timeFormat = DateTimeFormatter.ofPattern("hh:mm a");
		ZoneId zone = TimezoneUtils.getActiveProgramZoneId(p);
		return CheckinLogEditModel.builder()
				.id( c.getId() )
				.checkinDate( c.getCheckInTime().withZoneSameInstant(zone).format(dateFormat) )
				.checkinTime( c.getCheckInTime().withZoneSameInstant(zone).format(timeFormat) )
				.checkoutDate( c.getCheckOutTime().withZoneSameInstant(zone).format(dateFormat) )
				.checkoutTime( c.getCheckOutTime().withZoneSameInstant(zone).format(timeFormat) )
				.programId( c.getProgramId() )
				.studentId( c.getStudent().getId() )
				.removed( c.getRemoved() )
				.pickupName( c.getPickupName() )
				.checkinRecordType( c.getCheckinRecordType() )
				.build();
	}
	
	public CheckinLog buildCheckinLog( CheckinLogEditModel model, CheckinLog c, Student s, AfterSchoolProgram p ) {
		Objects.requireNonNull(s, "Student is required");
		DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("MM/dd/yyyy");
		DateTimeFormatter timeFormat = DateTimeFormatter.ofPattern("hh:mm a");
		ZoneId zone = p.getTimezone() != null ? TimeZone.getTimeZone(p.getTimezone()).toZoneId() : TimeZone.getTimeZone("America/New_York").toZoneId();
		
		if( c == null ) {
			c = new CheckinLog();
		}
		if( model.getRemoved() != null ) {
			c.setRemoved( model.getRemoved() );
		}
		if( c.getRemoved() == null ) {
			c.setRemoved(false);
		}
		if( 
			model.getCheckinDate() != null && !model.getCheckinDate().isEmpty() &&
			model.getCheckinTime() != null && !model.getCheckinTime().isEmpty()	
		) {
//			ZonedDateTime checkinDateTime = ZonedDateTime.of(LocalDate.parse( model.getCheckinDate(), dateFormat), LocalTime.parse(model.getCheckinTime(), timeFormat), zone);
//			c.setCheckInTime( checkinDateTime.withZoneSameInstant(ZoneId.of("UTC")) );
			c.setCheckInTime( ZonedDateTime.of(LocalDate.parse( model.getCheckinDate(), dateFormat), LocalTime.parse(model.getCheckinTime(), timeFormat), zone) );
		}
		if( 
			model.getCheckoutDate() != null && !model.getCheckoutDate().isEmpty() &&
			model.getCheckoutTime() != null && !model.getCheckoutTime().isEmpty()	
		) {
//			ZonedDateTime checkoutDateTime = ZonedDateTime.of(LocalDate.parse( model.getCheckoutDate(), dateFormat), LocalTime.parse(model.getCheckoutTime(), timeFormat), zone);
//			c.setCheckOutTime( checkoutDateTime.withZoneSameInstant(ZoneId.of("UTC")) );
			c.setCheckOutTime( ZonedDateTime.of(LocalDate.parse( model.getCheckoutDate(), dateFormat), LocalTime.parse(model.getCheckoutTime(), timeFormat), zone) );
		}
		c.setProgramId( p.getId() );
		c.setStudent(s);
		if( model.getPickupName() != null && !model.getPickupName().isEmpty() ) {
			c.setPickupName( model.getPickupName() );
		}
		if( c.getPickupName() == null || c.getPickupName().isEmpty() ) {
			c.setPickupName("Automated Checkout");
		}
		if( model.getCheckinRecordType() != null ) {
			c.setCheckinRecordType( model.getCheckinRecordType() );
		}
		return c;
	}

	public AfterSchoolProgramAttendanceModel buildAfterSchoolProgramAttendanceModel(AfterSchoolProgram p,
			Map<Long, List<CheckinLog>> studentCheckinLogMap) {
		AfterSchoolProgramAttendanceModel model = new AfterSchoolProgramAttendanceModel();
		model.setProgram( buildFullAfterSchoolProgramModel( p ) );
		model.setStudents( new ArrayList<StudentAttendanceModel>() );
		for( Long key : studentCheckinLogMap.keySet() ) {
			model.getStudents().add( buildStudentAttendanceModel( studentCheckinLogMap.get(key), p) );
		}
		return model;
	}
	
	public StudentAttendanceModel buildStudentAttendanceModel( List<CheckinLog> checkinLogs, AfterSchoolProgram p ) {
		StudentAttendanceModel model = new StudentAttendanceModel();
		model.setCheckinLogs( new ArrayList<>() );
		
		checkinLogs.stream().forEach( l -> {
			if( model.getStudent() == null ) {
				model.setStudent( buildStudentModel( l.getStudent() ));
			}
			model.getCheckinLogs().add( buildCheckinLogModel( l, null, p) );
		});
		return model;
		
	}
	
	public DepositReportModel buildDepositReportModel( AfterSchoolProgram p, List<BillingTransaction> achTransactions, List<BillingTransaction> checkTransactions, List<BillingTransaction> cardTransactions  ) { 
		DepositReportModel	model = new DepositReportModel();
		model.setProgram( buildFullAfterSchoolProgramModel(p) );
		model.setAchPayments(new ArrayList<>());
		model.setAchTotals( new BigDecimal(0).setScale(2) );
		model.setCheckPayments(new ArrayList<>());
		model.setCheckTotals( new BigDecimal(0).setScale(2) );
		model.setCreditcardPayments(new ArrayList<>());
		model.setCreditcardTotals( new BigDecimal(0).setScale(2) );
		achTransactions.stream().forEach( t -> {
			model.setAchTotals( model.getAchTotals().add( t.getAmount() ) );
			model.getAchPayments().add( buildBillingTransactionModel(t, p) );
		});
		checkTransactions.stream().forEach( t -> {
			model.setCheckTotals( model.getCheckTotals().add( t.getAmount() ) );
			model.getCheckPayments().add( buildBillingTransactionModel(t, p) );
		});
		cardTransactions.stream().forEach( t -> {
			model.setCreditcardTotals( model.getCreditcardTotals().add( t.getAmount() ) );
			model.getCreditcardPayments().add( buildBillingTransactionModel(t, p) );
		});
		model.setAchCount( Long.valueOf( achTransactions.size() ) );
		model.setCheckCount(  Long.valueOf( checkTransactions.size() ) );
		model.setCreditcardCount( Long.valueOf( cardTransactions.size() ) );
		return model;
	}

	public DepositSummaryModel buildDepositSummaryModel(AfterSchoolProgram p, List<BillingTransaction> transactions) {
		com.myspartansoftware.login.model.DepositSummaryModel model = new DepositSummaryModel();
		model.setProgram( buildFullAfterSchoolProgramModel(p) );
		model.setTotal( new BigDecimal(0).setScale(2) );
		transactions.stream().forEach( t -> {
			model.setTotal( model.getTotal().add( t.getAmount() ) );
		});
		
		return model;
	}
		
	
	
	
}
