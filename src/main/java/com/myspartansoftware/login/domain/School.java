package com.myspartansoftware.login.domain;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

import lombok.Data;

@Data
@Entity
@Table(name="school")
public class School {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "school_id")
	private Long id;
	@Column(name="name")
	private String name;
	@Column(name="program_id")
	@NotNull(message = "*School must be connected to a program")
	private Long programId;
	
	
}
