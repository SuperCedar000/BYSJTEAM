package com.milktea.supplysystem.repository;

import com.milktea.supplysystem.entity.SalesRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SalesRecordRepository extends JpaRepository<SalesRecord, Long> {
}