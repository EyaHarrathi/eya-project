package com.example.Mongo.Entity;


import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "utilisateur") // Ensure data is saved in "utilisateur" collection
public class User {
    public enum Role {
        USER,
        PREMIUM_USER,
        ADMIN
    }

    @Id
    private String id;
    private String nom;
    private String prenom;
    // In User entity
    private String bio = "";  // Initialize with empty string
    private String email;
    private List<String> additionalEmails = new ArrayList<>();
    private String telephone;
    private String adresse;
    @Transient  // This field won't be stored in MongoDB
    private String rawPassword;
    private String password;
    private String pays;    // Add the country field
    private String etat;    // Add the state field
    private String photoUrl; // New field for the user's photo URL (Google profile picture)
    @SuppressWarnings("unused")
    private String googleId; // Add this field to store Google user ID
    private Role role = Role.USER;
    @CreatedDate
    @Field("created_date")
    private Date createdDate;
    private boolean emailVerified = false;
    private String verificationToken;
    private Date verificationTokenExpiry;
    // NEW: Add lastActive field
    @Field("last_active")
    private Date lastActive;

    // NEW: Add isOnline field
    @Field("is_online")
    private boolean isOnline = false;

    // In User.java
    @Field("subscription_reminder_sent")
    private boolean subscriptionReminderSent = false;


    @Field("subscription_expiration_date")
    private Date subscriptionExpirationDate;


    // Constructors

    public User() {
        this.lastActive = new Date();
        this.createdDate = new Date();
    }
//using all filds

