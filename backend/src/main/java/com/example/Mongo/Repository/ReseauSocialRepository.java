package com.example.Mongo.Repository;

import com.example.Mongo.Entity.ReseauSocial;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ReseauSocialRepository extends MongoRepository<ReseauSocial, String> {
    // Méthodes personnalisées si nécessaire
}