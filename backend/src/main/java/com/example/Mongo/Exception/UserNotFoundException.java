package com.example.Mongo.Exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String userId) {
        super("Utilisateur non trouvé avec l'ID: " + userId);
    }
}

