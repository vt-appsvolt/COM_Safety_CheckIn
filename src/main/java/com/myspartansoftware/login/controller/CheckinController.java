package com.myspartansoftware.login.controller;

import java.text.ParseException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import java.util.function.Function;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.myspartansoftware.login.domain.ActiveCheckin;
import com.myspartansoftware.login.domain.AfterSchoolProgram;
import com.myspartansoftware.login.domain.CheckinLog;
import com.myspartansoftware.login.domain.Guardian;
import com.myspartansoftware.login.domain.ProgramEmployee;
import com.myspartansoftware.login.domain.Student;
import com.myspartansoftware.login.domain.StudentBillingAttendanceRecord;
import com.myspartansoftware.login.domain.User;
import com.myspartansoftware.login.domain.billing.BillingTransaction;
import com.myspartansoftware.login.domain.billing.FamilyBillingAccount;
import com.myspartansoftware.login.domain.billing.StudentBillingAccount;
import com.myspartansoftware.login.model.ActiveCheckinModel;
import com.myspartansoftware.login.model.AfterSchoolProgramAttendanceModel;
import com.myspartansoftware.login.model.CheckinLedgerAccountModel;
import com.myspartansoftware.login.model.CheckinLedgerModel;
import com.myspartansoftware.login.model.CheckinLogEditModel;
import com.myspartansoftware.login.model.CheckinLogModel;
import com.myspartansoftware.login.model.CheckoutResponseModel;
import com.myspartansoftware.login.model.GuardianCheckoutModel;
import com.myspartansoftware.login.model.StudentModel;
import com.myspartansoftware.login.model.StudentSort;
import com.myspartansoftware.login.model.aws.AwsErrorLog;
import com.myspartansoftware.login.service.CheckinService;
import com.myspartansoftware.login.service.ProgramEmployeeService;
import com.myspartansoftware.login.service.SessionService;
import com.myspartansoftware.login.service.StudentService;
import com.myspartansoftware.login.service.aws.S3ErrorUploadingService;
import com.myspartansoftware.login.service.billing.BillingService;
import com.myspartansoftware.login.service.builder.ModelBuilderService;
import com.myspartansoftware.login.utils.AuthenticationUtils;
import com.myspartansoftware.login.utils.TimezoneUtils;

@Controller
public class CheckinController {
	
	@Autowired 
	private SessionService sessionService;
	@Autowired
	private CheckinService checkinService;
	@Autowired
	private StudentService studentService;
	@Autowired 
    private BillingService billingService;
	@Autowired 
	private ModelBuilderService modelBuilderService;
    @Autowired
    private ProgramEmployeeService programEmployeeService;
    @Autowired 
    private S3ErrorUploadingService s3ErrorUploadingService;
    
	
	@GetMapping("/checkin")
	public ModelAndView checkinHome( @RequestParam(name="view", required=false) String view, HttpServletRequest request ) {
		User activeUser = sessionService.getAuthenticatedUser();
		ModelAndView modelAndView = new ModelAndView();
		modelAndView.addObject("view", view);
		Long activeProgramId = sessionService.getActiveProgramId(request);
		if( activeProgramId == null ) {
			List<ProgramEmployee> afterSchoolPrograms = programEmployeeService.findProgramEmployeesByUser(activeUser);
			if( afterSchoolPrograms != null && !afterSchoolPrograms.isEmpty() ) {
				activeProgramId = afterSchoolPrograms.get(0).getAfterSchoolProgram().getId();
			}else {
				activeProgramId = 1l;
			}
			sessionService.setActiveProgram(activeProgramId, request);
		}
		
		modelAndView.addObject("employeeRoles", programEmployeeService.findProgramEmployeeRoles( activeProgramId , activeUser.getId()) );
		modelAndView.addObject("activeProgramId", activeProgramId);
		modelAndView.setViewName("user/index");
		return modelAndView;
	}
	
	@GetMapping("/admin/checkin")
	public ModelAndView adminHome( @RequestParam(name="view", required=false) String view ) {
		ModelAndView modelAndView = new ModelAndView();
		modelAndView.addObject("view", view);
		modelAndView.setViewName("admin/index");
		return modelAndView;
	}
	
