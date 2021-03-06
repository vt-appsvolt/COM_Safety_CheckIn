package com.myspartansoftware.login.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.myspartansoftware.login.domain.billing.BillingRecord;

@Repository("billingRecordRepository")
public interface BillingRecordRepository extends JpaRepository<BillingRecord, Long>, JpaSpecificationExecutor<BillingRecord>{

}
