package com.myspartansoftware.login.stripe.repository;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.myspartansoftware.login.stripe.domian.StripeCustomerCharge;

@Repository("stripeCustomerChargeRepository")
public interface StripeCustomerChargeRepository extends JpaRepository<StripeCustomerCharge, Long>, JpaSpecificationExecutor<StripeCustomerCharge> {

	@Transactional
	void deleteByProgramId(String programId);

	StripeCustomerCharge findByChargeId(String chargeId);

}
