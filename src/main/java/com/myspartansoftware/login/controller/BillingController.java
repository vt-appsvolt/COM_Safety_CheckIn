package com.myspartansoftware.login.controller;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.myspartansoftware.login.domain.AfterSchoolProgram;
import com.myspartansoftware.login.domain.Student;
import com.myspartansoftware.login.domain.WeeklyBillingLog;
import com.myspartansoftware.login.domain.billing.BillingPlan;
import com.myspartansoftware.login.domain.billing.BillingRecord;
import com.myspartansoftware.login.domain.billing.BillingTransaction;
import com.myspartansoftware.login.domain.billing.BillingTransaction.TransactionType;
import com.myspartansoftware.login.domain.billing.FamilyBillingAccount;
import com.myspartansoftware.login.domain.billing.StudentBillingAccount;
import com.myspartansoftware.login.model.BillingPlanModel;
import com.myspartansoftware.login.model.BillingRecordModel;
import com.myspartansoftware.login.model.BillingTransactionModel;
import com.myspartansoftware.login.model.DepositReportModel;
import com.myspartansoftware.login.model.DepositSummaryModel;
import com.myspartansoftware.login.model.StudentLedgerModel;
import com.myspartansoftware.login.model.StudentSort;
import com.myspartansoftware.login.model.WeeklyBillingLogModel;
import com.myspartansoftware.login.service.SessionService;
import com.myspartansoftware.login.service.StudentService;
import com.myspartansoftware.login.service.billing.BillingService;
import com.myspartansoftware.login.service.builder.ModelBuilderService;
import com.myspartansoftware.login.utils.AuthenticationUtils;

@Controller
public class BillingController {

	@Autowired 
	private SessionService sessionService;
	@Autowired
	private BillingService billingService;
	@Autowired
	private StudentService studentService;
	@Autowired 
	private ModelBuilderService modelBuilderService;
	
	@GetMapping("/billing/plan/{billingPlanId}")
	public ResponseEntity<BillingPlan> findBillingPlan( @PathVariable("billingPlanId") BillingPlan billingPlan, HttpServletRequest request  ){
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		if( billingPlan.getProgramId().equals( activeProgram.getId() ) ) {
			return ResponseEntity.ok(billingPlan);
		}
		return ResponseEntity.badRequest().build();
	}
	
	@DeleteMapping("/delete/billing/plan/{billingPlanId}")
	public ResponseEntity<Void> deleteStudent( @PathVariable("billingPlanId") BillingPlan billingPlan ) {
		billingService.deleteBillingPlan( billingPlan );
		return ResponseEntity.ok().build();
	}
	
	@GetMapping("/billing/plans")
	public ResponseEntity<Page<BillingPlan>> findBillingPlans( 
			HttpServletRequest request, 
			Pageable pageable
	){
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		return ResponseEntity.ok( billingService.findBillingPlans(activeProgram.getId(), pageable) );
	}
	
	@PostMapping("/billing/plan")
	public ResponseEntity<BillingPlan> saveBillingPlan( @RequestBody BillingPlan billingPlan, BindingResult result, HttpServletRequest request ){
		billingPlan.setProgramId( sessionService.getActiveProgramId(request) );
		return ResponseEntity.ok( billingService.saveBillingPlan(billingPlan) );
	}
	
	@GetMapping("/billing/model/plans")
	public ResponseEntity<List<BillingPlanModel>> getBillingPlanModels( HttpServletRequest request ){
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		List<BillingPlan> billingPlans = billingService.getBillingPlans( activeProgram.getId() );
		return ResponseEntity.ok( billingPlans.stream().map( b -> modelBuilderService.buildBillingPlanModel(b) ).collect(Collectors.toList()) );
	}
	
	@GetMapping("/billing/model/weeks")
	public ResponseEntity<List<String>> getWeeksModel( HttpServletRequest request ){
		List<String> response = new ArrayList<String>();
		LocalDate now = LocalDate.now();
		LocalDate sunday = now.with(WeekFields.of(Locale.US).dayOfWeek(), 1L);
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd/yyyy");
		response.add( sunday.format(formatter));
		for( int i=0; i<10; i++) {
			sunday = sunday.minusDays(7l);
			response.add( sunday.format(formatter));
		}
		return ResponseEntity.ok(response);
	}
	
