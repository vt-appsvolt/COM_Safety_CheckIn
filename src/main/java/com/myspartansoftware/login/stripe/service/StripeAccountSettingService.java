package com.myspartansoftware.login.stripe.service;

import javax.validation.constraints.NotBlank;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.myspartansoftware.login.stripe.domian.StripeAccountSetting;
import com.myspartansoftware.login.stripe.repository.StripeAccountSettingRepository;

@Service("stripeAccountSettingService")
public class StripeAccountSettingService {

	@Autowired
	private StripeAccountSettingRepository stripeAccountSettingRepository;

	public StripeAccountSetting findByProgramIdAndStatus(@NotBlank String programId, Boolean statusActive) {
		return stripeAccountSettingRepository.findByProgramIdAndStatus(programId, statusActive);
	}

}
