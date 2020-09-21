package com.myspartansoftware.login.service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.myspartansoftware.login.domain.EmployeeRole;
import com.myspartansoftware.login.domain.EmployeeRole.EmployeeRoleType;
import com.myspartansoftware.login.domain.EmployeeRolePK_;
import com.myspartansoftware.login.domain.EmployeeRole_;
import com.myspartansoftware.login.domain.ProgramEmployee;
import com.myspartansoftware.login.domain.ProgramEmployee_;
import com.myspartansoftware.login.domain.User;
import com.myspartansoftware.login.repository.EmployeeRoleRepository;
import com.myspartansoftware.login.repository.ProgramEmployeeRepository;

@Service("programEmployeeService")
public class ProgramEmployeeService {

	private ProgramEmployeeRepository programEmployeeRepository;
	private EmployeeRoleRepository employeeRoleRepository;
	
	@Autowired
	public ProgramEmployeeService( ProgramEmployeeRepository programEmployeeRepository, EmployeeRoleRepository employeeRoleRepository ) {
		this.programEmployeeRepository = programEmployeeRepository;
		this.employeeRoleRepository = employeeRoleRepository;
	}
	
	public List<ProgramEmployee> findProgramEmployeesByUser( User user ){
		return programEmployeeRepository.findByUserId( user.getId() );
	}

	public Optional<ProgramEmployee> findByAfterSchoolProgramAndUser(
			Long afterSchoolProgramId, Long userId) {
		return programEmployeeRepository.findOne( (root, q, cb) -> {
			return cb.and(
				cb.equal( root.get(ProgramEmployee_.AFTER_SCHOOL_PROGRAM_ID), afterSchoolProgramId ),
				cb.equal( root.get(ProgramEmployee_.USER_ID), userId )
			);
		});
	}
	
	public List<EmployeeRoleType> findProgramEmployeeRoles( Long afterSchoolProgramId, Long userId) {
		Optional<ProgramEmployee> programEmployee = findByAfterSchoolProgramAndUser(afterSchoolProgramId, userId);
		if( programEmployee.isPresent() ) {
			return findProgramEmployeeRoles( programEmployee.get() );
		}
		return Collections.emptyList();
	}
	
	public List<EmployeeRoleType> findProgramEmployeeRoles( ProgramEmployee programEmployee ){
		return Optional.ofNullable( getEmployeeRoles(programEmployee) ).orElse(Collections.emptyList()).stream()
				.map( r -> r.getId().getRole()).collect( Collectors.toList() );
	}
	
	public List<EmployeeRole> getEmployeeRoles( ProgramEmployee programEmployee ){
		return employeeRoleRepository.findAll( (root, q, cb) -> {
			return cb.and(
					cb.equal( root.get(EmployeeRole_.ID).get(EmployeeRolePK_.EMPLOYEE_ID), programEmployee.getUserId() ),
					cb.equal( root.get(EmployeeRole_.ID).get(EmployeeRolePK_.PROGRAM_ID), programEmployee.getAfterSchoolProgramId() )
				);
		});
		
	}
	
	
	
}
