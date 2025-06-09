package com.example.Mongo.Service;

import com.example.Mongo.Dto.ProductStatsDTO;
import com.example.Mongo.Entity.Boutique;
import com.example.Mongo.Entity.Product;
import com.example.Mongo.Entity.RentalPeriod;
import com.example.Mongo.Repository.BoutiqueRepository;
import com.example.Mongo.Repository.ProductRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final BoutiqueRepository boutiqueRepo;
    private final BoutiqueService boutiqueService;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    public ProductService(ProductRepository productRepository,
                          BoutiqueRepository boutiqueRepo,
                          BoutiqueService boutiqueService) {
        this.productRepository = productRepository;
        this.boutiqueRepo = boutiqueRepo;
        this.boutiqueService = boutiqueService;
    }

    public Product saveProduct(Product product) {
        if ("LOCATION".equalsIgnoreCase(product.getType())) {
            if (product.getRentalPeriods() == null || product.getRentalPeriods().isEmpty()) {
                RentalPeriod defaultPeriod = new RentalPeriod();
                defaultPeriod.setRentalStatus("disponible");
                defaultPeriod.setRentalStartDate(LocalDate.now());
                defaultPeriod.setRentalEndDate(LocalDate.now().plusDays(7));
                product.setRentalPeriods(List.of(defaultPeriod));
            }
        }
        return productRepository.save(product);
    }


    public List<Product> getAllProductsByUserId(String userId) {
        return productRepository.findByUserId(userId);
    }

    public Product getProductById(String id) {
        return productRepository.findById(id).orElse(null);
    }

    public Product updateProduct(String id, Product product) {
        Product existingProduct = getProductById(id);
        if (existingProduct == null) return null;

        String previousType = existingProduct.getType();  // Sauvegarder l'ancien type

        existingProduct.setName(product.getName());
        existingProduct.setDescription(product.getDescription());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setType(product.getType());
        existingProduct.setQuantity(product.getQuantity());
        existingProduct.setColors(product.getColors());
        existingProduct.setAvailable(product.isAvailable());
        existingProduct.setCategoryId(product.getCategoryId());
        existingProduct.setImageName(product.getImageName());
        existingProduct.setUserId(product.getUserId());

        // ✅ Si le nouveau type est "LOCATION" et qu’il n’a pas de période, on en crée une
        if ("LOCATION".equalsIgnoreCase(product.getType())) {
            if (existingProduct.getRentalPeriods() == null || existingProduct.getRentalPeriods().isEmpty()) {
                RentalPeriod defaultPeriod = new RentalPeriod();
                defaultPeriod.setRentalStatus("disponible");
                defaultPeriod.setRentalStartDate(LocalDate.now());
                defaultPeriod.setRentalEndDate(LocalDate.now().plusDays(7));
                existingProduct.setRentalPeriods(List.of(defaultPeriod));
            }
        }

        // ❌ Si le produit était en LOCATION et devient VENTE, on supprime les périodes
        else if ("LOCATION".equalsIgnoreCase(previousType) && !"LOCATION".equalsIgnoreCase(product.getType())) {
            existingProduct.setRentalPeriods(null); // Ou bien `new ArrayList<>()` si tu préfères une liste vide
        }

        return productRepository.save(existingProduct);
    }

    public List<Product> findByUserIds(List<String> userIds) {
        return productRepository.findByUserIdIn(userIds);
    }

    public void deleteProduct(String id) {
        productRepository.deleteById(id);
    }

    public List<Product> findByCategoryId(String categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    public List<Product> findByType(String type) {
        return productRepository.findByTypeIgnoreCase(type);
    }

    public List<Product> findByUserId(String userId) {
        return productRepository.findByUserId(userId);
    }

    public List<Product> findByAvailable(boolean available) {
        return productRepository.findByAvailable(available);
    }

    public Map<String, Object> getProductDetails(String productId) {
        return productRepository.findById(productId)
                .map(product -> {
                    Map<String, Object> details = new HashMap<>();
                    details.put("id", product.getId());
                    details.put("name", product.getName());
                    details.put("price", product.getPrice());
                    details.put("imageUrl", "/api/products/images/" + product.getImageName());
                    details.put("description", product.getDescription());
                    details.put("categoryId", product.getCategoryId());
                    return details;
                })
                .orElseGet(HashMap::new);
    }

    public List<String> findUserIdsByProductIds(List<String> productIds) {
        List<Product> products = productRepository.findAllById(productIds);
        return products.stream()
                .map(Product::getUserId)
                .collect(Collectors.toList());
    }

    public boolean isAvailableForRental(Product product, LocalDate start, LocalDate end) {
        for (RentalPeriod rentalPeriod : product.getRentalPeriods()) {
            if ("réservé".equals(rentalPeriod.getRentalStatus())) {
                LocalDate existingStart = rentalPeriod.getRentalStartDate();
                LocalDate existingEnd = rentalPeriod.getRentalEndDate();
                if (!(end.isBefore(existingStart) || start.isAfter(existingEnd))) {
                    return false;
                }
            }
        }
        return true;
    }

    public Product updateQuantity(String id, String operation, int value, int currentQuantity) {
        if (value <= 0) {
            throw new IllegalArgumentException("La valeur doit être strictement positive.");
        }

        Query query = new Query(Criteria.where("_id").is(id));
        Update update = new Update();

        switch (operation.toLowerCase()) {
            case "decrement" -> update.inc("quantity", -value);
            case "increment" -> update.inc("quantity", value);
        }

        Product updated = mongoTemplate.findAndModify(
                query,
                update,
                new FindAndModifyOptions().returnNew(true),
                Product.class
        );

        if (updated == null) {
            throw new OptimisticLockingFailureException("Conflit de mise à jour détecté ou produit introuvable.");
        }

        return updated;
    }

    public boolean isStockAvailable(String productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return product.getQuantity() >= quantity;
    }

    public Product createProduct(Product product, MultipartFile image) {
        if (product.getBoutiqueId() != null) {
            boutiqueService.validateBoutiqueOwnership(
                    product.getBoutiqueId(),
                    product.getUserId()
            );
        }

        // (À compléter : gestion de l'image si nécessaire)
        return productRepository.save(product);
    }

    public List<Product> getProductsByBoutique(String boutiqueId) {
        return productRepository.findByBoutiqueId(boutiqueId);
    }

    public List<Product> getIndependentProducts(String userId) {
        return productRepository.findIndependentProductsByUserId(userId);
    }
    public int migrateProductsToBoutique(String userId, String boutiqueId) {
        List<Product> products = productRepository.findByUserIdAndBoutiqueIdIsNull(userId);



        products.forEach(product -> product.setBoutiqueId(boutiqueId));
        productRepository.saveAll(products);

        return products.size();
    }

    public List<Product> getProductsByBoutiqueId(String boutiqueId) {
        List<Product> products = productRepository.findByBoutiqueId(boutiqueId);


        return products;
    }
    public List<Product> getProductsWithoutBoutique(String userId) {
        return productRepository.findByUserIdAndBoutiqueIdIsNull(userId);
    }
    public long countProductsWithoutBoutique(String userId) {
        return productRepository.countByUserIdAndBoutiqueIdIsNull(userId);
    }
    public long countProductsByUser(String userId) {
        return productRepository.countByUserId(userId);
    }
    public void deleteProductsByBoutiqueId(String boutiqueId) {
        productRepository.deleteByBoutiqueId(boutiqueId);
    }
    public ProductStatsDTO getProductStatistics() {
        ProductStatsDTO stats = new ProductStatsDTO();

        // Total products
        stats.setTotalProducts(productRepository.count());

        // Category distribution
        List<ProductStatsDTO.CategoryDistribution> categoryDist = productRepository.getCategoryDistribution();
        stats.setCategoryDistribution(categoryDist);

        // Type distribution
        List<ProductStatsDTO.TypeDistribution> typeDist = productRepository.getTypeDistribution();
        stats.setTypeDistribution(typeDist);

        // Active/inactive products
        stats.setActiveProducts(productRepository.countByAvailable(true));
        stats.setInactiveProducts(productRepository.countByAvailable(false));

        // Low stock products
        stats.setLowStockProducts(productRepository.countByQuantityLessThan(10));

        return stats;
    }
    public String getNomProduit(String idProduit) {
        if (idProduit == null || !ObjectId.isValid(idProduit)) {
            return "Produit Inconnu";
        }
        return productRepository.findById(idProduit)
                .map(Product::getName)
                .orElse("Produit Inconnu");
    }
    public boolean cancelRentalPeriod(String productId, LocalDate startDate, LocalDate endDate) {
        Product product = getProductById(productId);

        if (product == null || product.getRentalPeriods() == null) return false;

        List<RentalPeriod> periods = product.getRentalPeriods();

        // Recherche d'une période correspondant exactement
        RentalPeriod toRemove = null;
        for (RentalPeriod period : periods) {
            if (startDate.equals(period.getRentalStartDate()) &&
                    endDate.equals(period.getRentalEndDate())) {
                toRemove = period;
                break;
            }
        }

        if (toRemove != null) {
            periods.remove(toRemove);
            product.setRentalPeriods(periods);
            productRepository.save(product);
            return true;
        }

        return false;
    }

}
