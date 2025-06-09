package com.example.Mongo.Dto;

import com.example.Mongo.Entity.User;
import com.example.Mongo.Entity.UserNode;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

public class UserDTO {
    @JsonProperty("id")
    private String id;
    private String userId; // ID de l'utilisateur
    private String prenom; // Prénom de l'utilisateur
    private String nom;    // Nom de l'utilisateur
    private String photoUrl; // URL de la photo de profil
    private String email;
    private Map<String, Integer> categoryPoints;
    public UserDTO(User user) {
        this.id = user.getId();  // Verify getter name matches
        this.prenom = user.getPrenom();
        this.nom = user.getNom();
        this.email = user.getEmail();
        this.photoUrl = user.getPhotoUrl();
    }

    public UserDTO(String prenom, String userId, String nom, String photoUrl, Map<String, Integer> categoryPoints) {
        this.prenom = prenom;
        this.userId = userId;
        this.nom = nom;
        this.photoUrl = photoUrl;
        this.categoryPoints = categoryPoints;
    }



    // Constructeur
    public UserDTO(String userId, String prenom, String nom, String photoUrl) {
        this.userId = userId;
        this.prenom = prenom;
        this.nom = nom;
        this.photoUrl = photoUrl;
    }
    public UserDTO(UserNode userNode) {
        this.photoUrl = userNode.getPhotoUrl(); // Supposant que ce champ contient déjà le bon chemin
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    // Getters et Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }
}