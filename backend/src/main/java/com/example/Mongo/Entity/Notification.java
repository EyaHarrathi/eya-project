package com.example.Mongo.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    private String userId; // ID de l'utilisateur qui reçoit la notification
    private String type; // Type de notification (ex: "nouvelle_invitation", "invitation_acceptée")
    private String message; // Message de la notification
    private LocalDateTime date; // Date de création de la notification
    private String statut; // Statut de la notification (ex: "non lue", "lue")
    private String userPhotoUrl; // URL de la photo de l'utilisateur qui a déclenché l'événement
    private String iconUrl; // URL de l'icône associée à la notification
    private String relatedUserId; // ID de l'utilisateur lié à la notification (ex: celui qui a envoyé l'invitation)

    // Constructeurs, getters et setters
    public Notification() {}

    public Notification(String userId, String type, String message, String userPhotoUrl, String iconUrl, String relatedUserId) {
        this.userId = userId;
        this.type = type;
        this.message = message;
        this.date = LocalDateTime.now();
        this.statut = "non lue";
        this.userPhotoUrl = userPhotoUrl;
        this.iconUrl = iconUrl;
        this.relatedUserId = relatedUserId;
    }

    // Getters et setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public String getUserPhotoUrl() { return userPhotoUrl; }
    public void setUserPhotoUrl(String userPhotoUrl) { this.userPhotoUrl = userPhotoUrl; }

    public String getIconUrl() { return iconUrl; }
    public void setIconUrl(String iconUrl) { this.iconUrl = iconUrl; }

    public String getRelatedUserId() { return relatedUserId; }
    public void setRelatedUserId(String relatedUserId) { this.relatedUserId = relatedUserId; }
}