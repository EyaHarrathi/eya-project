package com.example.Mongo.Dto;


public class ClientStatistique {
    private String nom;
    private long valeur;

    public ClientStatistique(String nom, long valeur) {
        this.nom = nom;
        this.valeur = valeur;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public long getValeur() {
        return valeur;
    }

    public void setValeur(long valeur) {
        this.valeur = valeur;
    }
}
