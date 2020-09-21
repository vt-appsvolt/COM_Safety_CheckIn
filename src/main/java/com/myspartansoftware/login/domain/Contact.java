package com.myspartansoftware.login.domain;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.Data;

@Data
@Entity
@Table(name="contact")
public class Contact implements Serializable {

	private static final long serialVersionUID = 6630099072265880159L;

	public enum ContactType{
		Phone, Email;
	}
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private Long id;
	
	@Enumerated(EnumType.STRING)
	@Column(name="contact_type")
	private ContactType contactType;
	
	@Column(name="label")
	private String label;
	
	@Column(name="contact_value")
	private String contactValue;
	
	@Column(name="preferred")
	private Boolean preferred;
	
}
