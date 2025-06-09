package com.example.Mongo.Dto;

public class PaymentRequest {
    private Long amount;
    private String currency;

    public PaymentRequest() {
    }

    public PaymentRequest(Long amount, String currency) {
        this.amount = amount;
        this.currency = currency;
    }

    // Getters and Setters
    public Long getAmount() { return amount; }
    public void setAmount(Long amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
}
