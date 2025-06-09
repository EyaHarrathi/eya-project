package com.example.Mongo.Entity;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.HashSet;
import java.util.Set;

@Node("User")
public class UserNode {
    @Id
    private String userId;
    private String prenom;  // Nouveau champ
    private String nom;     // Nouveau champ

    private String photoUrl;

    @Relationship(type = "AMI_AVEC", direction = Relationship.Direction.INCOMING)
    private Set<UserNode> amis = new HashSet<>();

    // Constructeurs
    public UserNode() {}
    public UserNode(String userId, String prenom, String nom, String photoUrl) {
        this.userId = userId;
        this.prenom = prenom;
        this.nom = nom;
        this.photoUrl = photoUrl;
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

    public Set<UserNode> getAmis() {
        return amis;
    }

    public void setAmis(Set<UserNode> amis) {
        this.amis = amis;
    }
}