package com.example.Mongo.Controller;

import com.example.Mongo.Dto.*;
import com.example.Mongo.Entity.Product;
import com.example.Mongo.Entity.RentalPeriod;
import com.example.Mongo.Entity.User;
import com.example.Mongo.Repository.OrderRepository;
import com.example.Mongo.Repository.ProductRepository;
import com.example.Mongo.Service.FriendService;
import com.example.Mongo.Service.ProductService;
import com.example.Mongo.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;

import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.io.IOException;

import org.springframework.core.io.Resource;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    @Autowired
    private FriendService friendService;
    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;


    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // Classe interne AvailabilityResponse
    public static class AvailabilityResponse {
        private boolean available;

        public AvailabilityResponse(boolean available) {
            this.available = available;
        }

        public boolean isAvailable() {
            return available;
        }

        public void setAvailable(boolean available) {
            this.available = available;
        }
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product savedProduct = productService.saveProduct(product);
        return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
    }

    @GetMapping("/users/{userId}")
    public List<Product> getProductsByUser(@PathVariable String userId) {
        return productService.getAllProductsByUserId(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        Product product = productService.getProductById(id);
        return product != null
                ? new ResponseEntity<>(product, HttpStatus.OK)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> updateProduct(
            @PathVariable String id,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "price", required = false) Double price,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "quantity", required = false) Integer quantity,
            @RequestParam(value = "colors", required = false) String colors,
            @RequestParam(value = "available", required = false) Boolean available,
            @RequestParam(value = "categoryId", required = false) String categoryId,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "imageName", required = false) String imageName) {

        try {
            Product existingProduct = productService.getProductById(id);
            if (existingProduct == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            // Handle image update
            if (image != null && !image.isEmpty()) {
                Path uploadPath = Paths.get("uploads");
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                Files.copy(image.getInputStream(), uploadPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
                existingProduct.setImageName(fileName);
            } else if (imageName != null) {
                existingProduct.setImageName(imageName);
            }

            // Update other fields
            if (name != null) existingProduct.setName(name);
            if (description != null) existingProduct.setDescription(description);
            if (price != null) existingProduct.setPrice(price);
            if (type != null) existingProduct.setType(type);
            if (quantity != null) existingProduct.setQuantity(quantity);
            if (colors != null) existingProduct.setColors(Arrays.asList(colors.split(",")));
            if (available != null) existingProduct.setAvailable(available);
            if (categoryId != null) existingProduct.setCategoryId(categoryId);

            Product updatedProduct = productService.updateProduct(id, existingProduct);
            return new ResponseEntity<>(updatedProduct, HttpStatus.OK);

        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        if (productService.getProductById(id) == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        productService.deleteProduct(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // Filter Endpoints
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Product>> getByCategory(@PathVariable String categoryId) {
        return new ResponseEntity<>(
                productService.findByCategoryId(categoryId),
                HttpStatus.OK
        );
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Product>> getByType(@PathVariable String type) {
        return new ResponseEntity<>(productService.findByType(type), HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Product>> getByUser(@PathVariable String userId) {
        return new ResponseEntity<>(
                productService.findByUserId(userId),
                HttpStatus.OK
        );
    }

    @GetMapping("/available/{available}")
    public ResponseEntity<List<Product>> getByAvailability(@PathVariable boolean available) {
        return new ResponseEntity<>(
                productService.findByAvailable(available),
                HttpStatus.OK
        );
    }


// Add these imports to the ProductController

    @PostMapping(value = "/createWithImage", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> createProductWithImage(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") double price,
            @RequestParam("type") String type,
            @RequestParam("quantity") int quantity,
            @RequestParam("colors") String colors,
            @RequestParam("available") boolean available,
            @RequestParam("categoryId") String categoryId,
            @RequestParam("userId") String userId,
            @RequestParam("image") MultipartFile image) {

        try {
            // Save the image to the uploads directory
            Path uploadPath = Paths.get("uploads");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
            Files.copy(image.getInputStream(), uploadPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);

            // Convert comma-separated colors to a list
            List<String> colorList = Arrays.asList(colors.split(","));

            // Create and populate the Product object
            Product product = new Product();
            product.setName(name);
            product.setDescription(description);
            product.setPrice(price);
            product.setType(type);
            product.setQuantity(quantity);
            product.setColors(colorList);
            product.setAvailable(available);
            product.setCategoryId(categoryId);
            product.setUserId(userId);
            product.setImageName(fileName);

            Product savedProduct = productService.saveProduct(product);
            return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/images/{filename}")

    public ResponseEntity<Resource> getProductImage(@PathVariable String filename) {
        Path imagePath = Paths.get("uploads").resolve(filename); // Adjust if you save elsewhere
        Resource image = new FileSystemResource(imagePath);
        if (!image.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG) // or detect based on file
                .body(image);
    }

    @PutMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> updateProductImage(
            @PathVariable String id,
            @RequestParam("image") MultipartFile image) {

        try {
            Product product = productService.getProductById(id);
            if (product == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            // Save the new image
            Path uploadPath = Paths.get("uploads");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
            Files.copy(image.getInputStream(), uploadPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);

            // Update the product's image name and save
            product.setImageName(fileName);
            Product updatedProduct = productService.saveProduct(product);

            return new ResponseEntity<>(updatedProduct, HttpStatus.OK);

        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Autowired
    private UserService userService;
    @PostMapping("/by-users")
    public ResponseEntity<Map<String, Object>> getProductsByUserIds(@RequestBody UserIdsRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<String> userIds = request.getUserIds();

            if (userIds == null || userIds.isEmpty()) {
                response.put("success", false);
                response.put("message", "Liste d'IDs utilisateur vide");
                return ResponseEntity.badRequest().body(response);
            }

            Set<String> friendIds = new HashSet<>();

            for (String userId : userIds) {
                // Get direct friends
                List<UserDTO> friendsOfUser = friendService.getFriends(userId);
                friendsOfUser.forEach(friend -> friendIds.add(friend.getUserId()));

                // Check if user is premium and get third-degree friends
                User user = userService.getUserById(userId);
                if (user != null && user.getRole() == User.Role.PREMIUM_USER) {
                    List<String> thirdDegreeIds = friendService.getThirdDegreeFriendsIds(userId);
                    thirdDegreeIds.forEach(friendIds::add);
                }
            }

            if (friendIds.isEmpty()) {
                response.put("success", true);
                response.put("count", 0);
                response.put("data", Collections.emptyList());
                return ResponseEntity.ok(response);
            }

            // Get products from all collected friend IDs
            List<Product> products = productService.findByUserIds(new ArrayList<>(friendIds));

            response.put("success", true);
            response.put("count", products.size());
            response.put("data", products);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur interne: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    @PostMapping("/users-by-products")
    public ResponseEntity<List<String>> getUserIdsByProductIds(@RequestBody List<String> productIds) {
        List<String> userIds = productService.findUserIdsByProductIds(productIds);
        return userIds.isEmpty()
                ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
                : new ResponseEntity<>(userIds, HttpStatus.OK);
    }

    @GetMapping("/name/{id}")
    public ResponseEntity<String> getProductNameById(@PathVariable String id) {
        Product product = productService.getProductById(id);
        if (product != null) {
            return new ResponseEntity<>(product.getName(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/{id}/imageName")
    public ResponseEntity<String> getProductImageName(@PathVariable String id) {
        Product product = productService.getProductById(id);
        if (product == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        String imageName = product.getImageName();
        return new ResponseEntity<>(imageName, HttpStatus.OK);
    }

    @GetMapping("/{id}/user")
    public ResponseEntity<String> getUserIdByProductId(@PathVariable String id) {
        Product product = productService.getProductById(id);
        if (product != null && product.getUserId() != null) {
            return new ResponseEntity<>(product.getUserId(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/check-availability/{productId}")
    public ResponseEntity<?> checkRentalAvailability(
            @PathVariable String productId,
            @RequestParam("startDate") String startDateStr,
            @RequestParam("endDate") String endDateStr) {

        // Récupération du produit
        Product product = productService.getProductById(productId);
        if (product == null) {
            return new ResponseEntity<>("Produit introuvable", HttpStatus.NOT_FOUND);
        }

        // Vérifie que c’est un produit de location
        if (!"LOCATION".equalsIgnoreCase(product.getType())) {
            return new ResponseEntity<>("Ce produit n'est pas un produit de location", HttpStatus.BAD_REQUEST);
        }

        try {
            LocalDate startDate = LocalDate.parse(startDateStr);
            LocalDate endDate = LocalDate.parse(endDateStr);

            // Vérifie que la date de début n’est pas après la date de fin
            if (startDate.isAfter(endDate)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("La date de début ne peut pas être après la date de fin");
            }

            for (RentalPeriod period : product.getRentalPeriods()) {
                if ("indisponible".equalsIgnoreCase(period.getRentalStatus())) {
                    LocalDate pStart = period.getRentalStartDate();
                    LocalDate pEnd = period.getRentalEndDate();

                    // Si les périodes se chevauchent → non disponible
                    if (!(endDate.isBefore(pStart) || startDate.isAfter(pEnd))) {
                        return new ResponseEntity<>(new AvailabilityResponse(false), HttpStatus.OK);
                    }
                }
            }

            // Si aucune période ne bloque → disponible
            return new ResponseEntity<>(new AvailabilityResponse(true), HttpStatus.OK);

        } catch (DateTimeParseException e) {
            return new ResponseEntity<>("Format de date invalide (attendu : yyyy-MM-dd)", HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}/rental")
    public ResponseEntity<?> updateRentalStatusAndDates(
            @PathVariable String id,
            @RequestParam("startDate") String startDateStr,
            @RequestParam("endDate") String endDateStr) {

        // Récupération du produit par son ID
        Product product = productService.getProductById(id);
        if (product == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Produit introuvable");
        }

        // Validation des dates de location
        if (startDateStr == null || endDateStr == null || startDateStr.isBlank() || endDateStr.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Les dates ne doivent pas être nulles ou vides");
        }

        try {
            LocalDate startDate = LocalDate.parse(startDateStr);
            LocalDate endDate = LocalDate.parse(endDateStr);

            // Vérifier si la date de début est après la date de fin
            if (startDate.isAfter(endDate)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("La date de début ne peut pas être après la date de fin");
            }

            // Ajouter la nouvelle période de location dans la liste des périodes
            RentalPeriod newRentalPeriod = new RentalPeriod("indisponible", startDate, endDate);
            product.getRentalPeriods().add(newRentalPeriod);

            // Mise à jour du produit avec la nouvelle période
            productService.saveProduct(product);
            return ResponseEntity.ok(product);

        } catch (DateTimeParseException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Format de date invalide (attendu : yyyy-MM-dd)");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de la mise à jour");
        }
    }

    @GetMapping("/{id}/type")
    public ResponseEntity<Map<String, String>> getProductTypeById(@PathVariable String id) {
        Product product = productService.getProductById(id);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, String> response = new HashMap<>();
        response.put("type", product.getType());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/stock")
    public ResponseEntity<Product> updateStock(
            @PathVariable String id,
            @RequestBody StockUpdateRequest request
    ) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produit non trouvé"));

        int currentQuantity = product.getQuantity();

        Product updatedProduct = productService.updateQuantity(
                id,
                request.getOperation(),
                request.getValue(),
                currentQuantity
        );

        return ResponseEntity.ok(updatedProduct);
    }

    @GetMapping("/{id}/price")
    public ResponseEntity<Double> getProductPrice(@PathVariable String id) {
        Product product = productService.getProductById(id);
        if (product != null) {
            return new ResponseEntity<>(product.getPrice(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/{productId}/check-stock")
    public ResponseEntity<Boolean> checkStock(
            @PathVariable String productId,
            @RequestParam("quantityToCheck") Integer quantity // Ajout du nom explicite
    ) {
        boolean isAvailable = productService.isStockAvailable(productId, quantity);
        return ResponseEntity.ok(isAvailable);
    }
    @GetMapping("/{id}/category")
    public ResponseEntity<Map<String, String>> getCategoryByProductId(@PathVariable String id) {
        Product product = productService.getProductById(id);
        if (product == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Map<String, String> response = new HashMap<>();
        response.put("categoryId", product.getCategoryId());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }


    @GetMapping("/user/{userId}/independent")
    public ResponseEntity<List<Product>> getIndependentProducts(@PathVariable String userId) {
        return ResponseEntity.ok(productService.getIndependentProducts(userId));
    }

    @PostMapping("/migrate-to-boutique")
    public ResponseEntity<?> migrateProducts(
            @RequestParam String userId,
            @RequestParam String boutiqueId
    ) {
        try {
            int migratedCount = productService.migrateProductsToBoutique(userId, boutiqueId);
            return ResponseEntity.ok().body(
                    Map.of(
                            "success", true,
                            "message", "Migration completed successfully",
                            "migratedProducts", migratedCount
                    )
            );
        }  catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", "Migration failed: " + e.getMessage()));
        }
    }

    @GetMapping("/boutique/{boutiqueId}")
    public ResponseEntity<?> getProductsByBoutique(@PathVariable String boutiqueId) {
        try {
            List<Product> products = productService.getProductsByBoutiqueId(boutiqueId);
            if (products.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
            }
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve products: " + e.getMessage()));
        }
    }
    @PostMapping(value = "/createWithShop", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> createProductWithShop(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") double price,
            @RequestParam("type") String type,
            @RequestParam("quantity") int quantity,
            @RequestParam("colors") String colors,
            @RequestParam("available") boolean available,
            @RequestParam("categoryId") String categoryId,
            @RequestParam("userId") String userId,
            @RequestParam("boutiqueId") String boutiqueId,
            @RequestParam("image") MultipartFile image) {

        try {
            // Sauvegarde de l'image
            Path uploadPath = Paths.get("uploads");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
            Files.copy(image.getInputStream(), uploadPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);

            // Création du produit
            Product product = new Product();
            product.setName(name);
            product.setDescription(description);
            product.setPrice(price);
            product.setType(type);
            product.setQuantity(quantity);
            product.setColors(Arrays.asList(colors.split(",")));
            product.setAvailable(available);
            product.setCategoryId(categoryId);
            product.setUserId(userId);
            product.setBoutiqueId(boutiqueId); // Assurez-vous que le champ `shopId` existe dans l'entité Product
            product.setImageName(fileName);

            Product savedProduct = productService.saveProduct(product);
            return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
    // Dans ProductController.java
    @GetMapping("/user/{userId}/without-boutique")
    public ResponseEntity<List<Product>> getProductsWithoutBoutique(@PathVariable String userId) {
        try {
            List<Product> products = productService.getProductsWithoutBoutique(userId);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList());
        }
    }
    @GetMapping("/user/{userId}/without-boutique/count")
    public ResponseEntity<Map<String, Object>> countProductsWithoutBoutique(@PathVariable String userId) {
        try {
            long count = productService.countProductsWithoutBoutique(userId);
            return ResponseEntity.ok(Collections.singletonMap("count", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Erreur lors du comptage : " + e.getMessage()));
        }
    }
    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Map<String, Object>> countProductsByUser(@PathVariable String userId) {
        try {
            long count = productService.countProductsByUser(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("productCount", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Erreur lors du comptage : " + e.getMessage()));
        }
    }
    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/stats")
    public ResponseEntity<ProductStatsDTO> getProductStats() {
        ProductStatsDTO stats = productService.getProductStatistics();
        return ResponseEntity.ok(stats);
    }

//

    @DeleteMapping("/{productId}/rental/cancel")
    public ResponseEntity<?> cancelRentalPeriod(
            @PathVariable String productId,
            @RequestBody Map<String, String> requestDates) {

        try {
            LocalDate startDate = LocalDate.parse(requestDates.get("startDate"));
            LocalDate endDate = LocalDate.parse(requestDates.get("endDate"));

            boolean removed = productService.cancelRentalPeriod(productId, startDate, endDate);

            if (removed) {
                return ResponseEntity.ok("Période supprimée avec succès");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Aucune période correspondante trouvée");
            }

        } catch (DateTimeParseException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Format de date invalide (attendu : yyyy-MM-dd)");
        }
    }


}