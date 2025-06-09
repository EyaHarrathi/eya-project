package com.example.Mongo.Dto;
public class StockUpdateRequest {
    private String operation;
    private int value;

    // Getters et Setters
    public String getOperation() {
        return operation;
    }

    public void setOperation(String operation) {
        this.operation = operation;
    }

    public int getValue() {
        return value;
    }

    public void setValue(int value) {
        this.value = value;
    }
}
