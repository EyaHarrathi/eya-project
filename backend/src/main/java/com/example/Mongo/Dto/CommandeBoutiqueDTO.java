package com.example.Mongo.Dto;
public class CommandeBoutiqueDTO {
    private String id;
    private String client;
    private String produits;
    private String date;
    private String montant;
    private String statut;

    public CommandeBoutiqueDTO() {} // Obligatoire pour Jackson ou Spring

    public CommandeBoutiqueDTO(String id, String client, String produits, String date, String montant, String statut) {
        this.id = id;
        this.client = client;
        this.produits = produits;
        this.date = date;
        this.montant = montant;
        this.statut = statut;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;

    }


    public String getClient() {
        return client;
    }

    public void setClient(String client) {
        this.client = client;
    }

    public String getProduits() {
        return produits;
    }

    public void setProduits(String produits) {
        this.produits = produits;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getMontant() {
        return montant;
    }

    public void setMontant(String montant) {
        this.montant = montant;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }
}

