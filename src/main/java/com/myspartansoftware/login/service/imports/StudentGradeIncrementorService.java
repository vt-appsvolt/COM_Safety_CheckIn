package com.myspartansoftware.login.service.imports;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.myspartansoftware.login.domain.Student;
import com.myspartansoftware.login.domain.Student_;
import com.myspartansoftware.login.domain.imports.StudentGradeIncrementor;
import com.myspartansoftware.login.domain.imports.StudentGradeIncrementor_;
import com.myspartansoftware.login.repository.StudentRepository;
import com.myspartansoftware.login.repository.imports.StudentGradeIncrementorRepository;

@Service("studentGradeIncrementorService")
public class StudentGradeIncrementorService {
	
	private StudentGradeIncrementorRepository studentGradeIncrementorRepository;
	private StudentRepository studentRepository;
	
	@Autowired
	public StudentGradeIncrementorService( StudentGradeIncrementorRepository studentGradeIncrementorRepository, StudentRepository studentRepository ) {
		this.studentGradeIncrementorRepository = studentGradeIncrementorRepository;
		this.studentRepository = studentRepository;
	}
	
	public void loadProgramStudents( Long programId ) {
		Pageable page =  PageRequest.of(0, 100);
		Page<Student> students = getStudentPage( programId, page );
		if( students.hasContent() ) {
			do {
				List<StudentGradeIncrementor> studentGradeIncrementors = students.getContent().stream().map( s -> new StudentGradeIncrementor( s.getId(), s.getGrade(), programId) ).collect(Collectors.toList());
				studentGradeIncrementorRepository.saveAll( studentGradeIncrementors );
				students = getStudentPage( programId, PageRequest.of( students.getNumber()+1, 100 ) );
			} while ( students.hasContent() );
		}
	}
	
	public void processStudentGradeIncrement( Long programId, Pageable page ) {
		Page<StudentGradeIncrementor> studentGradeIncrementors = getStudentGradeIncrementor( programId, page );
		if( studentGradeIncrementors.hasContent() ) {
			List<StudentGradeIncrementor> incrementorsToRemove = new ArrayList<>();
			studentGradeIncrementors.getContent().stream().forEach( s -> { 
				Student student = studentRepository.findById( s.getId() ).orElse(null);
				if( student != null ) {
					student.setGrade(  incrementGrade( student.getGrade() )  );
					studentRepository.save(student);
					incrementorsToRemove.add(s);
				}
			});
			studentGradeIncrementorRepository.deleteAll(incrementorsToRemove);
		}
	}
	
	private Page<Student> getStudentPage( Long programId, Pageable page ){
		return studentRepository.findAll( (root, q, cb) -> {
			return cb.equal(root.get(Student_.PROGRAM_ID), programId );
		}, page );
	}

	private Page<StudentGradeIncrementor> getStudentGradeIncrementor( Long programId, Pageable page ){
		return studentGradeIncrementorRepository.findAll( (root, q, cb) -> {
			return cb.equal(root.get(StudentGradeIncrementor_.PROGRAM_ID), programId );
		}, page );
	}
	
	private String incrementGrade( String currentGrade ) {
		if( currentGrade != null ) {
			switch ( currentGrade ) {
				case "K":
					return "1";
				case "1":
					return "2";
				case "2":
					return "3";
				case "3":
					return "4";
				case "4":
					return "5";
				case "5":
					return "6";
				case "6":
					return "7";
				case "7":
					return "8";
				case "8":
					return "9";
				case "9":
					return "10";
				default:
					break;
			}
		}
		return currentGrade;
	}
	
}
