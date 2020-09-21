package com.myspartansoftware.login.repository.imports;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.myspartansoftware.login.domain.imports.StudentParentExcel;

@Repository
public interface StudentParentExcelRepository extends JpaRepository<StudentParentExcel, Long>, JpaSpecificationExecutor<StudentParentExcel> {

}