	@GetMapping("/checkin/active/students")
	public ResponseEntity<Page<ActiveCheckinModel>> activeStudents( @RequestParam(name="search", required=false) String search,
			@RequestParam(value="studentSort", required=false) StudentSort studentSort,
			HttpServletRequest request, Pageable pageable ){
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		if( activeProgram == null ) {
			return ResponseEntity.badRequest().build();
		}
		Page<ActiveCheckin> activeCheckinsPage = checkinService.findActiveCheckins(activeProgram.getId(), search, studentSort, pageable);
		List<ActiveCheckinModel> activeCheckins = new ArrayList<>();
		if( activeCheckinsPage.hasContent() ) {
			for( ActiveCheckin activeCheckin : activeCheckinsPage.getContent() ) {
				activeCheckins.add( modelBuilderService.buildActiveCheckinModel(activeCheckin) );
			}
		}
		return ResponseEntity.ok( new PageImpl<>(activeCheckins, pageable, activeCheckinsPage.getTotalElements()) );
	}
	
	
	
	
	@GetMapping("/checkin/active/students/count")
	public ResponseEntity<Map<String,Long>> getActiveStudentCount( HttpServletRequest request ){
		User activeUser = sessionService.getAuthenticatedUser();
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		HashMap<String, Long> response = new HashMap<String, Long>();
		if( activeProgram != null ) {
			response.put("activeProgramCount", checkinService.getActiveProgramCount( activeProgram.getId() ) );
			response.put("activeUserCount", checkinService.getActiveUserCount( activeUser.getId(), activeProgram.getId() ) );
		}
		return ResponseEntity.ok( response );
	}
	
	@PostMapping("/checkin/student/{studentId}")
	public ResponseEntity<ActiveCheckinModel> checkinStudent( @PathVariable("studentId") String studentId, 
			@RequestParam(value="override", required=false, defaultValue="false") Boolean override, 
			HttpServletRequest request ){
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		User activeUser = sessionService.getAuthenticatedUser();
		try {
			Student student = studentService.findStudentByStudentId( activeProgram.getId(), studentId );
			if( student != null ) {
				if( student.getActive() != null && !student.getActive() ) {
					if( !override ) {
						return new ResponseEntity<ActiveCheckinModel>(HttpStatus.CONFLICT);
					}else {
						student.setActive(true);
						studentService.saveStudent(student);
					}
				}
				
				ActiveCheckin exitingCheckin = checkinService.findByStudentId( student.getId(), studentId, activeProgram.getId() );
				if( exitingCheckin != null ) {
					return ResponseEntity.ok( modelBuilderService.buildActiveCheckinModel( exitingCheckin ) );
				}
				ActiveCheckin activeCheckin = new ActiveCheckin();
				activeCheckin.setStudent(student);
				activeCheckin.setProgramId(student.getProgramId());
				activeCheckin.setCheckInTime(ZonedDateTime.now(TimeZone.getTimeZone("US/Eastern").toZoneId()));
				activeCheckin.setCheckedInBy( activeUser.getId() );
				checkinService.checkinStudent(activeCheckin, activeProgram);
				return ResponseEntity.ok( modelBuilderService.buildActiveCheckinModel( activeCheckin ) );
			}
		}catch( Exception e ) {
			HashMap<String,String> errorData = new HashMap<String, String>();
			errorData.put("studentId", studentId);
			errorData.put("override", override != null ? override.toString() : "");
			s3ErrorUploadingService.uploadError( 
					activeProgram.getId(), 
					"checkinController_checkinStudent", 
					"US/Eastern",
					AwsErrorLog.builder()
					.activeUserId(activeUser.getId())
					.programId( activeProgram.getId() )
					.description( ExceptionUtils.getStackTrace(e) )
					.method("CheckinController.checkinStudent")
					.data( errorData )
					.build()
				);
		}
		return new ResponseEntity<ActiveCheckinModel>(HttpStatus.BAD_REQUEST);
	}
	
	@GetMapping("/checkin/manual/log/{id}")
	public ResponseEntity<CheckinLogEditModel> getManualCheckinLog( @PathVariable(value="id") CheckinLog checkinLog, HttpServletRequest request ){
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		User activeUser = sessionService.getAuthenticatedUser();
		if( sessionService.isAuthorized(activeProgram, activeUser, AuthenticationUtils.getOwnerRoles() ) ) {
			return ResponseEntity.ok( modelBuilderService.buildCheckinLogEditModel(checkinLog, activeProgram) );
		}
		return ResponseEntity.badRequest().build();
	}
	
