package com.myspartansoftware.login.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import javax.persistence.criteria.Predicate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.myspartansoftware.login.domain.Contact;
import com.myspartansoftware.login.domain.Guardian;
import com.myspartansoftware.login.domain.Guardian_;
import com.myspartansoftware.login.domain.School;
import com.myspartansoftware.login.domain.School_;
import com.myspartansoftware.login.domain.Student;
import com.myspartansoftware.login.domain.Student_;
import com.myspartansoftware.login.domain.billing.FamilyBillingAccount;
import com.myspartansoftware.login.domain.billing.StudentBillingAccount;
import com.myspartansoftware.login.domain.enums.BillingRecordType;
import com.myspartansoftware.login.model.StudentSort;
import com.myspartansoftware.login.repository.GuardianRepository;
import com.myspartansoftware.login.repository.StudentRepository;
import com.myspartansoftware.login.service.billing.BillingService;

@Service("studentService")
public class StudentService {

	private StudentRepository studentRepository;
	private GuardianRepository guardianRepository;
	private ContactService contactService;
	private SchoolService schoolService;
	private BillingService billingService;
	
	@Autowired
	public StudentService(StudentRepository studentRepository, GuardianRepository guardianRepository,
			ContactService contactService, SchoolService schoolService,
			BillingService billingService ) {
		this.studentRepository = studentRepository;
		this.guardianRepository = guardianRepository;
		this.contactService = contactService;
		this.schoolService = schoolService;
		this.billingService = billingService;
	}
	
	public void saveStudent(Student student) {
		Long programId = student.getProgramId();
		if( student.getId() == null && student.getStudentId() != null ) {
			Student existingStudent = findStudentByStudentId(programId, student.getStudentId());
			if( existingStudent != null ) {
				student = mergeExistingStudent( existingStudent, student );
				student.setActive(true);
			}
		}
		
		if( student.getGuardians() != null && !student.getGuardians().isEmpty() ) {
			student.getGuardians().stream().forEach( g -> {
				g.setProgramId(programId);
				saveGuardian(g);
			} );
		}
		if( student.getSchoolName() != null && !student.getSchoolName().isEmpty() ) {
			School school = schoolService.findFirstProgramSchool(student.getProgramId(), student.getSchoolName() );
			if( school == null ) {
				school = new School();
				school.setProgramId(student.getProgramId());
				school.setName( student.getSchoolName() );
				school = schoolService.saveSchool( school );
			}
			student.setSchool(school);
			
		}else {
			student.setSchool(null);
		}
		
		student = studentRepository.saveAndFlush(student);
		processStudentBillingAccounts( student );
	}
	
	public void processStudentBillingAccounts( Student student ) {
		StudentBillingAccount studentBillingAccount = billingService.getStudentBillingAccount( student );
		FamilyBillingAccount familyBillingAccount = studentBillingAccount.getFamilyBillingAccount() != null ? 
					studentBillingAccount.getFamilyBillingAccount() :
					billingService.findOrCreateFamilyBillingAccount(studentBillingAccount);
		if( studentBillingAccount.getFamilyBillingAccount() == null ) {
			studentBillingAccount.setFamilyBillingAccount(familyBillingAccount);
			billingService.saveStudentBillingAccount( studentBillingAccount );
		}
		
		try {
			List<Student> relatedStudents = getRelatedStudents( student );
			if( relatedStudents != null && !relatedStudents.isEmpty() ) {
				relatedStudents.stream().forEach( s -> {
					StudentBillingAccount relatedStudentBillingAccount = billingService.getStudentBillingAccount( s );
					if( relatedStudentBillingAccount.getFamilyBillingAccount() == null ) {
						billingService.linkFamilyAndStudentBillingAccounts(relatedStudentBillingAccount, familyBillingAccount);
					}
				});
			}
		}catch( Exception e) {
			e.printStackTrace();
		}
		
		if( student.getGuardians() != null ) {
			student.getGuardians().stream().forEach( g -> {
				if( g.getFamilyBillingAccountId() == null ) {
					g.setFamilyBillingAccountId(familyBillingAccount.getId());
					saveGuardian(g);
				}
			});
		}
		
	}
	
	public List<Student> getRelatedStudents( Student student ){
		if( student.getGuardians() != null ) {
			List<Long> guardianIds = student.getGuardians().stream().map( g -> g.getId() ).collect(Collectors.toList());
			if( guardianIds != null && !guardianIds.isEmpty() ) {
				return findDependentsByParentIdsAndProgramId(guardianIds, student.getProgramId());
			}
		}
		return new ArrayList<>();
	}
	
	
	public Student mergeExistingStudent( Student existingStudent, Student newStudent ) {
		if( newStudent.getAllergies() != null ) {
			existingStudent.setAllergies( newStudent.getAllergies() );
		}
		if( newStudent.getTeachersName() != null ) {
			existingStudent.setTeachersName( newStudent.getTeachersName() );			
		}
		if( newStudent.getBillingPlanId() != null ) {
			existingStudent.setBillingPlanId(newStudent.getBillingPlanId());
		}
		existingStudent.setFirstName( newStudent.getFirstName() );
		existingStudent.setMiddleName( newStudent.getMiddleName() );
		existingStudent.setLastName( newStudent.getLastName() );
		existingStudent.setGrade( newStudent.getGrade() );
		existingStudent.setSchoolName( newStudent.getSchoolName() );
		existingStudent.setSex( newStudent.getSex() );
		//TODO: Maybe run merge function??
		existingStudent.setGuardians( newStudent.getGuardians() );
		newStudent.setGuardians(null);
		return existingStudent;
	}
	
