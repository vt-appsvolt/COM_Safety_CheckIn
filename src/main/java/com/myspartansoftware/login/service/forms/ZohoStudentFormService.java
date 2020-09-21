package com.myspartansoftware.login.service.forms;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;

import com.myspartansoftware.login.domain.Address;
import com.myspartansoftware.login.domain.AfterSchoolProgram;
import com.myspartansoftware.login.domain.Contact;
import com.myspartansoftware.login.domain.Contact.ContactType;
import com.myspartansoftware.login.domain.Guardian;
import com.myspartansoftware.login.domain.Guardian.Relationship;
import com.myspartansoftware.login.domain.Guardian_;
import com.myspartansoftware.login.domain.Person.Sex;
import com.myspartansoftware.login.domain.Person_;
import com.myspartansoftware.login.domain.School;
import com.myspartansoftware.login.domain.Student;
import com.myspartansoftware.login.domain.Student_;
import com.myspartansoftware.login.domain.billing.BillingPlan;
import com.myspartansoftware.login.domain.billing.BillingPlan_;
import com.myspartansoftware.login.domain.billing.BillingTransaction;
import com.myspartansoftware.login.domain.billing.BillingTransaction.TransactionType;
import com.myspartansoftware.login.domain.enums.BillingRecordType;
import com.myspartansoftware.login.domain.enums.SpecializedBillingPlan;
import com.myspartansoftware.login.domain.forms.ZohoStudentForm;
import com.myspartansoftware.login.domain.forms.ZohoStudentForm_;
import com.myspartansoftware.login.model.StudentModel;
import com.myspartansoftware.login.model.forms.ZohoStudentFormModel;
import com.myspartansoftware.login.repository.AfterSchoolProgramRepository;
import com.myspartansoftware.login.repository.BillingPlanRepository;
import com.myspartansoftware.login.repository.GuardianRepository;
import com.myspartansoftware.login.repository.StudentRepository;
import com.myspartansoftware.login.repository.forms.ZohoStudentFormRepository;
import com.myspartansoftware.login.service.SchoolService;
import com.myspartansoftware.login.service.StudentService;
import com.myspartansoftware.login.service.billing.BillingService;

@Service("zohoStudentFormService")
public class ZohoStudentFormService {
	
	private ZohoStudentFormRepository zohoStudentFormRepository;
	private AfterSchoolProgramRepository afterSchoolProgramRepository;
	private GuardianRepository guardianRepository;
	private StudentRepository studentRepository;
	private SchoolService schoolService;
	private StudentService studentService;
	private BillingService billingService;
	private BillingPlanRepository billingPlanRepository;
	
	@Autowired
	public ZohoStudentFormService( ZohoStudentFormRepository zohoStudentFormRepository, 
			AfterSchoolProgramRepository afterSchoolProgramRepository,
			GuardianRepository guardianRepository,
			StudentRepository studentRepository,
			SchoolService schoolService,
			StudentService studentService,
			BillingService billingService,
			BillingPlanRepository billingPlanRepository
	) {
		this.zohoStudentFormRepository = zohoStudentFormRepository;
		this.afterSchoolProgramRepository = afterSchoolProgramRepository;
		this.guardianRepository = guardianRepository;
		this.studentRepository = studentRepository;
		this.schoolService = schoolService;
		this.studentService = studentService;
		this.billingService = billingService;
		this.billingPlanRepository = billingPlanRepository;
	}

	public void saveZohoStudentForm( ZohoStudentForm zohoStudentForm ) {
		zohoStudentFormRepository.save(zohoStudentForm);
		processForm( zohoStudentForm , true, true);
	}
	
