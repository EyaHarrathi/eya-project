package com.example.Mongo.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "reseaux_sociaux")
public class ReseauSocial {

    @Id
    private String idReseau; // ID unique du réseau social
    private List<User> listAmis; // Liste des amis
    private List<User> listDemandeInvitation; // Liste des demandes d'invitation envoyées
    private List<User> listRecoiInvitation; // Liste des invitations reçues

    // Constructeurs, getters et setters
    public ReseauSocial() {}

    public ReseauSocial(String idReseau, List<User> listAmis, List<User> listDemandeInvitation, List<User> listRecoiInvitation) {
        this.idReseau = idReseau;
        this.listAmis = listAmis;
        this.listDemandeInvitation = listDemandeInvitation;
        this.listRecoiInvitation = listRecoiInvitation;
    }

    public String getIdReseau() {
        return idReseau;
    }

    public void setIdReseau(String idReseau) {
        this.idReseau = idReseau;
    }

    public List<User> getListAmis() {
        return listAmis;
    }

    public void setListAmis(List<User> listAmis) {
        this.listAmis = listAmis;
    }

    public List<User> getListDemandeInvitation() {
        return listDemandeInvitation;
    }

    public void setListDemandeInvitation(List<User> listDemandeInvitation) {
        this.listDemandeInvitation = listDemandeInvitation;
    }

    public List<User> getListRecoiInvitation() {
        return listRecoiInvitation;
    }

    public void setListRecoiInvitation(List<User> listRecoiInvitation) {
        this.listRecoiInvitation = listRecoiInvitation;
    }

    
}