package com.myspartansoftware.login.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.myspartansoftware.login.domain.StudentBillingAttendanceRecord;

@Repository("studentBillingAttendanceRecordRepository")
public interface StudentBillingAttendanceRecordRepository extends JpaRepository<StudentBillingAttendanceRecord, Long>, JpaSpecificationExecutor<StudentBillingAttendanceRecord>{

}
