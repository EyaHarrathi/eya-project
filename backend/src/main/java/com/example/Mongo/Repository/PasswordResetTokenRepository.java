package com.example.Mongo.Repository;

import com.example.Mongo.Entity.PasswordResetToken;
import com.example.Mongo.Entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PasswordResetTokenRepository extends MongoRepository<PasswordResetToken, String> {
    PasswordResetToken findByUserAndToken(User user, String token);
}
