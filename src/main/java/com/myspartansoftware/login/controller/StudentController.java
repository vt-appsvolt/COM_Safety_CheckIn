package com.myspartansoftware.login.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.myspartansoftware.login.domain.ActiveCheckin;
import com.myspartansoftware.login.domain.AfterSchoolProgram;
import com.myspartansoftware.login.domain.Student;
import com.myspartansoftware.login.domain.billing.BillingPlan;
import com.myspartansoftware.login.model.StudentModel;
import com.myspartansoftware.login.model.StudentSort;
import com.myspartansoftware.login.service.CheckinService;
import com.myspartansoftware.login.service.SessionService;
import com.myspartansoftware.login.service.StudentService;
import com.myspartansoftware.login.service.billing.BillingService;
import com.myspartansoftware.login.service.builder.ModelBuilderService;

@RestController
public class StudentController {

	@Autowired 
	private SessionService sessionService;
	@Autowired
	private StudentService studentService;
	@Autowired
	private ModelBuilderService modelBuilderService;
	@Autowired
	private CheckinService checkinService;
	@Autowired
	private BillingService billingService;
	
	@PostMapping("/student.json")
	public ResponseEntity<Student> createStudent( @RequestBody Student student, BindingResult result, HttpServletRequest request ){
		student.setProgramId( sessionService.getActiveProgramId(request) );
		if( student.getActive() == null) {
			student.setActive(true);
		}
		studentService.saveStudent(student);
		return ResponseEntity.ok(student);
	}
	
	@DeleteMapping("/delete/student/{personId}")
	public ResponseEntity<Void> deleteStudent( @PathVariable("personId") Student student) {
		student.setActive(false);
		try {
			studentService.saveStudent(student);
		}catch( Exception e) {
			e.printStackTrace();
		}
		return ResponseEntity.ok().build();
	}
	
	@GetMapping("/student/{personId}")
	public ResponseEntity<StudentModel> findStudent( @PathVariable("personId") Student student) {
		BillingPlan billingPlan = null;
		if( student.getBillingPlanId() != null ) {
			billingPlan = billingService.findBillingPlan( student.getBillingPlanId() );
		}
		return ResponseEntity.ok( modelBuilderService.buildStudentModel(student, billingPlan ) );
	}
	
	@GetMapping("/students")
	public ResponseEntity<Page<StudentModel>> findStudents( 
			@RequestParam(name="search", required=false) String search, 
			@RequestParam(value="studentSort", required=false) StudentSort studentSort,
			@RequestParam(value="showInactive", required=false, defaultValue="false") Boolean showInactive,
			@RequestParam(value="studentsFilter", required=false, defaultValue="ACTIVE_STUDENTS") String studentsFilter,
			HttpServletRequest request, Pageable pageable ){
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		if( activeProgram == null ) {
			return ResponseEntity.badRequest().build();
		}
		Page<Student> studentPage = studentService.findStudents(activeProgram.getId(), showInactive, search, studentsFilter, studentSort, pageable );
		List<StudentModel> studentModelList = new ArrayList<>();
		if( studentPage.hasContent() ) {
			List<ActiveCheckin> activeStudents = checkinService.findByStudentIds( studentPage.getContent().stream().map( s -> s.getStudentId() ).collect(Collectors.toList()), activeProgram.getId());
			for( Student student : studentPage.getContent() ) {
				if( activeStudents.stream().noneMatch( a -> a.getStudent().getStudentId().equals(student.getStudentId() )) ){
					studentModelList.add( 
							modelBuilderService.buildStudentModel(student, activeStudents.stream().anyMatch( a -> a.getStudent().getStudentId().equals(student.getStudentId()) ) ) );
				}
			}
		}
		return ResponseEntity.ok( new PageImpl<>(studentModelList, pageable, studentPage.getTotalElements()) );
	}
	
}
