package com.myspartansoftware.login.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.myspartansoftware.login.domain.ActiveCheckin;

@Repository("activeCheckinRepository")
public interface ActiveCheckinRepository extends JpaRepository<ActiveCheckin, Long>, JpaSpecificationExecutor<ActiveCheckin>{

}
