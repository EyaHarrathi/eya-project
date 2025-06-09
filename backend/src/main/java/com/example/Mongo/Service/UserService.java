package com.example.Mongo.Service;

import com.example.Mongo.Dto.UserOrderStatsDTO;
import com.example.Mongo.Dto.UserStatsDTO;
import com.example.Mongo.Repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.Mongo.Entity.User;
import com.example.Mongo.Repository.UserRepository;
import sendinblue.ApiClient;
import sendinblue.ApiException;
import sendinblue.Configuration;
import sendinblue.auth.ApiKeyAuth;
import sibApi.TransactionalEmailsApi;
import sibModel.*;

import java.time.Instant;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

import sibApi.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    private final TransactionalEmailsApi brevoEmailApi;
    private final String senderEmail;
    private final String senderName;

    public UserService(
            @Value("${brevo.api.key}") String apiKey,
            @Value("${brevo.sender.email}") String senderEmail,
            @Value("${brevo.sender.name}") String senderName
    ) {
        ApiClient defaultClient = Configuration.getDefaultApiClient();
        ApiKeyAuth apiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("api-key");
        apiKeyAuth.setApiKey(apiKey);

        this.brevoEmailApi = new TransactionalEmailsApi();
        this.senderEmail = senderEmail;
        this.senderName = senderName;
    }

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    // Update user's last active timestamp
    public void updateUserActivity(String userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            user.updateLastActive();
            userRepository.save(user);
        }
    }

    // Set user online status
    public void setUserOnline(String userId, boolean online) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            user.setOnline(online);
            if (online) {
                user.updateLastActive();
            }
            userRepository.save(user);
            logger.info("User {} set to {}", userId, online ? "online" : "offline");
        }
    }

    // Get users with activity data
    public List<User> getUsersWithActivity(List<String> userIds) {
        return userRepository.findAllById(userIds);
    }

    // NEW: Scheduled task to set inactive users offline
    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    public void setInactiveUsersOffline() {
        try {
            // Set users offline if they haven't been active for more than 10 minutes
            Date tenMinutesAgo = Date.from(Instant.now().minus(10, ChronoUnit.MINUTES));
            List<User> inactiveUsers = userRepository.findByIsOnlineTrueAndLastActiveBefore(tenMinutesAgo);

            for (User user : inactiveUsers) {
                user.setOnline(false);
                userRepository.save(user);
                logger.info("Set user {} offline due to inactivity", user.getId());
            }

            if (!inactiveUsers.isEmpty()) {
                logger.info("Set {} inactive users offline", inactiveUsers.size());
            }
        } catch (Exception e) {
            logger.error("Error setting inactive users offline: {}", e.getMessage());
        }
    }

    // NEW: Method to manually reset all users to offline (for testing)
    public void resetAllUsersOffline() {
        List<User> onlineUsers = userRepository.findByIsOnlineTrue();
        for (User user : onlineUsers) {
            user.setOnline(false);
            userRepository.save(user);
        }
        logger.info("Reset {} users to offline", onlineUsers.size());
    }

    private void sendVerificationEmail(User user) {
        int maxRetries = 3;
        int retryDelayMs = 2000;

        logger.info("Tentative d'envoi d'email à : {}", user.getEmail());

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                SendSmtpEmail email = createVerificationEmail(user);
                brevoEmailApi.sendTransacEmail(email);
                logger.info("Email envoyé avec succès à : {}", user.getEmail());
                return;
            } catch (ApiException e) {
                logger.error("Échec de l'envoi (tentative {}/{}): {}", attempt, maxRetries, e.getMessage());
                logger.debug("Réponse Brevo : {}", e.getResponseBody());

                if (e.getCode() == 429) {
                    try {
                        Thread.sleep(retryDelayMs * attempt);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                } else {
                    throw new RuntimeException("Erreur Brevo: " + e.getMessage());
                }
            }
        }
        throw new RuntimeException("Échec après " + maxRetries + " tentatives");
    }

