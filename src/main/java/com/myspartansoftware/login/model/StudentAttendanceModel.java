package com.myspartansoftware.login.model;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StudentAttendanceModel {

	private StudentModel student;
	private List<CheckinLogModel> checkinLogs;
}
