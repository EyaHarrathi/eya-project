package com.example.Mongo.Repository;

import com.example.Mongo.Entity.Cart;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CartRepository extends MongoRepository<Cart, String> {
    Optional<Cart> findByUserId(String userId);
    boolean existsByUserId(String userId);
    void deleteByUserId(String userId);

}
