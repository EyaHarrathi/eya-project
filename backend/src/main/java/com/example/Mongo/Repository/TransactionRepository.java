package com.example.Mongo.Repository;

import com.example.Mongo.Entity.Transaction;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface TransactionRepository extends MongoRepository<Transaction, String> {
    // Exemples de requêtes personnalisées
    List<Transaction> findByIdAcheteur(String idAcheteur);
    List<Transaction> findByIdCommande(String idCommande);

    List<Transaction> findTop10ByOrderByDateTransactionDesc();


    List<Transaction> findByIdCommandeIn(List<String> idCommandes);


        interface MonthlyRevenueProjection {
            String getMonth();
            Double getAmount();
        }

        interface RevenueByCategory {
            String getCategory();
            Double getAmount();
        }
    @Aggregation(pipeline = {
            "{ $group: { _id: null, total: { $sum: '$montant' } } }",
            "{ $project: { _id: 0, total: 1 } }"
    })
    List<TotalAmountProjection> sumAllAmountsProjection();


    @Aggregation(pipeline = {
            "{ $group: { _id: { $dateToString: { format: '%Y-%m', date: '$dateTransaction' } }, total: { $sum: '$montant' } } }",
            "{ $project: { month: '$_id', amount: '$total', _id: 0 } }",
            "{ $sort: { month: 1 } }"
    })
    List<MonthlyRevenueProjection> getMonthlyRevenue();
    // Correct revenue by category aggregation
    @Aggregation(pipeline = {
            "{ $unwind: '$produits' }", // Unwind the produits array
            "{ $group: { _id: '$produits.category', total: { $sum: '$montant' } } }",
            "{ $project: { category: '$_id', amount: '$total', _id: 0 } }"
    })
    List<RevenueByCategory> getRevenueByCategory();

    default double sumAllAmounts() {
        List<TotalAmountProjection> result = sumAllAmountsProjection();
        return result.isEmpty() ? 0.0 : result.get(0).getTotal();
    }

    interface TotalAmountProjection {
        Double getTotal();
    }

//    // Récupère les transactions contenant au moins un produit avec les IDs spécifiés
//      List<Transaction> findByProduits_IdProduitIn(Set<String> produitIds);
    @Query("{ 'produits.idProduit' : { $in: ?0 } }")
    List<Transaction> findByProduitsIdProduitIn(List<String> productIds);
}



