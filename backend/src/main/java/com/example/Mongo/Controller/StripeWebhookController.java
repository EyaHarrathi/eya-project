package com.example.Mongo.Controller;

import com.example.Mongo.Service.CommandeService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StripeWebhookController {

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Autowired
    private CommandeService commandeService;

    @PostMapping("/api/payment/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

            if ("payment_intent.succeeded".equals(event.getType())) {
                PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
                        .getObject()
                        .orElseThrow(() -> new IllegalStateException("Deserialization failed"));

                // Ajouter la logique de transaction
                commandeService.handleSuccessfulPayment(
                        paymentIntent.getId(),
                        paymentIntent.getAmount(),
                        paymentIntent.getMetadata() // Récupérer les métadonnées
                );
            }

            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            // Loguer l'erreur complète

            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}