	public ZohoStudentForm convert( ZohoStudentFormModel model ) {
		return ZohoStudentForm.builder()
				.id( model.getId() )
				.childFirstName( model.getChildFirstName() )
				.childLastName( model.getChildLastName() )
				.grade( model.getGrade() )
				.teacherName( model.getTeacherName() )
				.dateOfBirth( model.getDateOfBirth() )
				.sex( model.getSex() )
				.allergies( model.getAllergies() )
				.childStreetAddress( model.getChildStreetAddress() )
				.childAddressCity( model.getChildAddressCity() )
				.childAddressZipCode( model.getChildAddressZipCode() )
				.twoChildFirstName( model.getTwoChildFirstName() )
				.twoChildLastName( model.getTwoChildLastName() )
				.twoGrade( model.getTwoGrade() )
				.twoTeacherName( model.getTwoTeacherName() )
				.twoDateOfBirth( model.getTwoDateOfBirth() )
				.twoSex( model.getTwoSex() )
				.twoAllergies( model.getTwoAllergies() )
				.threeChildFirstName( model.getThreeChildFirstName() )
				.threeChildLastName( model.getThreeChildLastName() )
				.threeGrade( model.getThreeGrade() )
				.threeTeacherName( model.getThreeTeacherName() )
				.threeDateOfBirth( model.getThreeDateOfBirth() )
				.threeSex( model.getThreeSex() )
				.threeAllergies( model.getThreeAllergies() )
				.fourChildFirstName( model.getFourChildFirstName() )
				.fourChildLastName( model.getFourChildLastName() )
				.fourGrade( model.getFourGrade() )
				.fourTeacherName( model.getFourTeacherName() )
				.fourDateOfBirth( model.getFourDateOfBirth() )
				.fourSex( model.getFourSex() )
				.fourAllergies( model.getFourAllergies() )
				.fiveChildFirstName( model.getFiveChildFirstName() )
				.fiveChildLastName( model.getFiveChildLastName() )
				.fiveGrade( model.getFiveGrade() )
				.fiveTeacherName( model.getFiveTeacherName() )
				.fiveDateOfBirth( model.getFiveDateOfBirth() )
				.fiveSex( model.getFiveSex() )
				.fiveAllergies( model.getFiveAllergies() )
				.location( model.getLocation() )
				.oneParentFirstName( model.getOneParentFirstName() )
				.oneParentLastName( model.getOneParentLastName() )
				.parentStreetAddress( model.getParentStreetAddress() )
				.parentCity( model.getParentCity() )
				.parentZipCode( model.getParentZipCode() )
				.email( model.getEmail() )
				.driverLicenseNumber( model.getDriverLicenseNumber() )
				.cellPhone( model.getCellPhone() )
				.workPhone( model.getWorkPhone() )
				.twoParentFirstName( model.getTwoParentFirstName() )
				.twoParentLastName( model.getTwoParentLastName() )
				.twoParentStreetAddress( model.getTwoParentStreetAddress() )
				.twoParentCity( model.getTwoParentCity() )
				.twoParentZipCode( model.getTwoParentZipCode() )
				.twoEmail( model.getTwoEmail() )
				.twoDriverLicenseNumber( model.getTwoDriverLicenseNumber() )
				.twoCellPhone( model.getTwoCellPhone() )
				.twoWorkPhone( model.getTwoWorkPhone() )
				.additionalPickUpNameFirst( model.getAdditionalPickUpNameFirst() )
				.additionalPickUpNameLast( model.getAdditionalPickUpNameLast() )
				.additionalPickUpPhone( model.getAdditionalPickUpPhone() )
				.twoAdditionalPickUpNameFirst( model.getTwoAdditionalPickUpNameFirst() )
				.twoAdditionalPickUpNameLast( model.getTwoAdditionalPickUpNameLast() )
				.twoAdditionalPickUpPhone( model.getTwoAdditionalPickUpPhone() )
				.threeAdditionalPickUpNameFirst( model.getThreeAdditionalPickUpNameFirst() )
				.threeAdditionalPickUpNameLast( model.getThreeAdditionalPickUpNameLast() )
				.threeAdditionalPickUpPhone( model.getThreeAdditionalPickUpPhone() )
				.parentOneCCPS( model.getParentOneCCPS() )
				.parentTwoCCPS( model.getParentTwoCCPS() )
				.noPhoto( model.getNoPhoto() != null && model.getNoPhoto().length > 0 ? model.getNoPhoto()[0] : null )
				.enrollmentType( model.getEnrollmentType() != null &&  model.getEnrollmentType().length > 0 ? model.getEnrollmentType()[0] : null )
				.processed(false)
				.failedToProcess(false)
				.school( model.getSchool() )
				.build();	
	}
	
