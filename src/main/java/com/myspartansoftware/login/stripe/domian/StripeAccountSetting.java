package com.myspartansoftware.login.stripe.domian;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.Data;

@Data
@Entity
@Table(name = "stripe_account_setting")
public class StripeAccountSetting {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "id")
	private Long id;

	@Column(name="program_id")
	public String programId;
	
	@Column(name = "test_secret_key")
	public String testSecretKey;

	@Column(name = "test_publishable_key")
	public String testPublishablekey;
	
	@Column(name = "test_client_id")
	public String testClientId;
	
	@Column(name = "secret_key")
	public String secretKey;

	@Column(name = "publishable_key")
	public String publishablekey;
	
	@Column(name = "client_id")
	public String clientId;
	
	@Column(name = "is_live_mode")
	public Boolean isLiveMode;
	
	@Column(name = "status")
	public Boolean status;
}