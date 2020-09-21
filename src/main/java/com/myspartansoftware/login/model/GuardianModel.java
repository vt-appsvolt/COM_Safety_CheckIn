package com.myspartansoftware.login.model;

import java.util.List;

import com.myspartansoftware.login.domain.Guardian.Relationship;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper=false)
public class GuardianModel extends PersonModel {

	private Long id;
	private Long programId;
	private String parentId;
	private String employer;
	private String driversLicenseNumber;
	private Relationship relationship;
	private List<ContactModel> contacts;
}
