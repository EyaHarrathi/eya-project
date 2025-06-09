package com.example.Mongo.Service;

import com.example.Mongo.Entity.Cart;
import com.example.Mongo.Entity.CartItem;
import com.example.Mongo.Entity.Product;
import com.example.Mongo.Repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final ProductService productService;

    @Autowired
    public CartService(CartRepository cartRepository, ProductService productService) {
        this.cartRepository = cartRepository;
        this.productService = productService;
    }

    public Cart getCartByUserId(String userId) {
        return cartRepository.findByUserId(userId).orElse(null);
    }

    public Cart addProductToCart(String userId, String productId) {
        Product product = productService.getProductById(productId);
        if (product == null || !product.isAvailable()) {
            throw new RuntimeException("Ce produit n'est plus disponible");
        }
        Cart cart = getCartByUserId(userId);
        if (cart == null) {
            cart = new Cart(userId, new ArrayList<>());
        }

        // Ajout ou mise à jour du produit dans le panier
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(existingItem.get().getQuantity() + 1);
        } else {
            cart.getItems().add(new CartItem(productId, 1));
        }

        return cartRepository.save(cart);
    }

    public Cart removeProductFromCart(String userId, String productId) {
        Cart cart = getCartByUserId(userId);
        if (cart != null) {
            cart.setItems(cart.getItems().stream()
                    .filter(item -> !item.getProductId().equals(productId))
                    .collect(Collectors.toList()));
            cartRepository.save(cart);
        }
        return cart;
    }

//    public void clearCart(String userId) {
//        Cart cart = getCartByUserId(userId);
//        if (cart != null) {
//            cartRepository.delete(cart);
//        }
//    }

    // Nouvelle méthode pour créer un panier pour un utilisateur
    public Cart createCart(String userId) {
        Cart newCart = new Cart(userId, new ArrayList<>());  // Un panier vide (sans produits)
        return cartRepository.save(newCart);  // Sauvegarde le panier dans la base de données MongoDB
    }

    // Méthode pour incrémenter la quantité d'un produit
    public Cart incrementProductQuantity(String userId, String productId) {
        Cart cart = getCartByUserId(userId);
        if (cart != null) {
            Optional<CartItem> existingItem = cart.getItems().stream()
                    .filter(item -> item.getProductId().equals(productId))
                    .findFirst();

            if (existingItem.isPresent()) {
                existingItem.get().setQuantity(existingItem.get().getQuantity() + 1);
                cartRepository.save(cart);
            }
        }
        return cart;
    }

    // Méthode pour décrémenter la quantité d'un produit
    public Cart decrementProductQuantity(String userId, String productId) {
        Cart cart = getCartByUserId(userId);
        if (cart != null) {
            Optional<CartItem> existingItem = cart.getItems().stream()
                    .filter(item -> item.getProductId().equals(productId))
                    .findFirst();

            if (existingItem.isPresent() && existingItem.get().getQuantity() > 1) {
                existingItem.get().setQuantity(existingItem.get().getQuantity() - 1);
                cartRepository.save(cart);
            }
        }
        return cart;
    }

    // Garder cette version améliorée
    public Cart clearCart(String userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Panier non trouvé"));
        cart.getItems().clear();
        return cartRepository.save(cart);
    }
}

