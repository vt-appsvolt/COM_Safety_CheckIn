package com.myspartansoftware.login.stripe.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.myspartansoftware.login.domain.AfterSchoolProgram;
import com.myspartansoftware.login.service.AfterSchoolProgramService;
import com.myspartansoftware.login.stripe.domian.StripeAccountSetting;
import com.myspartansoftware.login.stripe.domian.StripeCustomer;
import com.myspartansoftware.login.stripe.domian.StripeCustomerCharge;
import com.myspartansoftware.login.stripe.domian.StripeTransaction;
import com.myspartansoftware.login.stripe.service.StripeAccountSettingService;
import com.myspartansoftware.login.stripe.service.StripeCustomerChargeService;
import com.myspartansoftware.login.stripe.service.StripeCustomerService;
import com.myspartansoftware.login.stripe.service.StripeTransactionService;
import com.myspartansoftware.login.stripe.utils.EventType;
import com.myspartansoftware.login.stripe.utils.StripeDTO;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.BalanceTransaction;
import com.stripe.model.Charge;
import com.stripe.model.Customer;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.net.ApiResource;

@Controller
public class StripeWebHookController {

	@Autowired
	StripeTransactionService stripeTransactionService;

	@Autowired
	StripeCustomerService stripeCustomerService;

	@Autowired
	StripeCustomerChargeService stripeCustomerChargeService;

	@Autowired
	StripeAccountSettingService stripeAccountSettingService;

	@Autowired
	AfterSchoolProgramService afterSchoolProgramService;

	@PostMapping("stripe/webhook/notification")
	public ResponseEntity<String> fetchAllStripeDetails(@RequestBody String requestData,
			@RequestParam String programId) {
		System.out.println("====Request Param=====" + programId);
		// Check request param programId is exist or not
		if (programId == null || programId.isEmpty()) {
			System.out.println("Please add After School Program Id");
			return ResponseEntity.badRequest().body("Please add After School Program Id");
		}
		// Check request param programId is valid or not
		Optional<AfterSchoolProgram> afterSchoolProgram = afterSchoolProgramService
				.findAfterSchoolProgram(Long.valueOf(programId).longValue());
		if (!afterSchoolProgram.isPresent()) {
			System.out.println("Please add valid After School Program Id");
			return ResponseEntity.badRequest().body("Please add valid After School Program Id");
		}
		Event event = ApiResource.GSON.fromJson(requestData, Event.class);
		System.out.println("Event id ========>>>>>>> " + event.getId());
		System.out.println("Event type ========>>>>>>> " + event.getType());
		// Deserialize the nested object inside the event
		EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
		StripeObject stripeObject = null;
		if (dataObjectDeserializer.getObject().isPresent()) {
			stripeObject = dataObjectDeserializer.getObject().get();
		} else {
			System.out.println("There are some issue to Deserialize Object");
			return ResponseEntity.badRequest().body("There are some issue to Deserialize Object");
		}
		// Calling the updateEventData method and get response message
		String responseMessage = updateEventData(programId, event, stripeObject);
		// Generate and Return Response success message
		System.out.println("Event Data updated ====>>>>> " + responseMessage);
		return ResponseEntity.ok(responseMessage);
	}

