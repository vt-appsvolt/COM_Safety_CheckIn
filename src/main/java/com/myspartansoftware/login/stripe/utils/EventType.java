package com.myspartansoftware.login.stripe.utils;

public class EventType {

	public static final String ISSUING_TRANSACTION_CREATED = "issuing_transaction.created";
	public static final String ISSUING_TRANSACTION_UPDATED = "issuing_transaction.updated";
	public static final String CUSTOMER_CREATED = "customer.created";
	public static final String CUSTOMER_UPDATED = "customer.updated";
	public static final String CHARGE_UPDATED = "charge.updated";
	public static final String CHARGE_SUCCEEDED = "charge.succeeded";
	public static final String CHARGE_PENDING = "charge.pending";
	public static final String CHARGE_FAILED = "charge.failed";
	public static final String CHARGE_CAPTURED = "charge.captured";
	
}
