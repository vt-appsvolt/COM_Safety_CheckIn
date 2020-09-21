package com.myspartansoftware.login.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.myspartansoftware.login.domain.School;

@Repository("schoolRepository")
public interface SchoolRepository extends JpaRepository<School, Long>, JpaSpecificationExecutor<School>{

}
