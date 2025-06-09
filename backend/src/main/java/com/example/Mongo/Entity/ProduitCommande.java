package com.example.Mongo.Entity;

import java.time.LocalDate;

public class ProduitCommande {
    private String idProduit;
    private String idVendeur;
    private int quantite;
    private LocalDate startDate; // Nouveau champ pour location
    private LocalDate endDate;   // Nouveau champ pour location
    private double prix;

    public ProduitCommande() {
    }

    public ProduitCommande(String idProduit, String idVendeur, int quantite, LocalDate startDate, LocalDate endDate, double prix) {
        this.idProduit = idProduit;
        this.idVendeur = idVendeur;
        this.quantite = quantite;
        this.startDate = startDate;
        this.endDate = endDate;
        this.prix = prix;
    }

    public double getPrix() {
        return prix;
    }

    public void setPrix(double prix) {
        this.prix = prix;
    }

    // Getters et setters
    public String getIdProduit() { return idProduit; }
    public void setIdProduit(String idProduit) { this.idProduit = idProduit; }

    public String getIdVendeur() { return idVendeur; }
    public void setIdVendeur(String idVendeur) { this.idVendeur = idVendeur; }

    public int getQuantite() { return quantite; }
    public void setQuantite(int quantite) { this.quantite = quantite; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}