package com.milktea.supplysystem.controller;

import com.milktea.supplysystem.entity.Requisition;
import com.milktea.supplysystem.repository.RequisitionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requisition")
@CrossOrigin(origins = "http://localhost:5173")
public class RequisitionController {

    @Autowired
    private RequisitionRepository requisitionRepository;

    @PostMapping
    public Requisition createRequisition(@RequestBody Requisition requisition) {
        requisition.setStatus("pending");
        return requisitionRepository.save(requisition);
    }

    @GetMapping
    public List<Requisition> getAllRequisitions() {
        return requisitionRepository.findAll();
    }

    @PutMapping("/{id}/status")
    public Requisition updateStatus(@PathVariable Long id, @RequestParam String status) {
        Requisition req = requisitionRepository.findById(id).orElseThrow();
        req.setStatus(status);
        return requisitionRepository.save(req);
    }
}