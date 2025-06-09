package com.example.Mongo.Service;

import com.example.Mongo.Entity.Commande;
import com.example.Mongo.Entity.Intermediaire;
import com.example.Mongo.Entity.Product;
import com.example.Mongo.Entity.Transaction;
import com.example.Mongo.Repository.CommandeRepository;
import com.example.Mongo.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CommandeService {
    @Autowired
    private TransactionService transactionService;

    @Autowired
    private CommandeRepository commandeRepository;
    private ProductRepository ProductRepository;


    public CommandeService(RestTemplate restTemplate,ProductRepository ProductRepository) {
        this.restTemplate = restTemplate;
        this.ProductRepository = ProductRepository;
    }
    public Commande creerCommande(Commande commande) {
        // La dateCommande est automatiquement définie via la classe Commande
        return commandeRepository.save(commande);
    }

    public long countCommandesByVendeur(String vendeurId) {
        List<Commande> commandes = commandeRepository.findAll();

        return commandes.stream()
                .filter(c -> c.getProduits().stream()
                        .anyMatch(p -> vendeurId.equals(p.getIdVendeur())))
                .count();
    }
    public Commande mettreAJourStatut(String id, String statut) {
        return commandeRepository.findById(id).map(c -> {
            c.setStatut(statut);
            return commandeRepository.save(c);
        }).orElse(null);
    }
    @Transactional
    public void handleSuccessfulPayment(String paymentIntentId, Long amount, Map<String, String> metadata) {
        // 1. Trouver la commande associée
        Commande commande = commandeRepository.findByPaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        // 2. Mettre à jour le statut
        commande.setStatut("PAYEE");
        commandeRepository.save(commande);

        // 3. Créer la transaction
        Transaction transaction = new Transaction();
        transaction.setMontant(amount / 100.0); // Conversion cents → euros
        transaction.setIdCommande(commande.getId());
        transaction.setIdAcheteur(commande.getIdUtilisateur());
        transaction.setIntermediaires(getIntermediaires(commande));

        transactionService.creerTransaction(transaction);
    }

    public List<Commande> getCommandesByVendeur(String vendeurId) {
        return commandeRepository.findByProduitsIdVendeur(vendeurId);
    }
    public void updatePaymentStatus(String paymentIntentId, String status) {
        Commande commande = commandeRepository.findByPaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        commande.setStatutPaiement(status);
        commandeRepository.save(commande);
    }
    @Autowired
    private RestTemplate restTemplate;
    private List<String> getIntermediaires(Commande commande) {
        Set<String> intermediaires = new HashSet<>();
        String categoryId = "your-category-id"; // Remplacer par l'ID réel

        // 1. Récupérer tous les vendeurs distincts de la commande
        Set<String> vendeurIds = commande.getProduits().stream()
                .map(p -> p.getIdVendeur())
                .collect(Collectors.toSet());

        // 2. Pour chaque vendeur, trouver les intermédiaires
        for (String vendeurId : vendeurIds) {
            try {
                List<Intermediaire> intermediaries = restTemplate.getForObject(
                        "http://localhost:8080/api/intermediaries/between/" +
                                commande.getIdUtilisateur() + "/" +
                                vendeurId + "/" +
                                categoryId,
                        List.class
                );

                if (intermediaries != null) {
                    intermediaries.stream()
                            .map(Intermediaire::getId)
                            .forEach(intermediaires::add);
                }
            } catch (Exception e) {
                throw new RuntimeException("Erreur lors de la récupération des intermédiaires pour le vendeur " + vendeurId, e);
            }
        }

        return new ArrayList<>(intermediaires);
    }
    public List<Commande> getCommandesByUSER(String userId) {
        // Étape 1 : récupérer les produits du vendeur sans boutique
        List<Product> produitsSansBoutique = ProductRepository.findByUserIdAndBoutiqueIdIsNull(userId);

        if (produitsSansBoutique.isEmpty()) {
            return Collections.emptyList();
        }

        // Étape 2 : extraire les IDs des produits
        List<String> idsProduits = produitsSansBoutique.stream()
                .map(Product::getId)
                .collect(Collectors.toList());

        // Étape 3 : récupérer les commandes contenant ces produits
        return commandeRepository.findByProduitsIdProduitIn(idsProduits);
    }
    public long countCommandesByUser(String idUtilisateur) {
        return commandeRepository.countByIdUtilisateur(idUtilisateur);
    }

}


