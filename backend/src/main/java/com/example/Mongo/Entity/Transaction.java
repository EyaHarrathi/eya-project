
package com.example.Mongo.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;
import java.util.List;

public class Transaction {
    @Id
    private String idTransaction;
    private String idCommande;
    private String idAcheteur;
    @Field("dateTransaction")
    private Date dateTransaction;
    private double montant;
    private List<ProduitVendeur> produits;
    private List<String> intermediaires; // Liste d’IDs intermédiaires


    // Getters & setters

    public String getIdTransaction() {
        return idTransaction;
    }

    public void setIdTransaction(String idTransaction) {
        this.idTransaction = idTransaction;
    }

    public String getIdCommande() {
        return idCommande;
    }

    public void setIdCommande(String idCommande) {
        this.idCommande = idCommande;
    }

    public String getIdAcheteur() {
        return idAcheteur;
    }

    public void setIdAcheteur(String idAcheteur) {
        this.idAcheteur = idAcheteur;
    }

    public Date getDateTransaction() {
        return dateTransaction;
    }

    public void setDateTransaction(Date dateTransaction) {
        this.dateTransaction = dateTransaction;
    }

    public double getMontant() {
        return montant;
    }

    public void setMontant(double montant) {
        this.montant = montant;
    }

    public List<ProduitVendeur> getProduits() {
        return produits;
    }

    public void setProduits(List<ProduitVendeur> produits) {
        this.produits = produits;
    }

    public List<String> getIntermediaires() {
        return intermediaires;
    }

    public void setIntermediaires(List<String> intermediaires) {
        this.intermediaires = intermediaires;
    }
}

