package com.example.Mongo.Repository;

import com.example.Mongo.Entity.Commande;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CommandeRepository extends MongoRepository<Commande, String> {

    List<Commande> findByIdUtilisateur(String idUtilisateur);

    Optional<Commande> findByPaymentIntentId(String paymentIntentId);
    @Query("{ 'produits.idVendeur': ?0 }")
    List<Commande> findByProduitsIdVendeur(String vendeurId);

    // Compter le nombre de commandes pour un utilisateur
    long countByIdUtilisateur(String idUtilisateur);
    List<Commande> findByIdIn(List<String> ids);

    @Query("{ 'produits.idProduit': { $in: ?0 } }")
    List<Commande> findByProduitsIdProduitIn(List<String> productIds);
//    @Query("SELECT c FROM Commande c JOIN c.produits p WHERE p.id IN :productIds")
//    List<Commande> findByProduitIds(@Param("productIds") List<String> productIds);
}
