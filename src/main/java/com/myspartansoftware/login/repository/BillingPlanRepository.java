package com.myspartansoftware.login.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.myspartansoftware.login.domain.billing.BillingPlan;

@Repository("billingRepository")
public interface BillingPlanRepository extends JpaRepository<BillingPlan, Long>, JpaSpecificationExecutor<BillingPlan>{

}
