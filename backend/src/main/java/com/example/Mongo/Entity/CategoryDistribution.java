package com.example.Mongo.Entity;


public class CategoryDistribution {
    private String categoryId;
    private long count;

    public CategoryDistribution() {}

    public CategoryDistribution(String categoryId, long count) {
        this.categoryId = categoryId;
        this.count = count;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}
