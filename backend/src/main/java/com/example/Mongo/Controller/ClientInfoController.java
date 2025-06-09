package com.example.Mongo.Controller;

import com.example.Mongo.Entity.Boutique;
import com.example.Mongo.Entity.Product;
import com.example.Mongo.Entity.Transaction;
import com.example.Mongo.Entity.User;
import com.example.Mongo.Repository.BoutiqueRepository;
import com.example.Mongo.Repository.ProductRepository;
import com.example.Mongo.Repository.TransactionRepository;
import com.example.Mongo.Repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/boutique")
public class ClientInfoController {

    private static final Logger logger = LoggerFactory.getLogger(ClientInfoController.class);

    @Autowired
    private BoutiqueRepository boutiqueRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    // Country code to name mapping
    private static final Map<String, String> COUNTRY_MAP = new HashMap<>();
    static {
        COUNTRY_MAP.put("fr", "France");
        COUNTRY_MAP.put("us", "United States");
        COUNTRY_MAP.put("de", "Germany");
        COUNTRY_MAP.put("tn", "Tunisia"); // Added mapping for Tunisia
        // Add more country codes as needed
    }

    // French department code to name mapping
    private static final Map<String, String> DEPARTMENT_MAP = new HashMap<>();
    static {
        DEPARTMENT_MAP.put("67", "Bas-Rhin");
        DEPARTMENT_MAP.put("68", "Haut-Rhin");
        DEPARTMENT_MAP.put("75", "Paris");
        // Add more department codes as needed
    }

    public static class ClientInfoDTO {
        private String id;
        private String name;
        private String email;
        private String location;
        private String phone;
        private int orders;
        private double spent;
        private String lastOrder;
        private String status;
        private boolean isPremium;

        public ClientInfoDTO(String id, String name, String email, String location, String phone,
                             int orders, double spent, String lastOrder, String status, boolean isPremium) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.location = location;
            this.phone = phone;
            this.orders = orders;
            this.spent = spent;
            this.lastOrder = lastOrder;
            this.status = status;
            this.isPremium = isPremium;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public int getOrders() { return orders; }
        public void setOrders(int orders) { this.orders = orders; }
        public double getSpent() { return spent; }
        public void setSpent(double spent) { this.spent = spent; }
        public String getLastOrder() { return lastOrder; }
        public void setLastOrder(String lastOrder) { this.lastOrder = lastOrder; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public boolean isPremium() { return isPremium; }
        public void setPremium(boolean premium) { isPremium = premium; }
    }

    @GetMapping("/{boutiqueId}/clients")
    public ResponseEntity<?> getClientInfoByBoutiqueId(@PathVariable String boutiqueId) {
        logger.info("Fetching client info for boutiqueId: {}", boutiqueId);

        // Validate boutiqueId
        if (boutiqueId == null || boutiqueId.trim().isEmpty()) {
            logger.error("Invalid boutiqueId: {}", boutiqueId);
            return ResponseEntity.badRequest().body("boutiqueId cannot be empty");
        }

        // Check if boutique exists
        if (!boutiqueRepository.existsById(boutiqueId)) {
            logger.warn("Boutique not found for boutiqueId: {}", boutiqueId);
            return ResponseEntity.ok().body(Collections.singletonMap("message", "No boutique found for ID: " + boutiqueId));
        }

        List<ClientInfoDTO> clientInfos = new ArrayList<>();

        // Step 1: Get products by boutique ID
        List<Product> products = productRepository.findByBoutiqueId(boutiqueId);
        logger.info("Found {} products for boutiqueId: {}", products.size(), boutiqueId);
        if (products.isEmpty()) {
            logger.warn("No products found for boutiqueId: {}", boutiqueId);
            return ResponseEntity.ok().body(Collections.singletonMap("message", "No products found for boutique ID: " + boutiqueId));
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
            return ResponseEntity.ok().body(Collections.singletonMap("message", "No transactions found for products of boutique ID: " + boutiqueId));
        }

        // Group transactions by buyer ID
        var transactionsByBuyer = transactions.stream()
                .collect(Collectors.groupingBy(Transaction::getIdAcheteur));
        logger.info("Found {} unique buyers", transactionsByBuyer.size());

        // Step 3: Get client information
        for (String buyerId : transactionsByBuyer.keySet()) {
            User user = userRepository.findById(buyerId).orElse(null);
            if (user == null) {
                logger.warn("No user found for buyerId: {}", buyerId);
                continue;
            }

            List<Transaction> buyerTransactions = transactionsByBuyer.get(buyerId);
            logger.debug("Processing buyerId: {}, with {} transactions", buyerId, buyerTransactions.size());

            // Calculate metrics
            int orderCount = buyerTransactions.size();
            double totalSpent = buyerTransactions.stream()
                    .mapToDouble(Transaction::getMontant)
                    .sum();
            String lastOrderDate = buyerTransactions.stream()
                    .map(Transaction::getDateTransaction)
                    .filter(date -> date != null)
                    .max(Date::compareTo)
                    .map(date -> date.toInstant()
                            .atZone(ZoneId.systemDefault())
                            .toLocalDate()
                            .toString())
                    .orElse("");

            // Handle null fields safely for full name
            String name = (user.getNom() != null ? user.getNom() : "") + " " +
                    (user.getPrenom() != null ? user.getPrenom() : "");

            // Map country and department codes to names
            String country = user.getPays() != null ? COUNTRY_MAP.getOrDefault(user.getPays().toLowerCase(), user.getPays()) : "";
            String department = user.getEtat() != null ? DEPARTMENT_MAP.getOrDefault(user.getEtat(), user.getEtat()) : "";
            String location = (department.isEmpty() ? "" : department + ", ") + country;

            String phone = user.getTelephone() != null ? user.getTelephone() : "";
            String email = user.getEmail() != null ? user.getEmail() : "";

            // Determine premium status based on user role
            boolean isPremium = user.getRole() != null && user.getRole() == User.Role.PREMIUM_USER;
            if (user.getRole() == null) {
                logger.warn("User role is null for buyerId: {}", buyerId);
            }

            // Create DTO
            ClientInfoDTO clientInfo = new ClientInfoDTO(
                    buyerId,
                    name.trim(),
                    email,
                    location.trim(),
                    phone,
                    orderCount,
                    totalSpent,
                    lastOrderDate,
                    orderCount > 1 ? "Actif" : "Inactif",
                    isPremium
            );

            clientInfos.add(clientInfo);
        }

        logger.info("Returning {} client infos", clientInfos.size());
        if (clientInfos.isEmpty()) {
            return ResponseEntity.ok().body(Collections.singletonMap("message", "No clients found for boutique ID: " + boutiqueId));
        }
        return ResponseEntity.ok().body(clientInfos);
    }
}