//    private SendSmtpEmail createVerificationEmail(User user) {
//        String verificationUrl = "http://localhost:8080/utilisateur/verify-email?token=" + user.getVerificationToken();
//
//        return new SendSmtpEmail()
//                .sender(new SendSmtpEmailSender()
//                        .email(senderEmail)
//                        .name(senderName))
//                .to(List.of(new SendSmtpEmailTo()
//                        .email(user.getEmail())))
//                .subject("Vérification de votre email")
//                .htmlContent("<h1>Bienvenue sur notre plateforme</h1>"
//                        + "<p>Cliquez sur ce lien pour vérifier votre email : "
//                        + "<a href='" + verificationUrl + "'>Vérifier mon email</a></p>"
//                        + "<p>Ce lien expirera dans 24 heures</p>");
//    }

    private SendSmtpEmail createVerificationEmail(User user) {
        String userName = (user.getPrenom() != null && !user.getPrenom().isEmpty()) ?
                user.getPrenom() : "cher utilisateur";

        return new SendSmtpEmail()
                .sender(new SendSmtpEmailSender()
                        .email(senderEmail)
                        .name(senderName))
                .to(List.of(new SendSmtpEmailTo()
                        .email(user.getEmail())))
                .subject("Bienvenue sur notre plateforme")
                .htmlContent("<div style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 10px; overflow: hidden; background: #f8f9fa;\">"
                        + "<div style=\"padding: 40px 30px; text-align: center;\">"
                        + "<div style=\"margin-bottom: 25px;\">"
                        + "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"64\" height=\"64\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#4CAF50\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">"
                        + "<path d=\"M22 11.08V12a10 10 0 1 1-5.93-9.14'></path>"
                        + "<polyline points='22 4 12 14.01 9 11.01'></polyline>"
                        + "</svg>"
                        + "</div>"
                        + "<h1 style=\"color: #333; font-size: 28px; margin-bottom: 10px;\">Bienvenue " + userName + " !</h1>"
                        + "<p style=\"color: #555; line-height: 1.6; font-size: 16px;\">"
                        + "Votre compte a été activé avec succès.<br>"
                        + "Vous pouvez dès à présent vous connecter et profiter de nos services."
                        + "</p>"
                        + "<div style=\"margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;\">"
                        + "<p style=\"color: #777; font-size: 14px; margin: 5px 0;\">"
                        + "Cordialement,<br><strong>L'équipe de notre plateforme</strong>"
                        + "</p>"
                        + "</div>"
                        + "</div>"
                        + "<div style=\"background: #4CAF50; padding: 15px; text-align: center; color: white; font-size: 12px;\">"
                        + "<p style=\"margin: 0;\">© 2023 Notre Plateforme. Tous droits réservés.</p>"
                        + "</div>"
                        + "</div>");
    }
    public User createUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getRawPassword()));
        user.setVerificationToken(UUID.randomUUID().toString());
        user.setVerificationTokenExpiry(Date.from(Instant.now().plus(24, ChronoUnit.HOURS)));
        user.setEmailVerified(false);
        user.updateLastActive();
        user.setOnline(false); // New users start offline

        User savedUser = userRepository.save(user);
        sendVerificationEmail(savedUser);
        return savedUser;
    }

    public User verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (user.getVerificationTokenExpiry().before(new Date())) {
            throw new RuntimeException("Token expired");
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        user.updateLastActive();
        return userRepository.save(user);
    }

    public User loginUser(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        user.updateLastActive();
        // Don't set online here - it will be set by the controller
        userRepository.save(user);
        return user;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Only update activity, don't change online status
        user.updateLastActive();
        userRepository.save(user);
        return user;
    }

    public User updateUser(String id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        userDetails.setEmail(user.getEmail());
        userDetails.setAdditionalEmails(user.getAdditionalEmails());

        if(userDetails.getNom() != null) user.setNom(userDetails.getNom());
        if(userDetails.getPrenom() != null) user.setPrenom(userDetails.getPrenom());
        if(userDetails.getTelephone() != null) user.setTelephone(userDetails.getTelephone());
        if(userDetails.getAdresse() != null) user.setAdresse(userDetails.getAdresse());
        if(userDetails.getPays() != null) user.setPays(userDetails.getPays());
        if(userDetails.getEtat() != null) user.setEtat(userDetails.getEtat());
        if(userDetails.getPhotoUrl() != null) user.setPhotoUrl(userDetails.getPhotoUrl());
        if(userDetails.getBio() != null) user.setBio(userDetails.getBio());

        user.updateLastActive();
        return userRepository.save(user);
    }

    public User addEmail(String userId, String newEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(!user.getAdditionalEmails().contains(newEmail)) {
            user.getAdditionalEmails().add(newEmail);
        }

        user.updateLastActive();
        return userRepository.save(user);
    }

    public User removeEmail(String userId, String emailToRemove) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.getAdditionalEmails().removeIf(email -> email.equals(emailToRemove));
        user.updateLastActive();
        return userRepository.save(user);
    }

    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> getUserByGoogleId(String googleId) {
        return userRepository.findByGoogleId(googleId);
    }

    private Date calculateExpirationDate(String planType) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(new Date());

        switch (planType.toLowerCase()) {
            case "monthly":
                calendar.add(Calendar.MONTH, 1);
                break;
            case "annual":
                calendar.add(Calendar.YEAR, 1);
                break;
            default:
                throw new IllegalArgumentException("Invalid plan type: " + planType);
        }

        return calendar.getTime();
    }

    public void downgradeExpiredUsers() {
        Date now = new Date();
        List<User> expiredUsers = userRepository.findBySubscriptionExpirationDateBefore(now);

        for (User user : expiredUsers) {
            user.setRole(User.Role.USER);
            user.setSubscriptionExpirationDate(null);
            userRepository.save(user);
        }
    }

    public void sendExpirationReminders() {
        Calendar calendar = Calendar.getInstance();

        calendar.add(Calendar.DAY_OF_MONTH, 2);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        Date startDate = calendar.getTime();

        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        Date endDate = calendar.getTime();

        List<User> expiringUsers = userRepository.findBySubscriptionExpirationDateBetween(startDate, endDate);

        for (User user : expiringUsers) {
            if (!user.isSubscriptionReminderSent()) {
                notificationService.createNotification(
                        user.getId(),
                        "SUBSCRIPTION_REMINDER",
                        "Your premium subscription expires in 2 days! Renew now to maintain your benefits. 🚀",
                        user.getPhotoUrl(),
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTah4HdYpD-_AA5ZlIhmm1Xuj_lPbdsettpvQ&s",
                        user.getId()
                );

                user.setSubscriptionReminderSent(true);
                userRepository.save(user);
            }
        }
    }

    public User upgradeToPremium(String userId, String planType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(User.Role.PREMIUM_USER);
        user.setSubscriptionExpirationDate(calculateExpirationDate(planType));
        user.setSubscriptionReminderSent(false);
        user.updateLastActive();

        return userRepository.save(user);
    }

    public boolean verifyPassword(String userId, String rawPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return passwordEncoder.matches(rawPassword, user.getPassword());
    }

    public UserStatsDTO getUserStatistics() {
        UserStatsDTO stats = new UserStatsDTO();

        stats.setTotalUsers(userRepository.count());

        List<UserStatsDTO.MonthlySignup> monthlySignups = userRepository.getMonthlySignups().stream()
                .map(ms -> new UserStatsDTO.MonthlySignup(ms.getMonth(), ms.getCount()))
                .collect(Collectors.toList());
        stats.setMonthlySignups(monthlySignups);

        stats.setPremiumUsers(userRepository.countByRole(User.Role.PREMIUM_USER));
        stats.setRegularUsers(userRepository.countByRole(User.Role.USER));

        List<User> recentUsers = userRepository.findTop5ByOrderByCreatedDateDesc();
        List<UserStatsDTO.RecentUser> recentSignups = recentUsers.stream()
                .filter(user -> user.getCreatedDate() != null)
                .map(user -> new UserStatsDTO.RecentUser(
                        user.getId(),
                        user.getPrenom() + " " + user.getNom(),
                        user.getEmail(),
                        user.getCreatedDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate()
                ))
                .collect(Collectors.toList());
        stats.setRecentSignups(recentSignups.isEmpty() ? null : recentSignups);

        return stats;
    }

    @Autowired
    private OrderRepository orderRepository;

    public UserOrderStatsDTO getUserOrderStatistics(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int totalOrders = orderRepository.countByIdUtilisateur(userId);
        Double totalSpent = orderRepository.calculateTotalForUser(userId);
        return new UserOrderStatsDTO(
                userId,
                user.getPrenom() + " " + user.getNom(),
                totalOrders,
                totalSpent
        );
    }
}
