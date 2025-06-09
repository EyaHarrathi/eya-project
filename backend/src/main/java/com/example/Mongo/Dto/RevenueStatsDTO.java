package com.example.Mongo.Dto;

import com.example.Mongo.Entity.MonthlyRevenue;

import java.util.List;
import java.util.Map;

public class RevenueStatsDTO {
    private double totalRevenue;
    private List<MonthlyRevenue> monthlyRevenue;
    private Map<String, Double> revenueByCategory;

    public RevenueStatsDTO() {
    }

    public RevenueStatsDTO(double totalRevenue, List<MonthlyRevenue> monthlyRevenue, Map<String, Double> revenueByCategory) {
        this.totalRevenue = totalRevenue;
        this.monthlyRevenue = monthlyRevenue;
        this.revenueByCategory = revenueByCategory;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public List<MonthlyRevenue> getMonthlyRevenue() {
        return monthlyRevenue;
    }

    public void setMonthlyRevenue(List<MonthlyRevenue> monthlyRevenue) {
        this.monthlyRevenue = monthlyRevenue;
    }

    public Map<String, Double> getRevenueByCategory() {
        return revenueByCategory;
    }

    public void setRevenueByCategory(Map<String, Double> revenueByCategory) {
        this.revenueByCategory = revenueByCategory;
    }
}