	@GetMapping("/student/billing/week/of")
	public ResponseEntity<Page<WeeklyBillingLogModel>> getWeekofStudentBillingModel( @RequestParam("date") @DateTimeFormat(pattern = "dd.MM.yyyy") LocalDate date,
			@RequestParam(value="search", required=false) String search, 
			@RequestParam(value="studentSort", required=false) StudentSort studentSort,
			HttpServletRequest request, Pageable pageable ){
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		if( activeProgram == null ) {
			return ResponseEntity.badRequest().build();
		}
		Page<WeeklyBillingLog> weeklyBillingLogPage = billingService.getWeeklyBillingLogs(date, activeProgram.getId(), pageable, search, studentSort);
		List<WeeklyBillingLogModel> weeklyBillingLogModels = new ArrayList<WeeklyBillingLogModel>();
		if( weeklyBillingLogPage.hasContent() ) {
			weeklyBillingLogModels = weeklyBillingLogPage.getContent().stream()
					.map( 
						w -> modelBuilderService.buildWeeklyBillingLogModel( w, 
									studentService.findStudentById( w.getStudentId() ), 
									billingService.getStudentBillingAccount(w.getStudentId(), activeProgram.getId() ) 
									)
					).collect(Collectors.toList());
		}
		return ResponseEntity.ok(  new PageImpl<>( weeklyBillingLogModels, pageable, weeklyBillingLogPage.getTotalElements()) );
	}
	
	@GetMapping("/student/billing/week/of/entry")
	public ResponseEntity<WeeklyBillingLogModel> getStudentBillingModel( 
			@RequestParam("studentId") Long studentId,
			@RequestParam("date") @DateTimeFormat(pattern = "dd.MM.yyyy") LocalDate date,
			HttpServletRequest request, Pageable pageable ){
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		if( activeProgram == null ) {
			return ResponseEntity.badRequest().build();
		}
		WeeklyBillingLog weeklyBillingLog = billingService.getWeeklyBillingLogs(date, activeProgram.getId(), studentId);
		WeeklyBillingLogModel weeklyBillingLogModels = new WeeklyBillingLogModel();
		if( weeklyBillingLog != null ) {
			weeklyBillingLogModels = modelBuilderService.buildWeeklyBillingLogModel( weeklyBillingLog, 
									studentService.findStudentById( weeklyBillingLog.getStudentId() ), 
									billingService.getStudentBillingAccount(weeklyBillingLog.getStudentId(), activeProgram.getId() ) 
								);
		}
		return ResponseEntity.ok(  weeklyBillingLogModels );
	}
	
	@PostMapping("/billing/record")
	public ResponseEntity<BillingRecord> postBillingRecord( @RequestBody BillingRecordModel billingRecordModel, HttpServletRequest request ){
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		if( activeProgram == null ) {
			return ResponseEntity.badRequest().build();
		}
		Student student = studentService.findStudentById( billingRecordModel.getStudentId() );
		BillingRecord billingRecord = billingService.convert( billingRecordModel );
		billingRecord.setProgramId( activeProgram.getId() );
		billingRecord = billingService.saveBillingRecord( billingRecord, student, billingRecordModel.getType(), billingRecordModel.getDescription(), billingRecordModel.getPaymentMethodType() );
		return ResponseEntity.ok( billingRecord );
	}
	 