	/**
	 * Enter a manual checkinLog with the ability to also apply a payment if updateLedger is true.
	 * Creates or updates an existing {@link CheckinLog}. 
	 * Creates of updates an existing {@link WeeklyBillingLog}.
	 * Creates or updates an existing {@link StudentBillingAttendanceRecord}
	 * If updateLedger is true it will 
	 * - update the dailyRate on the {@link StudentBillingAttendanceRecord}, {@link WeeklyBillingLog} and 
	 * - create or update an existing {@link BillingTransaction}, 
	 * - update the {@link StudentBillingAccount} and {@link FamilyBillingAccount}.
	 * 
	 * 
	 * @param checkinLogEditModel
	 * @param request
	 * @return
	 */
	@PostMapping("/checkin/manual/log")
	public ResponseEntity<CheckinLogModel> saveManualCheckinLog( @RequestBody CheckinLogEditModel checkinLogEditModel, HttpServletRequest request ){
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		User activeUser = sessionService.getAuthenticatedUser();
		if( sessionService.isAuthorized(activeProgram, activeUser, AuthenticationUtils.getOwnerRoles() ) ) {
			Student student = studentService.findStudentById(  checkinLogEditModel.getStudentId() );
			if( student == null ) {
				return ResponseEntity.badRequest().build();
			}
			CheckinLog checkinLog = checkinService.createManualCheckinLog( checkinLogEditModel, student, activeProgram );
			return ResponseEntity.ok( modelBuilderService.buildCheckinLogModel(checkinLog, student, activeProgram) );
		}
		return ResponseEntity.badRequest().build();
	}
	
	@PostMapping("/active/student/{studentId}/checkin/delete")
	public ResponseEntity<Void> removeActiveCheckin( @PathVariable("studentId") String studentId, HttpServletRequest request ){
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		try {
			Student student = studentService.findStudentByStudentId( activeProgram.getId(), studentId );
			if( student != null ) {
				ActiveCheckin activeCheckin = checkinService.findByStudentId( student.getId(), studentId, activeProgram.getId() );
				if( activeCheckin != null ) {
					checkinService.removeActiveCheckin(activeCheckin, activeProgram);
				}
			}
		}catch( Exception e ) {
			HashMap<String,String> errorData = new HashMap<String, String>();
			errorData.put("studentId", studentId);
			s3ErrorUploadingService.uploadError( 
					activeProgram.getId(), 
					"checkinController_removeActiveCheckin", 
					"US/Eastern",
					AwsErrorLog.builder()
					.activeUserId(null)
					.programId( activeProgram.getId() )
					.description( ExceptionUtils.getStackTrace(e) )
					.method("CheckinController.removeActiveCheckin")
					.data( errorData )
					.build()
				);
		}
		return ResponseEntity.ok().build();
	}
	
