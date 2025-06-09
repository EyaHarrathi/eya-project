package com.example.Mongo.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "boutiques")
public class Boutique {
    @Id
    private String id;
    private String nom;
    private String description;
    private String type;
    private List<String> numeros;

    @Field("produits")
    private List<String> produitsIds = new ArrayList<>(); // Liste des IDs de produits

    @Field(targetType = FieldType.BINARY)
    private byte[] logo;

    @Field(targetType = FieldType.BINARY)
    private byte[] documentJuridique;

    private String idUtilisateur;

    // Constructeurs
    public Boutique() {}

    // Getters et Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public List<String> getNumeros() { return numeros; }
    public void setNumeros(List<String> numeros) { this.numeros = numeros; }

    public List<String> getProduitsIds() { return produitsIds; }
    public void setProduitsIds(List<String> produitsIds) {
        this.produitsIds = produitsIds;
    }

    public byte[] getLogo() { return logo; }
    public void setLogo(byte[] logo) { this.logo = logo; }

    public byte[] getDocumentJuridique() { return documentJuridique; }
    public void setDocumentJuridique(byte[] documentJuridique) {
        this.documentJuridique = documentJuridique;
    }

    public String getIdUtilisateur() { return idUtilisateur; }
    public void setIdUtilisateur(String idUtilisateur) {
        this.idUtilisateur = idUtilisateur;
    }

    // Méthodes utilitaires
    public void ajouterProduit(String productId) {
        if (!this.produitsIds.contains(productId)) {
            this.produitsIds.add(productId);
        }
    }

    public void retirerProduit(String productId) {
        this.produitsIds.remove(productId);
    }
}