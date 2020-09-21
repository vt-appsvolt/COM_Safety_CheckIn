package com.myspartansoftware.login.utils;

import java.util.Arrays;
import java.util.List;

import com.myspartansoftware.login.domain.EmployeeRole.EmployeeRoleType;

public class AuthenticationUtils {

	public static final List<EmployeeRoleType> getOwnerRoles(){
		return Arrays.asList( EmployeeRoleType.Owner );
	}
	
	
	public static final List<EmployeeRoleType> getManagerRoles(){
		return Arrays.asList( EmployeeRoleType.Manager );
	}
	
}