	@PostMapping("/checkout/student/{studentId}")
	public ResponseEntity<CheckoutResponseModel> checkoutStudent( @PathVariable("studentId") String studentId, HttpServletRequest request ){
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		Student student = studentService.findStudentByStudentId( activeProgram.getId(), studentId );
		User activeUser = sessionService.getAuthenticatedUser();
		try {
			CheckoutResponseModel response = new CheckoutResponseModel();
			response.setId(studentId);
			if( student != null ) {
				ActiveCheckin activeCheckin = checkinService.findByStudentId( student.getId(), studentId, activeProgram.getId() );
				if( activeCheckin != null ) {
					CheckinLog checkinLog = checkinService.checkoutStudent( activeCheckin, activeUser.getId(), "Self Checkout", null, activeProgram );
					response.setStudentCheckedOut( true );
					response.setCheckedOutIds( new ArrayList<>() );
					response.setCheckinLogs(new ArrayList<>());
					response.getCheckedOutIds().add( studentId );
					response.getCheckinLogs().add( modelBuilderService.buildCheckinLogModel(checkinLog, student, activeProgram) );
					return ResponseEntity.ok( response );
				}else {
					List<StudentModel> studentModelList = new ArrayList<>();
					studentModelList.add( modelBuilderService.buildStudentModel( student )); 
					response.setConnectedStudents( studentModelList );
					response.setInactiveStudents( studentModelList );
					return ResponseEntity.ok( response );
				}
			}
			Guardian guardian = studentService.findByParentIdAndProgramId(studentId, activeProgram.getId());
			List<Student> dependents = studentService.findDependentsByParentIdAndProgramId(studentId, activeProgram.getId());
			if( dependents != null ) {
				if( dependents.size() == 1 ) {
					response.setConnectedStudents( dependents.stream().map( s -> modelBuilderService.buildStudentModel(s) ).collect(Collectors.toList() ) );
					List<ActiveCheckin> activeDependentCheckins = checkinService.findByStudentIds( dependents.stream().map( s -> s.getStudentId() ).collect(Collectors.toList()), activeProgram.getId() );
					if( activeDependentCheckins != null && !activeDependentCheckins.isEmpty() ) {
						response.setCheckinLogs(new ArrayList<>());
						activeDependentCheckins.stream().forEach( c -> {
							CheckinLog checkinLog = checkinService.checkoutStudent( c, activeUser.getId(), guardian.getFirstName()+" "+guardian.getLastName(), guardian.getId(), activeProgram );
							response.getCheckinLogs().add( modelBuilderService.buildCheckinLogModel(checkinLog, student, activeProgram) );
						});
						response.setCheckedOutIds( activeDependentCheckins.stream().map( a -> a.getStudent().getStudentId() ).collect(Collectors.toList()) );
						response.setActiveCheckins(activeDependentCheckins);
						response.setInactiveStudents( response.getConnectedStudents().stream().filter( c -> {
							return activeDependentCheckins.stream().noneMatch( a -> a.getStudent().getStudentId().equals( c.getStudentId() ) );					
						} ).collect( Collectors.toList() ));
					}else {
						response.setInactiveStudents( response.getConnectedStudents() );
					}
				}else {
					response.setConnectedStudents( dependents.stream().map( s -> modelBuilderService.buildStudentModel(s) ).collect(Collectors.toList() ) );
					List<ActiveCheckin> activeDependentCheckins = checkinService.findByStudentIds( dependents.stream().map( s -> s.getStudentId() ).collect(Collectors.toList()), activeProgram.getId() );
					if( activeDependentCheckins != null && !activeDependentCheckins.isEmpty() ) {
	//					response.setCheckinLogs(new ArrayList<>());
	//					activeDependentCheckins.stream().forEach( c -> {
	//						CheckinLog checkinLog = checkinService.checkoutStudent( c, activeUser.getId() );
	//						response.getCheckinLogs().add( modelBuilderService.buildCheckinLogModel(checkinLog) );
	//					});
	//					response.setCheckedOutIds( activeDependentCheckins.stream().map( a -> a.getStudent().getStudentId() ).collect(Collectors.toList()) );
	//					return ResponseEntity.ok( response );
						
						response.setActiveCheckins(activeDependentCheckins);
						response.setInactiveStudents( response.getConnectedStudents().stream().filter( c -> {
							return activeDependentCheckins.stream().noneMatch( a -> a.getStudent().getStudentId().equals( c.getStudentId() ) );					
						} ).collect( Collectors.toList() ));
					}else {
						response.setInactiveStudents( response.getConnectedStudents() );
					}
				}
				
				if( 
					( response.getActiveCheckins() == null || response.getActiveCheckins().isEmpty() ) && 
					( response.getInactiveStudents() == null || response.getInactiveStudents().isEmpty() ) 	
				) {
					HashMap<String,String> errorData = new HashMap<String, String>();
					errorData.put("studentId", studentId.toString() );
					s3ErrorUploadingService.uploadError( 
							activeProgram.getId(), 
							"checkinController_checkoutStudent", 
							"US/Eastern",
							AwsErrorLog.builder()
							.activeUserId( activeUser.getId() )
							.programId( activeProgram.getId() )
							.description( "Not found in students or guardians" )
							.method("CheckinController.checkoutStudent")
							.data( errorData )
							.build()
						);
				}
				
				return ResponseEntity.ok( response );
			}
		}catch( Exception e ) {
			HashMap<String,String> errorData = new HashMap<String, String>();
			errorData.put("studentId", studentId);
			s3ErrorUploadingService.uploadError( 
					activeProgram.getId(), 
					"checkinController_checkoutStudent", 
					"US/Eastern",
					AwsErrorLog.builder()
					.activeUserId( activeUser.getId() )
					.programId( activeProgram.getId() )
					.description( ExceptionUtils.getStackTrace(e) )
					.method("CheckinController.checkoutStudent")
					.data( errorData )
					.build()
				);
		}
		
		return new ResponseEntity<CheckoutResponseModel>(HttpStatus.BAD_REQUEST);
	}
	
	
	@PostMapping("/checkout/students")
	public ResponseEntity<CheckoutResponseModel> checkoutStudents( @RequestParam("studentIds[]") List<String> studentIds, HttpServletRequest request ){
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		User activeUser = sessionService.getAuthenticatedUser();
		try {
			CheckoutResponseModel response = new CheckoutResponseModel();
			if( studentIds != null && !studentIds.isEmpty() ) {
				List<ActiveCheckin> activeDependentCheckins = checkinService.findByStudentIds( studentIds, activeProgram.getId() );
				if( activeDependentCheckins != null && !activeDependentCheckins.isEmpty() ) {
					response.setCheckinLogs(new ArrayList<>());
					activeDependentCheckins.stream().forEach( c -> {
						CheckinLog checkinLog = checkinService.checkoutStudent( c, activeUser.getId(), "Self Checkout", null, activeProgram );
						response.getCheckinLogs().add( modelBuilderService.buildCheckinLogModel(checkinLog, checkinLog.getStudent(), activeProgram) );
					});
					response.setCheckedOutIds( activeDependentCheckins.stream().map( a -> a.getStudent().getStudentId() ).collect(Collectors.toList()) );
					return ResponseEntity.ok( response );
				}
			}
		}catch( Exception e ) {
			HashMap<String,String> errorData = new HashMap<String, String>();
			errorData.put("studentIds", studentIds.toString() );
			s3ErrorUploadingService.uploadError( 
					activeProgram.getId(), 
					"checkinController_checkoutStudents", 
					"US/Eastern",
					AwsErrorLog.builder()
					.activeUserId( activeUser.getId() )
					.programId( activeProgram.getId() )
					.description( ExceptionUtils.getStackTrace(e) )
					.method("CheckinController.checkoutStudents")
					.data( errorData )
					.build()
				);
		}
		return new ResponseEntity<CheckoutResponseModel>(HttpStatus.BAD_REQUEST);
	}
	
	
	@PostMapping("/checkout/guardian")
	public ResponseEntity<CheckoutResponseModel> guardianCheckout( @RequestBody GuardianCheckoutModel guardianCheckoutModel, HttpServletRequest request ){
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		User activeUser = sessionService.getAuthenticatedUser();
		try {
			CheckoutResponseModel response = new CheckoutResponseModel();
			response.setCheckinLogs(new ArrayList<>());
			Guardian guardian = guardianCheckoutModel.getParentId() != null ? studentService.findByParentIdAndProgramId(guardianCheckoutModel.getParentId(), activeProgram.getId()) : null;
			if( guardianCheckoutModel.getActiveCheckoutIds() != null && !guardianCheckoutModel.getActiveCheckoutIds().isEmpty() ) {
				List<ActiveCheckin> activeDependentCheckins = checkinService.findByStudentIds( guardianCheckoutModel.getActiveCheckoutIds(), activeProgram.getId() );
				if( activeDependentCheckins != null && !activeDependentCheckins.isEmpty() ) {
					activeDependentCheckins.stream().forEach( c -> {
						CheckinLog checkinLog = checkinService.checkoutStudent( c, activeUser.getId(), guardian != null ? (guardian.getFirstName()+" "+guardian.getLastName()) : "Self Checkout", guardian != null ? guardian.getId() : null, activeProgram  );
						response.getCheckinLogs().add( modelBuilderService.buildCheckinLogModel(checkinLog, checkinLog.getStudent(), activeProgram) );
					});
					response.setCheckedOutIds( activeDependentCheckins.stream().map( a -> a.getStudent().getStudentId() ).collect(Collectors.toList()) );
				}
			}
			if( guardianCheckoutModel.getInactiveCheckouts() != null && !guardianCheckoutModel.getInactiveCheckouts().isEmpty() ) {
				guardianCheckoutModel.getInactiveCheckouts().stream().forEach( c -> {
					Student student = studentService.findStudentByStudentId(activeProgram.getId(), c.getStudentId() );
					if( student != null && student.getProgramId() != null && student.getProgramId().equals( activeProgram.getId() ) ) {
						LocalTime checkInTime;
						if( c.getCheckinTime() != null && !c.getCheckinTime().trim().isEmpty() ) {
							checkInTime = LocalTime.parse( c.getCheckinTime(), DateTimeFormatter.ofPattern("hh:mm a") );
						}else {
							checkInTime = LocalTime.now( TimeZone.getTimeZone("America/New_York").toZoneId() );
						}
						CheckinLog checkinLog = checkinService.checkoutStudent( ZonedDateTime.of(LocalDate.now(), checkInTime, ZoneId.of("UTC")),
							student, 
							activeUser.getId(), 
							activeProgram,
							guardian != null ? (guardian.getFirstName()+" "+guardian.getLastName()) : "Self Checkout", 
							guardian != null ? guardian.getId() : null );
						response.getCheckinLogs().add( modelBuilderService.buildCheckinLogModel(checkinLog, student, activeProgram) );
						if( response.getCheckedOutIds() == null ) {
							response.setCheckedOutIds( new ArrayList<String>() );
						}
						response.getCheckedOutIds().add( student.getStudentId() );
					}
				});
			}
			return ResponseEntity.ok( response );
		}catch( Exception e ) {
			HashMap<String,String> errorData = new HashMap<String, String>();
			s3ErrorUploadingService.uploadError( 
					activeProgram.getId(), 
					"checkinController_guardianCheckout", 
					"US/Eastern",
					AwsErrorLog.builder()
					.activeUserId( activeUser.getId() )
					.programId( activeProgram.getId() )
					.description( ExceptionUtils.getStackTrace(e) )
					.method("CheckinController.guardianCheckout")
					.data( errorData )
					.build()
				);
		}
		return ResponseEntity.badRequest().build();
	}
	
