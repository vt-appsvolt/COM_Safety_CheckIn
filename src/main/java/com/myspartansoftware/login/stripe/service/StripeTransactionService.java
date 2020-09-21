package com.myspartansoftware.login.stripe.service;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.criteria.Predicate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.myspartansoftware.login.stripe.domian.StripeTransaction;
import com.myspartansoftware.login.stripe.domian.StripeTransaction_;
import com.myspartansoftware.login.stripe.repository.StripeTransactionRepository;

@Service("stripeTransactionService")
public class StripeTransactionService {

	@Autowired
	private StripeTransactionRepository stripeTransactionRepository;

	public void saveAll(List<StripeTransaction> stripeTransactions) {
		stripeTransactionRepository.saveAll(stripeTransactions);
	}

	public void deleteByProgramId(String programId) {
		stripeTransactionRepository.deleteByProgramId(programId);		
	}

	public StripeTransaction findByTransactionId(String transactionId) {
		return stripeTransactionRepository.findByTransactionId(transactionId);
	}
	
	public void save(StripeTransaction stripeTransaction) {
		stripeTransactionRepository.save(stripeTransaction);
	}

	public Page<StripeTransaction> findTransactionsWithinDateRange(Long programId, ZonedDateTime startDate,
			ZonedDateTime endDate, List<String> paymentTypes, Pageable pageable ) {
		return stripeTransactionRepository.findAll( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			andPredicate.add( cb.equal( root.get(StripeTransaction_.PROGRAM_ID), programId) );
			andPredicate.add( cb.greaterThanOrEqualTo( root.get(StripeTransaction_.CREATED), startDate ) );
			andPredicate.add( cb.lessThanOrEqualTo( root.get(StripeTransaction_.CREATED), endDate ) );
			
			andPredicate.add( cb.equal( root.get(StripeTransaction_.PROGRAM_ID), programId) );
			if( paymentTypes != null ) {
				andPredicate.add( root.get(StripeTransaction_.TYPE).in(paymentTypes) );				
			}
			
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			return q.getRestriction();
		}, pageable);
	}
}
