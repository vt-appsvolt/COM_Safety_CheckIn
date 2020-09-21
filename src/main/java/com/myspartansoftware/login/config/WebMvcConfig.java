package com.myspartansoftware.login.config;

import java.text.SimpleDateFormat;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.SerializationFeature;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();
        return bCryptPasswordEncoder;
    }
    
    @Bean
    public Jackson2ObjectMapperBuilder jacksonBuilder() {
    	Jackson2ObjectMapperBuilder b = new Jackson2ObjectMapperBuilder();
    	b.serializationInclusion(JsonInclude.Include.NON_NULL) // Don’t include null values
    	 .indentOutput(true)
    	 .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS) //ISODate
    	 .dateFormat(new SimpleDateFormat("yyyy-MM-dd"));
    	return b;
    }
//	    @Bean(name = "OBJECT_MAPPER_BEAN")
//	    public ObjectMapper jsonObjectMapper() {
//	        return Jackson2ObjectMapperBuilder.json()
//	                .serializationInclusion(JsonInclude.Include.NON_NULL) // Don’t include null values
//	                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS) //ISODate
//	                .modules(new JSR310Module())
//	                .build();
//	    }
    
//    @Bean
//    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
//    	http
//    		.redirectToHttps();
////    		.redirectToHttps(redirect -> redirect
////    		.httpsRedirectWhen(e -> e.getRequest().getHeaders().containsKey("X-Forwarded-Proto"))
////            );
////    		.redirectToHttps()
////    		.httpsRedirectWhen( e -> e.getRequest().getHeaders().containsKey("X-Forwarded-Proto"));
//    		
//    	return http.build();
//    }
}
