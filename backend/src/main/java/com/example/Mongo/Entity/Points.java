// src/main/java/com/example/Mongo/Entity/Points.java
package com.example.Mongo.Entity;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.HashMap;
import java.util.Map;
@CompoundIndex(def = "{'categoryPoints.$**' : 1}")
@Document(collection = "points")
public class Points {
    @Id
    private ObjectId id;
    private String userId;
    private Map<String, Integer> categoryPoints = new HashMap<>(); // categoryId -> points

    // Constructors
    public Points() {}

    public Points(String userId) {
        this.userId = userId;
    }

    // Getters/Setters
    public ObjectId getId() { return id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public Map<String, Integer> getCategoryPoints() { return categoryPoints; }
    public void setCategoryPoints(Map<String, Integer> categoryPoints) {
        this.categoryPoints = categoryPoints;
    }

    // Helper method to add points for a category
    public void addPoints(String categoryId, int points) {
        categoryPoints.put(categoryId,
                categoryPoints.getOrDefault(categoryId, 0) + points);
    }
}