	public Guardian findGuardian( Long guardianId ) {
		return guardianRepository.findById(guardianId).orElse(null);
	}
	
	
	public void saveGuardian( Guardian guardian ) {
		if( guardian.getId() == null && guardian.getParentId() != null ) {
			Guardian existingGuardian = findByParentIdAndProgramId( guardian.getParentId(), guardian.getProgramId() );
			guardian = mergeExistingGuardian( existingGuardian, guardian );
		}
		if( guardian.getContacts() != null && !guardian.getContacts().isEmpty() ) {
			guardian.getContacts().stream().forEach( c -> contactService.saveContact(c) );
		}
		guardianRepository.save(guardian);
	}
	
	public Guardian mergeExistingGuardian( Guardian existingGuardian, Guardian newGuardian ) {
		if( newGuardian.getFamilyBillingAccountId() != null ) {
			existingGuardian.setFamilyBillingAccountId( newGuardian.getFamilyBillingAccountId() );
		}
		existingGuardian.setFirstName( newGuardian.getFirstName() );
		existingGuardian.setLastName( newGuardian.getLastName() );
		existingGuardian.setRelationship( newGuardian.getRelationship() );
		//TODO: Map out all guardian fields
		
		if( newGuardian.getContacts() != null && !newGuardian.getContacts().isEmpty() ) {
			newGuardian.getContacts().stream().forEach( c -> {
				if( existingGuardian.getContacts() == null ) {
					existingGuardian.setContacts( new ArrayList<Contact>() );
				}
				if( existingGuardian.getContacts().stream().noneMatch( gc -> gc.getContactValue().equals( c.getContactValue() ) ) ) {
					existingGuardian.getContacts().add( c );
				}
			});
		}
		
		
		return existingGuardian;
	}

	public Guardian findByParentIdAndProgramId( String parentId, Long programId ) {
		List<Guardian> guardians = guardianRepository.findAll( (root, q, cb) -> {
			q.where( cb.and( cb.equal(root.get( Guardian_.PARENT_ID), parentId), cb.equal( root.get(Guardian_.PROGRAM_ID), programId ) ) );
			return q.getRestriction();
		});
		//TODO: alert that there are more that one guardian id
		return guardians != null && !guardians.isEmpty() ? guardians.iterator().next() : null;
	}
	
	
	public List<Student> findDependentsByParentIdAndProgramId( String parentId, Long programId ) {
		return studentRepository.findAll( (root, q, cb) -> {
			q.where( 
					cb.and( cb.equal( root.join( Student_.guardians).get(Guardian_.PARENT_ID), parentId), cb.equal( root.get(Guardian_.PROGRAM_ID), programId ) ) );
			return q.getRestriction();
		});
	}
	
	public List<Student> findDependentsByParentIdsAndProgramId( List<Long> parentIds, Long programId ) {
		return studentRepository.findAll( (root, q, cb) -> {
			q.where( 
					cb.and( root.join( Student_.guardians).get(Guardian_.ID).in(parentIds), cb.equal( root.get(Guardian_.PROGRAM_ID), programId ) ) );
			return q.getRestriction();
		});
	}
	
