package com.example.Mongo.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import com.example.Mongo.Entity.MonthlySignup;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.Mongo.Entity.User;
import org.springframework.data.mongodb.repository.Query;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmailAndPassword(String email, String password); // Recherche par email et mot de passe
    long countByRole(User.Role role);

    Optional<User> findByEmail(String email);  // Recherche par email uniquement
    Optional<User> findByGoogleId(String googleId);  // Recherche par googleId pour les utilisateurs Google
    @SuppressWarnings("null")
    Optional<User> findById(String userId);
    Optional<User> findByVerificationToken(String verificationToken);
    List<User> findTop5ByOrderByCreatedDateDesc();
    List<User> findBySubscriptionExpirationDateBefore(Date date);
    @Aggregation(pipeline = {
            "{ $group: { _id: { $dateToString: { format: '%Y-%m', date: '$created_date' } }, count: { $sum: 1 } } }",
            "{ $project: { _id: 0, month: '$_id', count: 1 } }",
            "{ $sort: { month: 1 } }"
    })
    List<User> findByRole(User.Role role);

    @Aggregation(pipeline = {
            "{ $group: { _id: { $dateToString: { format: '%Y-%m', date: '$created_date' } }, count: { $sum: 1 } } }",
            "{ $project: { _id: 0, month: '$_id', count: 1 } }",
            "{ $sort: { month: 1 } }"
    })
    List<MonthlySignupProjection> getMonthlySignups();
    interface MonthlySignupProjection {
        String getMonth();
        Long getCount();
    }
    List<User> findBySubscriptionExpirationDateBetween(Date startDate, Date endDate);
    // NEW: Methods for online status management
    List<User> findByIsOnlineTrue();
    List<User> findByIsOnlineTrueAndLastActiveBefore(Date date);
}
