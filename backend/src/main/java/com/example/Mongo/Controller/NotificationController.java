package com.example.Mongo.Controller;

import com.example.Mongo.Dto.NotificationRequest;
import com.example.Mongo.Entity.Notification;
import com.example.Mongo.Service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // Endpoint existant pour les notifications non lues (version avec paramètre)
    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@RequestParam String userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    // Nouvel endpoint compatible avec le frontend (version avec path variable)
    @GetMapping("/unread/{userId}")
    public ResponseEntity<List<Notification>> getUnreadNotificationsPath(@PathVariable String userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    // Endpoint existant pour toutes les notifications (version avec paramètre)
    @GetMapping("/all")
    public ResponseEntity<List<Notification>> getAllNotifications(@RequestParam String userId) {
        return ResponseEntity.ok(notificationService.getAllNotifications(userId));
    }

    // Nouvel endpoint compatible avec le frontend (version avec path variable)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable String userId) {
        return ResponseEntity.ok(notificationService.getAllNotifications(userId));
    }

    // Version améliorée avec réponse plus descriptive
    @PostMapping("/markAsRead/{id}")
    public ResponseEntity<Map<String, String>> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Notification marquée comme lue",
                "notificationId", id
        ));
    }

    // Version alternative avec RequestBody
    @PostMapping("/markAllAsRead")
    public ResponseEntity<Map<String, String>> markAllAsRead(@RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "userId is required"
            ));
        }
        try {
            notificationService.markAllAsRead(userId);
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Toutes les notifications marquées comme lues",
                    "userId", userId
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", "error",
                    "message", "Erreur lors du marquage des notifications: " + e.getMessage()
            ));
        }
    }
    @PostMapping("/create")
    public ResponseEntity<?> createNotification(@Valid @RequestBody NotificationRequest request) {
        try {
            // Validation supplémentaire
            if (request.getType() == null || request.getType().isEmpty()) {
                throw new IllegalArgumentException("Le type de notification est obligatoire");
            }

            Notification notification = notificationService.createNotification(
                    request.getUserId(),
                    request.getType().toUpperCase(),
                    request.getMessage(),
                    request.getUserPhotoUrl(),
                    request.getIconUrl(),
                    request.getRelatedUserId()
            );

            // Réponse standardisée
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("notification", notification);
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    errorResponse("invalid_request", e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    errorResponse("server_error", "Échec de création de la notification")
            );
        }
    }

    private Map<String, Object> errorResponse(String code, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "error");
        response.put("error_code", code);
        response.put("message", message);
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }
    // Add this method to your existing NotificationController class

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable String notificationId) {
        try {
            boolean deleted = notificationService.deleteNotification(notificationId);

            if (deleted) {
                return ResponseEntity.ok(Map.of(
                        "status", "success",
                        "message", "Notification supprimée avec succès",
                        "notificationId", notificationId
                ));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "status", "error",
                        "message", "Notification non trouvée",
                        "notificationId", notificationId
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", "error",
                    "message", "Erreur lors de la suppression: " + e.getMessage(),
                    "notificationId", notificationId
            ));
        }
    }

    // Optional: Delete all notifications for a user
    @DeleteMapping("/user/{userId}/all")
    public ResponseEntity<Map<String, String>> deleteAllUserNotifications(@PathVariable String userId) {
        try {
            long deletedCount = notificationService.deleteAllUserNotifications(userId);

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Toutes les notifications supprimées",
                    "userId", userId,
                    "deletedCount", String.valueOf(deletedCount)
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", "error",
                    "message", "Erreur lors de la suppression: " + e.getMessage(),
                    "userId", userId
            ));
        }
    }
}
