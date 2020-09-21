package com.myspartansoftware.login.stripe.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.validation.constraints.NotBlank;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.myspartansoftware.login.stripe.domian.StripeAccountSetting;
import com.myspartansoftware.login.stripe.domian.StripeCustomer;
import com.myspartansoftware.login.stripe.domian.StripeCustomerCharge;
import com.myspartansoftware.login.stripe.domian.StripeTransaction;
import com.myspartansoftware.login.stripe.service.StripeAccountSettingService;
import com.myspartansoftware.login.stripe.service.StripeCustomerChargeService;
import com.myspartansoftware.login.stripe.service.StripeCustomerService;
import com.myspartansoftware.login.stripe.service.StripeTransactionService;
import com.myspartansoftware.login.stripe.utils.StripeDTO;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.BalanceTransaction;
import com.stripe.model.Charge;
import com.stripe.model.Customer;

@Controller
public class StripeController {

	@Autowired
	StripeTransactionService stripeTransactionService;

	@Autowired
	StripeCustomerService stripeCustomerService;

	@Autowired
	StripeCustomerChargeService stripeCustomerChargeService;

	@Autowired
	StripeAccountSettingService stripeAccountSettingService;

	@GetMapping("/stripe/{programId}/sync")
	public ResponseEntity<Void> fetchAllStripeDetails(@PathVariable("programId") @NotBlank String programId) {

		// Fetch Account Setting Details by Program Id
		System.out.println("==========Program id========>>>>>>>>>" + programId);
		StripeAccountSetting stripeAccountSetting = stripeAccountSettingService.findByProgramIdAndStatus(programId,
				Boolean.TRUE);
		// If Account is not bind with program id throw an bad request error
		if (stripeAccountSetting == null) {
			return ResponseEntity.badRequest().build();
		}
		// Check fetched account is in live or test mode
		if (stripeAccountSetting.isLiveMode) {
			Stripe.apiKey = stripeAccountSetting.secretKey;
		} else {
			Stripe.apiKey = stripeAccountSetting.testSecretKey;
		}
		try {
			// Fetch all Customers
			fetchAndPersistCustomers(programId);
			// Fetch all Customer Charges
			fetchAndPersistCharges(programId);
			// Fetch all Account BalanceTransaction
			fetchAndPersistTransaction(programId);
		} catch (StripeException e) {
			e.printStackTrace();
		}
		return ResponseEntity.ok().build();
	}

	private void fetchAndPersistCharges(String programId) throws StripeException {
		// Delete Record
		stripeCustomerChargeService.deleteByProgramId(programId);

		Map<String, Object> chargeParams = new HashMap<>();
		chargeParams.put("limit", 100);
		// Auto Pagination Data
		Iterable<Charge> chargeList = Charge.list(chargeParams).autoPagingIterable();

		List<StripeCustomerCharge> stripeCustomerCharges = new ArrayList<>();

		for (Charge customerCharge : chargeList) {
			stripeCustomerCharges.add(StripeDTO.convertChargeToStripeCustomerCharge(customerCharge,programId));
		}
		System.out.println("====stripeCustomerscharge===" + stripeCustomerCharges.size());
		stripeCustomerChargeService.saveAll(stripeCustomerCharges);

	}

	private void fetchAndPersistCustomers(String programId) throws StripeException {
		// Delete Record
		stripeCustomerService.deleteByProgramId(programId);

		Map<String, Object> customerParms = new HashMap<>();
		customerParms.put("limit", 100);
		// Auto Pagination Data
		Iterable<Customer> customerList = Customer.list(customerParms).autoPagingIterable();

		List<StripeCustomer> stripeCustomers = new ArrayList<>();

		for (Customer customer : customerList) {
			stripeCustomers.add(StripeDTO.convertCustomerToStripeCustomer(customer, programId));
		}
		System.out.println("====stripeCustomers===" + stripeCustomers.size());
		stripeCustomerService.saveAll(stripeCustomers);

	}

	private void fetchAndPersistTransaction(String programId) throws StripeException {
		// Delete Record
		stripeTransactionService.deleteByProgramId(programId);

		Map<String, Object> balanceTransParam = new HashMap<>();
		balanceTransParam.put("limit", 100);
		// Auto Pagination Data
		Iterable<BalanceTransaction> balanceTransactions = BalanceTransaction.list(balanceTransParam)
				.autoPagingIterable();

		List<StripeTransaction> stripeTransactions = new ArrayList<>();

		for (BalanceTransaction balanceTransaction : balanceTransactions) {
			

			stripeTransactions.add(StripeDTO.convertBalanceTransactionToStripeTransaction(balanceTransaction, programId));

		}
		System.out.println("====stripeTransactions===" + stripeTransactions.size());
		stripeTransactionService.saveAll(stripeTransactions);
	}

	

}
