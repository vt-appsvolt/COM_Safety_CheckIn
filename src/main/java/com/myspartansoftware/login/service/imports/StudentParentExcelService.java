package com.myspartansoftware.login.service.imports;

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
import com.myspartansoftware.login.domain.Contact;
import com.myspartansoftware.login.domain.Contact.ContactType;
import com.myspartansoftware.login.domain.Guardian;
import com.myspartansoftware.login.domain.Guardian.Relationship;
import com.myspartansoftware.login.domain.Guardian_;
import com.myspartansoftware.login.domain.Person_;
import com.myspartansoftware.login.domain.School;
import com.myspartansoftware.login.domain.Student;
import com.myspartansoftware.login.domain.Student_;
import com.myspartansoftware.login.domain.imports.StudentParentExcel;
import com.myspartansoftware.login.domain.imports.StudentParentExcelV2;
import com.myspartansoftware.login.repository.AddressRepository;
import com.myspartansoftware.login.repository.GuardianRepository;
import com.myspartansoftware.login.repository.StudentRepository;
import com.myspartansoftware.login.repository.imports.StudentParentExcelRepository;
import com.myspartansoftware.login.repository.imports.StudentParentExcelV2Repository;
import com.myspartansoftware.login.service.SchoolService;
import com.myspartansoftware.login.service.StudentService;

@Service("studentParentExcelService")
public class StudentParentExcelService {

	private StudentParentExcelRepository studentParentExcelRepository;
	private StudentParentExcelV2Repository studentParentExcelV2Repository;
	private AddressRepository addressRepository;
	private StudentRepository studentRepository;
	private GuardianRepository guardianRepository;
	private StudentService studentService;
	private SchoolService schoolService;
	
	@Autowired
	public StudentParentExcelService( StudentParentExcelRepository studentParentExcelRepository,
			StudentParentExcelV2Repository studentParentExcelV2Repository,
			AddressRepository addressRepository,
			StudentRepository studentRepository,
			GuardianRepository guardianRepository,
			StudentService studentService,
			SchoolService schoolService) {
		this.studentParentExcelRepository = studentParentExcelRepository;
		this.studentParentExcelV2Repository = studentParentExcelV2Repository;
		this.addressRepository = addressRepository;
		this.studentRepository = studentRepository;
		this.guardianRepository = guardianRepository;
		this.studentService = studentService;
		this.schoolService = schoolService;
	}
	
	
	public void processExcel( Pageable pageable ) {
		Page<StudentParentExcel> excelPage = studentParentExcelRepository.findAll(pageable);
		List<StudentParentExcel> processed = new ArrayList<>();
		
		if( excelPage.hasContent() ) {
			for( StudentParentExcel excelEntry : excelPage.getContent() ) {
				Long programId = excelEntry.getProgramId();
				try {
					Student student = studentRepository.findOne( (root, q, cb ) ->{
						return cb.and(
								cb.equal( root.get(Student_.STUDENT_ID), excelEntry.getStudentId() ),
								cb.equal( root.get(Student_.PROGRAM_ID), programId)
						);
					}).orElse(null);
					if( student == null ) {
						List<Student> studentsByName = studentRepository.findAll( (root, q, cb ) ->{
							return cb.and(
									cb.and( 
										cb.equal( root.get(Student_.FIRST_NAME), excelEntry.getFirstName() ),
										cb.equal( root.get(Student_.LAST_NAME), excelEntry.getLastName() )
									),
									cb.equal( root.get(Student_.PROGRAM_ID), programId)
							);
						});
						if( studentsByName != null && !studentsByName.isEmpty() ) {
							student = studentsByName.get(0);
						}
					}
					
					
					if( student == null ) {
						student = processStudent( excelEntry.getFirstName(), excelEntry.getLastName(), excelEntry.getStudentId(), excelEntry.getGrade(), excelEntry.getProgramId(), excelEntry.getSchoolName() );
					}
					if( student != null && 
						student.getGuardians() != null &&
						!student.getGuardians().isEmpty()
					) {
						student.setActive( true );
						student = studentRepository.saveAndFlush(student);
						processed.add(excelEntry);
					}else if( student != null ) {
						student.setActive(true);
						
						List<Guardian> guardians = new ArrayList<>();
						Guardian guardian = processGuardian( excelEntry.getFirstParentFirstName(), excelEntry.getFirstParentLastName(), excelEntry.getFirstParentNumber(), student.getProgramId() );
						if( guardian != null ) {
							guardians.add(guardian);
						}
						guardian = processGuardian( excelEntry.getSecondParentFirstName(), excelEntry.getSecondParentLastName(), excelEntry.getSecondParentNumber(), student.getProgramId() );
						if( guardian != null ) {
							guardians.add(guardian);
						}
						if( !guardians.isEmpty() ) {
							if( student.getGuardians() == null ) {
								student.setGuardians(guardians);
							}else {
								student.getGuardians().addAll(guardians);
							}
							student = studentRepository.saveAndFlush(student);
						}
						processed.add(excelEntry);
						studentService.processStudentBillingAccounts( student );
					}
				}catch( Exception e) {
					e.printStackTrace();
				}
			}
		}
		
		if( !processed.isEmpty() ) {
			studentParentExcelRepository.deleteAll(processed);				
		}
	}
	