	public Student findStudentByStudentId( Long programId, String studentId) {
		List<Student> students = studentRepository.findAll( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			andPredicate.add(
				cb.equal(root.get(Student_.programId), programId)
			);
			andPredicate.add(
					cb.equal(root.get(Student_.studentId), studentId)
				);
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			return q.getRestriction();
		});
		//TODO: alert that there are more than one student with a student id if multiple are present
		if( students != null && students.stream().anyMatch( s -> s.getActive() != null && s.getActive() ) ) {
			return students.stream().filter( s -> s.getActive() != null && s.getActive() ).findFirst().orElse(null);
		}
		return students != null && !students.isEmpty() ? students.iterator().next() : null;
	}
	
	public Student findStudentById( Long studentId ) {
		return studentRepository.findById( studentId ).orElse(null);
	}

	public Page<Student> findStudents(Long programId, Boolean showInactive, String search, String filter, StudentSort studentSort, Pageable pageable) {
		List<Long> billingPlanIds = new ArrayList<>();
		if( filter != null ) {
			billingPlanIds.addAll( billingService.findBillingPlanIdsByFilter( programId, filter ) );
		}
		if( filter != null && Arrays.asList("CCPS","SCHOLARSHIP","ELC","DEFAULT_RATE").contains( filter ) && billingPlanIds.isEmpty() ) {
			return Page.empty(pageable);
		}
		
		return studentRepository.findAll( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			if( search != null && !search.trim().isEmpty() ) {
				final String[] searchStrings = search.trim().split(" ");
				for( String searchString : searchStrings ) {
					if( searchString.length() == 1 ) {
						andPredicate.add(
							cb.equal(root.get(Student_.GRADE), searchString)
						);
					}else{
						String tokenizedSearch = TokenizerUtility.startsWith( searchString.toUpperCase() );
						andPredicate.add(
							cb.or(
								cb.like( root.get(Student_.firstName), tokenizedSearch),
								cb.like( root.get(Student_.middleName), tokenizedSearch),
								cb.like( root.get(Student_.lastName), tokenizedSearch),
								cb.like( root.get(Student_.STUDENT_ID), tokenizedSearch),
								cb.like( root.get(Student_.SCHOOL).get(School_.NAME), tokenizedSearch)
							)
						);	
					}
				}				
			}
			andPredicate.add(
				cb.equal(root.get(Student_.programId), programId)
			);
			if( filter != null ) {
				switch( filter ) {
					case "INACTIVE_STUDENTS":
						andPredicate.add(
							cb.isFalse(root.get(Student_.active) )
						);
						break;
					case "ALL_STUDENTS":
						break;
					case "MORNING_STUDENTS":
						andPredicate.add(  
							root.get( Student_.DEFAULT_WEEKLY_BILLING_TYPE ).in( Arrays.asList( BillingRecordType.MORNING, BillingRecordType.TWO_TO_THREE_DAYS_BEFORE_AND_AFTER, BillingRecordType.FOUR_TO_FIVE_DAYS_BEFORE_AND_AFTER ) )
						);
						andPredicate.add(
							cb.isTrue(root.get(Student_.active) )
						);
						break;
					case "CCPS":
					case "SCHOLARSHIP":
					case "ELC":
						andPredicate.add(  root.get(Student_.BILLING_PLAN_ID).in( billingPlanIds ) );
						andPredicate.add(
							cb.isTrue(root.get(Student_.active) )
						);
						break;
					case "DEFAULT_RATE":
						andPredicate.add( 
							cb.or( 
								cb.isNull( root.get(Student_.BILLING_PLAN_ID) ),
								root.get(Student_.BILLING_PLAN_ID).in( billingPlanIds )
							)
						);
						andPredicate.add(
							cb.isTrue(root.get(Student_.active) )
						);
						break;
					case "ACTIVE_STUDENTS":
					default:
						andPredicate.add(
							cb.isTrue(root.get(Student_.active) )
						);
						break;
				}
				
			}else if( showInactive == null || !showInactive ) {
				andPredicate.add(
						cb.isTrue(root.get(Student_.active) )
				);
			}
			
//			Path<Object> path = root.get(Student_.STUDENT_ID); // field to map with sub-query
//			
//			Subquery<ActiveCheckin> sq = q.subquery(ActiveCheckin.class);
//			Root<ActiveCheckin> activeCheckin = sq.from(ActiveCheckin.class);
//			sq.select(activeCheckin.get("studentId")); // field to map with main-query
//			sq.where(cb.and(cb.equal( activeCheckin.get(ActiveCheckin_.PROGRAM_ID), programId) ));
//
//			andPredicate.add(cb.not( cb.in(path).value(sq) ));
//			
//			 Subquery<ActiveCheckin> sq = q.subquery(ActiveCheckin.class);
//	            Root<ActiveCheckin> activeCheckin = sq.from(ActiveCheckin.class);
//	            sq.where( cb.equal(activeCheckin.get("programId"), programId ), cb.equal( activeCheckin.get( ActiveCheckin_.STUDENT ).get(Student_.STUDENT_ID), root.get(Student_.STUDENT_ID ) ) );
//	            
//	        andPredicate.add( cb.isNull( sq ) );
			
			if( studentSort != null ) {
				switch( studentSort ) {
					case GradeAsc:
						q.orderBy( cb.asc( root.get(Student_.GRADE) ) );
						break;
					case GradeDesc:
						q.orderBy( cb.desc( root.get(Student_.GRADE) ) );
						break;
					case LastNameAsc:
						q.orderBy( cb.asc( root.get(Student_.LAST_NAME) ) );
						break;
					case LastNameDesc:
						q.orderBy( cb.desc( root.get(Student_.LAST_NAME) ) );
						break;
					case SchoolAsc:
						q.orderBy( cb.asc( root.get(Student_.SCHOOL).get(School_.NAME) ) );
						break;
					case SchoolDesc:
						q.orderBy( cb.desc( root.get(Student_.SCHOOL).get(School_.NAME ) ) );
						break;
					default:
						break;
				}
			}
			
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			return q.getRestriction();
			
			
		}, pageable );
	}
}
