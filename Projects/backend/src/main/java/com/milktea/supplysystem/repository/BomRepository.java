package com.milktea.supplysystem.repository;

import com.milktea.supplysystem.entity.Bom;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BomRepository extends JpaRepository<Bom, Integer> {
}