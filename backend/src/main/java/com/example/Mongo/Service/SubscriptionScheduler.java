
package com.example.Mongo.Service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

@Component
public class SubscriptionScheduler {

    @Autowired
    private UserService userService;
    @Scheduled(cron = "0 0 0 * * ?") // Run daily at midnight
    public void checkExpiredSubscriptions() {
        // 1. Downgrade expired users
        userService.downgradeExpiredUsers();

        // 2. Send expiration reminders
        userService.sendExpirationReminders();
    }
}