	@GetMapping("/family/billing/ledger") 
	public ResponseEntity<StudentLedgerModel> getFamilyBillingLedger( @RequestParam(value="startDate", required=false) @DateTimeFormat(pattern = "dd.MM.yyyy") LocalDate startDate,
			@RequestParam(value="endDate", required=false) @DateTimeFormat(pattern = "dd.MM.yyyy") LocalDate endDate,
			@RequestParam(value="search", required=false) String search, 
			@RequestParam(value="transactionType", required=false) TransactionType transactionType,
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
		if( familyBillingAccount != null ) {
			Page<BillingTransaction> billingTransactionPage = billingService.getBillingTransactionsByFamilyAccount(familyBillingAccount, transactionType, startDate, endDate, pageable);
			List<StudentBillingAccount> studentBillingAccounts = billingService.getStudentBillingAccountsByFamilyId( familyBillingAccount.getId() );
			List<BillingTransactionModel> billingTransactionModelList = billingTransactionPage.hasContent() ? 
						billingTransactionPage.getContent().stream().map( t -> modelBuilderService.buildBillingTransactionModel( t, activeProgram ) ).collect(Collectors.toList()) :
						new ArrayList<>();
			return ResponseEntity.ok( StudentLedgerModel.builder()
					.familyBillingAccount(familyBillingAccount)
					.studentBillingAccounts( studentBillingAccounts != null ? 
							studentBillingAccounts.stream()
								.filter( sba -> sba.getStudent().getActive() == null || sba.getStudent().getActive() )
								.map( sba ->  modelBuilderService.buildStudentBillingAccountModel( sba) ).collect(Collectors.toList() ) :
							null
					)
					.billingTransactionPage( new PageImpl<>(billingTransactionModelList, pageable, billingTransactionPage.getTotalElements()) )
					.build() );
		}else if( studentBillingAccount != null ) {
			Page<BillingTransaction> billingTransactionPage = billingService.getBillingTransactionsByStudentAccount(studentBillingAccount, transactionType, startDate, endDate, pageable);
			List<BillingTransactionModel> billingTransactionModelList = billingTransactionPage.hasContent() ? 
					billingTransactionPage.getContent().stream().map( t -> modelBuilderService.buildBillingTransactionModel( t, activeProgram ) ).collect(Collectors.toList()) : 
					new ArrayList<>();
			return ResponseEntity.ok( StudentLedgerModel.builder()
					.familyBillingAccount(familyBillingAccount)
					.studentBillingAccount( modelBuilderService.buildStudentBillingAccountModel(studentBillingAccount) )
					.billingTransactionPage( new PageImpl<>(billingTransactionModelList, pageable, billingTransactionPage.getTotalElements()) )
					.build() );
		}
		return ResponseEntity.badRequest().build();
	}
	