	public void processForms( Pageable pageable, Boolean processFee, Boolean activate) {
		Page<ZohoStudentForm> formsToProcess = zohoStudentFormRepository.findAll( (root,q,cb) -> {
			return cb.or(
				cb.isNull( root.get(ZohoStudentForm_.PROCESSED) ),
				cb.isFalse( root.get(ZohoStudentForm_.PROCESSED) )
			);
		}, pageable);
		if( formsToProcess.hasContent() ) {
			for( ZohoStudentForm zohoStudentForm : formsToProcess.getContent() ) {
				processForm(zohoStudentForm, processFee, activate);
			}
		}
	}
	
	
	public void processForm( ZohoStudentForm zohoStudentForm, Boolean processFee, Boolean activate ) {
		boolean processed = true;
		AfterSchoolProgram program = getProgram( zohoStudentForm.getLocation() );
		Student firstStudent = null;
		if( program == null ) {
			processed = false;
		} else {
			School school = null;
			if( zohoStudentForm.getSchool() != null ) {
				school = getSchool( zohoStudentForm.getSchool(), program.getId() );		
			}else {
				school = getSchool( zohoStudentForm.getLocation(), program.getId() );				
			}
			List<Guardian> guardians = new ArrayList<>();
			//TODO: 
			if( zohoStudentForm.getOneParentFirstName() != null && !zohoStudentForm.getOneParentFirstName().isEmpty() &&
				zohoStudentForm.getOneParentLastName() != null && !zohoStudentForm.getOneParentLastName().isEmpty() ) {
				Guardian guardian = processGuardian(	zohoStudentForm.getOneParentFirstName(),
									zohoStudentForm.getOneParentLastName(),
									zohoStudentForm.getDriverLicenseNumber(),
									program.getId(),
									zohoStudentForm.getParentStreetAddress(),
									zohoStudentForm.getParentCity(),
									zohoStudentForm.getParentZipCode(),
									zohoStudentForm.getEmail(),
									zohoStudentForm.getCellPhone(),
									zohoStudentForm.getWorkPhone(),
									Relationship.Guardian );
				
				if( guardian != null ) {
					guardians.add(guardian);
				}
			}
			if( zohoStudentForm.getTwoParentFirstName() != null && !zohoStudentForm.getTwoParentFirstName().trim().isEmpty() && 
				zohoStudentForm.getTwoParentLastName() != null && !zohoStudentForm.getTwoParentLastName().trim().isEmpty()	
			) {
				Guardian guardian = processGuardian(	zohoStudentForm.getTwoParentFirstName(),
						zohoStudentForm.getTwoParentLastName(),
						zohoStudentForm.getTwoDriverLicenseNumber(),
						program.getId(),
						zohoStudentForm.getTwoParentStreetAddress(),
						zohoStudentForm.getTwoParentCity(),
						zohoStudentForm.getTwoParentZipCode(),
						zohoStudentForm.getTwoEmail(),
						zohoStudentForm.getTwoCellPhone(),
						zohoStudentForm.getTwoWorkPhone(),
						Relationship.Guardian );
	
				if( guardian != null ) {
					guardians.add(guardian);
				}
			}
			
			//String additionalPickUpNameFirst;
			//private String additionalPickUpNameLast;
			//private String additionalPickUpPhone;
//			if(  zohoStudentForm.getAdditionalPickUpNameFirst() != null && !zohoStudentForm.getAdditionalPickUpNameFirst().isEmpty() ) {
//				Guardian pickUp = processPickUp( zohoStudentForm.getAdditionalPickUpNameFirst(), zohoStudentForm.getAdditionalPickUpNameLast(), zohoStudentForm.getAdditionalPickUpPhone() );
//				
//				
//			}
			boolean isCCPSRate = "true".equals(zohoStudentForm.getParentOneCCPS()) || "true".equals(zohoStudentForm.getParentTwoCCPS());
			StudentModel studentModel;
			//01-Jan-2019
			DateTimeFormatter birthDateFormatter = DateTimeFormatter.ofPattern("dd-MMM-yyyy");
			if( zohoStudentForm.getChildFirstName() != null && zohoStudentForm.getChildLastName() != null && 
					!zohoStudentForm.getChildFirstName().isEmpty() && !zohoStudentForm.getChildLastName().isEmpty() ) {
				studentModel = new StudentModel();
				studentModel.setFirstName( zohoStudentForm.getChildFirstName() );
				studentModel.setLastName( zohoStudentForm.getChildLastName() );
				studentModel.setAllergies( zohoStudentForm.getAllergies() );
				studentModel.setDefaultWeeklyBillingType( getBillingRecordType( zohoStudentForm.getEnrollmentType() ) );
				studentModel.setGrade( zohoStudentForm.getGrade() );
				studentModel.setTeachersName( zohoStudentForm.getTeacherName() );
				studentModel.setSex( getSex( zohoStudentForm.getSex() )  );
				studentModel.setNoPhoto( processNoPhoto( zohoStudentForm.getNoPhoto() ) );
				studentModel.setIsCCPS( isCCPSRate );
				try {
					studentModel.setDateOfBirth( LocalDate.parse( zohoStudentForm.getDateOfBirth(), birthDateFormatter )  );
				}catch(Exception e) { }
				
				try {
					firstStudent = processStudent(studentModel, program.getId(), school, guardians, activate);
				}catch( Exception e ) {
					processed = false;
				}
			}
			if( zohoStudentForm.getTwoChildFirstName() != null && zohoStudentForm.getTwoChildLastName() != null && 
					!zohoStudentForm.getTwoChildFirstName().isEmpty() && !zohoStudentForm.getTwoChildLastName().isEmpty() ) {
				studentModel = new StudentModel();
				studentModel.setFirstName( zohoStudentForm.getTwoChildFirstName() );
				studentModel.setLastName( zohoStudentForm.getTwoChildLastName() );
				studentModel.setAllergies( zohoStudentForm.getTwoAllergies() );
				studentModel.setDefaultWeeklyBillingType( getBillingRecordType( zohoStudentForm.getEnrollmentType() ) );
				studentModel.setGrade( zohoStudentForm.getTwoGrade() );
				studentModel.setTeachersName( zohoStudentForm.getTwoTeacherName() );
				studentModel.setSex( getSex( zohoStudentForm.getTwoSex() )  );
				studentModel.setNoPhoto( processNoPhoto( zohoStudentForm.getNoPhoto() ) );
				studentModel.setIsCCPS( isCCPSRate );
				try {
					studentModel.setDateOfBirth( LocalDate.parse( zohoStudentForm.getDateOfBirth(), birthDateFormatter )  );
				}catch(Exception e) { }
				
				try {
					Student student = processStudent(studentModel, program.getId(), school, guardians, activate );
					if( firstStudent == null ) {
						firstStudent= student;
					}
				}catch( Exception e ) {
					processed = false;
				}
			}
			if( zohoStudentForm.getThreeChildFirstName() != null && zohoStudentForm.getThreeChildLastName() != null && 
					!zohoStudentForm.getThreeChildFirstName().isEmpty() && !zohoStudentForm.getThreeChildLastName().isEmpty() ) {
				studentModel = new StudentModel();
				studentModel.setFirstName( zohoStudentForm.getThreeChildFirstName() );
				studentModel.setLastName( zohoStudentForm.getThreeChildLastName() );
				studentModel.setAllergies( zohoStudentForm.getThreeAllergies() );
				studentModel.setDefaultWeeklyBillingType( getBillingRecordType( zohoStudentForm.getEnrollmentType() ) );
				studentModel.setGrade( zohoStudentForm.getThreeGrade() );
				studentModel.setTeachersName( zohoStudentForm.getThreeTeacherName() );
				studentModel.setSex( getSex( zohoStudentForm.getThreeSex() )  );
				studentModel.setNoPhoto( processNoPhoto( zohoStudentForm.getNoPhoto() ) );
				studentModel.setIsCCPS( isCCPSRate );
				try {
					studentModel.setDateOfBirth( LocalDate.parse( zohoStudentForm.getDateOfBirth(), birthDateFormatter )  );
				}catch(Exception e) { }
				
				try {
					Student student = processStudent(studentModel, program.getId(), school, guardians, activate );
					if( firstStudent == null ) {
						firstStudent= student;
					}
				}catch( Exception e ) {
					processed = false;
				}
			}
			if( zohoStudentForm.getFourChildFirstName() != null && zohoStudentForm.getFourChildLastName() != null && 
					!zohoStudentForm.getFourChildFirstName().isEmpty() && !zohoStudentForm.getFourChildLastName().isEmpty() ) {
				studentModel = new StudentModel();
				studentModel.setFirstName( zohoStudentForm.getFourChildFirstName() );
				studentModel.setLastName( zohoStudentForm.getFourChildLastName() );
				studentModel.setAllergies( zohoStudentForm.getFourAllergies() );
				studentModel.setDefaultWeeklyBillingType( getBillingRecordType( zohoStudentForm.getEnrollmentType() ) );
				studentModel.setGrade( zohoStudentForm.getFourGrade() );
				studentModel.setTeachersName( zohoStudentForm.getFourTeacherName() );
				studentModel.setSex( getSex( zohoStudentForm.getFourSex() )  );
				studentModel.setNoPhoto( processNoPhoto( zohoStudentForm.getNoPhoto() ) );
				studentModel.setIsCCPS( isCCPSRate );
				try {
					studentModel.setDateOfBirth( LocalDate.parse( zohoStudentForm.getDateOfBirth(), birthDateFormatter )  );
				}catch(Exception e) { }
				
				try {
					Student student = processStudent(studentModel, program.getId(), school, guardians, activate );
					if( firstStudent == null ) {
						firstStudent= student;
					}
				}catch( Exception e ) {
					processed = false;
				}
			}
			if( zohoStudentForm.getFiveChildFirstName() != null && zohoStudentForm.getFiveChildLastName() != null && 
					!zohoStudentForm.getFiveChildFirstName().isEmpty() && !zohoStudentForm.getFiveChildLastName().isEmpty() ) {
				studentModel = new StudentModel();
				studentModel.setFirstName( zohoStudentForm.getFiveChildFirstName() );
				studentModel.setLastName( zohoStudentForm.getFiveChildLastName() );
				studentModel.setAllergies( zohoStudentForm.getFiveAllergies() );
				studentModel.setDefaultWeeklyBillingType( getBillingRecordType( zohoStudentForm.getEnrollmentType() ) );
				studentModel.setGrade( zohoStudentForm.getFiveGrade() );
				studentModel.setTeachersName( zohoStudentForm.getFiveTeacherName() );
				studentModel.setSex( getSex( zohoStudentForm.getFiveSex() )  );
				studentModel.setNoPhoto( processNoPhoto( zohoStudentForm.getNoPhoto() ) );
				studentModel.setIsCCPS( isCCPSRate );
				try {
					studentModel.setDateOfBirth( LocalDate.parse( zohoStudentForm.getDateOfBirth(), birthDateFormatter )  );
				}catch(Exception e) { }
				
				try {
					Student student = processStudent(studentModel, program.getId(), school, guardians, activate );
					if( firstStudent == null ) {
						firstStudent= student;
					}
				}catch( Exception e ) {
					processed = false;
				}
			}
		}
		
		if( processed ) {
			if( processFee ) {
				List<BillingTransaction> yearlyRegistrationFee = billingService.findBillingTransaction(firstStudent.getId(), "Yearly Registration Fee", TransactionType.Charge );
				if( yearlyRegistrationFee == null || yearlyRegistrationFee.isEmpty() ) {
					billingService.updateStudentBalance(firstStudent.getId(), program.getId(), new BigDecimal(40).setScale(2, RoundingMode.HALF_UP), null, TransactionType.Charge, null, null, "Yearly Registration Fee", ZonedDateTime.now(), null, null);
				}
			}
			zohoStudentForm.setProcessed(true);
			zohoStudentForm.setFailedToProcess(false);
		}else {
			zohoStudentForm.setProcessed(true);
			zohoStudentForm.setFailedToProcess(true);
		}
		
		
		zohoStudentFormRepository.save(zohoStudentForm);
	}
	
