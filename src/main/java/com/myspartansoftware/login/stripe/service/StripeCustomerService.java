package com.myspartansoftware.login.stripe.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.myspartansoftware.login.stripe.domian.StripeCustomer;
import com.myspartansoftware.login.stripe.domian.StripeCustomer_;
import com.myspartansoftware.login.stripe.repository.StripeCustomerRepository;

@Service("stripeCustomerService")
public class StripeCustomerService {

	@Autowired
	private StripeCustomerRepository stripeCustomerRepository;

	public void saveAll(List<StripeCustomer	> stripeTransactions) {
		stripeCustomerRepository.saveAll(stripeTransactions);
	}

	public void deleteByProgramId(String programId) {
		stripeCustomerRepository.deleteByProgramId(programId);
	}

	public StripeCustomer findByCustomerId(String customerId) {
		return stripeCustomerRepository.findByCustomerId(customerId);
	}

	public void save(StripeCustomer stripeCustomerDomain) {
		stripeCustomerRepository.save(stripeCustomerDomain);
	}
	
	public Page<StripeCustomer> findUnlinkedStripeCustomers( Long programId, Pageable pageable ){
		return stripeCustomerRepository.findAll( ( root, q, cb) -> {
			return cb.and(  
					cb.equal( root.get(StripeCustomer_.PROGRAM_ID), programId),
					cb.isNull( root.get(StripeCustomer_.FAMILY_BILLING_ACCOUNT_ID) )
			);
		}, pageable);
	}
	
}
