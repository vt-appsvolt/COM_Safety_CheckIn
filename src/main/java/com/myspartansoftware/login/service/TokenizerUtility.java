package com.myspartansoftware.login.service;

public class TokenizerUtility {

	
	public static final String like(String string){
		if( string == null ){
			return string;
		}
		string = "%" + string.replace(" ", "%") + "%";
		return string;
	}
	
	public static final String startsWith(String string){
		return string +"%";
	}
}
