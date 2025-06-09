package com.example.Mongo.Repository;

import com.example.Mongo.Entity.Boutique;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BoutiqueRepository extends MongoRepository<Boutique, String> {
    List<Boutique> findByidUtilisateur(String idUtilisateur);

//    Page<Boutique> findByidUtilisateur(String idUtilisateur, Pageable pageable);

//    Boutique findByIdUser(String idUtilisateur);
}