	public AfterSchoolProgram getProgram( String location ) {
		switch(location) {
			case "SCC":
				return afterSchoolProgramRepository.findById( 1l ).orElse(null);
			case "OES":
				return afterSchoolProgramRepository.findById( 6l ).orElse(null);
			case "PME":
				return afterSchoolProgramRepository.findById( 2l ).orElse(null);
			case "PES":
				return afterSchoolProgramRepository.findById( 3l ).orElse(null);
			case "SPE":
				return afterSchoolProgramRepository.findById( 4l ).orElse(null);
			case "EES":
				return afterSchoolProgramRepository.findById( 5l ).orElse(null);
			case "VES":
				return afterSchoolProgramRepository.findById( 7l ).orElse(null);
		}
		return null;
	}
	
	public Sex getSex( String sexString ) {
		if( sexString != null ) {
			switch( sexString.toLowerCase() ) {
				case "male":
					return Sex.MALE;
				case "female":
					return Sex.FEMALE;
			}
		}
		return null;
	}
	
	public BillingRecordType getBillingRecordType( String enrollmentType ) {
		if( enrollmentType != null ) {
			switch( enrollmentType ) {
				case "After School Only (Full-Time 4 to 5 days)":
					return BillingRecordType.FOUR_TO_FIVE_DAYS;
				case "Before/After School (Full-Time 4 to 5 days)":
					return BillingRecordType.FOUR_TO_FIVE_DAYS_BEFORE_AND_AFTER;
				case "Morning Only":
					return BillingRecordType.MORNING;
				case "After School (Part-Time 2 to 3 days)":
					return BillingRecordType.TWO_TO_THREE_DAYS;
				case "Before/After School (Part-Time 2 to 3 days)":
					return BillingRecordType.TWO_TO_THREE_DAYS_BEFORE_AND_AFTER;
				case "1 day a week":
					return BillingRecordType.DAILY_RATE;
				case "2 days a week":
					return BillingRecordType.TWO_DAY;
				case "3 days a week":
					return BillingRecordType.THREE_DAY;
				case "4 days a week":
					return BillingRecordType.FOUR_DAY;
				case "5 days a week":
					return BillingRecordType.FIVE_DAY;
				case "1 day a week, 2 days a week, 3 days a week, 4 days a week, 5 days a week":
					return BillingRecordType.DAILY_RATE;
			}
		}
		return null;
	}
	
	
	private Student processStudent( StudentModel studentModel, Long programId, School school, List<Guardian> guardians, Boolean activate ) {
		List<Student> students = studentRepository.findAll( (root, q, cb) -> {
			q.where( 
					cb.and( 
							cb.equal( cb.upper( root.get( Student_.FIRST_NAME ) ), studentModel.getFirstName().toUpperCase() ),
							cb.equal( cb.upper( root.get( Student_.LAST_NAME ) ), studentModel.getLastName().toUpperCase() ),
							cb.equal( root.get(Guardian_.PROGRAM_ID), programId ) ) );
			return q.getRestriction();
		});
		Student student = new Student();
		if( !students.isEmpty() ) {
			if( students.stream().anyMatch( s -> s.getActive() != null && s.getActive() ) ) {
				student = students.stream().filter( s -> s.getActive() != null && s.getActive() ).findFirst().get();
			}else {
				student = students.iterator().next();
			}
		}
		
		student.setProgramId( programId );
		if( activate || student.getActive() == null ) {
			student.setActive(true);
		}
		student.setAllergies( studentModel.getAllergies() );
		student.setDateOfBirth( studentModel.getDateOfBirth() );
		
		student.setDefaultWeeklyBillingType( studentModel.getDefaultWeeklyBillingType() );
		student.setFirstName( studentModel.getFirstName() );
		student.setLastName( studentModel.getLastName() );
		student.setGrade( studentModel.getGrade() );
		if( school != null ) {
			student.setSchool( school );
			student.setSchoolName( school.getName() );
		}
		student.setSex( studentModel.getSex() );
		student.setTeachersName( studentModel.getTeachersName() );
		student.setGuardians(guardians);
		if( student.getStudentId() == null ) {
			generateStudentId( student );
		}
		if( studentModel.getIsCCPS() != null && 
			studentModel.getIsCCPS() ) {
			student.setBillingPlanId( getProgramCCPSBillingId( programId )  );
		}
		student = studentRepository.save(student);
		studentService.processStudentBillingAccounts( student );
		return student;
	}
	
	
	public void generateStudentId( Student student ) {
		Page<Student> lastStudent = studentRepository.findAll( (root, q, cb) -> {
			return cb.and(
				cb.equal( root.get( Student_.PROGRAM_ID ), student.getProgramId() ),
				cb.notEqual( cb.upper(root.get(Student_.STUDENT_ID)), "X"),
				cb.notEqual( root.get(Student_.STUDENT_ID), "T17139")
			);
		}, PageRequest.of(0, 1, new Sort(Direction.DESC, "studentId")));
		String studentId = "";
		if( lastStudent.hasContent() ) {
			String lastStudentId = lastStudent.getContent().get(0).getStudentId();
			Integer lastId = Integer.valueOf( lastStudentId.replaceAll("\\D", "") );
			lastId++;
			studentId = lastId.toString();
		}else {
			studentId = student.getProgramId()+"001";
		}
		student.setStudentId(studentId);
		student.setRequiresIdCard(true);
	}
	