	public void processExcelV2( Pageable pageable ) {
		Page<StudentParentExcelV2> excelPage = studentParentExcelV2Repository.findAll(pageable);
		List<StudentParentExcelV2> processed = new ArrayList<>();
		
		if( excelPage.hasContent() ) {
			for( StudentParentExcelV2 excelEntry : excelPage.getContent() ) {
				Long programId = excelEntry.getProgramId();
				try {
					List<Student> students = studentRepository.findAll( (root, q, cb ) ->{
						return cb.and(
								cb.equal( root.get(Student_.STUDENT_ID), excelEntry.getStudentId() ),
								cb.equal( root.get(Student_.PROGRAM_ID), programId)
						);
					});
					
					
					Student student = null;
					if( !students.isEmpty() ) {
						student = students.stream().filter( s -> s.getActive() != null && s.getActive() ).findFirst().orElse( students.iterator().next() );
					}
					
					if( student == null ) {
						List<Student> studentsByName = studentRepository.findAll( (root, q, cb ) ->{
							return cb.and(
									cb.and( 
										cb.equal( root.get(Student_.FIRST_NAME), excelEntry.getFirstName() ),
										cb.equal( root.get(Student_.LAST_NAME), excelEntry.getLastName() )
									),
									cb.equal( root.get(Student_.PROGRAM_ID), programId)
							);
						});
						if( studentsByName != null && !studentsByName.isEmpty() ) {
							student = studentsByName.get(0);
						}
					}
					
					
					if( student == null ) {
						student = processStudent( excelEntry.getFirstName(), excelEntry.getLastName(), excelEntry.getStudentId(), excelEntry.getGrade(), excelEntry.getProgramId(), excelEntry.getSchoolName() );
					}
//					if( student != null && 
//						student.getGuardians() != null &&
//						!student.getGuardians().isEmpty()
//					) {
//						student.setActive( true );
//						student = studentRepository.saveAndFlush(student);
//						processed.add(excelEntry);
//					}else 
					if( student != null ) {
						student.setActive(true);
						
						List<Guardian> guardians = new ArrayList<>();
						Guardian guardian = processGuardian( excelEntry.getFirstParentFirstName(), excelEntry.getFirstParentLastName(), excelEntry.getFirstParentNumber(), student.getProgramId(), excelEntry.getFirstParentAddress(), excelEntry.getFirstParentEmail(), excelEntry.getFirstParentPhone(), Relationship.Mother );
						if( guardian != null ) {
							guardians.add(guardian);
						}
						guardian = processGuardian( excelEntry.getSecondParentFirstName(), excelEntry.getSecondParentLastName(), excelEntry.getSecondParentNumber(), student.getProgramId(), excelEntry.getFirstParentAddress(), null, excelEntry.getSecondParentPhone(), Relationship.Father );
						if( guardian != null ) {
							guardians.add(guardian);
						}
						if( !guardians.isEmpty() ) {
							student.setGuardians(guardians);
//							if( student.getGuardians() == null ) {
//								student.setGuardians(guardians);
//							}else {
//								student.getGuardians().addAll(guardians);
//							}
						}
						student = studentRepository.saveAndFlush(student);
						processed.add(excelEntry);
						studentService.processStudentBillingAccounts( student );
					}
				}catch( Exception e) {
					e.printStackTrace();
				}
			}
		}
		
		if( !processed.isEmpty() ) {
			studentParentExcelV2Repository.deleteAll(processed);				
		}
	}
	
	
	
	public Student processStudent(String firstName, String lastName, String studentId, String grade, Long programId, String schoolName) {
		//AfterSchoolProgram afterSchoolProgram = af
		Student student = new Student();
		student.setActive(true);
		student.setFirstName(firstName.trim());
		student.setLastName(lastName.trim());
		student.setGrade(grade.trim());
		student.setStudentId( studentId.trim() );
		student.setSchoolName( schoolName.trim() );
		student.setProgramId(programId);
		if( student.getSchoolName() != null && !student.getSchoolName().isEmpty() ) {
			School school = schoolService.findFirstProgramSchool(programId, schoolName );
			if( school == null ) {
				school = new School();
				school.setProgramId(student.getProgramId());
				school.setName( student.getSchoolName() );
				school = schoolService.saveSchool( school );
			}
			student.setSchool(school);
		}
		student = studentRepository.saveAndFlush(student);
		return student;
	}


