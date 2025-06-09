package com.example.Mongo.Controller;



import com.example.Mongo.Dto.PaymentRequest;
import com.example.Mongo.Entity.User;
import com.example.Mongo.Service.ProductService;
import com.example.Mongo.Service.UserService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {
    @Autowired
    private UserService userService;
    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody PaymentRequest paymentRequest) {
        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(paymentRequest.getAmount())
                    .setCurrency(paymentRequest.getCurrency())
                    // Choisir UNE seule méthode ci-dessous
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);
            return ResponseEntity.ok().body(Map.of(
                    "clientSecret", intent.getClientSecret(),
                    "paymentIntentId", intent.getId()
            ));
        } catch (StripeException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    @PostMapping("/confirm/{userId}")
    public ResponseEntity<?> confirmPayment(
            @PathVariable String userId,
            @RequestBody Map<String, String> paymentData) {  // Add planType in request body

        try {
            // Extract plan type from request body
            String planType = paymentData.get("planType");

            User upgradedUser = userService.upgradeToPremium(userId, planType); // Pass both parameters
            return ResponseEntity.ok(upgradedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