	public Guardian processGuardian( String firstName, String lastName, String driversLicense, Long programId, String street, String city, String zip, String email, String cellPhone, String workPhone, Relationship relationship ) {
		if( lastName != null && firstName != null ) {
			Guardian guardian = null;
			if( guardian == null ) {
				List<Guardian> guardians = guardianRepository.findAll( (root, q, cb) -> {
					return cb.and( 
						cb.equal(root.get(Person_.FIRST_NAME), firstName ),
						cb.equal(root.get(Person_.LAST_NAME), lastName )
					);
				});
				if( guardians != null && !guardians.isEmpty() ) {
					guardian = guardians.get(0);
				}
			}
			
			String newParentId = "";
			if( guardian == null || guardian.getParentId() == null ) {
				Page<Guardian> lastGuardian = guardianRepository.findAll( (root, q, cb) -> {
					return cb.and(
						cb.equal( root.get( Guardian_.PROGRAM_ID ), programId ),
						cb.notEqual( cb.upper(root.get(Guardian_.PARENT_ID)), "X")
					);
				}, PageRequest.of(0, 1, new Sort(Direction.DESC, "id")));
				if( lastGuardian.hasContent() ) {
					String lastParentId = lastGuardian.getContent().get(0).getParentId();
					Integer lastParentInt = Integer.valueOf( lastParentId.replaceAll("\\D", "") );
					lastParentInt++;
					//lastParentLong ++;
					newParentId = "P"+lastParentInt;
				}else {
					newParentId = "P"+programId+"001";
				}
			}else {
				newParentId.equals( guardian.getParentId() );
			}
			
			
			if( guardian == null ) {
				guardian = new Guardian();
			}
			guardian.setFirstName( firstName );
			guardian.setLastName( lastName );
			guardian.setRelationship(relationship);
			
			if( guardian.getParentId() == null ) {
				guardian.setParentId( newParentId );
			}
			guardian.setDriversLicenseNumber(driversLicense);
			
			if( street != null  ) {
				guardian.setAddress( processAddress( guardian.getAddress(), street, city, zip ) );
			}
			List<Contact> contacts = guardian.getContacts();
			if( contacts == null ) {
				contacts = new ArrayList<>();
			}		
			
			if( cellPhone != null && !cellPhone.trim().isEmpty() ) {
				processContacts( contacts, ContactType.Phone, "Cell", cellPhone );
			}
			if( workPhone != null && !workPhone.trim().isEmpty() ) {
				processContacts( contacts, ContactType.Phone, "Work", workPhone );
			}
			if( email != null && !email.toUpperCase().equals("X") ) {
				processContacts( contacts, ContactType.Email, "Email", email );
			}
			guardian.setContacts(contacts);
			guardian.setProgramId(programId);
			
			
			return guardianRepository.saveAndFlush( guardian );
		}
		return null;
	}
	
//	private processPickUp( String firstName, String lastName, String phone ) {
//		if( lastName != null && firstName != null && 
//			!lastName.trim().isEmpty() && !firstName.trim().isEmpty()  ) {
//			Guardian guardian = null;
//			if( guardian == null ) {
//				List<Guardian> guardians = guardianRepository.findAll( (root, q, cb) -> {
//					return cb.and( 
//						cb.equal(root.get(Person_.FIRST_NAME), firstName ),
//						cb.equal(root.get(Person_.LAST_NAME), lastName )
//					);
//				});
//				if( guardians != null && !guardians.isEmpty() ) {
//					guardian = guardians.get(0);
//				}
//			}
//			
//			if( guardian == null ) {
//				guardian = new Guardian();
//			}
//			
//			List<Contact> contacts = guardian.getContacts();
//			if( contacts == null ) {
//				contacts = new ArrayList<>();
//			}	
//			if( phone != null && !phone.trim().isEmpty() ) {
//				processContacts( contacts, ContactType.Phone, "Cell", phone );
//			}
//			guardian.setFirstName( firstName );
//			guardian.setLastName( lastName );
//			guardian.setRelationship(Relationship.);
//			guardian.setContacts(contacts);
//			guardian.setProgramId(programId);
//			
//			
//			return guardianRepository.saveAndFlush( guardian );
//			
//		}
//		
//		return null;
//	}
	
	
	private List<Contact> processContacts( List<Contact> contacts, ContactType contactType, String label, String contactValue ){
		Contact contact = contacts.stream().filter( c -> label.equals( c.getLabel() ) ).findFirst().orElse( null );
		if( contact == null ) {
			contact = new Contact();
			contact.setContactType(contactType);
			contact.setContactValue(contactValue);
			contact.setLabel(label);
			contacts.add(contact);
		}else {
			contact.setContactType(contactType);
			contact.setContactValue(contactValue);
			contact.setLabel(label);
		}
		return contacts;
	}
	
