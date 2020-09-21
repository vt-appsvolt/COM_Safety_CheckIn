package com.myspartansoftware.login.service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.myspartansoftware.login.domain.AfterSchoolProgram;
import com.myspartansoftware.login.domain.EmployeeRole.EmployeeRoleType;
import com.myspartansoftware.login.domain.ProgramEmployee;
import com.myspartansoftware.login.domain.User;
import com.myspartansoftware.login.repository.AfterSchoolProgramRepository;
import com.myspartansoftware.login.repository.UserRepository;

@Service("sessionService")
public class SessionService {

	private UserRepository userRepository;
	private AfterSchoolProgramRepository afterSchoolProgramRepository;
	private ProgramEmployeeService programEmployeeService;
	
	@Autowired
	public SessionService(UserRepository userRepository, AfterSchoolProgramRepository afterSchoolProgramRepository,
			ProgramEmployeeService programEmployeeService
	) {
		this.userRepository = userRepository;
		this.afterSchoolProgramRepository = afterSchoolProgramRepository;
		this.programEmployeeService = programEmployeeService;
	}
	
	public User getAuthenticatedUser() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if ( auth != null && !(auth instanceof AnonymousAuthenticationToken)) {
			return userRepository.findByUsername( auth.getName() );
		}
		return null;
	}
	
	public void setActiveProgram( Long programId, HttpServletRequest request ) {
		request.getSession().setAttribute("activeProgramId", programId );
	}
	
	public Long getActiveProgramId( HttpServletRequest request ) {
		return (Long)request.getSession().getAttribute("activeProgramId");
	}
	
	public AfterSchoolProgram getActiveProgram( HttpServletRequest request ) {
		Long activeProgramId = getActiveProgramId(request);
		if( activeProgramId != null ) {
			return afterSchoolProgramRepository.findById( activeProgramId ).orElse(null); 
		}
		return null;
	}
	
	public boolean isAuthorized( AfterSchoolProgram afterSchoolProgram, List<EmployeeRoleType> authenticatedRoles, HttpServletRequest request ) {
		User user = getAuthenticatedUser();
		if( afterSchoolProgram != null && user != null ) {
			return isAuthorized(afterSchoolProgram, user, authenticatedRoles);
		}
		return false;
	}
	
	public boolean isAuthorized( AfterSchoolProgram afterSchoolProgram, User user, List<EmployeeRoleType> authenticatedRoles) {
		return isAuthorized( afterSchoolProgram.getId(), user.getId(), authenticatedRoles);
	}
	
	public boolean isAuthorized( Long afterSchoolProgramId, Long userId, List<EmployeeRoleType> authenticatedRoles) {
		Optional<ProgramEmployee> programEmployee = programEmployeeService.findByAfterSchoolProgramAndUser( afterSchoolProgramId, userId );
		if( programEmployee.isPresent() ) {
			return isAuthorized( programEmployee.get(), authenticatedRoles );
		}
		return false;
	}
	
	public boolean isAuthorized( ProgramEmployee programEmployee, List<EmployeeRoleType> authenticatedRoles ) {
		List<EmployeeRoleType> employeeRoles = programEmployeeService.findProgramEmployeeRoles(programEmployee);
 		if ( !Collections.disjoint(authenticatedRoles, employeeRoles ) )
			return true;
		return false;
	}
	
}