	public Guardian processGuardian( String firstName, String lastName, String parentId, Long programId ) {
		if( !lastName.toUpperCase().equals( "X" ) ) {
			if( parentId.toUpperCase().equals("X") ) {
				List<Guardian> guardians = guardianRepository.findAll( (root, q, cb) -> {
					return cb.and( 
						cb.equal(root.get(Person_.FIRST_NAME), firstName ),
						cb.equal(root.get(Person_.LAST_NAME), lastName )
					);
				});
				if( guardians != null && !guardians.isEmpty() ) {
					return guardians.get(0);
				}
			}
			if( parentId.toUpperCase().equals("X") ){
				//String lastParentId = "";
				Page<Guardian> lastGuardian = guardianRepository.findAll( (root, q, cb) -> {
					return cb.and(
						cb.equal( root.get( Guardian_.PROGRAM_ID ), programId ),
						cb.notEqual( cb.upper(root.get(Guardian_.PARENT_ID)), "X")
					);
				}, PageRequest.of(0, 1, new Sort(Direction.DESC, "id")));
				if( lastGuardian.hasContent() ) {
					Long lastParentLong = lastGuardian.getContent().get(0).getId();
					//Integer lastParentInt = Integer.valueOf( lastParentId.replace("P", "").replace("-", "") );
					//Integer lastParentInt = lastGuardian.getContent()
					lastParentLong ++;
					parentId = "P"+lastParentLong;
				}else {
					parentId = "P"+programId+"001";
				}
			}
			
			Guardian guardian = new Guardian();
			guardian.setFirstName( firstName );
			guardian.setLastName( lastName );
			guardian.setParentId( parentId );
			guardian.setProgramId(programId);
			return guardianRepository.saveAndFlush( guardian );
		}
		return null;
	}
	
	public Guardian processGuardian( String firstName, String lastName, String parentId, Long programId, String address, String email, String phoneNumber, Relationship relationship ) {
		if( !lastName.toUpperCase().equals( "X" ) ) {
			Guardian guardian = null;
			if( !parentId.toUpperCase().equals("X")) {
				List<Guardian> guardians = guardianRepository.findAll( (root, q, cb) -> {
					return cb.and( 
						cb.equal(root.get(Guardian_.PARENT_ID), parentId ),
						cb.equal(root.get(Guardian_.PROGRAM_ID), programId )
					);
				});
				if( guardians != null && !guardians.isEmpty() ) {
					guardian = guardians.get(0);
				}
			}
			if( guardian == null || parentId.toUpperCase().equals("X") ) {
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
			if( parentId.toUpperCase().equals("X") ){
				Page<Guardian> lastGuardian = guardianRepository.findAll( (root, q, cb) -> {
					return cb.and(
						cb.equal( root.get( Guardian_.PROGRAM_ID ), programId ),
						cb.notEqual( cb.upper(root.get(Guardian_.PARENT_ID)), "X"),
						cb.notEqual( root.get(Student_.STUDENT_ID), "T17139")
					);
				}, PageRequest.of(0, 1, new Sort(Direction.DESC, "id")));
				if( lastGuardian.hasContent() ) {
					Long lastParentLong = lastGuardian.getContent().get(0).getId();
					//Integer lastParentInt = Integer.valueOf( lastParentId.replace("P", "").replace("-", "") );
					//Integer lastParentInt = lastGuardian.getContent()
					lastParentLong ++;
					newParentId = "P"+lastParentLong;
				}else {
					newParentId = "P"+programId+"001";
				}
			}else {
				newParentId = parentId;
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
			if( address != null && !address.toUpperCase().equals("X") ) {
				guardian.setAddress( processAddress( guardian.getAddress(), address ) );
			}
			List<Contact> contacts = guardian.getContacts();
			if( contacts == null ) {
				contacts = new ArrayList<>();
			}		
					
			if( phoneNumber != null && !phoneNumber.toUpperCase().equals("X") ) {
				processContacts( contacts, ContactType.Phone, "Phone", phoneNumber );
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
	
	private List<Contact> processContacts( List<Contact> contacts, ContactType contactType, String label, String contactValue ){
		Contact contact = contacts.stream().filter( c -> contactType.equals( c.getContactType() ) ).findFirst().orElse( null );
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
	
	private Address processAddress( Address address, String fullAddress ) {
		if( address == null ) {
			address = new Address();
		}
		address.setFullAddress(fullAddress);
		return address;
	}
	
}
