package com.example.Mongo.Controller;

import com.example.Mongo.Dto.UserOrderStatsDTO;
import com.example.Mongo.Dto.UserStatsDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.Mongo.Entity.User;
import com.example.Mongo.Repository.UserRepository;
import com.example.Mongo.Service.UserService;

import java.time.ZoneId;
import java.util.*;

import org.springframework.http.MediaType;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;
import java.io.IOException;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/utilisateur")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    // Get all users
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // Get user by ID (updates lastActive)
    @GetMapping("/{id}")
    public User getUserById(@PathVariable String id) {
        return userService.getUserById(id);
    }

    // Get user status without updating lastActive
    @GetMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> getUserStatus(@PathVariable String id) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

            Map<String, Object> status = new HashMap<>();
            status.put("isOnline", user.isOnline());
            status.put("lastActive", user.getLastActive());
            status.put("userId", user.getId());

            return ResponseEntity.ok(status);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    // Get multiple users' status in batch
    @PostMapping("/batch-status")
    public ResponseEntity<List<Map<String, Object>>> getBatchUserStatus(@RequestBody List<String> userIds) {
        try {
            List<User> users = userRepository.findAllById(userIds);
            List<Map<String, Object>> statusList = users.stream()
                    .map(user -> {
                        Map<String, Object> status = new HashMap<>();
                        status.put("userId", user.getId());
                        status.put("isOnline", user.isOnline());
                        status.put("lastActive", user.getLastActive());
                        return status;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(statusList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList());
        }
    }

    // NEW: Set user online status
    @PostMapping("/{id}/online")
    public ResponseEntity<?> setUserOnline(@PathVariable String id) {
        try {
            userService.setUserOnline(id, true);
            return ResponseEntity.ok(Collections.singletonMap("message", "User set online"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    // NEW: Set user offline status
    @PostMapping("/{id}/offline")
    public ResponseEntity<?> setUserOffline(@PathVariable String id) {
        try {
            userService.setUserOnline(id, false);
            return ResponseEntity.ok(Collections.singletonMap("message", "User set offline"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    // NEW: Update user activity (heartbeat)
    @PostMapping("/{id}/heartbeat")
    public ResponseEntity<?> updateUserActivity(@PathVariable String id) {
        try {
            userService.updateUserActivity(id);
            return ResponseEntity.ok(Collections.singletonMap("message", "Activity updated"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    // Create a new user via JSON
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            User createdUser = userService.createUser(user);
            return ResponseEntity.ok(createdUser);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        }
    }

    // Update a user
    @PutMapping("/{id}")
    public User updateUser(@PathVariable String id, @RequestBody User userDetails) {
        return userService.updateUser(id, userDetails);
    }

    // Delete a user
    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return "User with ID " + id + " deleted successfully.";
    }

    @PutMapping("/{id}/upgrade")
    public ResponseEntity<?> upgradeToPremium(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {

        try {
            String planType = request.get("planType");
            User upgradedUser = userService.upgradeToPremium(id, planType);
            return ResponseEntity.ok(upgradedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of("error", e.getMessage())
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("error", e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Internal server error")
            );
        }
    }

    // login - MODIFIED to set user online
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user) {
        try {
            User loggedInUser = userService.loginUser(user.getEmail(), user.getPassword());
            // Set user online after successful login
            userService.setUserOnline(loggedInUser.getId(), true);
            return ResponseEntity.ok(loggedInUser);
        } catch (RuntimeException e) {
            String errorMessage = "Invalid credentials";
            if (e.getMessage().equals("Email not verified")) {
                errorMessage = "Email not verified. Please check your inbox.";
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorMessage);
        }
    }

    // logout - MODIFIED to set user offline
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, @RequestBody(required = false) Map<String, String> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            new SecurityContextLogoutHandler().logout(request, null, null);
        }

        // Set user offline if userId is provided
        if (body != null && body.containsKey("userId")) {
            String userId = body.get("userId");
            userService.setUserOnline(userId, false);
        }

        return ResponseEntity.ok()
                .body(Collections.singletonMap("message", "Logged out successfully"));
    }

    @PostMapping("/googleLogin")
    public ResponseEntity<?> googleLogin(@RequestBody User userFromGoogle) {
        Optional<User> existingUser = userService.getUserByEmail(userFromGoogle.getEmail());

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setPhotoUrl(userFromGoogle.getPhotoUrl());
            user.setNom(userFromGoogle.getNom());
            user.setPrenom(userFromGoogle.getPrenom());

            userService.updateUser(user.getId(), user);
            // Set user online after successful Google login
            userService.setUserOnline(user.getId(), true);

            return ResponseEntity.ok(user);
        } else {
            try {
                String profileImageUrl = userFromGoogle.getPhotoUrl();
                User newUser = new User(
                        userFromGoogle.getNom(),
                        userFromGoogle.getPrenom(),
                        userFromGoogle.getEmail(),
                        "", "", "", "",
                        profileImageUrl, profileImageUrl
                );
                newUser.setRawPassword(UUID.randomUUID().toString());
                User createdUser = userService.createUser(newUser);
                // Set new user online
                userService.setUserOnline(createdUser.getId(), true);
                return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
            } catch (RuntimeException e) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
            }
        }
    }

    @PostMapping(value = "/createWithPhoto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> createUserWithPhoto(
            @RequestParam("nom") String nom,
            @RequestParam("prenom") String prenom,
            @RequestParam("email") String email,
            @RequestParam("telephone") String telephone,
            @RequestParam("adresse") String adresse,
            @RequestParam("pays") String pays,
            @RequestParam("etat") String etat,
            @RequestParam("password") String rawPassword,
            @RequestParam("photo") MultipartFile photo) {

        try {
            Path uploadPath = Paths.get("uploads");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = System.currentTimeMillis() + "_" + photo.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.write(filePath, photo.getBytes());

            User user = new User(nom, prenom, email, telephone, adresse, pays, etat, "", fileName);
            user.setRawPassword(rawPassword);
            userService.createUser(user);
            userRepository.save(user);

            return ResponseEntity.ok("Utilisateur enregistré avec succès !");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de l'upload.");
        }
    }

    @PostMapping(value = "/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateUserPhoto(
            @PathVariable String id,
            @RequestParam("photo") MultipartFile photo) {

        try {
            User user = userService.getUserById(id);

            Path uploadPath = Paths.get("uploads");
            String fileName = System.currentTimeMillis() + "_" + photo.getOriginalFilename();
            Files.write(uploadPath.resolve(fileName), photo.getBytes());

            user.setPhotoUrl(fileName);
            userService.updateUser(id, user);

            return ResponseEntity.ok(Collections.singletonMap("photoUrl", fileName));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{userId}/emails")
    public ResponseEntity<User> addEmail(
            @PathVariable String userId,
            @RequestBody Map<String, String> request) {

        String newEmail = request.get("email");
        return ResponseEntity.ok(userService.addEmail(userId, newEmail));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        try {
            User verifiedUser = userService.verifyEmail(token);
            return ResponseEntity.ok("Email verified successfully!");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/{userId}/emails/{email}")
    public ResponseEntity<User> removeEmail(
            @PathVariable String userId,
            @PathVariable String email) {

        return ResponseEntity.ok(userService.removeEmail(userId, email));
    }

    @PostMapping("/{id}/verify-password")
    public ResponseEntity<?> verifyPassword(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {

        String password = request.get("password");
        boolean isValid = userService.verifyPassword(id, password);

        return ResponseEntity.ok(Collections.singletonMap("valid", isValid));
    }

    @PostMapping("/upload")
    public ResponseEntity<String> handleFileUpload(@RequestParam("file") MultipartFile file) {
        try {
            String fileName = file.getOriginalFilename();
            Path path = Paths.get("uploads/" + fileName);
            Files.write(path, file.getBytes());

            return ResponseEntity.ok("/uploads/" + fileName);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur upload");
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<UserStatsDTO> getUserStats() {
        UserStatsDTO stats = userService.getUserStatistics();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/{userId}/order-stats")
    public ResponseEntity<UserOrderStatsDTO> getUserOrderStats(@PathVariable String userId) {
        UserOrderStatsDTO stats = userService.getUserOrderStatistics(userId);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/{userId}/role")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> getUserRole(@PathVariable String userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User non trouvé avec l'id: " + userId));

            return ResponseEntity.ok(Collections.singletonMap("role", user.getRole()));

        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/check-session")
    public ResponseEntity<?> checkSession() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok().build();
    }
    @GetMapping("/check-premium")
    public ResponseEntity<Map<String, Boolean>> checkPremiumStatus(
            @AuthenticationPrincipal UserDetails userDetails) {

        String username = userDetails.getUsername();
        Optional<User> userOpt = userRepository.findByEmail(username);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userOpt.get();
        boolean isPremium = user.getRole() == User.Role.PREMIUM_USER &&
                (user.getSubscriptionExpirationDate() == null ||
                        user.getSubscriptionExpirationDate().after(new Date()));

        return ResponseEntity.ok(Collections.singletonMap("isPremium", isPremium));
    }
}
