package com.example.Mongo.Entity;

import org.springframework.data.mongodb.core.mapping.Field;

public class ProduitVendeur {
    @Field("id")
    private String idProduit;
    private String ipVendeur;
    private double prix;
    private int quantite;
    @Field("nomProduit")
    private String nomProduit;
    // Getters & setters

    public ProduitVendeur() {
    }

    public ProduitVendeur(String idProduit, String ipVendeur, double prix, int quantite, String nomProduit) {
        this.idProduit = idProduit;
        this.ipVendeur = ipVendeur;
        this.prix = prix;
        this.quantite = quantite;
        this.nomProduit = nomProduit;
    }

    public String getIdProduit() {
        return idProduit;
    }

    public void setIdProduit(String idProduit) {
        this.idProduit = idProduit;
    }

    public String getIpVendeur() {
        return ipVendeur;
    }

    public void setIpVendeur(String ipVendeur) {
        this.ipVendeur = ipVendeur;
    }

    public double getPrix() {
        return prix;
    }

    public void setPrix(double prix) {
        this.prix = prix;
    }

    public int getQuantite() {
        return quantite;
    }

    public void setQuantite(int quantite) {
        this.quantite = quantite;
    }
    public String getNomProduit() {
        return nomProduit;
    }

    public void setNomProduit(String nomProduit) {
        this.nomProduit = nomProduit;
    }
}
