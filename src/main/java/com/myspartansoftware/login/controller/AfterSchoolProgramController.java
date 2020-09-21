package com.myspartansoftware.login.controller;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.myspartansoftware.login.domain.AfterSchoolProgram;
import com.myspartansoftware.login.domain.ProgramEmployee;
import com.myspartansoftware.login.domain.User;
import com.myspartansoftware.login.model.AfterSchoolProgramModel;
import com.myspartansoftware.login.service.AfterSchoolProgramService;
import com.myspartansoftware.login.service.ProgramEmployeeService;
import com.myspartansoftware.login.service.SessionService;
import com.myspartansoftware.login.service.builder.ModelBuilderService;

@Controller
public class AfterSchoolProgramController {

	@Autowired 
	private SessionService sessionService;
	@Autowired
	private AfterSchoolProgramService afterSchoolProgramService;
	@Autowired 
	private ModelBuilderService modelBuilderService;
	@Autowired
    private ProgramEmployeeService programEmployeeService;
	
	@PostMapping("/afterschoolprogram.json")
	public ResponseEntity<AfterSchoolProgram> createAfterSchoolProgram( @RequestBody AfterSchoolProgram afterSchoolProgram, BindingResult result, HttpServletRequest request ){
		afterSchoolProgramService.saveAfterSchoolProgramRepository(afterSchoolProgram);
		return ResponseEntity.ok(afterSchoolProgram); 
	}
	
	@GetMapping("/afterschoolprograms.json")
	public ResponseEntity<Page<AfterSchoolProgram>> getActiveSchoolPrograms( Pageable pageable ){
		return ResponseEntity.ok( afterSchoolProgramService.getAfterSchoolPrograms(pageable) );
	}
	
	@GetMapping("/employee/afterschoolprograms")
	public ResponseEntity<List<AfterSchoolProgramModel>> getActiveEmployeeAfterSchoolPrograms( HttpServletRequest request ){
		User activeUser = sessionService.getAuthenticatedUser();
		List<ProgramEmployee> afterSchoolPrograms = programEmployeeService.findProgramEmployeesByUser(activeUser);
		List<AfterSchoolProgramModel> afterSchoolProgramList = new ArrayList<AfterSchoolProgramModel>();

		Long activeProgramId = sessionService.getActiveProgramId(request);
		if( activeProgramId == null ) {
			if( afterSchoolPrograms != null && !afterSchoolPrograms.isEmpty() ) {
				activeProgramId = afterSchoolPrograms.get(0).getAfterSchoolProgram().getId();
			}else {
				activeProgramId = 1l;
			}
			sessionService.setActiveProgram(activeProgramId, request);
		}
		if( afterSchoolPrograms != null && !afterSchoolPrograms.isEmpty() ) {
			final Long apID = activeProgramId;
			afterSchoolPrograms.stream().forEach( p -> {
				afterSchoolProgramList.add( modelBuilderService.buildAfterSchoolProgramModel( p.getAfterSchoolProgram(), p.getAfterSchoolProgram().getId().equals( apID ) ) );
			});
		}
		return ResponseEntity.ok(afterSchoolProgramList);
	}
	
	@PostMapping("/employee/afterschoolprogram/{programId}/activate")
	public ResponseEntity<List<AfterSchoolProgramModel>> activeActiveEmployeeAfterSchoolProgram( @PathVariable("programId") Long activeProgramId, HttpServletRequest request ){
		User activeUser = sessionService.getAuthenticatedUser();
		List<ProgramEmployee> afterSchoolPrograms = programEmployeeService.findProgramEmployeesByUser(activeUser);
		List<AfterSchoolProgramModel> afterSchoolProgramList = new ArrayList<AfterSchoolProgramModel>();
		if( afterSchoolPrograms != null && !afterSchoolPrograms.isEmpty() ) {
			if( afterSchoolPrograms.stream().anyMatch( p -> p.getAfterSchoolProgram().getId().equals(activeProgramId) ) ) {
				sessionService.setActiveProgram(activeProgramId, request);
				afterSchoolPrograms.stream().forEach( p -> {
					afterSchoolProgramList.add( modelBuilderService.buildAfterSchoolProgramModel( p.getAfterSchoolProgram(), p.getAfterSchoolProgram().getId().equals( activeProgramId ) ) );
				});
			}else {
				return ResponseEntity.badRequest().build();
			}
		}
		return ResponseEntity.ok(afterSchoolProgramList);
	}
	
	
	
	
}