    public User(String id, String nom, String prenom, String bio, String email, List<String> additionalEmails, String telephone, String adresse, String rawPassword, String password, String pays, String etat, String photoUrl, String googleId, Role role, Date createdDate, boolean emailVerified, String verificationToken, Date lastActive, Date verificationTokenExpiry, boolean isOnline, boolean subscriptionReminderSent, Date subscriptionExpirationDate) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.bio = bio;
        this.email = email;
        this.additionalEmails = additionalEmails;
        this.telephone = telephone;
        this.adresse = adresse;
        this.rawPassword = rawPassword;
        this.password = password;
        this.pays = pays;
        this.etat = etat;
        this.photoUrl = photoUrl;
        this.googleId = googleId;
        this.role = role;
        this.createdDate = createdDate;
        this.emailVerified = emailVerified;
        this.verificationToken = verificationToken;
        this.lastActive = lastActive;
        this.verificationTokenExpiry = verificationTokenExpiry;
        this.isOnline = isOnline;
        this.subscriptionReminderSent = subscriptionReminderSent;
        this.subscriptionExpirationDate = subscriptionExpirationDate;
    }

    public User(String id, String nom, String prenom, String bio, String email, List<String> additionalEmails, String telephone, String adresse, String rawPassword, String password, String pays, String etat, String photoUrl, String googleId, Role role, Date createdDate, boolean emailVerified, String verificationToken, Date verificationTokenExpiry, boolean subscriptionReminderSent, Date subscriptionExpirationDate) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.bio = bio;
        this.email = email;
        this.additionalEmails = additionalEmails;
        this.telephone = telephone;
        this.adresse = adresse;
        this.rawPassword = rawPassword;
        this.password = password;
        this.pays = pays;
        this.etat = etat;
        this.photoUrl = photoUrl;
        this.googleId = googleId;
        this.role = role;
        this.createdDate = createdDate;
        this.emailVerified = emailVerified;
        this.verificationToken = verificationToken;
        this.verificationTokenExpiry = verificationTokenExpiry;
        this.subscriptionReminderSent = subscriptionReminderSent;
        this.subscriptionExpirationDate = subscriptionExpirationDate;
    }

    public User(String id, String nom, String prenom, String bio, String email, List<String> additionalEmails, String telephone, String adresse, String rawPassword, String password, String pays, String etat, String photoUrl, String googleId, Role role, Date createdDate) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.bio = bio;
        this.email = email;
        this.additionalEmails = additionalEmails;
        this.telephone = telephone;
        this.adresse = adresse;
        this.rawPassword = rawPassword;
        this.password = password;
        this.pays = pays;
        this.etat = etat;
        this.photoUrl = photoUrl;
        this.googleId = googleId;
        this.role = role;
        this.createdDate = createdDate;
    }

    public User(String id, String nom, String prenom, String bio, String email, List<String> additionalEmails, String telephone, String adresse, String rawPassword, String password, String pays, String etat, String photoUrl, String googleId, Role role) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.bio = bio;
        this.email = email;
        this.additionalEmails = additionalEmails;
        this.telephone = telephone;
        this.adresse = adresse;
        this.rawPassword = rawPassword;
        this.password = password;
        this.pays = pays;
        this.etat = etat;
        this.photoUrl = photoUrl;
        this.googleId = googleId;
        this.role = role;
    }

    public User(String id, String nom, String prenom, String email,
                List<String> additionalEmails, String telephone, String adresse,
                String password, String pays, String etat, String photoUrl, String googleId) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.additionalEmails = additionalEmails;
        this.telephone = telephone;
        this.adresse = adresse;
        this.password = password;
        this.pays = pays;
        this.etat = etat;
        this.photoUrl = photoUrl;
        this.googleId = googleId;
    }

    public User(String id, String nom, String prenom,String bio , String email,
                List<String> additionalEmails, String telephone, String adresse, String rawPassword,
                String password, String pays, String photoUrl, String etat, String googleId) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.bio = bio;
        this.email = email;
        this.additionalEmails = additionalEmails;
        this.telephone = telephone;
        this.adresse = adresse;
        this.rawPassword = rawPassword;
        this.password = "";
        this.pays = pays;
        this.photoUrl = photoUrl;
        this.etat = etat;
        this.googleId = googleId;
    }

    //
    public User(String nom, String prenom, String email, String telephone, String adresse
            ,String rawPassword
            , String pays, String etat, String photoUrl) {
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.telephone = telephone;
        this.adresse = adresse;
        this.rawPassword = rawPassword;
        this.password = "";
        this.pays = pays;        // Initialize the country field
        this.etat = etat;        // Initialize the state field
        this.photoUrl = photoUrl; // Initialize the photo URL field
    }
    // Constructor for Google users (without password)

    public User(String id, String nom, String prenom, String email, String telephone, String adresse,  String pays, String etat, String photoUrl, String googleId) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.telephone = telephone;
        this.adresse = adresse;

        this.pays = pays;
        this.etat = etat;
        this.photoUrl = photoUrl;
        this.googleId = googleId;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPays() { return pays; }   // Getter for country
    public void setPays(String pays) { this.pays = pays; }   // Setter for country

    public String getEtat() { return etat; }   // Getter for state
    public void setEtat(String etat) { this.etat = etat; }   // Setter for state

    public String getPhotoUrl() { return photoUrl; } // Getter for photo URL
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; } // Setter for photo URL


    // Getters and Setters
    public Date getSubscriptionExpirationDate() {
        return subscriptionExpirationDate;
    }

    public void setSubscriptionExpirationDate(Date subscriptionExpirationDate) {
        this.subscriptionExpirationDate = subscriptionExpirationDate;
    }

    public String getGoogleId() {
        return this.googleId;
    }

    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }



    public List<String> getAdditionalEmails() { return additionalEmails; }
    public void setAdditionalEmails(List<String> additionalEmails) {
        this.additionalEmails = additionalEmails;
    }
    // Update getters/setters
    public String getRawPassword() { return rawPassword; }
    public void setRawPassword(String rawPassword) { this.rawPassword = rawPassword; }
    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
    public Date getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Date createdDate) {
        this.createdDate = createdDate;
    }
    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public String getVerificationToken() { return verificationToken; }
    public void setVerificationToken(String verificationToken) { this.verificationToken = verificationToken; }

    public Date getVerificationTokenExpiry() { return verificationTokenExpiry; }
    public void setVerificationTokenExpiry(Date verificationTokenExpiry) { this.verificationTokenExpiry = verificationTokenExpiry; }
    // Getters and Setters
    public boolean isSubscriptionReminderSent() {
        return subscriptionReminderSent;
    }

    public void setSubscriptionReminderSent(boolean subscriptionReminderSent) {
        this.subscriptionReminderSent = subscriptionReminderSent;
    }
    // NEW: Getters and setters for lastActive and isOnline
    public Date getLastActive() { return lastActive; }
    public void setLastActive(Date lastActive) { this.lastActive = lastActive; }

    public boolean isOnline() { return isOnline; }
    public void setOnline(boolean online) { isOnline = online; }

    // NEW: Method to update last active timestamp
    public void updateLastActive() {
        this.lastActive = new Date();
        this.isOnline = true;
    }

    // NEW: Method to set user offline
    public void setOffline() {
        this.isOnline = false;
    }

}