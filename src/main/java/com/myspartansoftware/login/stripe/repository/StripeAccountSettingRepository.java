package com.myspartansoftware.login.stripe.repository;

import javax.validation.constraints.NotBlank;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.myspartansoftware.login.stripe.domian.StripeAccountSetting;


@Repository("stripeAccountSettingepository")
public interface StripeAccountSettingRepository extends JpaRepository<StripeAccountSetting, Long> {

	StripeAccountSetting findByProgramIdAndStatus(@NotBlank String programId, Boolean statusActive);

}
