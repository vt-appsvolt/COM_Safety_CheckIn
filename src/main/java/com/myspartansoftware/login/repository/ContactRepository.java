package com.myspartansoftware.login.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.myspartansoftware.login.domain.Contact;

@Repository("contactRepository")
public interface ContactRepository extends JpaRepository<Contact, Long>{

}
