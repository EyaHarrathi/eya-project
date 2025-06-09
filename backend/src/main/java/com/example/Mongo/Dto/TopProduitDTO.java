package com.example.Mongo.Dto;

public class TopProduitDTO {
    private String nom;
    private int valeur;

    public TopProduitDTO(String nom, int valeur) {
        this.nom = nom;
        this.valeur = valeur;
    }

    // getters et setters
    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public int getValeur() {
        return valeur;
    }

    public void setValeur(int valeur) {
        this.valeur = valeur;
    }
}
