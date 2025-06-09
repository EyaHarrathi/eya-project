package com.example.Mongo.Dto;

public class ProduitPerformanceDTO {
    private String nom;
    private int livree;
    private int annuler;

    public ProduitPerformanceDTO(String nom, int livree, int annuler) {
        this.nom = nom;
        this.livree = livree;
        this.annuler = annuler;
    }

    public String getNom() {
        return nom;
    }

    public int getLivree() {
        return livree;
    }

    public int getAnnuler() {
        return annuler;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public void setLivree(int livree) {
        this.livree = livree;
    }

    public void setAnnuler(int annuler) {
        this.annuler = annuler;
    }
}
