package com.example.Mongo.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "commandes")
public class Commande {
    @Id
    private String id;
    private String idUtilisateur;
    private List<ProduitCommande> produits;
    private Livraison livraison;
    private String statut;
    private LocalDateTime dateCommande = LocalDateTime.now(); // Date automatiquement définie à la création
    @Field("payment_intent_id")
    private String paymentIntentId; // Champ pour Stripe
    private String statutPaiement; // <-- Ajouter ce champ

    // Ajouter les getters/setters manquants
    public String getStatutPaiement() {
        return statutPaiement;
    }

    public void setStatutPaiement(String statutPaiement) {
        this.statutPaiement = statutPaiement;
    }

    public String getPaymentIntentId() {
        return paymentIntentId;
    }

    public void setPaymentIntentId(String paymentIntentId) {
        this.paymentIntentId = paymentIntentId;
    }
    // Getters et setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getIdUtilisateur() {
        return idUtilisateur;
    }

    public void setIdUtilisateur(String idUtilisateur) {
        this.idUtilisateur = idUtilisateur;
    }

    public List<ProduitCommande> getProduits() {
        return produits;
    }

    public void setProduits(List<ProduitCommande> produits) {
        this.produits = produits;
    }

    public Livraison getLivraison() {
        return livraison;
    }

    public void setLivraison(Livraison livraison) {
        this.livraison = livraison;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public LocalDateTime getDateCommande() {
        return dateCommande;
    }

    public void setDateCommande(LocalDateTime dateCommande) {
        this.dateCommande = dateCommande;
    }
}
