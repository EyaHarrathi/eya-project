package com.example.Mongo.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.Mongo.Entity.User;
import com.example.Mongo.Service.EmailService;
import com.example.Mongo.Service.ResetPasswordService;
import com.example.Mongo.Repository.UserRepository;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173") // Allow frontend access
@RestController
@RequestMapping("/api/password")
public class PasswordResetController {

    @Autowired
    private ResetPasswordService resetPasswordService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService; // Injection de EmailService

    @PostMapping("/send-reset-link")
    public ResponseEntity<Map<String, String>> sendResetLink(@RequestBody Map<String, String> request) {
        String email = request.get("email"); // Extraire l'email de l'objet JSON
        System.out.println("Email reçu : " + email); // Log pour vérifier l'email
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            System.out.println("Utilisateur trouvé : " + user.get().getEmail()); // Log pour vérifier l'utilisateur
            boolean isSent = resetPasswordService.sendResetLink(email);
            if (isSent) {
                // Renvoyer une réponse JSON
                Map<String, String> response = new HashMap<>();
                response.put("message", "Un lien de réinitialisation a été envoyé à votre email.");
                return ResponseEntity.ok(response);
            } else {
                // Renvoyer une réponse JSON en cas d'erreur
                Map<String, String> response = new HashMap<>();
                response.put("message", "Erreur lors de l'envoi du lien de réinitialisation.");
                return ResponseEntity.status(500).body(response);
            }
        } else {
            System.out.println("Aucun utilisateur trouvé avec cet email."); // Log pour vérifier l'absence d'utilisateur
            // Renvoyer une réponse JSON en cas d'email non trouvé
            Map<String, String> response = new HashMap<>();
            response.put("message", "Cet email n'existe pas.");
            return ResponseEntity.status(404).body(response);
        }
    }

    // Endpoint pour vérifier le code de réinitialisation
    @PostMapping("/verify-reset-code")
    public ResponseEntity<Map<String, String>> verifyResetCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");

        boolean isValid = resetPasswordService.validateResetCode(email, code);
        if (isValid) {
            // Renvoyer une réponse JSON
            Map<String, String> response = new HashMap<>();
            response.put("message", "Code vérifié avec succès.");
            return ResponseEntity.ok(response);
        } else {
            // Renvoyer une réponse JSON en cas d'erreur
            Map<String, String> response = new HashMap<>();
            response.put("message", "Code invalide ou expiré.");
            return ResponseEntity.status(400).body(response);
        }
    }

    // Endpoint pour réinitialiser le mot de passe
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        String newPassword = request.get("newPassword");

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            boolean isUpdated = resetPasswordService.updatePassword(email, code, newPassword);
            if (isUpdated) {
                // Renvoyer une réponse JSON
                Map<String, String> response = new HashMap<>();
                response.put("message", "Mot de passe réinitialisé avec succès.");
                return ResponseEntity.ok(response);
            } else {
                // Renvoyer une réponse JSON en cas d'erreur
                Map<String, String> response = new HashMap<>();
                response.put("message", "Code de réinitialisation invalide ou expiré.");
                return ResponseEntity.status(400).body(response);
            }
        } else {
            // Renvoyer une réponse JSON en cas d'utilisateur non trouvé
            Map<String, String> response = new HashMap<>();
            response.put("message", "Utilisateur non trouvé.");
            return ResponseEntity.status(404).body(response);
        }
    }

    // Endpoint pour envoyer un email de test
    @PostMapping("/send-email")
    public ResponseEntity<Map<String, String>> sendTestEmail(@RequestBody Map<String, String> request) {
        String toEmail = request.get("email");
        if (toEmail == null || toEmail.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Email is required.");
            return ResponseEntity.badRequest().body(response);
        }

        // Now correctly returns a boolean
        boolean isSent = emailService.sendResetLink(toEmail, "TEST_TOKEN_12345");

        if (isSent) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Email sent successfully.");
            return ResponseEntity.ok(response);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to send email.");
            return ResponseEntity.status(500).body(response);
        }
    }
}