package com.example.Mongo.Service;

import com.example.Mongo.Dto.ClientStatistique;
import com.example.Mongo.Dto.CommandeBoutiqueDTO;
import com.example.Mongo.Dto.TopProduitDTO;
import com.example.Mongo.Dto.UserBoutiquesDTO;
import com.example.Mongo.Entity.*;
import com.example.Mongo.Repository.*;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.threeten.bp.Instant;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class BoutiqueService {
    @Autowired
    private final ProductRepository ProductRepository;


    private final BoutiqueRepository boutiqueRepository;
    private final CommandeRepository commandeRepository;
    private final TransactionRepository transactionRepository;
    private final ProductService productService;
    private final UserRepository UserRepository;


    private static final List<String> DOCUMENT_MIME_TYPES = List.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    @Autowired
    public BoutiqueService(
            UserRepository UserRepository ,

            BoutiqueRepository boutiqueRepository,
            CommandeRepository commandeRepository,
            ProductRepository ProductRepository,
            TransactionRepository transactionRepository,

            @Lazy ProductService productService
    ) {
        this.ProductRepository = ProductRepository;
        this.boutiqueRepository = boutiqueRepository;
        this.commandeRepository = commandeRepository;
        this.transactionRepository = transactionRepository;
        this.productService = productService;
        this.UserRepository=UserRepository;

    }

    public Boutique creerBoutique(
            String nom,
            String description,
            String type,
            List<String> numeros,
            MultipartFile logo,
            MultipartFile documentJuridique,
            String idUtilisateur
    ) throws IOException {

        validateChampsObligatoires(nom, description, type, numeros);
        validateFichiers(logo, documentJuridique);
        validateNumerosTelephone(numeros);

        Boutique nouvelleBoutique = new Boutique();
        nouvelleBoutique.setNom(nom.trim());
        nouvelleBoutique.setDescription(description.trim());
        nouvelleBoutique.setType(type.trim());
        nouvelleBoutique.setNumeros(numeros);
        nouvelleBoutique.setLogo(logo.getBytes());
        nouvelleBoutique.setDocumentJuridique(documentJuridique.getBytes());
        nouvelleBoutique.setIdUtilisateur(idUtilisateur);

        return boutiqueRepository.save(nouvelleBoutique);
    }

    private void validateChampsObligatoires(String nom, String description, String type, List<String> numeros) {
        if (nom == null || nom.trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom de la boutique est obligatoire");
        }
        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("La description est obligatoire");
        }
        if (type == null || type.trim().isEmpty()) {
            throw new IllegalArgumentException("Le type de boutique est obligatoire");
        }
        if (numeros == null || numeros.isEmpty()) {
            throw new IllegalArgumentException("Au moins un numéro de téléphone est requis");
        }
    }

    private void validateFichiers(MultipartFile logo, MultipartFile documentJuridique) {
        if (logo.isEmpty()) {
            throw new IllegalArgumentException("Le logo est obligatoire");
        }
        if (documentJuridique.isEmpty()) {
            throw new IllegalArgumentException("Le document juridique est obligatoire");
        }

        String contentTypeLogo = logo.getContentType();
        if (contentTypeLogo == null || !contentTypeLogo.startsWith("image/")) {
            throw new IllegalArgumentException("Le logo doit être une image (format JPG, PNG, GIF)");
        }

        String contentTypeDoc = documentJuridique.getContentType();
        if (contentTypeDoc == null || !DOCUMENT_MIME_TYPES.contains(contentTypeDoc)) {
            throw new IllegalArgumentException("Document invalide. Formats acceptés : PDF, DOC, DOCX");
        }
    }

    private void validateNumerosTelephone(List<String> numeros) {
        for (String numero : numeros) {
            if (!numero.matches("^\\+216\\d{8}$")) {
                throw new IllegalArgumentException("Numéro invalide : " + numero + ". Format attendu : +216XXXXXXXX");
            }
        }
    }

    public void validateBoutiqueOwnership(String boutiqueId, String userId) {
        Boutique boutique = boutiqueRepository.findById(boutiqueId)
                .orElseThrow(() -> new IllegalArgumentException("Boutique introuvable"));

        if (!boutique.getIdUtilisateur().equals(userId)) {
            throw new SecurityException("Vous n'êtes pas propriétaire de cette boutique");
        }
    }

    public List<Boutique> getAllBoutiques() {
        return boutiqueRepository.findAll();
    }

    public Boutique getBoutiqueById(String id) {
        return boutiqueRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Boutique introuvable"));
    }

    public List<Boutique> getBoutiquesByUserId(String userId) {
        return boutiqueRepository.findByidUtilisateur(userId);
    }

    public boolean existsById(String id) {
        return boutiqueRepository.existsById(id);
    }

    public void deleteBoutique(String id) {
        productService.deleteProductsByBoutiqueId(id);
        boutiqueRepository.deleteById(id);
    }

    public Boutique updateBoutique(
            String id,
            String nom,
            String description,
            String type,
            List<String> numeros,
            MultipartFile logo,
            MultipartFile documentJuridique
    ) throws IOException {

        Boutique boutique = boutiqueRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Boutique introuvable"));

        if (nom != null && !nom.trim().isEmpty()) boutique.setNom(nom.trim());
        if (description != null && !description.trim().isEmpty()) boutique.setDescription(description.trim());
        if (type != null && !type.trim().isEmpty()) boutique.setType(type.trim());

        if (numeros != null) {
            validateNumerosTelephone(numeros);
            boutique.setNumeros(numeros);
        }

        if (logo != null && !logo.isEmpty()) {
            validateLogo(logo);
            boutique.setLogo(logo.getBytes());
        }

        if (documentJuridique != null && !documentJuridique.isEmpty()) {
            validateDocument(documentJuridique);
            boutique.setDocumentJuridique(documentJuridique.getBytes());
        }

        return boutiqueRepository.save(boutique);
    }

    private void validateLogo(MultipartFile logo) {
        String contentType = logo.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Format de logo invalide (JPG/PNG requis)");
        }
    }

    private void validateDocument(MultipartFile document) {
        String contentType = document.getContentType();
        if (!DOCUMENT_MIME_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Format de document invalide (PDF/DOC/DOCX requis)");
        }
    }

    public List<Map<String, Object>> getChiffreAffairesParMois(String boutiqueId) {
        Boutique boutique = boutiqueRepository.findById(boutiqueId)
                .orElseThrow(() -> new RuntimeException("Boutique introuvable"));
        String idVendeur = boutique.getIdUtilisateur();

        // Récupérer les commandes du vendeur
        List<Commande> commandes = commandeRepository.findByProduitsIdVendeur(idVendeur);
        List<String> idCommandes = commandes.stream()
                .map(Commande::getId)
                .collect(Collectors.toList());

        // Récupérer les transactions associées à ces commandes
        List<Transaction> transactions = transactionRepository.findByIdCommandeIn(idCommandes);

        // Calculer le chiffre d'affaires par mois
        Map<Month, Double> caParMois = transactions.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getDateTransaction().toInstant().atZone(ZoneId.systemDefault()).getMonth(),
                        Collectors.summingDouble(Transaction::getMontant)
                ));

        // Générer la liste des résultats pour tous les mois (même si valeur = 0)
        List<Map<String, Object>> resultat = new ArrayList<>();
        for (Month mois : Month.values()) {
            Map<String, Object> map = new HashMap<>();
            map.put("mois", getNomMois(mois));
            map.put("valeur", caParMois.getOrDefault(mois, 0.0));
            resultat.add(map);
        }

        return resultat;
    }

    private String getNomMois(Month mois) {
        Locale locale = Locale.FRENCH;
        return mois.getDisplayName(java.time.format.TextStyle.FULL, locale);
    }

    public List<TopProduitDTO> getTopProduitsDansTransactionsParBoutique(String idBoutique) {
        // Valider l'ID de boutique
        if (idBoutique == null || !ObjectId.isValid(idBoutique)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID de boutique invalide: " + idBoutique);
        }

        // Vérifier si la boutique existe
        Boutique boutique = boutiqueRepository.findById(idBoutique)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Boutique non trouvée: " + idBoutique));
        String idVendeur = boutique.getIdUtilisateur();

        // 1. Récupérer toutes les commandes de ce vendeur
        List<Commande> commandes = commandeRepository.findByProduitsIdVendeur(idVendeur);
        Map<String, Commande> mapCommandes = commandes.stream()
                .collect(Collectors.toMap(Commande::getId, c -> c));

        List<String> idsCommandes = commandes.stream()
                .map(Commande::getId)
                .toList();

        // 2. Récupérer toutes les transactions liées à ces commandes
        List<Transaction> transactions = transactionRepository.findByIdCommandeIn(idsCommandes);

        // 3. Compter les occurrences des produits dans ces commandes
        Map<String, Integer> compteurProduits = new HashMap<>();
        for (Transaction t : transactions) {
            Commande c = mapCommandes.get(t.getIdCommande());
            if (c != null) {
                for (ProduitCommande pc : c.getProduits()) {
                    compteurProduits.merge(pc.getIdProduit(), 1, Integer::sum);
                }
            }
        }

        // 4. Convertir en TopProduitDTO avec nom du produit
        List<TopProduitDTO> topProduits = compteurProduits.entrySet().stream()
                .map(entry -> {
                    String nom = productService.getNomProduit(entry.getKey());
                    return new TopProduitDTO(nom, entry.getValue());
                })
                .filter(dto -> !dto.getNom().equals("Produit Inconnu")) // Ignorer les produits introuvables
                .sorted(Comparator.comparingInt(TopProduitDTO::getValeur).reversed())
                .limit(10)
                .collect(Collectors.toList());

        return topProduits;
    }
    public List<ClientStatistique> getRepartitionClients(String idBoutique) {
        Boutique boutique = boutiqueRepository.findById(idBoutique)
                .orElseThrow(() -> new RuntimeException("Boutique non trouvée"));
        String idVendeur = boutique.getIdUtilisateur();

        // 1. Récupérer toutes les commandes de ce vendeur
        List<Commande> commandes = commandeRepository.findByProduitsIdVendeur(idVendeur);
        Map<String, Commande> mapCommandes = commandes.stream()
                .collect(Collectors.toMap(Commande::getId, c -> c));

        // Calculer les clients "Nouveaux" et "Fidèles"
        Map<String, Long> clientsCount = commandes.stream()
                .collect(Collectors.groupingBy(
                        commande -> isClientFidele(commande.getIdUtilisateur()) ? "Fidèles" : "Nouveaux",
                        Collectors.counting()
                ));

        // Retourner les statistiques sous forme de liste
        return List.of(
                new ClientStatistique("Nouveaux", clientsCount.getOrDefault("Nouveaux", 0L)),
                new ClientStatistique("Fidèles", clientsCount.getOrDefault("Fidèles", 0L))
        );
    }

    // Exemple de logique de fidélité (basée sur la première commande)
    private boolean isClientFidele(String clientId) {
        // Logique : si le client a plus de 1 commande, il est considéré comme fidèle
        long count = commandeRepository.countByIdUtilisateur(clientId);  // Assure-toi que 'idUtilisateur' est le bon champ
        return count > 1;
    }

    public List<CommandeBoutiqueDTO> getCommandesFormatteesParBoutique(String idBoutique) {
        Boutique boutique = boutiqueRepository.findById(idBoutique)
                .orElseThrow(() -> new RuntimeException("Boutique non trouvée"));

        String idVendeur = boutique.getIdUtilisateur();
        List<Commande> commandes = commandeRepository.findByProduitsIdVendeur(idVendeur);

        return commandes.stream().map(commande -> {
            String produits = commande.getProduits().stream()
                    .map(p -> {
                        Product produit = ProductRepository.findById(p.getIdProduit()).orElse(null);
                        return produit != null ? produit.getName() : "Inconnu";
                    })
                    .collect(Collectors.joining(", "));

            double total = commande.getProduits().stream()
                    .mapToDouble(p -> {
                        Product produit = ProductRepository.findById(p.getIdProduit()).orElse(null);
                        return produit != null ? produit.getPrice() * p.getQuantite() : 0.0;
                    }).sum();

            String montant = String.format("%.2f DT", total);

            return new CommandeBoutiqueDTO(
                    commande.getId(),
                    commande.getLivraison().getNomComplet(),
                    produits,
                    commande.getDateCommande().toString(),
                    montant,
                    commande.getStatut()
            );
        }).collect(Collectors.toList());
    }
    // BoutiqueService.java
//    public Map<String, List<Boutique>> getBoutiquesGroupedByUser() {
//        List<Boutique> allBoutiques = boutiqueRepository.findAll();
//        return allBoutiques.stream()
//                .collect(Collectors.groupingBy(Boutique::getIdUtilisateur));
//    }
    // BoutiqueService.java
    @Autowired
    private UserRepository userRepository; // Add this dependency

    public List<UserBoutiquesDTO> getBoutiquesGroupedByUser() {
        // 1. Group boutiques by user ID
        Map<String, List<Boutique>> boutiquesByUserId = boutiqueRepository.findAll()
                .stream()
                .collect(Collectors.groupingBy(Boutique::getIdUtilisateur));

        // 2. Fetch users and map to DTOs
        return boutiquesByUserId.entrySet().stream()
                .map(entry -> {
                    String userId = entry.getKey();
                    List<Boutique> boutiques = entry.getValue();
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found: " + userId));
                    return new UserBoutiquesDTO(user, boutiques);
                })
                .collect(Collectors.toList());
    }
    public Map<String, Long> getBoutiqueCountByType() {
        return boutiqueRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        boutique -> boutique.getType() != null ? boutique.getType() : "unknown",
                        Collectors.counting()
                ));
    }
}
