package com.myspartansoftware.login.repository.forms;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.myspartansoftware.login.domain.forms.ZohoStudentForm;

@Repository("zohoStudentFormRepository")
public interface ZohoStudentFormRepository extends JpaRepository<ZohoStudentForm, Long>, JpaSpecificationExecutor<ZohoStudentForm>{

}
