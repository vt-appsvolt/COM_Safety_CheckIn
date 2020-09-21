package com.myspartansoftware.login.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.myspartansoftware.login.domain.Contact;
import com.myspartansoftware.login.repository.ContactRepository;

@Service("contactService")
public class ContactService {

	private ContactRepository contactRepository;
	
	
	@Autowired 
	public ContactService( ContactRepository contactRepository ) {
		this.contactRepository = contactRepository;
	}
	
	public void saveContact( Contact contact ) {
		contactRepository.save(contact);
	}
	
}
