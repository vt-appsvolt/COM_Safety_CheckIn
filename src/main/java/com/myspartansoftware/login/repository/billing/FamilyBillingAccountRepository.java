package com.myspartansoftware.login.repository.billing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.myspartansoftware.login.domain.billing.FamilyBillingAccount;

@Repository
public interface FamilyBillingAccountRepository extends JpaRepository<FamilyBillingAccount, Long>, JpaSpecificationExecutor<FamilyBillingAccount>{

}