	@GetMapping("/checkin/daily/log")
	public ResponseEntity<Page<CheckinLogModel>> getDailyCheckinLog( 
			@RequestParam(value="search", required=false) String search, 
			@RequestParam(value="studentSort", required=false) StudentSort studentSort,
			@RequestParam(value="studentFilter", required=false) String studentFilter,
			@RequestParam("date") @DateTimeFormat(pattern = "dd.MM.yyyy") LocalDate date,
			HttpServletRequest request, Pageable pageable ){
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		if( activeProgram == null ) {
			return ResponseEntity.badRequest().build();
		}
		Page<CheckinLog> checkinLogPage;
		try {
			checkinLogPage = checkinService.findDailyCheckinLog(activeProgram.getId(), date, search, studentSort, studentFilter, pageable);
		} catch (ParseException e) {
			return ResponseEntity.badRequest().build();
		}
		List<CheckinLogModel> checkinLogs = new ArrayList<>();
		if( checkinLogPage.hasContent() ) {
			for( CheckinLog checkinLog : checkinLogPage.getContent() ) {
				checkinLogs.add( modelBuilderService.buildCheckinLogModel(checkinLog, checkinLog.getStudent(), activeProgram) );
			}
		}
		return ResponseEntity.ok( new PageImpl<>(checkinLogs, pageable, checkinLogPage.getTotalElements()) );
	}
	