	@GetMapping("/family/billing/ledger/totals")
	public ResponseEntity<StudentLedgerModel> getFamilyBillingLedgerTotals( 
			@RequestParam(value="studentId", required=false) Long studentId,
			@RequestParam(value="familyId", required=false ) Long familyId,
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
			}else if( studentBillingAccount.getFamilyBillingAccount() != null ) {
				familyBillingAccount = studentBillingAccount.getFamilyBillingAccount();
			}
		}else if( familyId != null ) {
			familyBillingAccount = billingService.getFamilyBillingAccount(familyId);
			//TODO: validate that they can look at this ledger
		}
		if( familyBillingAccount != null ) {
			List<StudentBillingAccount> studentBillingAccounts = billingService.getStudentBillingAccountsByFamilyId( familyBillingAccount.getId() );
			return ResponseEntity.ok( StudentLedgerModel.builder()
					.familyBillingAccount(familyBillingAccount)
					.studentBillingAccounts( studentBillingAccounts != null ? 
							studentBillingAccounts.stream()
								.filter( sba -> sba.getStudent().getActive() == null || sba.getStudent().getActive() )
								.map( sba ->  modelBuilderService.buildStudentBillingAccountModel( sba) ).collect(Collectors.toList() ) :
							null
					)
					.build() );
		}else if( studentBillingAccount != null ) {
			return ResponseEntity.ok( StudentLedgerModel.builder()
					.familyBillingAccount(familyBillingAccount)
					.studentBillingAccount( modelBuilderService.buildStudentBillingAccountModel(studentBillingAccount) )
					.build() );
		}
		return ResponseEntity.badRequest().build();
	}
	
	@DeleteMapping("/billing/transaction/{recordId}")
	public ResponseEntity<Void> deleteBillingTransaction( @PathVariable("recordId") BillingTransaction billingTransaction, HttpServletRequest request ){
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		if( ( 
				( billingTransaction.getStudentBillingAccount() != null && billingTransaction.getStudentBillingAccount().getProgramId().equals( activeProgram.getId() ) ) ||
				( billingTransaction.getStudentBillingAccount() != null && billingTransaction.getStudentBillingAccount().getStudent().getProgramId().equals( activeProgram.getId() ) ) ||
				( billingTransaction.getFamilyBillingAccount() != null && billingTransaction.getFamilyBillingAccount().getProgramId().equals( activeProgram.getId() ) ) 
			) && 
			sessionService.isAuthorized(activeProgram, AuthenticationUtils.getOwnerRoles(), request)	
		) {
			billingService.deleteBillingTransaction(billingTransaction);
			return ResponseEntity.ok().build();
		}
		return ResponseEntity.badRequest().build();
	}
	
	@PostMapping("/billing/transaction/{recordId}")
	public ResponseEntity<BillingTransactionModel> updateBillingTransaction( @PathVariable("recordId") BillingTransaction billingTransaction,
			@RequestBody BillingTransactionModel billingTransactionModel,
			HttpServletRequest request ){
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		if( ( 
				( billingTransaction.getStudentBillingAccount() != null && billingTransaction.getStudentBillingAccount().getProgramId().equals( activeProgram.getId() ) ) ||
				( billingTransaction.getStudentBillingAccount() != null && billingTransaction.getStudentBillingAccount().getStudent().getProgramId().equals( activeProgram.getId() ) ) ||
				( billingTransaction.getFamilyBillingAccount() != null && billingTransaction.getFamilyBillingAccount().getProgramId().equals( activeProgram.getId() ) ) 
			) && 
			sessionService.isAuthorized(activeProgram, AuthenticationUtils.getOwnerRoles(), request)	
		) {
			BillingTransaction existingBillingTransaction = new BillingTransaction(billingTransaction);
			billingTransaction.setAmount( billingTransactionModel.getAmount() );
			billingTransaction.setDescription( billingTransactionModel.getDescription() );
			if( billingTransactionModel.getAuthorization() != null ) {
				billingTransaction.setAuthorization( billingTransactionModel.getAuthorization() );
			}
			if( billingTransactionModel.getPaymentMethodType() != null ) {
				billingTransaction.setPaymentMethodType( billingTransactionModel.getPaymentMethodType() );
			}
			
			billingTransaction = billingService.updateBillingTransaction(billingTransaction, existingBillingTransaction);
			return ResponseEntity.ok( modelBuilderService.buildBillingTransactionModel(billingTransaction, activeProgram) );
		}
		return ResponseEntity.badRequest().build();
	}
	
	@GetMapping("/program/weekly/deposit/report")
	public ResponseEntity<DepositReportModel> getWeeklyDepositReport(  
			@RequestParam(value="startDate", required=false) @DateTimeFormat(pattern = "dd.MM.yyyy") LocalDate startDate,
			@RequestParam(value="endDate", required=false) @DateTimeFormat(pattern = "dd.MM.yyyy") LocalDate endDate,
			@RequestParam(value="filter", required=false, defaultValue="ALL") String filter,
			HttpServletRequest request ){
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		if( activeProgram == null ) {
			return ResponseEntity.badRequest().build();
		}
		return ResponseEntity.ok( billingService.getWeeklyDepositReport( activeProgram, startDate, endDate, filter ) );
	}
	
	@GetMapping("/program/weekly/deposit/summary/report")
	public ResponseEntity<DepositSummaryModel> getWeeklyDepositSummaryReport(  
			@RequestParam(value="startDate", required=false) @DateTimeFormat(pattern = "dd.MM.yyyy") LocalDate startDate,
			@RequestParam(value="endDate", required=false) @DateTimeFormat(pattern = "dd.MM.yyyy") LocalDate endDate,
			@RequestParam(value="filter", required=false, defaultValue="ALL") String filter,
			HttpServletRequest request ){
		AfterSchoolProgram activeProgram = sessionService.getActiveProgram(request);
		if( activeProgram == null ) {
			return ResponseEntity.badRequest().build();
		}
		return ResponseEntity.ok( billingService.getWeeklyDepositSummaryReport( activeProgram, startDate, endDate, filter ) );
	}
	
}
