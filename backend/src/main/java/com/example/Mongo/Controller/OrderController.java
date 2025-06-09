package com.example.Mongo.Controller;

import com.example.Mongo.Entity.Boutique;
import com.example.Mongo.Entity.Commande;
import com.example.Mongo.Entity.Product;
import com.example.Mongo.Entity.User;
import com.example.Mongo.Repository.BoutiqueRepository;
import com.example.Mongo.Repository.CommandeRepository;
import com.example.Mongo.Repository.ProductRepository;
import com.example.Mongo.Repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZoneOffset;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/boutique")
public class OrderController {

    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    @Autowired
    private BoutiqueRepository boutiqueRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CommandeRepository commandeRepository;

    @Autowired
    private UserRepository userRepository;

    // DTO for formatted orders
    public static class CommandeBoutiqueDTO {
        private String id;
        private String client;
        private String produits;
        private String date;
        private String montant;
        private String statut;

        public CommandeBoutiqueDTO(String id, String client, String produits, String date, String montant, String statut) {
            this.id = id;
            this.client = client;
            this.produits = produits;
            this.date = date;
            this.montant = montant;
            this.statut = statut;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getClient() {
            return client;
        }

        public void setClient(String client) {
            this.client = client;
        }

        public String getProduits() {
            return produits;
        }

        public void setProduits(String produits) {
            this.produits = produits;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public String getMontant() {
            return montant;
        }

        public void setMontant(String montant) {
            this.montant = montant;
        }

        public String getStatut() {
            return statut;
        }

        public void setStatut(String statut) {
            this.statut = statut;
        }
    }

    @GetMapping("/{boutiqueId}/order")
    public ResponseEntity<?> getCommandesFormatteesParBoutique(@PathVariable String boutiqueId) {
        logger.info("Fetching formatted orders for boutiqueId: {}", boutiqueId);

        // Validate boutiqueId
        if (boutiqueId == null || boutiqueId.trim().isEmpty()) {
            logger.error("Invalid boutiqueId: {}", boutiqueId);
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }

        // Check if boutique exists
        Optional<Boutique> boutiqueOpt = boutiqueRepository.findById(boutiqueId);
        if (!boutiqueOpt.isPresent()) {
            logger.warn("Boutique not found for boutiqueId: {}", boutiqueId);
            return ResponseEntity.ok().body(Collections.emptyList());
        }

        // Fetch products by boutiqueId
        List<Product> products = productRepository.findByBoutiqueId(boutiqueId);
        logger.info("Found {} products for boutiqueId: {}", products.size(), boutiqueId);
        if (products.isEmpty()) {
            logger.warn("No products found for boutiqueId: {}", boutiqueId);
            return ResponseEntity.ok().body(Collections.emptyList());
        }

        // Create a map of product ID to product details for quick lookup
        Map<String, Product> productMap = products.stream()
                .collect(Collectors.toMap(Product::getId, p -> p, (a, b) -> a));
        List<String> productIds = products.stream()
                .map(Product::getId)
                .collect(Collectors.toList());
        logger.debug("Product IDs: {}", productIds);

        // Get commands where produits.idProduit is in productIds
        List<Commande> commandes = commandeRepository.findByProduitsIdProduitIn(productIds);
        logger.info("Found {} commands for {} product IDs", commandes.size(), productIds.size());
        if (commandes.isEmpty()) {
            logger.warn("No commands found for productIds: {}", productIds);
            return ResponseEntity.ok().body(Collections.emptyList());
        }

        // Format commands into CommandeBoutiqueDTO
        List<CommandeBoutiqueDTO> formattedOrders = commandes.stream()
                .map(commande -> {
                    // Get client name (prefer livraison.nomComplet, fallback to idAcheteur)
                    String clientName = commande.getLivraison() != null && commande.getLivraison().getNomComplet() != null ?
                            commande.getLivraison().getNomComplet() : "Inconnu";
                    if (clientName.equals("Inconnu") && commande.getIdUtilisateur() != null) {
                        User buyer = userRepository.findById(commande.getIdUtilisateur()).orElse(null);
                        if (buyer != null) {
                            clientName = (buyer.getNom() != null ? buyer.getNom() : "") + " " +
                                    (buyer.getPrenom() != null ? buyer.getPrenom() : "");
                            clientName = clientName.trim();
                        }
                    }

                    // Get product names
                    String produits = commande.getProduits() != null ?
                            commande.getProduits().stream()
                                    .map(p -> {
                                        Product produit = productMap.get(p.getIdProduit());
                                        return produit != null ? produit.getName() : "Inconnu";
                                    })
                                    .collect(Collectors.joining(", ")) :
                            "Aucun produit";

                    // Calculate total based on product prices and quantities
                    double total = commande.getProduits() != null ?
                            commande.getProduits().stream()
                                    .mapToDouble(p -> {
                                        Product produit = productMap.get(p.getIdProduit());
                                        int quantite = p.getQuantite() > 0 ? p.getQuantite() : 1;
                                        return produit != null ? produit.getPrice() * quantite : 0.0;
                                    }).sum() :
                            0.0;

                    // Format montant
                    String montant = String.format("%.2f DT", total);

                    // Format date (assume LocalDateTime)
                    String date = commande.getDateCommande() != null ?
                            commande.getDateCommande().toInstant(ZoneOffset.UTC)
                                    .atZone(java.time.ZoneId.systemDefault())
                                    .toLocalDateTime().toString() :
                            "Inconnue";

                    // Get status (default to "Confirmée" if null)
                    String statut = commande.getStatut() != null ? commande.getStatut() : "Confirmée";

                    return new CommandeBoutiqueDTO(
                            commande.getId(),
                            clientName,
                            produits,
                            date,
                            montant,
                            statut
                    );
                })
                .sorted((a, b) -> b.getDate().compareTo(a.getDate())) // Sort by date, newest first
                .collect(Collectors.toList());

        logger.info("Returning {} formatted orders", formattedOrders.size());
        return ResponseEntity.ok().body(formattedOrders);
    }
}