package com.myspartansoftware.login.stripe.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.criteria.Predicate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.myspartansoftware.login.stripe.domian.StripeCustomerCharge;
import com.myspartansoftware.login.stripe.domian.StripeCustomerCharge_;
import com.myspartansoftware.login.stripe.domian.StripeTransaction_;
import com.myspartansoftware.login.stripe.repository.StripeCustomerChargeRepository;

@Service("stripeCustomerChrageService")
public class StripeCustomerChargeService {

	@Autowired
	private StripeCustomerChargeRepository stripeCustomerChargeRepository;

	public void saveAll(List<StripeCustomerCharge> customerCharges) {
		stripeCustomerChargeRepository.saveAll(customerCharges);
	}

	public void deleteByProgramId(String programId) {
		stripeCustomerChargeRepository.deleteByProgramId(programId);
	}

	public StripeCustomerCharge findByChargeId(String chargeId) {
		// TODO Auto-generated method stub
		return stripeCustomerChargeRepository.findByChargeId(chargeId);
	}

	public void save(StripeCustomerCharge customerCharge) {
		stripeCustomerChargeRepository.save(customerCharge);
	}
	
	public Page<StripeCustomerCharge> findStripeCustomerChargesWithinDateRange(Long programId, LocalDateTime startDate,
			LocalDateTime endDate, List<String> statuses, Pageable pageable ) {
		return stripeCustomerChargeRepository.findAll( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			andPredicate.add( cb.equal( root.get(StripeCustomerCharge_.PROGRAM_ID), programId) );
			andPredicate.add( cb.greaterThanOrEqualTo( root.get(StripeCustomerCharge_.CREATED), startDate ) );
			andPredicate.add( cb.lessThanOrEqualTo( root.get(StripeCustomerCharge_.CREATED), endDate ) );
			andPredicate.add( cb.isNull( root.get(StripeCustomerCharge_.REFUNDED)) );
			andPredicate.add( cb.isTrue( root.get(StripeCustomerCharge_.PAID) ));
			andPredicate.add( cb.equal( root.get(StripeTransaction_.PROGRAM_ID), programId) );
			if( statuses != null ) {
				andPredicate.add( root.get(StripeCustomerCharge_.STATUS).in(statuses) );				
			}
			
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			return q.getRestriction();
		}, pageable);
	}
}
