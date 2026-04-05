package com.milktea.supplysystem.controller;

import com.milktea.supplysystem.entity.PurchaseOrder;
import com.milktea.supplysystem.repository.PurchaseOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/procurement")
@CrossOrigin(origins = "http://localhost:5173")
public class ProcurementController {

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @PostMapping("/orders")
    public PurchaseOrder createOrder(@RequestBody PurchaseOrder order) {
        order.setStatus("pending");
        return purchaseOrderRepository.save(order);
    }

    @GetMapping("/orders")
    public List<PurchaseOrder> getAllOrders() {
        return purchaseOrderRepository.findAll();
    }

    @PutMapping("/orders/{id}/status")
    public PurchaseOrder updateStatus(@PathVariable Long id, @RequestParam String status) {
        PurchaseOrder order = purchaseOrderRepository.findById(id).orElseThrow();
        order.setStatus(status);
        return purchaseOrderRepository.save(order);
    }
}