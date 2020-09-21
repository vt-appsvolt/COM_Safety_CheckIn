package com.myspartansoftware.login.domain.imports;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.Data;

@Data
@Entity
@Table(name="student_parent_excel")
public class StudentParentExcel {
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private Long id;
	
	@Column(name="first_name")
	private String firstName;
	
	@Column(name="last_name")
	private String lastName;
	
	@Column(name="student_id")
	private String studentId;
	
	@Column(name="grade")
	private String grade;

	@Column(name="first_parent_first_name")
	private String firstParentFirstName;
	
	@Column(name="first_parent_last_name")
	private String firstParentLastName;
	
	@Column(name="first_parent_number")
	private String firstParentNumber;
	
	@Column(name="second_parent_first_name")
	private String secondParentFirstName;
	
	@Column(name="second_parent_last_name")
	private String secondParentLastName;
	
	@Column(name="second_parent_number")
	private String secondParentNumber;
	
	@Column(name="program_id")
	private Long programId;
	
	@Column(name="school_name")
	private String schoolName;
	
}
