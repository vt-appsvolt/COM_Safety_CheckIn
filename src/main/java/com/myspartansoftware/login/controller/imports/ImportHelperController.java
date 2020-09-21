package com.myspartansoftware.login.controller.imports;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import com.myspartansoftware.login.service.billing.BillingService;
import com.myspartansoftware.login.service.forms.ZohoStudentFormService;
import com.myspartansoftware.login.service.imports.StudentGradeIncrementorService;
import com.myspartansoftware.login.service.imports.StudentParentExcelService;

@Controller
public class ImportHelperController {

	@Autowired
	private StudentParentExcelService studentParentExcelService;
	
	@Autowired
	private StudentGradeIncrementorService studentGradeIncrementorService;
	
	@Autowired
	private ZohoStudentFormService zohoStudentFormService;
	
	@Autowired
	private BillingService billingService;
	
	@GetMapping("/import/process/parent/student/excel")
	public ResponseEntity<String> processStudentParentExcel( Pageable pageable ){
		studentParentExcelService.processExcel(pageable);
		return ResponseEntity.ok("processed");
	}
	
	@GetMapping("/import/process/parent/student/excel/v2")
	public ResponseEntity<String> processStudentParentExcelV2( Pageable pageable ){
		studentParentExcelService.processExcelV2(pageable);
		return ResponseEntity.ok("processed");
	}
	
	@GetMapping("/student/grade/incrementor/{programId}/build")
	public ResponseEntity<String> buildStudentGradeIncrementors( @PathVariable("programId") Long programId ){
		studentGradeIncrementorService.loadProgramStudents(programId);
		return ResponseEntity.ok("built");
	}
	
	@GetMapping("/student/grade/incrementor/{programId}/process")
	public ResponseEntity<String> buildStudentGradeIncrementors( @PathVariable("programId") Long programId,  Pageable pageable ){
		studentGradeIncrementorService.processStudentGradeIncrement(programId, pageable);
		return ResponseEntity.ok("processed");
	}
	
	@GetMapping("/zoho/student/form/process")
	public ResponseEntity<String> processZohoForms(
			@RequestParam(value="activate", required=false, defaultValue="true") Boolean activate,
			@RequestParam(value="process_fee", required=false, defaultValue="true") Boolean processFee,
			Pageable pageable ){
		zohoStudentFormService.processForms(pageable, processFee, activate);
		return ResponseEntity.ok("processed");
	}
	
	@GetMapping("/student/billing/account/updates")
	public ResponseEntity<String> updateStudentBillingAccount( Pageable pageable ){
		billingService.updateStudentBilling(pageable);
		return ResponseEntity.ok("processed"); 
	}
	
	
	@GetMapping("/program/{programId}/weekly/balance/adjustment")
	public ResponseEntity<String> programWeeklyBalanceAdjustment( @PathVariable("programId") Long programId ){
		billingService.rebalanceStudentsEndOfWeekLedger(programId);
		return ResponseEntity.ok("processed"); 
	}
	
	@GetMapping("/temp/cleanup")
	public ResponseEntity<String> tempCleanup( ){
		billingService.cleanupDuplicateBilling();
		return ResponseEntity.ok("processed"); 		
	}
	
	@GetMapping("/stripe/account/link/{programId}")
	public ResponseEntity<String> linkFamilyBillingAccounts( @PathVariable("programId") Long programId ){
		billingService.linkFamilyBillingAccountsToStripeCustomer(programId);
		return ResponseEntity.ok("processed"); 
	}
	
}
