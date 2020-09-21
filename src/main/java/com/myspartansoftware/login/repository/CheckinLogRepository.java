package com.myspartansoftware.login.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.myspartansoftware.login.domain.CheckinLog;

@Repository("checkinLogRepository")
public interface CheckinLogRepository extends JpaRepository<CheckinLog, Long>, JpaSpecificationExecutor<CheckinLog>{

}
