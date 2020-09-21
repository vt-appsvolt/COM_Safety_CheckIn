package com.myspartansoftware.login.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.myspartansoftware.login.domain.ProgramEmployee;
import com.myspartansoftware.login.domain.ProgramEmployeePK;

@Repository("programEmployeeRepository")
public interface ProgramEmployeeRepository extends JpaRepository<ProgramEmployee, ProgramEmployeePK>, JpaSpecificationExecutor<ProgramEmployee>{

	List<ProgramEmployee> findByUserId(Long id);

}
