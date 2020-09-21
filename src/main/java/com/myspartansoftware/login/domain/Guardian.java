package com.myspartansoftware.login.domain;

import java.io.Serializable;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name="guardian")
public class Guardian extends Person implements Serializable{
	
	
	private static final long serialVersionUID = 1289613264986504578L;
	
	public enum Relationship{
		Mother, Father, Guardian, Grandmother, Grandfather
	}
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "guardian_id")
    private Long id;
	@Column(name="program_id")
	@NotNull(message = "*Guardian must be connected to a program")
	private Long programId;
	
	@Column(name="parent_id")
	private String parentId;
	@Column(name="employer")
	private String employer;
	@Column(name="drivers_license_number")
	private String driversLicenseNumber;
	@Enumerated(EnumType.STRING)
	@Column(name="relationship")
	private Relationship relationship;
	
//	@JsonIgnore
//	@ManyToMany(mappedBy="guardians")
//	private List<Student> dependents;

	@OneToMany(cascade=CascadeType.ALL)
	@JoinTable(name="guardian_contact", joinColumns=@JoinColumn(name="guardian_id"), inverseJoinColumns=@JoinColumn(name="id") )
	private List<Contact> contacts;
	
	//TODO: Address
//	
//	@ManyToOne
//	@JoinColumn(name="family_billing_id",referencedColumnName="id")
//	private FamilyBillingAccount familyBillingAccount;
	
	@Column(name="family_billing_id")
	private Long familyBillingAccountId;
	
	@ManyToOne(cascade = CascadeType.ALL)
	@JoinColumn(name="address_id", referencedColumnName="id")
	private Address address;
	
}
