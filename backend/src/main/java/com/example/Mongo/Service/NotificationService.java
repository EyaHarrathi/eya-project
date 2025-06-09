package com.example.Mongo.Service;

import com.example.Mongo.Entity.Notification;
import com.example.Mongo.Repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Notification createAndSendNotification(String userId, String type, String message,
                                                  String userPhotoUrl, String iconUrl,
                                                  String relatedUserId) {
        Notification notification = new Notification(
                userId, type, message, userPhotoUrl, iconUrl, relatedUserId
        );

        Notification savedNotification = notificationRepository.save(notification);
        sendRealTimeNotification(savedNotification);
        return savedNotification;
    }

    private void sendRealTimeNotification(Notification notification) {
        try {
            messagingTemplate.convertAndSendToUser(
                    notification.getUserId(),
                    "/queue/notifications",
                    notification
            );
        } catch (Exception e) {
            // Log l'erreur mais ne pas interrompre le flux
            System.err.println("Error sending real-time notification: " + e.getMessage());
        }
    }

    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndStatut(userId, "non lue");
    }

    public List<Notification> getAllNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByDateDesc(userId);
    }

    @Transactional
    public Notification markAsRead(String notificationId) {
        return notificationRepository.findById(notificationId)
                .map(notification -> {
                    if ("non lue".equals(notification.getStatut())) {
                        notification.setStatut("lue");
                        Notification updated = notificationRepository.save(notification);
                        sendRealTimeNotification(updated);
                        return updated;
                    }
                    return notification;
                })
                .orElseThrow(() -> new RuntimeException("Notification not found"));
    }

    @Transactional
    public void markAllAsRead(String userId) {
        long modifiedCount = notificationRepository.markAllAsRead(userId);

        messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/notifications/allRead",
                Map.of(
                        "type", "MARK_ALL_READ",
                        "timestamp", System.currentTimeMillis(),
                        "modifiedCount", modifiedCount
                )
        );
    }

    public Notification createNotification(
            String userId,
            String type,
            String message,
            String userPhotoUrl,
            String iconUrl,
            String relatedUserId
    ) {
        Notification notification = new Notification(
                userId,
                type,
                message,
                userPhotoUrl,
                iconUrl,
                relatedUserId
        );

        Notification savedNotification = notificationRepository.save(notification);
        sendRealTimeNotification(savedNotification);
        return savedNotification;
    }
    @Transactional
    public boolean deleteNotification(String notificationId) {
        try {
            Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);

            if (notificationOpt.isPresent()) {
                Notification notification = notificationOpt.get();

                // Delete from database
                notificationRepository.deleteById(notificationId);

                // Send real-time notification about deletion
                sendRealTimeNotificationDeletion(notification);

                return true;
            }
            return false;
        } catch (Exception e) {
            System.err.println("Error deleting notification: " + e.getMessage());
            throw new RuntimeException("Failed to delete notification", e);
        }
    }

    @Transactional
    public long deleteAllUserNotifications(String userId) {
        try {
            // Get count before deletion for return value
            long count = notificationRepository.countByUserId(userId);

            // Delete all notifications for the user
            notificationRepository.deleteByUserId(userId);

            // Send real-time notification about bulk deletion
            messagingTemplate.convertAndSendToUser(
                    userId,
                    "/queue/notifications/allDeleted",
                    Map.of(
                            "type", "DELETE_ALL",
                            "timestamp", System.currentTimeMillis(),
                            "deletedCount", count
                    )
            );

            return count;
        } catch (Exception e) {
            System.err.println("Error deleting all user notifications: " + e.getMessage());
            throw new RuntimeException("Failed to delete all notifications", e);
        }
    }

    private void sendRealTimeNotificationDeletion(Notification notification) {
        try {
            messagingTemplate.convertAndSendToUser(
                    notification.getUserId(),
                    "/queue/notifications/deleted",
                    Map.of(
                            "type", "NOTIFICATION_DELETED",
                            "notificationId", notification.getId(),
                            "timestamp", System.currentTimeMillis()
                    )
            );
        } catch (Exception e) {
            System.err.println("Error sending real-time deletion notification: " + e.getMessage());
        }
    }
}