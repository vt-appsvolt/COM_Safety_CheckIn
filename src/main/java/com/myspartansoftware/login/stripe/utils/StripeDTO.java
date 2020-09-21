package com.myspartansoftware.login.stripe.utils;

import java.math.BigDecimal;
import java.math.RoundingMode;

import com.myspartansoftware.login.stripe.domian.StripeCustomer;
import com.myspartansoftware.login.stripe.domian.StripeCustomerCharge;
import com.myspartansoftware.login.stripe.domian.StripeTransaction;
import com.stripe.model.BalanceTransaction;
import com.stripe.model.Charge;
import com.stripe.model.Customer;

/**
 * 
 * @author Vikas
 *
 */
public class StripeDTO {

	public static StripeCustomerCharge convertChargeToStripeCustomerCharge(Charge customerCharge, String programId) {
		StripeCustomerCharge stripeCustomerCharge = new StripeCustomerCharge();
		stripeCustomerCharge.amount = new BigDecimal( customerCharge.getAmount() ).divide( new BigDecimal( 100 )).setScale(2, RoundingMode.HALF_UP );
		stripeCustomerCharge.amountRefunded = new BigDecimal( customerCharge.getAmountRefunded() ).divide( new BigDecimal( 100 )).setScale(2, RoundingMode.HALF_UP );
		if (customerCharge.getApplicationFeeAmount() != null) {
			stripeCustomerCharge.applicationFeeAmount = new BigDecimal( customerCharge.getApplicationFeeAmount() ).divide( new BigDecimal( 100 )).setScale(2, RoundingMode.HALF_UP );
		}
		stripeCustomerCharge.calculatedStatementDescriptor = customerCharge.getCalculatedStatementDescriptor();

		stripeCustomerCharge.captured = customerCharge.getCaptured();
		stripeCustomerCharge.chargeId = customerCharge.getId();
		stripeCustomerCharge.created = DateUtils.convertUnixToEasternTime(customerCharge.getCreated());
		stripeCustomerCharge.currency = customerCharge.getCurrency();
		stripeCustomerCharge.description = customerCharge.getDescription();
		stripeCustomerCharge.failureCode = customerCharge.getFailureCode();
		stripeCustomerCharge.failureMessage = customerCharge.getFailureMessage();
		stripeCustomerCharge.paymentMethod = customerCharge.getPaymentMethod();
		stripeCustomerCharge.paid = customerCharge.getPaid();
		stripeCustomerCharge.paymentIntent = customerCharge.getPaymentIntent();
		stripeCustomerCharge.receiptEmail = customerCharge.getReceiptEmail();
		stripeCustomerCharge.receiptUrl = customerCharge.getReceiptUrl();
		stripeCustomerCharge.statementDescriptor = customerCharge.getStatementDescriptor();
		stripeCustomerCharge.status = customerCharge.getStatus();
		stripeCustomerCharge.customerId = customerCharge.getCustomer();
		stripeCustomerCharge.transactionId = customerCharge.getBalanceTransaction();
		stripeCustomerCharge.programId = programId;
		

		return stripeCustomerCharge;
	}

	public static StripeCustomer convertCustomerToStripeCustomer(Customer customer, String programId) {
		StripeCustomer stripeCustomer = new StripeCustomer();
		stripeCustomer.balance = new BigDecimal( customer.getBalance() ).divide( new BigDecimal( 100 )).setScale(2, RoundingMode.HALF_UP );
		stripeCustomer.created = DateUtils.convertUnixToEasternTime(customer.getCreated());

		stripeCustomer.currency = customer.getCurrency();
		stripeCustomer.customerId = customer.getId();
		stripeCustomer.description = customer.getDescription();
		stripeCustomer.email = customer.getEmail();

//		stripeCustomer.familyBillingAccountId = customer.getMetadata().get("family_billing_id");
		stripeCustomer.name = customer.getName();
		stripeCustomer.phone = customer.getPhone();
		stripeCustomer.programId = programId;
		
		return stripeCustomer;
	}

	public static StripeTransaction convertBalanceTransactionToStripeTransaction(BalanceTransaction balanceTransaction,
			String programId) {
		StripeTransaction stripeTransaction = new StripeTransaction();

		stripeTransaction.amount = new BigDecimal( balanceTransaction.getAmount() ).divide( new BigDecimal( 100 )).setScale(2, RoundingMode.HALF_UP );
		stripeTransaction.availableOn = DateUtils.convertUnixToEasternTime(balanceTransaction.getAvailableOn());
		stripeTransaction.created = DateUtils.convertUnixToEasternTime(balanceTransaction.getCreated());
		stripeTransaction.currency = balanceTransaction.getCurrency();
		stripeTransaction.description = balanceTransaction.getDescription();
		stripeTransaction.fee = new BigDecimal( balanceTransaction.getFee() ).divide( new BigDecimal( 100 )).setScale(2, RoundingMode.HALF_UP );
		stripeTransaction.net = new BigDecimal( balanceTransaction.getNet() ).divide( new BigDecimal( 100 )).setScale(2, RoundingMode.HALF_UP );
		stripeTransaction.source = balanceTransaction.getSource();
		stripeTransaction.transactionId = balanceTransaction.getId();
		stripeTransaction.type = balanceTransaction.getType();
		stripeTransaction.status = balanceTransaction.getStatus();
		stripeTransaction.programId = programId;

		return stripeTransaction;
	}
}
