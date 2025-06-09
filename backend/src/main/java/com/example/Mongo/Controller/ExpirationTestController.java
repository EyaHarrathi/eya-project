package com.example.Mongo.Controller;

import com.example.Mongo.Entity.User;
import com.example.Mongo.Repository.UserRepository;
import com.example.Mongo.Service.NotificationService;
import com.example.Mongo.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/test")
public class ExpirationTestController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    // Test endpoint to set a user's subscription to expire in 5 minutes
    @PostMapping("/set-expiration/{userId}")
    public ResponseEntity<?> setTestExpiration(@PathVariable String userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Set expiration to 5 minutes from now
            Calendar calendar = Calendar.getInstance();
            calendar.add(Calendar.MINUTE, 5);
            Date expirationDate = calendar.getTime();

            user.setSubscriptionExpirationDate(expirationDate);
            user.setRole(User.Role.PREMIUM_USER);
            user.setSubscriptionReminderSent(false);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "User subscription set to expire in 5 minutes",
                    "userId", userId,
                    "expirationDate", expirationDate.toString()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        }
    }

    // Test endpoint to simulate checking for expiring subscriptions (2 days = 2 minutes for test)
    @PostMapping("/check-expiring")
    public ResponseEntity<?> checkExpiringSubscriptions() {
        try {
            // For testing: check subscriptions expiring in 2 minutes (instead of 2 days)
            Calendar calendar = Calendar.getInstance();
            
            // Start of minute in 2 minutes
            calendar.add(Calendar.MINUTE, 2);
            calendar.set(Calendar.SECOND, 0);
            calendar.set(Calendar.MILLISECOND, 0);
            Date startDate = calendar.getTime();

            // End of minute in 2 minutes
            calendar.set(Calendar.SECOND, 59);
            Date endDate = calendar.getTime();

            List<User> expiringUsers = userRepository.findBySubscriptionExpirationDateBetween(startDate, endDate);
            List<Map<String, Object>> results = new ArrayList<>();

            for (User user : expiringUsers) {
                if (!user.isSubscriptionReminderSent()) {
                    // Send notification
                    notificationService.createNotification(
                            user.getId(),
                            "SUBSCRIPTION_REMINDER_TEST",
                            "🚨 TEST: Votre abonnement Premium expire dans 2 minutes ! Renouvelez maintenant pour maintenir vos avantages. 🚀",
                            user.getPhotoUrl(),
                            "/icons/warning-icon.png",
                            user.getId()
                    );

                    user.setSubscriptionReminderSent(true);
                    userRepository.save(user);

                    results.add(Map.of(
                            "userId", user.getId(),
                            "email", user.getEmail(),
                            "expirationDate", user.getSubscriptionExpirationDate().toString(),
                            "notificationSent", true
                    ));
                } else {
                    results.add(Map.of(
                            "userId", user.getId(),
                            "email", user.getEmail(),
                            "expirationDate", user.getSubscriptionExpirationDate().toString(),
                            "notificationSent", false,
                            "reason", "Reminder already sent"
                    ));
                }
            }

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Expiration check completed",
                    "usersFound", expiringUsers.size(),
                    "results", results
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        }
    }

    // Test endpoint to check for expired subscriptions and downgrade
    @PostMapping("/check-expired")
    public ResponseEntity<?> checkExpiredSubscriptions() {
        try {
            Date now = new Date();
            List<User> expiredUsers = userRepository.findBySubscriptionExpirationDateBefore(now);
            List<Map<String, Object>> results = new ArrayList<>();

            for (User user : expiredUsers) {
                if (user.getRole() == User.Role.PREMIUM_USER) {
                    // Downgrade user
                    user.setRole(User.Role.USER);
                    user.setSubscriptionExpirationDate(null);
                    user.setSubscriptionReminderSent(false);
                    userRepository.save(user);

                    // Send expiration notification
                    notificationService.createNotification(
                            user.getId(),
                            "SUBSCRIPTION_EXPIRED",
                            "❌ Votre abonnement Premium a expiré. Vous avez été rétrogradé au plan gratuit. Renouvelez pour retrouver vos avantages !",
                            user.getPhotoUrl(),
                            "/icons/expired-icon.png",
                            user.getId()
                    );

                    results.add(Map.of(
                            "userId", user.getId(),
                            "email", user.getEmail(),
                            "action", "downgraded",
                            "previousRole", "PREMIUM_USER",
                            "newRole", "USER"
                    ));
                }
            }

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Expired subscriptions processed",
                    "usersProcessed", results.size(),
                    "results", results
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        }
    }

    // Get all users with their subscription status
    @GetMapping("/users-status")
    public ResponseEntity<?> getUsersStatus() {
        try {
            List<User> allUsers = userRepository.findAll();
            List<Map<String, Object>> usersStatus = new ArrayList<>();

            for (User user : allUsers) {
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("userId", user.getId());
                userInfo.put("email", user.getEmail());
                userInfo.put("role", user.getRole().toString());
                userInfo.put("subscriptionExpirationDate", 
                    user.getSubscriptionExpirationDate() != null ? 
                    user.getSubscriptionExpirationDate().toString() : null);
                userInfo.put("reminderSent", user.isSubscriptionReminderSent());
                
                // Calculate time until expiration
                if (user.getSubscriptionExpirationDate() != null) {
                    long timeUntilExpiration = user.getSubscriptionExpirationDate().getTime() - new Date().getTime();
                    long minutesUntilExpiration = timeUntilExpiration / (1000 * 60);
                    userInfo.put("minutesUntilExpiration", minutesUntilExpiration);
                    userInfo.put("isExpired", timeUntilExpiration < 0);
                }
                
                usersStatus.add(userInfo);
            }

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "totalUsers", allUsers.size(),
                    "users", usersStatus
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        }
    }

    // Reset a user's reminder flag for testing
    @PostMapping("/reset-reminder/{userId}")
    public ResponseEntity<?> resetReminderFlag(@PathVariable String userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            user.setSubscriptionReminderSent(false);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Reminder flag reset for user",
                    "userId", userId
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        }
    }

    // Complete test scenario
    @PostMapping("/run-complete-test/{userId}")
    public ResponseEntity<?> runCompleteTest(@PathVariable String userId) {
        try {
            Map<String, Object> testResults = new HashMap<>();
            
            // Step 1: Set expiration to 5 minutes
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Calendar calendar = Calendar.getInstance();
            calendar.add(Calendar.MINUTE, 5);
            Date expirationDate = calendar.getTime();

            user.setSubscriptionExpirationDate(expirationDate);
            user.setRole(User.Role.PREMIUM_USER);
            user.setSubscriptionReminderSent(false);
            userRepository.save(user);

            testResults.put("step1", Map.of(
                    "action", "Set expiration to 5 minutes",
                    "expirationDate", expirationDate.toString(),
                    "status", "completed"
            ));

            // Step 2: Wait and check (you'll need to call check-expiring manually after 3 minutes)
            testResults.put("step2", Map.of(
                    "action", "Wait 3 minutes then call /api/test/check-expiring",
                    "instruction", "Call check-expiring endpoint in 3 minutes to test notification",
                    "status", "pending"
            ));

            // Step 3: Wait and check expired (you'll need to call check-expired manually after 5+ minutes)
            testResults.put("step3", Map.of(
                    "action", "Wait 5+ minutes then call /api/test/check-expired",
                    "instruction", "Call check-expired endpoint after 5 minutes to test downgrade",
                    "status", "pending"
            ));

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Complete test scenario initiated",
                    "userId", userId,
                    "testSteps", testResults,
                    "instructions", "Follow the steps manually to complete the test"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        }
    }
}