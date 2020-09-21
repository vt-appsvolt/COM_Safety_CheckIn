package com.myspartansoftware.login.repository.imports;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.myspartansoftware.login.domain.imports.StudentParentExcelV2;

@Repository
public interface StudentParentExcelV2Repository extends JpaRepository<StudentParentExcelV2, Long>, JpaSpecificationExecutor<StudentParentExcelV2> {

}
