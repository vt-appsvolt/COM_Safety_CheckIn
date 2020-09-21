package com.myspartansoftware.login.domain.imports;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name="student_grade_incrementor")
public class StudentGradeIncrementor {

	@Id
    @Column(name = "id")
    private Long id;
	
	@Column(name="grade")
	private String grade;
	
	@Column(name="program_id")
	@NotNull(message = "*Student must be connected to a program")
	private Long programId;
}
