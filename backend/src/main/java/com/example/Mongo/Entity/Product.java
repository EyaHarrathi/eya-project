package com.example.Mongo.Entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDate;
import java.util.List;

@Document(collection = "products")
@JsonInclude(JsonInclude.Include.ALWAYS)
public class Product {
    @Id
    private String id;
    private String name;
    private String description;
    private double price;
    private String type; // 'sale' or 'rent'
    private int quantity;
    private String statue;
    private List<String> colors;
    private boolean available;
    private String categoryId;
    private String imageName;
    private String userId;
    @Field(name = "boutiqueId")
    private String boutiqueId; // Nullable
    // Liste des périodes de location
    private List<RentalPeriod> rentalPeriods;

    public Product() {
    }

    public Product(String id, String name, String description, double price, int quantity, String type,
                   List<String> colors, boolean available, String categoryId, String imageName, String userId,
                   List<RentalPeriod> rentalPeriods, String boutiqueId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.quantity = quantity;
        this.type = type;
        this.colors = colors;
        this.available = available;
        this.categoryId = categoryId;
        this.imageName = imageName;
        this.userId = userId;
        this.rentalPeriods = rentalPeriods;
        this.boutiqueId=boutiqueId;
    }

    // Getters et setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getStatue() {
        return statue;
    }

    public void setStatue(String statue) {
        this.statue = statue;
    }

    public List<String> getColors() {
        return colors;
    }

    public void setColors(List<String> colors) {
        this.colors = colors;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getImageName() {
        return imageName;
    }

    public void setImageName(String imageName) {
        this.imageName = imageName;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<RentalPeriod> getRentalPeriods() {
        return rentalPeriods;
    }

    public void setRentalPeriods(List<RentalPeriod> rentalPeriods) {
        this.rentalPeriods = rentalPeriods;
    }

    public String getBoutiqueId() {
        return boutiqueId;
    }

    public void setBoutiqueId(String boutiqueId) {
        this.boutiqueId = boutiqueId;
    }
}
