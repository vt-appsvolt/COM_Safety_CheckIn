package com.myspartansoftware.login.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.myspartansoftware.login.domain.Student;

@Repository("studentRepository")
public interface StudentRepository extends JpaRepository<Student, Long>, JpaSpecificationExecutor<Student>{

	Student findStudentByStudentId(String studentId);

}
