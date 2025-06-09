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

import java.time.Month;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/boutiques") // Changed to plural
public class RevenueController {

    private static final Logger logger = LoggerFactory.getLogger(RevenueController.class);

    @Autowired
    private BoutiqueRepository boutiqueRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    // French month names mapping
    private static final Map<Month, String> MONTH_NAME_MAP = new HashMap<>();
    static {
        MONTH_NAME_MAP.put(Month.JANUARY, "Janvier");
        MONTH_NAME_MAP.put(Month.FEBRUARY, "Février");
        MONTH_NAME_MAP.put(Month.MARCH, "Mars");
        MONTH_NAME_MAP.put(Month.APRIL, "Avril");
        MONTH_NAME_MAP.put(Month.MAY, "Mai");
        MONTH_NAME_MAP.put(Month.JUNE, "Juin");
        MONTH_NAME_MAP.put(Month.JULY, "Juillet");
        MONTH_NAME_MAP.put(Month.AUGUST, "Août");
        MONTH_NAME_MAP.put(Month.SEPTEMBER, "Septembre");
        MONTH_NAME_MAP.put(Month.OCTOBER, "Octobre");
        MONTH_NAME_MAP.put(Month.NOVEMBER, "Novembre");
        MONTH_NAME_MAP.put(Month.DECEMBER, "Décembre");
    }

    private String getNomMois(Month month) {
        return MONTH_NAME_MAP.getOrDefault(month, month.toString());
    }

    @GetMapping("/{boutiqueId}/chiffre-affaires-par-mois")
    public ResponseEntity<?> getChiffreAffairesParMois(@PathVariable String boutiqueId) {
        logger.info("Fetching monthly revenue for boutiqueId: {}", boutiqueId);

        // Validate boutiqueId
        if (boutiqueId == null || boutiqueId.trim().isEmpty()) {
            logger.error("Invalid boutiqueId: {}", boutiqueId);
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }

        // Check if boutique exists
        if (!boutiqueRepository.existsById(boutiqueId)) {
            logger.warn("Boutique not found for boutiqueId: {}", boutiqueId);
            return ResponseEntity.ok().body(generateEmptyMonthlyRevenue());
        }

        // Step 1: Get products by boutique ID
        List<Product> products = productRepository.findByBoutiqueId(boutiqueId);
        logger.info("Found {} products for boutiqueId: {}", products.size(), boutiqueId);
        if (products.isEmpty()) {
            logger.warn("No products found for boutiqueId: {}", boutiqueId);
            return ResponseEntity.ok().body(generateEmptyMonthlyRevenue());
        }

        List<String> productIds = products.stream()
                .map(Product::getId)
                .collect(Collectors.toList());
        logger.debug("Product IDs: {}", productIds);

        // Step 2: Get transactions by product IDs
        List<Transaction> transactions = transactionRepository.findByProduitsIdProduitIn(productIds);
        logger.info("Found {} transactions for {} product IDs", transactions.size(), productIds.size());
        if (transactions.isEmpty()) {
            logger.warn("No transactions found for productIds: {}", productIds);
            return ResponseEntity.ok().body(generateEmptyMonthlyRevenue());
        }

        // Step 3: Calculate revenue by month
        Map<Month, Double> caParMois = transactions.stream()
                .filter(t -> t.getDateTransaction() != null)
                .collect(Collectors.groupingBy(
                        t -> t.getDateTransaction().toInstant().atZone(ZoneId.systemDefault()).getMonth(),
                        Collectors.summingDouble(Transaction::getMontant)
                ));

        // Step 4: Generate results for all months
        List<Map<String, Object>> resultat = new ArrayList<>();
        for (Month mois : Month.values()) {
            Map<String, Object> map = new HashMap<>();
            map.put("mois", getNomMois(mois));
            map.put("valeur", caParMois.getOrDefault(mois, 0.0));
            resultat.add(map);
        }

        logger.info("Returning monthly revenue data with {} months", resultat.size());
        return ResponseEntity.ok().body(resultat);
    }

    private List<Map<String, Object>> generateEmptyMonthlyRevenue() {
        List<Map<String, Object>> resultat = new ArrayList<>();
        for (Month mois : Month.values()) {
            Map<String, Object> map = new HashMap<>();
            map.put("mois", getNomMois(mois));
            map.put("valeur", 0.0);
            resultat.add(map);
        }
        return resultat;
    }
}