	/**
	 * @param programId
	 * @param event
	 * @param stripeObject
	 * @return
	 */
	private String updateEventData(String programId, Event event, StripeObject stripeObject) {
		String responseMessage = "There is no event type to match";
		switch (event.getType()) {
		case EventType.CHARGE_CAPTURED:
		case EventType.CHARGE_FAILED:
		case EventType.CHARGE_PENDING:
		case EventType.CHARGE_SUCCEEDED:
		case EventType.CHARGE_UPDATED:
			Charge charge = (Charge) stripeObject;
			System.out.println("====stripe charge=====" + charge);
			/**
			 * Check customer charge is already exist into the database if yes, then update
			 * the existing customer charge data into the stripe_customer_charge table if
			 * no, then save customer charge data into the stripe_customer_charge table
			 */
			StripeCustomerCharge stripeCustomerCharge = stripeCustomerChargeService.findByChargeId(charge.getId());
			// Convert Stripe Charge Object to Domain Stripe Customer Charge Object
			StripeCustomerCharge customerChargeDomain = StripeDTO.convertChargeToStripeCustomerCharge(charge,
					programId);
			if (stripeCustomerCharge != null) {
				customerChargeDomain.id = stripeCustomerCharge.id;
				System.out.println("==== Update Charge Data Succesfully =====" + customerChargeDomain);
				responseMessage = "Update Charge Data Succesfully";
			} else {
				System.out.println("==== Insert Charge Data Succesfully =====" + customerChargeDomain);
				responseMessage = "Insert Charge Data Succesfully";
			}
			// Insert/Update table
			stripeCustomerChargeService.save(customerChargeDomain);

			/*
			 * Persist balance transaction
			 * Fetch and update Charge Transaction Detail
			 * Fetch API keys from the account setting table by Program Id 
			 */
			StripeAccountSetting stripeAccountSetting = stripeAccountSettingService.findByProgramIdAndStatus(programId,
					Boolean.TRUE);
			// If Account is not bind with program id throw an bad request error
			if (stripeAccountSetting == null) {
				ResponseEntity.badRequest().body("API key is missing");
			}
			// Check fetched account is in live or test mode
			if (stripeAccountSetting.isLiveMode) {
				Stripe.apiKey = stripeAccountSetting.secretKey;
			} else {
				Stripe.apiKey = stripeAccountSetting.testSecretKey;
			}
			// Retrive BalanceTransaction from transaction Id
			BalanceTransaction balanceTransaction = null;
			try {
				balanceTransaction = BalanceTransaction.retrieve(customerChargeDomain.transactionId);
			} catch (StripeException e) {
				e.printStackTrace();
			}
			// Check Balance Transaction is not null
			if (balanceTransaction != null) {
				// Fetch Stripe Transaction from the Table
				StripeTransaction stripeTransaction = stripeTransactionService.findByTransactionId(balanceTransaction.getId());
				// Convert Stripe object to the Domain object
				StripeTransaction stripeTransactionDomain = StripeDTO
						.convertBalanceTransactionToStripeTransaction(balanceTransaction, programId);
				if (stripeTransaction != null) {
					stripeTransactionDomain.id = stripeTransaction.id;
					System.out.println("==== Update Charge Transaction Detial Succesfully =====" + stripeTransactionDomain);
				} else {
					System.out.println("==== Insert Charge Transaction Detial Succesfully =====" + stripeTransactionDomain);
				}
				stripeTransactionService.save(stripeTransactionDomain);
			}
			break;
		case EventType.CUSTOMER_CREATED:
		case EventType.CUSTOMER_UPDATED:
			Customer customer = (Customer) stripeObject;
			System.out.println("====stripe customer=====" + customer);
			/**
			 * Check customer is already exist into the database if yes, then update the
			 * existing customer data into the stripe_customer table if no, then save
			 * customer data into the stripe_customer table
			 */
			StripeCustomer stripeCustomer = stripeCustomerService.findByCustomerId(customer.getId());
			// Convert Stripe Customer Object to Domain Stripe Customer Object
			StripeCustomer stripeCustomerDomain = StripeDTO.convertCustomerToStripeCustomer(customer, programId);
			if (stripeCustomer != null) {
				stripeCustomerDomain.id = stripeCustomer.id;
				System.out.println("==== Update Customer Data Succesfully =====" + stripeCustomerDomain);
				responseMessage = "Update Customer Data Succesfully";
			} else {
				System.out.println("==== Insert Customer Data Succesfully =====" + stripeCustomerDomain);
				responseMessage = "Insert Customer Data Succesfully";
			}
			// Insert/Update table
			stripeCustomerService.save(stripeCustomerDomain);
			break;
		default:
			break;
		}
		return responseMessage;
	}

}
