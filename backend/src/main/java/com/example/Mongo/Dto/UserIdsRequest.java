package com.example.Mongo.Dto;

import java.util.List;

public class UserIdsRequest {
    private List<String> userIds;

    public UserIdsRequest() {
    }

    public UserIdsRequest(List<String> userIds) {
        this.userIds = userIds;
    }

    // Getters et Setters
    public List<String> getUserIds() { return userIds; }
    public void setUserIds(List<String> userIds) { this.userIds = userIds; }
}
