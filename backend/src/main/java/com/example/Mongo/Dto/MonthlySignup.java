package com.example.Mongo.Dto;

public class MonthlySignup {
    private int month;
    private int count;

    public MonthlySignup() {
    }

    public MonthlySignup(int month, int count) {
        this.month = month;
        this.count = count;
    }
    // getters/setters

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }
}
