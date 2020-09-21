package com.myspartansoftware.login.domain.billing;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.myspartansoftware.login.utils.ZonedDateTimeDeserializer;
import com.myspartansoftware.login.utils.ZonedDateTimeSerializer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name="billing_transaction")
public class BillingTransaction {

	public enum TransactionType {
		Charge,
		Credit,
		Payment,
		Refund
	}
	
	public enum PaymentMethodType {
		CreditCard,
		Ach,
		Check,
		Cash
	}
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private Long id;
	
	
	@Column(name="amount")
	private BigDecimal amount;
	
	@Enumerated(EnumType.STRING)
	@Column(name="type")
	private TransactionType type;
	
	@Column(name = "date")
	@JsonSerialize(converter = ZonedDateTimeSerializer.class)
	@JsonDeserialize(converter = ZonedDateTimeDeserializer.class)
	private ZonedDateTime date;

	@ManyToOne
	@JoinColumn(name="family_billing_account_id",referencedColumnName="id")
	private FamilyBillingAccount familyBillingAccount;
	
	@Column(name="family_billing_account_id", insertable=false, updatable=false)
	private Long familyBillingAccountId;
	
	@ManyToOne
	@JoinColumn(name="student_billing_account_id",referencedColumnName="id")
	private StudentBillingAccount studentBillingAccount;
	
	@Column(name="student_billing_account_id", insertable=false, updatable=false)
	private Long studentBillingAccountId;
	
	@Column(name="authorization")
	private String authorization;

	@Column(name="description")
	private String description;
	
	@Column(name="student_billing_attendance_record_id", unique = true)
	private Long studentBillingAttendanceRecordId;
	
	@Enumerated(EnumType.STRING)
	@Column(name="payment_method_type")
	private PaymentMethodType paymentMethodType;
	
	public BillingTransaction( BillingTransaction b ) {
		this.id = b.getId();
		this.amount = b.getAmount();
		this.type = b.getType();
		this.date = b.getDate();
		this.familyBillingAccount = b.getFamilyBillingAccount();
		this.familyBillingAccountId = b.getFamilyBillingAccountId();
		this.studentBillingAccount = b.getStudentBillingAccount();
		this.studentBillingAccountId = b.getStudentBillingAccountId();
		this.authorization = b.getAuthorization();
		this.description = b.getDescription();
		this.studentBillingAttendanceRecordId = b.getStudentBillingAttendanceRecordId();
		this.paymentMethodType = b.paymentMethodType;
	}
}
