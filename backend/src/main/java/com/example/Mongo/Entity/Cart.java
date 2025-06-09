package com.example.Mongo.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "carts")
public class Cart {
    @Id
    private String id;
    private String userId; // Identifiant de l'utilisateur
    private List<CartItem> items; // Liste des produits dans le panier

    // Getters et Setters

    public Cart(String userId, List<CartItem> items) {
        this.userId = userId;
        this.items = items;
    }


    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<CartItem> getItems() {
        return items;
    }

    public void setItems(List<CartItem> items) {
        this.items = items;
    }
}

