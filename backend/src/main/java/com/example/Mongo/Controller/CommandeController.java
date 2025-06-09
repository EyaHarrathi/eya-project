package com.example.Mongo.Controller;

import com.example.Mongo.Entity.Commande;
import com.example.Mongo.Entity.ProduitCommande;
import com.example.Mongo.Repository.CommandeRepository;
import com.example.Mongo.Service.CommandeService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/commandes")
@CrossOrigin(origins = "*")
public class CommandeController {

    @Autowired
    private CommandeRepository commandeRepository;
    @Autowired
    private CommandeService commandeService; // ✅ injecter le service

    // Endpoint pour récupérer toutes les commandes d'un utilisateur
    @GetMapping
    public List<Commande> getCommandesParUtilisateur(@RequestParam String userId) {
        return commandeRepository.findByIdUtilisateur(userId);
    }
    @PostMapping
    public Commande creerCommande(@RequestBody Commande commande) {
        if (commande == null || commande.getIdUtilisateur() == null) {
            throw new IllegalArgumentException("Commande ou ID utilisateur manquants");
        }

        // Validation des dates pour les produits en location
        for (ProduitCommande produit : commande.getProduits()) {
            if (produit.getStartDate() != null && produit.getEndDate() != null) {
                if (produit.getStartDate().isAfter(produit.getEndDate())) {
                    throw new IllegalArgumentException("Date de fin antérieure à la date de début");
                }
            }
        }

        return commandeRepository.save(commande);
    }

    // Endpoint pour mettre à jour le statut d'une commande
    @PutMapping("/{id}/statut")
    public ResponseEntity<?> mettreAJourStatut(
            @PathVariable String id,
            @RequestBody Map<String, String> request) { // ← Modification clé ici

        if (!request.containsKey("statut")) {
            return ResponseEntity.badRequest().body("Le paramètre 'statut' est requis");
        }

        String statut = request.get("statut");

        try {
            Commande commande = commandeRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Commande introuvable"));

            commande.setStatut(statut);
            Commande updatedCommande = commandeRepository.save(commande);

            return ResponseEntity.ok(updatedCommande);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur serveur : " + e.getMessage());
        }
    }
    @GetMapping("/by-vendeur")
    public ResponseEntity<List<Commande>> getCommandesByVendeur(@RequestParam String vendeurId) {
        List<Commande> commandes = commandeService.getCommandesByVendeur(vendeurId); // ✅ appel via instance
        return ResponseEntity.ok(commandes);
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getCommandeById(@PathVariable String id) {
        Optional<Commande> commande = commandeRepository.findById(id);
        if (commande.isPresent()) {
            return ResponseEntity.ok(commande.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Commande introuvable");
        }
    }
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<List<Commande>> getCommandesByUser(@PathVariable String userId) {
        List<Commande> commandes = commandeService.getCommandesByUSER(userId);
        return ResponseEntity.ok(commandes);
    }

    @GetMapping("/count-by-vendeur/{vendeurId}")
    public ResponseEntity<Long> countCommandesByVendeur(@PathVariable String vendeurId) {
        try {
            long count = commandeService.countCommandesByVendeur(vendeurId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(0L);
        }
    }
    @GetMapping("/count/by-user")
    public ResponseEntity<Long> countCommandesByUser(@RequestParam String userId) {
        long count = commandeService.countCommandesByUser(userId);
        return ResponseEntity.ok(count);
    }
}