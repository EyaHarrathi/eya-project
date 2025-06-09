package com.example.Mongo.Dto;

import com.example.Mongo.Entity.Boutique;
import com.example.Mongo.Entity.User;

import java.util.List;

// UserBoutiquesDTO.java
public class UserBoutiquesDTO {
    private String userId;
    private String userName;
    private List<Boutique> boutiques;

    // Constructor
    public UserBoutiquesDTO(User user, List<Boutique> boutiques) {
        this.userId = user.getId();
        this.userName = user.getNom() + " " + user.getPrenom();
        this.boutiques = boutiques;
    }

    // Getters
    public String getUserId() { return userId; }
    public String getUserName() { return userName; }
    public List<Boutique> getBoutiques() { return boutiques; }
}
