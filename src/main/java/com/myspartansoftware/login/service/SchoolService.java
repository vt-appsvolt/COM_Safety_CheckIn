package com.myspartansoftware.login.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import javax.persistence.criteria.Predicate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.myspartansoftware.login.domain.School;
import com.myspartansoftware.login.domain.School_;
import com.myspartansoftware.login.repository.SchoolRepository;

@Service("schoolService")
public class SchoolService {

	private SchoolRepository schoolRepository;
	
	@Autowired
	public SchoolService(SchoolRepository schoolRepository) {
		this.schoolRepository = schoolRepository;
	}
	
	public School saveSchool(School school) {
		return schoolRepository.save(school);
	}
	
	public Optional<School> findProgramSchool( Long programId, String schoolName ) {
		return schoolRepository.findOne( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			andPredicate.add(
				cb.equal(root.get(School_.programId), programId)
			);
			andPredicate.add(
					cb.equal(root.get(School_.name), schoolName)
				);
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			return q.getRestriction();
		});
	}
	
	
	public School findFirstProgramSchool( Long programId, String schoolName ) {
		List<School> schools = schoolRepository.findAll( (root, q, cb) -> {
			final List<Predicate> andPredicate = new ArrayList<Predicate>();
			andPredicate.add(
				cb.equal(root.get(School_.programId), programId)
			);
			andPredicate.add(
					cb.equal(root.get(School_.name), schoolName)
				);
			q.where(andPredicate.toArray(new Predicate[andPredicate.size()] ));
			return q.getRestriction();
		});
		if( schools != null && !schools.isEmpty() ) {
			schools.iterator().next();
		}
		return null;
	}
}