	private Address processAddress( Address address, String street, String city, String zip ) {
		if( address == null ) {
			address = new Address();
		}
		address.setStreet( street );
		address.setFullAddress( city );
		address.setState( "FL" );
		address.setZipcode( zip );
		return address;
	}
	
	private Boolean processNoPhoto( String noPhoto ) {
		if( noPhoto != null ) {
			if( noPhoto.trim().isEmpty() ) {
				return false;
			}else {
				String noPhotoLower = noPhoto.trim().toLowerCase();
				if( noPhotoLower.equals("true") ) {
					return true;
				}else if( noPhotoLower.equals("photo/video not allowed") ) {
					return true;
				}
			}
			
			
		}
		return false;
	}
	
	private School getSchool( String schoolName, Long programId ) {
		if( schoolName != null && !schoolName.trim().isEmpty() ) {
			School school = schoolService.findFirstProgramSchool(programId, schoolName );
			if( school == null ) {
				school = new School();
				school.setProgramId(programId);
				school.setName( schoolName );
				school = schoolService.saveSchool( school );
			}
			return school;
		}
		return null;
	}
	
	private Long getProgramCCPSBillingId( Long programId ) {
		List<BillingPlan> ccpsBillingPlans = billingPlanRepository.findAll( (root, q, cb) -> {
			return cb.and(  
				cb.equal( root.get(BillingPlan_.PROGRAM_ID), programId),
				cb.equal( root.get(BillingPlan_.SPECIALIZED_BILLING_PLAN), SpecializedBillingPlan.CCPSRate)	
			);
		});
		if( ccpsBillingPlans != null && !ccpsBillingPlans.isEmpty() ) {
			return ccpsBillingPlans.iterator().next().getId();
		}
		return 0l;
	}
	
}
