package com.milktea.supplysystem.repository;

import com.milktea.supplysystem.entity.Requisition;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RequisitionRepository extends JpaRepository<Requisition, Long> {
}