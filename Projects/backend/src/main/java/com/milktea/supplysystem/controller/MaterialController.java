package com.milktea.supplysystem.controller;

import com.milktea.supplysystem.entity.Material;
import com.milktea.supplysystem.repository.MaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/materials")
@CrossOrigin(origins = "http://localhost:5173")
public class MaterialController {
    
    @Autowired
    private MaterialRepository materialRepository;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Material> getAllMaterials() {
        return materialRepository.findAll();
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Material createMaterial(@RequestBody Material material) {
        return materialRepository.save(material);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Material updateMaterial(@PathVariable Integer id, @RequestBody Material material) {
        material.setMaterialId(id);
        return materialRepository.save(material);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteMaterial(@PathVariable Integer id) {
        materialRepository.deleteById(id);
    }
}