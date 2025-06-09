package com.example.Mongo.Repository;

import com.example.Mongo.Entity.Product;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import com.example.Mongo.Dto.ProductStatsDTO;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByCategoryId(String categoryId);
    List<Product> findByTypeIgnoreCase(String type);
    List<Product> findByUserId(String userId);
    List<Product> findByAvailable(boolean available);
    List<Product> findByUserIdIn(List<String> userIds);
    long countByAvailable(boolean available);
    long countByQuantityLessThan(int quantity);

    Optional<Product> findById(String id);
    List<Product> findByBoutiqueId(String boutiqueId);
    long countByUserId(String userId);
    @Query("{'userId': ?0, 'boutiqueId': { $exists: false }}")
    List<Product> findIndependentProductsByUserId(String userId);


//    @Query("{'userId': ?0, $or: [{'boutiqueId': null}, {'boutiqueId': { $exists: false }}]}")
//    List<Product> findUserProductsWithoutBoutique(String userId);

    Long countByBoutiqueId(String boutiqueId);
    @Query("{ 'userId' : ?0, 'boutiqueId' : { $exists: false } }")
    List<Product> findByUserIdAndBoutiqueIdIsNull(String userId);
    @Query(value = "{ 'userId' : ?0, 'boutiqueId' : { $exists: false } }", count = true)
    long countByUserIdAndBoutiqueIdIsNull(String userId);
    void deleteByBoutiqueId(String boutiqueId);
    @Aggregation(pipeline = {
            "{ $group: { _id: '$categoryId', count: { $sum: 1 } } }",
            "{ $project: { _id: 0, categoryId: '$_id', count: 1 } }"
    })
    List<ProductStatsDTO.CategoryDistribution> getCategoryDistribution();

    @Aggregation(pipeline = {
            "{ $group: { _id: '$type', count: { $sum: 1 } } }",
            "{ $project: { _id: 0, type: '$_id', count: 1 } }"
    })
    List<ProductStatsDTO.TypeDistribution> getTypeDistribution();

    // OrderRepository.java (if needed)
    @Aggregation(pipeline = {
            "{ $match: { status: 'completed' } }",
            "{ $group: { _id: { $dateToString: { format: '%Y-%m', date: '$orderDate' } }, totalSales: { $sum: '$totalAmount' } } }",
            "{ $project: { _id: 0, month: '$_id', totalSales: 1 } }",
            "{ $sort: { month: 1 } }"
    })
    List<ProductStatsDTO.MonthlySales> getMonthlySales();
    @Query("{ 'boutiqueId': ?0 }")
    List<Product> findProductsByShopId(String idBoutique);
}


