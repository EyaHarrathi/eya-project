package com.example.Mongo.Controller;

import com.example.Mongo.Entity.Notification;
import com.example.Mongo.Service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    private final NotificationService notificationService;

    @Autowired
    public WebSocketController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @MessageMapping("/notifications/markAsRead")
    public void handleMarkAsRead(String notificationId) {
        notificationService.markAsRead(notificationId);
    }

    @MessageMapping("/notifications/markAllAsRead")
    public void handleMarkAllAsRead(String userId) {
        notificationService.markAllAsRead(userId);
    }
}