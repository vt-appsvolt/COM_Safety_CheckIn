package com.myspartansoftware.login.domain;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.Data;

@Data
@Entity
@Table(name="employee_role")
public class EmployeeRole {

	public enum EmployeeRoleType{
		Owner, Manager, Cashier
	}
	@Id
	private EmployeeRolePK id;
	
}
