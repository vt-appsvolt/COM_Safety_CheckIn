package com.myspartansoftware.login.stripe.repository;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.myspartansoftware.login.stripe.domian.StripeTransaction;


@Repository("stripeTransactionRepository")
public interface StripeTransactionRepository extends JpaRepository<StripeTransaction, Long>, JpaSpecificationExecutor<StripeTransaction> {

	@Transactional
	void deleteByProgramId(String programId);

	StripeTransaction findByTransactionId(String transactionId);
	

}
