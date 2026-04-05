package com.milktea.supplysystem.repository;

import com.milktea.supplysystem.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialRepository extends JpaRepository<Material, Integer> {
}