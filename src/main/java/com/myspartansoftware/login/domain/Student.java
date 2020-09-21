package com.myspartansoftware.login.domain;

import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.NotNull;

import com.myspartansoftware.login.domain.enums.BillingRecordType;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name="student")
public class Student extends Person{

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private Long id;
	
	@Column(name="student_id")
	private String studentId;
	@Column(name="grade")
	private String grade;
	@Column(name="program_id")
	@NotNull(message = "*Student must be connected to a program")
	private Long programId;
	@Column(name="active")
	private Boolean active; 
	
	@ManyToOne
	@JoinColumn(name="school_id",referencedColumnName="school_id")
	private School school;
	
	@Transient
	private String schoolName;
	
	@ManyToMany(cascade= CascadeType.ALL)
	@JoinTable(name="dependents", joinColumns= @JoinColumn(name="id"), inverseJoinColumns=@JoinColumn(name="guardian_id") )
	private List<Guardian> guardians;
	
	@Column(name="billing_plan_id")
	private Long billingPlanId;
	
	@Enumerated(EnumType.STRING)
	@Column(name="default_weekly_billing_type")
	private BillingRecordType defaultWeeklyBillingType;
	
	@Column(name="allergies")
	private String allergies;
	
	@Column(name="teachers_name")
	private String teachersName;
	
	@Column(name="no_photo")
	private Boolean noPhoto;
	
	@Column(name="requires_id_card")
	private Boolean requiresIdCard;
	
	public String getSchoolName() {
		if( school != null ) {
			this.schoolName = school.getName();
		}
		return schoolName;
	}
	
}