	@GetMapping("/checkin/daily/log/unique/count")
	public ResponseEntity<Long> getUniqueStudentDailyLogCount( 
			@RequestParam("date") @DateTimeFormat(pattern = "dd.MM.yyyy") LocalDate date,
			HttpServletRequest request ){
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		if( activeProgram == null ) {
			return ResponseEntity.badRequest().build();
		}
		try {
			return ResponseEntity.ok( checkinService.getUniqueStudentDailyLogCount( activeProgram.getId(), date ) );
		} catch (ParseException e) {
			return ResponseEntity.badRequest().build();
		} 
	}
	
	@PostMapping("/checkin/daily/log/update")
	public ResponseEntity<CheckinLogModel> updateCheckinLog( 
			@RequestParam(value="id") Long id,
			@RequestParam(value="checkinTime", required=false) String checkinTime,
			@RequestParam(value="checkoutTime", required=false) String checkoutTime,
			HttpServletRequest request ){
		CheckinLog updatingCheckinLog = checkinService.findCheckinLog( id );
		if( updatingCheckinLog == null ) {
			return ResponseEntity.badRequest().build();
		}
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		if( !activeProgram.getId().equals(updatingCheckinLog.getProgramId()) ) {
			return ResponseEntity.badRequest().build();
		}
		try {
			if( checkinTime != null && !checkinTime.trim().isEmpty() ) {
				LocalTime checkInTime;
				checkInTime = LocalTime.parse( checkinTime, DateTimeFormatter.ofPattern("hh:mm a") );
				updatingCheckinLog.setCheckInTime(  ZonedDateTime.of( updatingCheckinLog.getCheckInTime().toLocalDate(), checkInTime, TimezoneUtils.getActiveProgramZoneId(activeProgram) ) );  //TimezoneUtils.getActiveProgramZoneId(activeProgram))
				updatingCheckinLog.setCheckInTime( updatingCheckinLog.getCheckInTime().withZoneSameInstant(ZoneOffset.UTC) );
			}
			if( checkoutTime != null && !checkoutTime.trim().isEmpty() ) {
				LocalTime checkOutTime;
				checkOutTime = LocalTime.parse( checkoutTime, DateTimeFormatter.ofPattern("hh:mm a") );
				updatingCheckinLog.setCheckOutTime(  ZonedDateTime.of(updatingCheckinLog.getCheckOutTime().toLocalDate(), checkOutTime, TimezoneUtils.getActiveProgramZoneId(activeProgram) ) );
				updatingCheckinLog.setCheckOutTime( updatingCheckinLog.getCheckOutTime().withZoneSameInstant(ZoneOffset.UTC) );
			}
			updatingCheckinLog = checkinService.saveCheckinLog(updatingCheckinLog);
			return ResponseEntity.ok( modelBuilderService.buildCheckinLogModel( updatingCheckinLog, updatingCheckinLog.getStudent(), activeProgram ) );
		}catch( Exception e ) {
			HashMap<String,String> errorData = new HashMap<String, String>();
			errorData.put("id", id.toString() );
			errorData.put("checkinTime", checkinTime );
			errorData.put("checkoutTime", checkoutTime );
			s3ErrorUploadingService.uploadError( 
					activeProgram.getId(), 
					"checkinController_updateCheckinLog", 
					"US/Eastern",
					AwsErrorLog.builder()
					.activeUserId( sessionService.getAuthenticatedUser().getId() )
					.programId( activeProgram.getId() )
					.description( ExceptionUtils.getStackTrace(e) )
					.method("CheckinController.updateCheckinLog")
					.data( errorData )
					.build()
				);
		}
		return ResponseEntity.badRequest().build();
	}
	
