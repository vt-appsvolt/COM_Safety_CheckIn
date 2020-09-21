package com.myspartansoftware.login.repository.billing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.myspartansoftware.login.domain.billing.BillingTransaction;

@Repository
public interface BillingTransactionRepository extends JpaRepository<BillingTransaction, Long>, JpaSpecificationExecutor<BillingTransaction>{

}
