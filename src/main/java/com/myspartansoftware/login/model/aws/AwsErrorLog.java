package com.myspartansoftware.login.model.aws;

import java.util.HashMap;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class AwsErrorLog {

	private String description;
	private String code;
	private String method;
	private Long activeUserId;
	private Long programId;
	private HashMap<String, String> data;
	
}
