package com.myspartansoftware.login.domain.billing;

import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

import com.myspartansoftware.login.domain.enums.SpecializedBillingPlan;

import lombok.Data;

@Data
@Entity
@Table(name="billing_plan")
public class BillingPlan {

	
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO )
	@Column(name = "id")
    private Long id;
	@Column(name="plan_name")
	private String planName;
	@Column(name="program_id")
	@NotNull(message = "*Billing Plan must be connected to a program")
	private Long programId;
	@Column(name="default_rate")
	private Boolean defaultRate;
	@Column(name="percentage")
	private Integer percentage;
	@Column(name="daily_rate")
	private BigDecimal dailyRate;
	@Column(name="early_release")
	private BigDecimal earlyRelease;
	@Column(name="full_day")
	private BigDecimal fullDay;
	@Column(name="allow_early_release")
	private Boolean allowEarlyRelease;
	@Column(name="early_release_minute_maximum")
	private Integer earlyReleaseMinuteMaximum;
	@Column(name="allow_full_day")
	private Boolean allowFullDay;
	@Column(name="full_day_minute_minimum")
	private Integer fullDayMinuteMinimum; // > 7 hours
	@Column(name="weekly_rate")
	private BigDecimal weeklyRate;
	@Enumerated(EnumType.STRING)
	@Column(name="specialized_billing_plan")
	private SpecializedBillingPlan specializedBillingPlan;
}
