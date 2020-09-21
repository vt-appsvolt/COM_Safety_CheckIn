package com.myspartansoftware.login.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.myspartansoftware.login.domain.AfterSchoolProgram;
import com.myspartansoftware.login.repository.AfterSchoolProgramRepository;

@Service("afterSchoolProgramService")
public class AfterSchoolProgramService {

	private AfterSchoolProgramRepository afterSchoolProgramRepository;
	
	@Autowired 
	public AfterSchoolProgramService( AfterSchoolProgramRepository afterSchoolProgramRepository ) {
		this.afterSchoolProgramRepository = afterSchoolProgramRepository;
	}
	
	public void saveAfterSchoolProgramRepository( AfterSchoolProgram afterSchoolProgram ) {
		afterSchoolProgramRepository.save(afterSchoolProgram);
	}
	
	public Page<AfterSchoolProgram> getAfterSchoolPrograms( Pageable pageable ){
		return afterSchoolProgramRepository.findAll(pageable);
	}
	
	public Optional<AfterSchoolProgram> findAfterSchoolProgram( Long id ) {
		return afterSchoolProgramRepository.findById(id);
	}
	
}
