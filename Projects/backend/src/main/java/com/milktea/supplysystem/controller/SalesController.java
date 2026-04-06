package com.milktea.supplysystem.controller;

import com.milktea.supplysystem.entity.SalesRecord;
import com.milktea.supplysystem.repository.SalesRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "http://localhost:5173")
public class SalesController {

    @Autowired
    private SalesRecordRepository salesRecordRepository;

    @PostMapping
    @PreAuthorize("hasRole('STORE_MANAGER')")
    public SalesRecord createRecord(@RequestBody SalesRecord record) {
        return salesRecordRepository.save(record);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<SalesRecord> getAllRecords() {
        return salesRecordRepository.findAll();
    }
}