package com.myspartansoftware.login.model;

import com.myspartansoftware.login.domain.Contact.ContactType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactModel {

	private Long id;
	private ContactType contactType;
	private String label;
	private String contactValue;
	private Boolean preferred;
}
