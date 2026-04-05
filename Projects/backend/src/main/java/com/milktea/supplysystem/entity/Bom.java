package com.milktea.supplysystem.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "bom")
public class Bom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer bomId;
    
    private String productName;
    
    @ManyToOne
    @JoinColumn(name = "material_id")
    private Material material;
    
    private BigDecimal quantityPerProduct;

    // getters and setters
    public Integer getBomId() { return bomId; }
    public void setBomId(Integer bomId) { this.bomId = bomId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public Material getMaterial() { return material; }
    public void setMaterial(Material material) { this.material = material; }
    public BigDecimal getQuantityPerProduct() { return quantityPerProduct; }
    public void setQuantityPerProduct(BigDecimal quantityPerProduct) { this.quantityPerProduct = quantityPerProduct; }
}