	@PostMapping("/checkin/daily/log/clear")
	public ResponseEntity<Void> clearDailyCheckinLog(  @RequestParam("date") @DateTimeFormat(pattern = "dd.MM.yyyy") LocalDate date,
			HttpServletRequest request){
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		if( activeProgram == null ) {
			return ResponseEntity.badRequest().build();
		}
		try {
			List<CheckinLog> logs = checkinService.findDailyCheckinLogs(activeProgram.getId(), date );
			checkinService.removeCheckinLogs( logs );
			return ResponseEntity.ok().build();
		}catch( Exception e ) {
			HashMap<String,String> errorData = new HashMap<String, String>();
			s3ErrorUploadingService.uploadError( 
					activeProgram.getId(), 
					"checkinController_clearDailyCheckinLog", 
					"US/Eastern",
					AwsErrorLog.builder()
					.activeUserId( sessionService.getAuthenticatedUser().getId() )
					.programId( activeProgram.getId() )
					.description( ExceptionUtils.getStackTrace(e) )
					.method("CheckinController.clearDailyCheckinLog")
					.data( errorData )
					.build()
				);
		} 
		return ResponseEntity.badRequest().build();
	}
	
	@PostMapping("/checkin/daily/log/{id}/clear")
	public ResponseEntity<Void> clearDailyCheckinLog( @PathVariable(name = "id") Long checkinLogId,
			HttpServletRequest request){
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		if( activeProgram == null ) {
			return ResponseEntity.badRequest().build();
		}
		try {
			CheckinLog checkinLog = checkinService.findCheckinLog( checkinLogId );
			if( checkinLog != null ) {
				checkinService.removeCheckinLog( checkinLog );
			}
			return ResponseEntity.ok().build();
		}catch( Exception e ) {
			HashMap<String,String> errorData = new HashMap<String, String>();
			errorData.put("checkinLogId", checkinLogId.toString());
			s3ErrorUploadingService.uploadError( 
					activeProgram.getId(), 
					"checkinController_clearDailyCheckinLog", 
					"US/Eastern",
					AwsErrorLog.builder()
					.activeUserId( sessionService.getAuthenticatedUser().getId() )
					.programId( activeProgram.getId() )
					.description( ExceptionUtils.getStackTrace(e) )
					.method("CheckinController.clearDailyCheckinLog")
					.data( errorData )
					.build()
				);
		} 
		return ResponseEntity.badRequest().build();
	}
	
