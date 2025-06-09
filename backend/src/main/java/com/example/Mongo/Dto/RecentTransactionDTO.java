package com.example.Mongo.Dto;

import java.time.LocalDate;

public class RecentTransactionDTO {
    private String id;
    private String productName;
    private double amount;
    private LocalDate date;

    public RecentTransactionDTO() {
    }

    public RecentTransactionDTO(String id, String productName, double amount, LocalDate date) {
        this.id = id;
        this.productName = productName;
        this.amount = amount;
        this.date = date;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}

