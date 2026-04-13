package com.milktea.supplysystem.controller;

import com.milktea.supplysystem.entity.Store;
import com.milktea.supplysystem.repository.StoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/stores")
@CrossOrigin(origins = "http://localhost:5173")
public class StoreController {
    
    @Autowired
    private StoreRepository storeRepository;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Store> getAllStores() {
        return storeRepository.findAll();
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Store createStore(@RequestBody Store store) {
        return storeRepository.save(store);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Store updateStore(@PathVariable Integer id, @RequestBody Store store) {
        store.setStoreId(id);
        return storeRepository.save(store);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteStore(@PathVariable Integer id) {
        storeRepository.deleteById(id);
    }
}