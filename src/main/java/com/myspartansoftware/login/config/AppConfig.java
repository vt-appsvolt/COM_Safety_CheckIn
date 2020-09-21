package com.myspartansoftware.login.config;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import org.springframework.beans.factory.config.PropertiesFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

@Configuration
public class AppConfig {

	@javax.annotation.Resource Properties properties;
	
	@Bean(name="properties")
	public static PropertiesFactoryBean getPropertiesFactoryBean() throws Exception {
		
		PropertiesFactoryBean propertiesFactory = new PropertiesFactoryBean();
		propertiesFactory.setFileEncoding("UTF-8");
		
		List<Resource> list = new ArrayList<>();
		list.add(new ClassPathResource("application.properties"));
		list.add(new ClassPathResource("stripe.properties"));
		
		propertiesFactory.setLocations(list.toArray(new Resource[list.size()]));
		propertiesFactory.afterPropertiesSet();
		return propertiesFactory;
	}
	
}
