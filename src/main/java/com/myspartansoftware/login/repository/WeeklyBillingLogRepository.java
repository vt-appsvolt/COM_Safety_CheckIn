package com.myspartansoftware.login.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.myspartansoftware.login.domain.WeeklyBillingLog;

@Repository("weeklyBillingLogRepository")
public interface WeeklyBillingLogRepository extends JpaRepository<WeeklyBillingLog, Long>, JpaSpecificationExecutor<WeeklyBillingLog>{

}
