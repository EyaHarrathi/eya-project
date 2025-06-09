package com.example.Mongo.Service;

import com.example.Mongo.Entity.User;
import com.example.Mongo.Entity.PasswordResetToken;
import com.example.Mongo.Repository.UserRepository;
import com.example.Mongo.Repository.PasswordResetTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.UUID;

@Service
public class ResetPasswordService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private EmailService emailService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    // Générer un code de réinitialisation unique
    public String generateResetCode(User user) {
        // Génère un code numérique aléatoire à 6 chiffres
        String token = String.format("%06d", (int)(Math.random() * 1000000));
        long expirationTime = System.currentTimeMillis() + (15 * 60 * 1000); // Code valide pendant 15 min

        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setToken(token);
        passwordResetToken.setUser(user);
        passwordResetToken.setExpirationTime(expirationTime);

        passwordResetTokenRepository.save(passwordResetToken);

        return token;
    }


    // Envoyer le lien de réinitialisation avec le code
    public boolean sendResetLink(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String resetToken = generateResetCode(user);
            emailService.sendResetLink(user.getEmail(), resetToken);  // Envoyer le lien de réinitialisation par email
            return true;
        }
        return false;  // L'utilisateur n'existe pas
    }

    // Vérifier si le code de réinitialisation est valide
    public boolean validateResetCode(String email, String code) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            PasswordResetToken resetToken = passwordResetTokenRepository.findByUserAndToken(user, code);
            if (resetToken != null && resetToken.getExpirationTime() > System.currentTimeMillis()) {
                return true;  // Le code est valide
            }
        }
        return false;  // Le code est invalide ou a expiré
    }

    // Mettre à jour le mot de passe de l'utilisateur
//    public boolean updatePassword(String email, String code, String newPassword) {
//        Optional<User> userOptional = userRepository.findByEmail(email);
//        if (userOptional.isPresent() && validateResetCode(email, code)) {
//            User user = userOptional.get();
//            user.setPassword(newPassword);  // Ici, on ne crypte pas le mot de passe
//            userRepository.save(user);  // Enregistrer le nouveau mot de passe dans la base de données
//            return true;  // Mot de passe mis à jour avec succès
//        }
//        return false;  // Code de réinitialisation invalide ou autre erreur
//    }
    public boolean updatePassword(String email, String code, String newPassword) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent() && validateResetCode(email, code)) {
            User user = userOptional.get();
            String encodedPassword = passwordEncoder.encode(newPassword);
            user.setPassword(encodedPassword);
            userRepository.save(user);

            // Invalidate the reset token
            PasswordResetToken resetToken = passwordResetTokenRepository.findByUserAndToken(user, code);
            if (resetToken != null) {
                passwordResetTokenRepository.delete(resetToken);
            }

            // Send password change confirmation email
            emailService.sendPasswordChangeConfirmation(user.getEmail());
            return true;
        }
        return false;
    }
}
