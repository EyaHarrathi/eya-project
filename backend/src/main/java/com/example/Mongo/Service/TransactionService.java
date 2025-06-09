package com.example.Mongo.Service;

import com.example.Mongo.Dto.RecentTransactionDTO;
import com.example.Mongo.Dto.RevenueStatsDTO;
import com.example.Mongo.Entity.MonthlyRevenue;
import com.example.Mongo.Entity.Product;
import com.example.Mongo.Entity.Transaction;
import com.example.Mongo.Repository.ProductRepository;
import com.example.Mongo.Repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;
    @Autowired
    private ProductRepository productRepository;
    public Transaction creerTransaction(Transaction transaction) {
        if (transaction == null
                || transaction.getIdAcheteur() == null
                || transaction.getProduits() == null
                || transaction.getProduits().isEmpty()) {
            throw new IllegalArgumentException("Transaction invalide.");
        }
        // ici tu pourrais aussi calculer le montant total à partir de la liste produits
        return transactionRepository.save(transaction);
    }
    public RevenueStatsDTO getRevenueStatistics() {
        RevenueStatsDTO stats = new RevenueStatsDTO();

        // Total revenue
        stats.setTotalRevenue(transactionRepository.sumAllAmounts());

        // Monthly revenue (with null/length checks)
        List<MonthlyRevenue> monthlyRevenue = transactionRepository.getMonthlyRevenue()
                .stream()
                .map(mr -> {
                    String monthStr = mr.getMonth();
                    if (monthStr == null || monthStr.length() < 7) {
                        // Log warning or handle invalid data
                        return null; // Skip invalid entries
                    }
                    try {
                        int month = Integer.parseInt(monthStr.substring(5, 7));
                        return new MonthlyRevenue(month, mr.getAmount());
                    } catch (NumberFormatException e) {
                        // Handle invalid numeric format
                        return null;
                    }
                })
                .filter(Objects::nonNull) // Remove null entries
                .collect(Collectors.toList());

        stats.setMonthlyRevenue(monthlyRevenue);

        // Revenue by category
        Map<String, Double> revenueByCategory = transactionRepository.getRevenueByCategory()
                .stream()
                .filter(rbc -> rbc.getCategory() != null)  // Filter out null categories
                .collect(Collectors.toMap(
                        rbc -> rbc.getCategory().trim().isEmpty() ? "uncategorized" : rbc.getCategory(),
                        TransactionRepository.RevenueByCategory::getAmount,
                        (existing, replacement) -> existing + replacement  // Merge duplicates
                ));

        stats.setRevenueByCategory(revenueByCategory);

        return stats;
    }

    public List<RecentTransactionDTO> getRecentTransactions() {
        // Fetch transactions and filter out null dates
        List<Transaction> filteredTransactions = transactionRepository.findTop10ByOrderByDateTransactionDesc()
                .stream()
                .filter(t -> t.getDateTransaction() != null)
                .collect(Collectors.toList());

        // Collect product IDs safely
        List<String> productIds = filteredTransactions.stream()
                .map(t -> {
                    if (t.getProduits() != null && !t.getProduits().isEmpty()) {
                        return t.getProduits().get(0).getIdProduit();
                    }
                    return null;
                })
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        // Debugging: Log collected product IDs
        System.out.println("Product IDs in transactions: " + productIds);

        // Fetch products and map IDs to names
        Map<String, String> productIdToNameMap = productRepository.findAllById(productIds)
                .stream()
                .collect(Collectors.toMap(
                        Product::getId,
                        Product::getName,
                        (existing, replacement) -> existing // Handle duplicates if any
                ));

        // Debugging: Log the product map
        System.out.println("Product ID to Name Map: " + productIdToNameMap);

        // Build DTOs with product names
        return filteredTransactions.stream()
                .map(t -> {
                    String productName = "N/A";
                    if (t.getProduits() != null && !t.getProduits().isEmpty()) {
                        String productId = t.getProduits().get(0).getIdProduit();
                        productName = productIdToNameMap.getOrDefault(productId, "N/A");

                        // Debugging: Log missing product IDs
                        if (!productIdToNameMap.containsKey(productId)) {
                            System.out.println("Product ID not found: " + productId);
                        }
                    }

                    LocalDate transactionDate = t.getDateTransaction().toInstant()
                            .atZone(ZoneId.systemDefault())
                            .toLocalDate();

                    return new RecentTransactionDTO(
                            t.getIdTransaction(),
                            productName,
                            t.getMontant(),
                            transactionDate
                    );
                })
                .collect(Collectors.toList());
    }
}
