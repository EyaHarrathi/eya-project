package com.example.Mongo.Controller;

import com.example.Mongo.Entity.Boutique;
import com.example.Mongo.Entity.Product;
import com.example.Mongo.Entity.Transaction;
import com.example.Mongo.Repository.BoutiqueRepository;
import com.example.Mongo.Repository.ProductRepository;
import com.example.Mongo.Repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/boutique")
public class produitcontroller {

    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);

    @Autowired
    private BoutiqueRepository boutiqueRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    // DTO for top products
    public static class TopProduitDTO {
        private String nom;
        private int valeur;

        public TopProduitDTO(String nom, int valeur) {
            this.nom = nom;
            this.valeur = valeur;
        }

        public String getNom() {
            return nom;
        }

        public void setNom(String nom) {
            this.nom = nom;
        }

        public int getValeur() {
            return valeur;
        }

        public void setValeur(int valeur) {
            this.valeur = valeur;
        }
    }

    @GetMapping("/{boutiqueId}/top-produits")
    public ResponseEntity<?> getTopProduitsDansTransactionsParBoutique(@PathVariable String boutiqueId) {
        logger.info("Fetching top products for boutiqueId: {}", boutiqueId);

        // Validate boutiqueId
        if (boutiqueId == null || boutiqueId.trim().isEmpty()) {
            logger.error("Invalid boutiqueId: {}", boutiqueId);
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }

        // Check if boutique exists
        if (!boutiqueRepository.existsById(boutiqueId)) {
            logger.warn("Boutique not found for boutiqueId: {}", boutiqueId);
            return ResponseEntity.ok().body(Collections.emptyList());
        }

        // Step 1: Get products by boutique ID
        List<Product> products = productRepository.findByBoutiqueId(boutiqueId);
        logger.info("Found {} products for boutiqueId: {}", products.size(), boutiqueId);
        if (products.isEmpty()) {
            logger.warn("No products found for boutiqueId: {}", boutiqueId);
            return ResponseEntity.ok().body(Collections.emptyList());
        }

        // Create a map of product ID to name for quick lookup
        Map<String, String> productNameMap = products.stream()
                .collect(Collectors.toMap(Product::getId, Product::getName, (a, b) -> a));
        List<String> productIds = products.stream()
                .map(Product::getId)
                .collect(Collectors.toList());
        logger.debug("Product IDs: {}", productIds);

        // Step 2: Get transactions by product IDs
        List<Transaction> transactions = transactionRepository.findByProduitsIdProduitIn(productIds);
        logger.info("Found {} transactions for {} product IDs", transactions.size(), productIds.size());
        if (transactions.isEmpty()) {
            logger.warn("No transactions found for productIds: {}", productIds);
            return ResponseEntity.ok().body(Collections.emptyList());
        }

        // Step 3: Count product occurrences in transactions
        Map<String, Integer> compteurProduits = new HashMap<>();
        for (Transaction transaction : transactions) {
            if (transaction.getProduits() != null) {
                for (var produit : transaction.getProduits()) {
                    String idProduit = produit.getIdProduit();
                    if (productIds.contains(idProduit)) {
                        compteurProduits.merge(idProduit, 1, Integer::sum);
                    }
                }
            }
        }

        // Step 4: Convert to TopProduitDTO
        List<TopProduitDTO> topProduits = compteurProduits.entrySet().stream()
                .map(entry -> {
                    String nom = productNameMap.getOrDefault(entry.getKey(), "Produit inconnu");
                    return new TopProduitDTO(nom, entry.getValue());
                })
                .sorted(Comparator.comparingInt(TopProduitDTO::getValeur).reversed())
                .limit(10)
                .collect(Collectors.toList());

        logger.info("Returning {} top products", topProduits.size());
        return ResponseEntity.ok().body(topProduits);
    }
}