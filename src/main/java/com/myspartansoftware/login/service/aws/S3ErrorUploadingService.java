package com.myspartansoftware.login.service.aws;

import java.text.SimpleDateFormat;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;
import java.util.TimeZone;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.amazonaws.services.s3.AmazonS3;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.myspartansoftware.login.model.aws.AwsErrorLog;

@Service("s3ErrorUploadingService")
public class S3ErrorUploadingService {

	private final String bucketName;
	private AmazonS3 s3;
	private ObjectMapper objectMapper;
	
	@Autowired
	public S3ErrorUploadingService( AmazonS3 s3, ObjectMapper objectMapper ) {
		Objects.requireNonNull(s3);
		Objects.requireNonNull(objectMapper);
		this.bucketName = "safety-check-in";
		this.s3 = s3;
		this.objectMapper = objectMapper;
		objectMapper.registerModule(new JavaTimeModule());
		objectMapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX"));
	}
	@Async
	public void uploadError( Long activeProgramId, String methodName, String timeZone, AwsErrorLog error ){
		if( !s3.doesBucketExistV2(bucketName) ) {
			s3.createBucket(bucketName);
		}
		try {
			ZonedDateTime now = ZonedDateTime.now(TimeZone.getTimeZone(  timeZone != null ? timeZone : "US/Eastern").toZoneId());
			String key = String.format("%s/%s/%s/%s/checkin/%s_%s_%s.json", activeProgramId, now.getYear(), now.getMonthValue(), now.getDayOfMonth(), methodName, now.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME), UUID.randomUUID() );
			s3.putObject(bucketName, key, objectMapper.writeValueAsString(error));
		}catch( Exception e ) {
			e.printStackTrace();
		}
	}
	
	
	@Async
	public void uploadError( String key, AwsErrorLog error ){
		if( !s3.doesBucketExistV2(bucketName) ) {
			s3.createBucket(bucketName);
		}
		try {
			s3.putObject(bucketName, key, objectMapper.writeValueAsString(error));
		}catch( Exception e ) {
			e.printStackTrace();
		}
	}
	
	@Async
	public void uploadErrors( String key, List<AwsErrorLog> errors ) {
		if( !s3.doesBucketExistV2(bucketName) ) {
			s3.createBucket(bucketName);
		}
		try {
			s3.putObject(bucketName, key, objectMapper.writeValueAsString(errors));
		}catch( Exception e ) {
			e.printStackTrace();
		}
	}
	
	
	
}
