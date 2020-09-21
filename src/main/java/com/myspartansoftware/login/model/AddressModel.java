package com.myspartansoftware.login.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressModel {

	private Long id;
	private String fullAddress;
	private String street;
	private String street2;
	private String city;
	private String state;
	private String zipcode;
}
