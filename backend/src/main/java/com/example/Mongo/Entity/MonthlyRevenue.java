package com.example.Mongo.Entity;

public class MonthlyRevenue {
    private Integer month;
    private Double amount;

    public MonthlyRevenue() {
    }

    public MonthlyRevenue(Integer month, Double amount) {
        this.month = month;
        this.amount = amount;
    }

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }
}

