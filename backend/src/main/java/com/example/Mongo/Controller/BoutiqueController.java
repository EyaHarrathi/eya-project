package com.example.Mongo.Controller;

import com.example.Mongo.Dto.*;
import com.example.Mongo.Entity.Boutique;
import com.example.Mongo.Service.BoutiqueService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/boutiques")
public class BoutiqueController {

    private final BoutiqueService boutiqueService;

    public BoutiqueController(BoutiqueService boutiqueService) {
        this.boutiqueService = boutiqueService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> creerBoutique(
            @RequestParam String nom,
            @RequestParam String description,
            @RequestParam String type,
            @RequestParam List<String> numeros,
            @RequestParam String idUtilisateur,

            @RequestParam MultipartFile logo,
            @RequestParam MultipartFile documentJuridique
    ) {

        try {
            Boutique boutique = boutiqueService.creerBoutique(
                    nom, description, type, numeros,
                    logo, documentJuridique, idUtilisateur
            );
            return new ResponseEntity<>(boutique, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("Erreur de traitement des fichiers"));
        }
    }

    // Toutes les boutiques
    @GetMapping
    public ResponseEntity<?> getAllBoutiques() {
        try {
            List<Boutique> boutiques = boutiqueService.getAllBoutiques();
            return ResponseEntity.ok(boutiques);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ErrorResponse(e.getMessage()));
        }
    }

    // Boutiques par utilisateur (chemin explicite)
    @GetMapping("/by-user")
    public ResponseEntity<?> getBoutiquesByUser(@RequestParam String userId) {
        try {
            List<Boutique> boutiques = boutiqueService.getBoutiquesByUserId(userId);
            return ResponseEntity.ok(boutiques);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/{id}/logo")
    public ResponseEntity<byte[]> getLogo(@PathVariable String id) {
        try {
            Boutique boutique = boutiqueService.getBoutiqueById(id);
            byte[] imageData = boutique.getLogo();

            String imageType = getImageMimeType(imageData);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(imageType));

            return new ResponseEntity<>(imageData, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    private String getImageMimeType(byte[] imageData) {
        if (imageData.length >= 8 &&
                imageData[0] == (byte) 0x89 &&
                imageData[1] == (byte) 0x50 &&
                imageData[2] == (byte) 0x4E &&
                imageData[3] == (byte) 0x47) {
            return "image/png";
        } else if (imageData.length >= 3 &&
                imageData[0] == (byte) 0xFF &&
                imageData[1] == (byte) 0xD8 &&
                imageData[2] == (byte) 0xFF) {
            return "image/jpeg";
        } else if (imageData.length >= 6 &&
                imageData[0] == (byte) 'G' &&
                imageData[1] == (byte) 'I' &&
                imageData[2] == (byte) 'F') {
            return "image/gif";
        }
        return "application/octet-stream";
    }


    @GetMapping("/{id}/nom")
    public ResponseEntity<?> getNomBoutique(@PathVariable String id) {
        try {
            Boutique boutique = boutiqueService.getBoutiqueById(id);
            if (boutique != null) {
                return ResponseEntity.ok(boutique.getNom());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Boutique non trouvée"));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoutique(@PathVariable String id) {
        if (!boutiqueService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        boutiqueService.deleteBoutique(id); // Cette méthode supprime maintenant les produits associés
        return ResponseEntity.noContent().build();
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateBoutique(
            @PathVariable String id,
            @RequestParam(required = false) String nom,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) List<String> numeros,
            @RequestParam(required = false) MultipartFile logo,
            @RequestParam(required = false) MultipartFile documentJuridique
    ) {
        try {
            Boutique updated = boutiqueService.updateBoutique(
                    id,
                    nom,
                    description,
                    type,
                    numeros,
                    logo,
                    documentJuridique
            );
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur de traitement des fichiers"));
        }
    }
    @GetMapping("/{idBoutique}/chiffreaffairesparmois")
    public ResponseEntity<List<Map<String, Object>>> getChiffreAffairesParMois(@PathVariable String idBoutique) {
        List<Map<String, Object>> resultat = boutiqueService.getChiffreAffairesParMois(idBoutique);
        return ResponseEntity.ok(resultat);
    }
    @GetMapping("/topproduits/{idBoutique}")
    public ResponseEntity<List<TopProduitDTO>> getTopProduitsParBoutique(@PathVariable String idBoutique) {
        List<TopProduitDTO> topProduits = boutiqueService.getTopProduitsDansTransactionsParBoutique(idBoutique);
        return ResponseEntity.ok(topProduits);
    }
    @GetMapping("/{idBoutique}/commandes")
    public List<CommandeBoutiqueDTO> getCommandesParBoutique(@PathVariable String idBoutique) {
        return boutiqueService.getCommandesFormatteesParBoutique(idBoutique);
    }

    // BoutiqueController.java
    @GetMapping("/grouped-by-user")
    public ResponseEntity<List<UserBoutiquesDTO>> getBoutiquesGroupedByUser() {
        List<UserBoutiquesDTO> result = boutiqueService.getBoutiquesGroupedByUser();
        return ResponseEntity.ok(result);
    }
    // Add this to BoutiqueController.java
    @GetMapping("/{id}/document-juridique")
    public ResponseEntity<byte[]> getDocumentJuridique(@PathVariable String id) {
        try {
            Boutique boutique = boutiqueService.getBoutiqueById(id);
            byte[] documentData = boutique.getDocumentJuridique();

            // Get MIME type from document bytes
            String mimeType = getDocumentMimeType(documentData);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(mimeType));

            return new ResponseEntity<>(documentData, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    private String getDocumentMimeType(byte[] documentData) {
        // Simple PDF detection
        if (documentData.length > 4 &&
                documentData[0] == 0x25 && // %
                documentData[1] == 0x50 && // P
                documentData[2] == 0x44 && // D
                documentData[3] == 0x46) { // F
            return "application/pdf";
        }
        // Add more document type checks if needed
        return "application/octet-stream";
    }
    @GetMapping("/count-by-type")
    public ResponseEntity<Map<String, Long>> getBoutiqueCountByType() {

        Map<String, Long> countByType = boutiqueService.getBoutiqueCountByType();
        return ResponseEntity.ok(countByType);
    }
}