	@GetMapping("/student/checkin/log/ledger")
	public ResponseEntity<CheckinLedgerModel> getStudentCheckinLogs( 
			@RequestParam(value="startDate", required=false) @DateTimeFormat(pattern = "dd.MM.yyyy") LocalDate startDate,
			@RequestParam(value="endDate", required=false) @DateTimeFormat(pattern = "dd.MM.yyyy") LocalDate endDate,
			@RequestParam(value="studentId", required=false) Long studentId,
			@RequestParam(value="familyId", required=false ) Long familyId,
			@RequestParam(value="familyFilter", required=false, defaultValue="All") String familyFilter,
			HttpServletRequest request, Pageable pageable ){
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		if( activeProgram == null ) {
			return ResponseEntity.badRequest().build();
		}
		FamilyBillingAccount familyBillingAccount = null;
		StudentBillingAccount studentBillingAccount = null;
		if( studentId != null ) {
			studentBillingAccount = billingService.getStudentBillingAccount(studentId, activeProgram.getId() );
			if( !studentBillingAccount.getStudent().getProgramId().equals( activeProgram.getId() ) ) {
				return ResponseEntity.badRequest().build();
			}
			if( familyId != null ) {
				familyBillingAccount = billingService.getFamilyBillingAccount(familyId);
			}else if( ("All").equals(familyFilter) && studentBillingAccount.getFamilyBillingAccount() != null ) {
				familyBillingAccount = studentBillingAccount.getFamilyBillingAccount();
			}
		}else if( familyId != null ) {
			familyBillingAccount = billingService.getFamilyBillingAccount(familyId);
			//TODO: validate that they can look at this ledger
		}
		Page<CheckinLog> checkinLogPage = null;
		CheckinLedgerAccountModel familyCheckinLedger = null;
		List<CheckinLedgerAccountModel> studentAccounts = new ArrayList<>();
		List<Long> studentIds = new ArrayList<>();
		
		if( familyBillingAccount != null ) {
			List<StudentBillingAccount> studentBillingAccounts = billingService.getStudentBillingAccountsByFamilyId( familyBillingAccount.getId() );
			
			studentBillingAccounts.stream()
				.filter( a -> a.getStudent() != null &&  ( a.getStudent().getActive() == null || a.getStudent().getActive() ) )
				.forEach(  a -> { 
					studentIds.add( a.getId() );
					studentAccounts.add( 
						CheckinLedgerAccountModel.builder()
							.billingBalanceId( a.getId() )
							.checkinCount( checkinService.countStudentDailyCheckinLogs(activeProgram.getId(), a.getId(), startDate, endDate)  )
							.person( modelBuilderService.buildStudentModel( a.getStudent() ) )
							.build()
					);
				});
			checkinLogPage = checkinService.findStudentsDailyCheckinLog(activeProgram.getId(), studentIds, startDate, endDate, pageable);
			familyCheckinLedger = CheckinLedgerAccountModel.builder()
					.billingBalanceId( familyBillingAccount.getId() )
					.checkinCount( checkinLogPage.getTotalElements()  )
					.build();
			
			
		}else if( studentBillingAccount != null ) {
			checkinLogPage = checkinService.findStudentDailyCheckinLog(activeProgram.getId(), studentId, startDate, endDate, pageable);
			studentAccounts.add( 
				CheckinLedgerAccountModel.builder()
					.billingBalanceId( studentBillingAccount.getId() )
					.checkinCount( checkinService.countStudentDailyCheckinLogs(activeProgram.getId(), studentId, startDate, endDate)  )
					.person( modelBuilderService.buildStudentModel( studentBillingAccount.getStudent() ) )
					.build()
			);
		}
		return ResponseEntity.ok( CheckinLedgerModel.builder()
				.familyAccount(familyCheckinLedger)
				.studentAccounts( studentAccounts )
				.checkinPage( checkinLogPage != null ? checkinLogPage.map( l -> modelBuilderService.buildCheckinLogModel(l, l.getStudent(), activeProgram) ) : null )
				.build() );
	}
	
	
	@GetMapping("/program/checkin/log/ledger")
	public ResponseEntity<AfterSchoolProgramAttendanceModel> getProgramCheckinLogs( 
			@RequestParam(value="startDate", required=false) @DateTimeFormat(pattern = "dd.MM.yyyy") LocalDate startDate,
			@RequestParam(value="endDate", required=false) @DateTimeFormat(pattern = "dd.MM.yyyy") LocalDate endDate,
			@RequestParam(value="filter", required=false, defaultValue="ALL") String filter,
			HttpServletRequest request ){
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		if( activeProgram == null ) {
			return ResponseEntity.badRequest().build();
		}
		return ResponseEntity.ok( checkinService.getAfterSchoolProgramAttendanceModel( activeProgram, startDate, endDate, filter ) );
	}
	
}
