package com.example.Mongo.Entity;

import java.text.DateFormatSymbols;

public class MonthlySales {
    private Integer month;
    private double totalSales;

    // Constructeurs
    public MonthlySales() {}

    public MonthlySales(Integer month, double totalSales) {
        this.month = month;
        this.totalSales = totalSales;
    }

    public String getMonthName() {
        return new DateFormatSymbols().getMonths()[month - 1];
    }
    // Getters et Setters


    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public double getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(double totalSales) {
        this.totalSales = totalSales;
    }
}
