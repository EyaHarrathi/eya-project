package com.example.Mongo.Repository;

import com.example.Mongo.Dto.ProductStatsDTO;
import com.example.Mongo.Entity.Commande;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface OrderRepository extends MongoRepository<Commande, String> {

    @Aggregation(pipeline = {
            "{ $match: { status: 'completed' } }",
            "{ $group: { _id: { $dateToString: { format: '%Y-%m', date: '$orderDate' } }, totalSales: { $sum: '$totalAmount' } } }",
            "{ $project: { _id: 0, month: '$_id', totalSales: 1 } }",
            "{ $sort: { month: 1 } }"
    })
    List<ProductStatsDTO.MonthlySales> getMonthlySales();

    int countByIdUtilisateur(String idUtilisateur);

    // Custom aggregation for total amount calculation
    @Aggregation(pipeline = {
            "{ $match: { idUtilisateur: ?0 } }",
            "{ $unwind: '$produits' }",
            "{ $group: { _id: null, total: { $sum: { $multiply: ['$produits.quantity', '$produits.prix'] } } } }",
            "{ $project: { _id: 0, total: 1 } }"
    })
    Double calculateTotalForUser(String idUtilisateur);
}

