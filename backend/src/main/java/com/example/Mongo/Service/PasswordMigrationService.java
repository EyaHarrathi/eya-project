package com.example.Mongo.Service;

import com.example.Mongo.Entity.User;
import com.example.Mongo.Repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PasswordMigrationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${security.migrate-passwords}")
    private boolean migratePasswords;

    public PasswordMigrationService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void init() {
        if(migratePasswords) {
            migrateExistingPasswords();
            disableMigrationFlag(); // Optionnel : désactiver après exécution
        }
    }

    private void migrateExistingPasswords() {
        List<User> users = userRepository.findAll();
        users.parallelStream().forEach(user -> {
            if(needsMigration(user)) {
                String encodedPassword = passwordEncoder.encode(user.getPassword());
                user.setPassword(encodedPassword);
                userRepository.save(user);
            }
        });
    }

    private boolean needsMigration(User user) {
        return user.getPassword() != null
                && !user.getPassword().startsWith("$2a$")
                && !user.getPassword().isEmpty();
    }

    private void disableMigrationFlag() {
        // Implémentez la logique pour désactiver le flag dans votre système de configuration
        System.out.println("Migration terminée - Flag désactivé");
    }
}