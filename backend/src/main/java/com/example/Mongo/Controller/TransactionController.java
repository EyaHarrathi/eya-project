package com.example.Mongo.Controller;

import com.example.Mongo.Dto.RecentTransactionDTO;
import com.example.Mongo.Dto.RevenueStatsDTO;
import com.example.Mongo.Entity.Transaction;
import com.example.Mongo.Service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping
    public ResponseEntity<Transaction> creerTransaction(@RequestBody Transaction transaction) {
        Transaction saved = transactionService.creerTransaction(transaction);
        return ResponseEntity.ok(saved);
    }
    @GetMapping("/stats")
    public ResponseEntity<RevenueStatsDTO> getRevenueStats() {
        RevenueStatsDTO stats = transactionService.getRevenueStatistics();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<RecentTransactionDTO>> getRecentTransactions() {
        List<RecentTransactionDTO> transactions = transactionService.getRecentTransactions();
        return ResponseEntity.ok(transactions);
    }

}
