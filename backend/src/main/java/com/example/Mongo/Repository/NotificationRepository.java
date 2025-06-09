package com.example.Mongo.Repository;

import com.example.Mongo.Entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    // Trouver toutes les notifications d'un utilisateur triées par date décroissante
    List<Notification> findByUserIdOrderByDateDesc(String userId);

    // Trouver toutes les notifications non lues d'un utilisateur
    List<Notification> findByUserIdAndStatut(String userId, String statut);

    // Trouver toutes les notifications d'un type spécifique pour un utilisateur
    List<Notification> findByUserIdAndType(String userId, String type);

    // Trouver toutes les notifications non lues triées par date décroissante
    List<Notification> findByUserIdAndStatutOrderByDateDesc(String userId, String statut);

    // Marquer toutes les notifications non lues comme lues pour un utilisateur
    @Query("{ 'userId': ?0, 'statut': 'non lue' }")
    @Update("{ '$set': { 'statut': 'lue' } }")
    long markAllAsRead(String userId);

    @Transactional
    void deleteByUserId(String userId);


    long countByUserId(String userId);
    @Transactional
    void deleteByUserIdAndId(String userId, String notificationId);

    // Optional: Delete notifications older than a certain date

    @Query("{ 'userId' : ?0, 'date' : { $lt: ?1 } }")
    @Transactional
    long deleteOldNotifications(String userId, java.time.LocalDateTime cutoffDate);
}
