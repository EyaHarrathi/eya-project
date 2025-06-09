package com.example.Mongo.Dto;
public class UserOrderStatsDTO {
    private String userId;
    private String fullName;
    private int totalOrders;
    private double totalSpent;

    // Default constructor
    public UserOrderStatsDTO() {
    }

    // Parameterized constructor
    public UserOrderStatsDTO(String userId, String fullName, int totalOrders, double totalSpent) {
        this.userId = userId;
        this.fullName = fullName;
        this.totalOrders = totalOrders;
        this.totalSpent = totalSpent;
    }

    // Getters and Setters

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public int getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(int totalOrders) {
        this.totalOrders = totalOrders;
    }

    public double getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(double totalSpent) {
        this.totalSpent = totalSpent;
    }

    // Optional: toString() method for easier debugging/logging
    @Override
    public String toString() {
        return "UserOrderStatsDTO{" +
                "userId='" + userId + '\'' +
                ", fullName='" + fullName + '\'' +
                ", totalOrders=" + totalOrders +
                ", totalSpent=" + totalSpent +
                '}';
    }
}

