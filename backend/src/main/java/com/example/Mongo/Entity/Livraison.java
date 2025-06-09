package com.example.Mongo.Entity;

public class Livraison {
    private String nomComplet;
    private String adresse;
    private String telephone;
    private String ville;
    private String codePostal;
    private boolean livraisonADomicile;

    // Getters et setters
    public String getNomComplet() {
        return nomComplet;
    }

    public void setNomComplet(String nomComplet) {
        this.nomComplet = nomComplet;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getVille() {
        return ville;
    }

    public void setVille(String ville) {
        this.ville = ville;
    }

    public String getCodePostal() {
        return codePostal;
    }

    public void setCodePostal(String codePostal) {
        this.codePostal = codePostal;
    }

    public boolean isLivraisonADomicile() {
        return livraisonADomicile;
    }

    public void setLivraisonADomicile(boolean livraisonADomicile) {
        this.livraisonADomicile = livraisonADomicile;
    }
}
