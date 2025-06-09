package com.example.Mongo.Controller;
import com.example.Mongo.Entity.Cart;

import com.example.Mongo.Service.CartService;
import com.example.Mongo.Service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final ProductService productService;

    @Autowired
    public CartController(CartService cartService, ProductService productService) {
        this.cartService = cartService;
        this.productService = productService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getCart(@PathVariable String userId) {
        try {
            Cart cart = cartService.getCartByUserId(userId);
            if (cart == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        Map.of("success", false, "message", "Panier non trouvé")
                );
            }

            List<Map<String, Object>> enrichedItems = cart.getItems().stream()
                    .map(item -> {
                        Map<String, Object> itemMap = new HashMap<>();
                        itemMap.put("quantity", item.getQuantity());

                        Map<String, Object> productDetails = productService.getProductDetails(item.getProductId());
                        if (!productDetails.isEmpty()) {
                            itemMap.put("product", productDetails);
                        } else {
                            itemMap.put("product", Map.of("error", "Produit non trouvé"));
                        }

                        return itemMap;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("userId", cart.getUserId());
            response.put("items", enrichedItems);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("success", false, "message", "Erreur serveur: " + e.getMessage())
            );
        }
    }


    @PostMapping("/{userId}/add/{productId}")
    public ResponseEntity<?> addProductToCart(@PathVariable String userId, @PathVariable String productId) {
        try {
            Cart updatedCart = cartService.addProductToCart(userId, productId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Produit ajouté au panier avec succès");
            response.put("cart", updatedCart);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("success", false, "message", "Erreur lors de l'ajout au panier: " + e.getMessage())
            );
        }
    }

// Le reste du contrôleur reste inchangé...

    @DeleteMapping("/{userId}/remove/{productId}")
    public ResponseEntity<Cart> removeProductFromCart(@PathVariable String userId, @PathVariable String productId) {
        Cart updatedCart = cartService.removeProductFromCart(userId, productId);
        return ResponseEntity.ok(updatedCart);
    }

    @PostMapping("/{userId}/create")
    public ResponseEntity<Cart> createCart(@PathVariable String userId) {
        Cart newCart = cartService.createCart(userId);
        return ResponseEntity.ok(newCart);
    }

    // API pour incrémenter la quantité d'un produit dans le panier
    @PostMapping("/{userId}/increment/{productId}")
    public ResponseEntity<Cart> incrementProductQuantity(@PathVariable String userId, @PathVariable String productId) {
        Cart updatedCart = cartService.incrementProductQuantity(userId, productId);
        return updatedCart != null ? ResponseEntity.ok(updatedCart) : ResponseEntity.notFound().build();
    }

    // API pour décrémenter la quantité d'un produit dans le panier
    @PostMapping("/{userId}/decrement/{productId}")
    public ResponseEntity<Cart> decrementProductQuantity(@PathVariable String userId, @PathVariable String productId) {
        Cart updatedCart = cartService.decrementProductQuantity(userId, productId);
        return updatedCart != null ? ResponseEntity.ok(updatedCart) : ResponseEntity.notFound().build();
    }
    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<?> clearCart(@PathVariable String userId) {
        try {
            Cart clearedCart = cartService.clearCart(userId);
            return ResponseEntity.ok(
                    Map.of("success", true, "message", "Panier vidé avec succès", "cart", clearedCart)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("success", false, "message", "Erreur lors du vidage du panier: " + e.getMessage())
            );
        }
    }
}

