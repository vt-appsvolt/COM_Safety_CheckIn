package com.myspartansoftware.login.stripe.repository;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.myspartansoftware.login.stripe.domian.StripeCustomer;


@Repository("stripeCustomerRepository")
public interface StripeCustomerRepository extends JpaRepository<StripeCustomer, Long>, JpaSpecificationExecutor<StripeCustomer> {

	@Transactional
	void deleteByProgramId(String programId);

	StripeCustomer findByCustomerId(String customerId);

}
