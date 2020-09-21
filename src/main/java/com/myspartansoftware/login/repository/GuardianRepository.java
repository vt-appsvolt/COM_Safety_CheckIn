package com.myspartansoftware.login.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.myspartansoftware.login.domain.Guardian;

@Repository("guardianRepository")
public interface GuardianRepository extends JpaRepository<Guardian, Long>, JpaSpecificationExecutor<Guardian> {

}
