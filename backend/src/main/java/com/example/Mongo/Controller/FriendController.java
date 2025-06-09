package com.example.Mongo.Controller;


import com.example.Mongo.Dto.UserDTO;
import com.example.Mongo.Entity.User;
import com.example.Mongo.Entity.UserNode;
import com.example.Mongo.Repository.UserNodeRepository;
import com.example.Mongo.Service.FriendService;


import java.util.List;
import java.util.Map;


import com.example.Mongo.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    @Autowired
    private FriendService friendService;
    /**
     * Récupérer les invitations reçues par un utilisateur.
     *
     * @param userId L'ID de l'utilisateur.
     * @return La liste des invitations reçues.
     */
    @GetMapping("/invitations/{userId}")
    public List<User> getInvitations(@PathVariable String userId) {
        return friendService.getInvitations(userId); // Retourner directement la liste
    }

    /**
     * Endpoint pour envoyer une invitation d'amitié.
     *
     * @param senderId   L'ID de l'utilisateur qui envoie l'invitation.
     * @param receiverId L'ID de l'utilisateur qui reçoit l'invitation.
     * @return Un message de confirmation ou d'erreur.
     */
    @PostMapping("/invitations/send/{senderId}/{receiverId}")
    public ResponseEntity<String> sendInvitation(
            @PathVariable String senderId,
            @PathVariable String receiverId) {
        String result = friendService.sendInvitation(senderId, receiverId);
        return ResponseEntity.ok(result);
    }

    /**
     * Endpoint pour accepter une invitation d'amitié.
     *
     * @param senderId   L'ID de l'utilisateur qui a envoyé l'invitation.
     * @param receiverId L'ID de l'utilisateur qui accepte l'invitation.
     * @return Un message de confirmation ou d'erreur.
     */
    @PostMapping("/invitations/accept/{senderId}/{receiverId}")
    public ResponseEntity<String> acceptInvitation(
            @PathVariable String senderId,
            @PathVariable String receiverId) {
        String result = friendService.acceptInvitation(senderId, receiverId);
        return ResponseEntity.ok(result);
    }

    /**
     * Endpoint pour décliner une invitation d'amitié.
     *
     * @param senderId   L'ID de l'utilisateur qui a envoyé l'invitation.
     * @param receiverId L'ID de l'utilisateur qui décline l'invitation.
     * @return Un message de confirmation ou d'erreur.
     */
    @PostMapping("/invitations/decline/{senderId}/{receiverId}")
    public ResponseEntity<String> declineInvitation(
            @PathVariable String senderId,
            @PathVariable String receiverId) {
        String result = friendService.declineInvitation(senderId, receiverId);
        return ResponseEntity.ok(result);
    }

    /**
     * Endpoint pour vérifier si deux utilisateurs sont amis dans Neo4j.
     *
     * @param userId1 L'ID du premier utilisateur.
     * @param userId2 L'ID du deuxième utilisateur.
     * @return Un message indiquant si les utilisateurs sont amis.
     */
    @GetMapping("/check-friendship/{userId1}/{userId2}")
    public ResponseEntity<String> checkFriendship(
            @PathVariable String userId1,
            @PathVariable String userId2) {
        String result = friendService.checkFriendship(userId1, userId2);
        return ResponseEntity.ok(result);
    }

    /**
     * Endpoint pour annuler une invitation d'amitié envoyée.
     *
     * @param senderId   L'ID de l'utilisateur qui a envoyé l'invitation.
     * @param receiverId L'ID de l'utilisateur qui devait recevoir l'invitation.
     * @return Un message de confirmation ou d'erreur.
     */
    @DeleteMapping("/invitations/cancel/{senderId}/{receiverId}")
    public ResponseEntity<String> cancelInvitation(
            @PathVariable String senderId,
            @PathVariable String receiverId) {
        try {
            String result = friendService.cancelInvitation(senderId, receiverId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erreur lors de l'annulation: " + e.getMessage());
        }
    }
    /////////////////////////////


    @Transactional
    @DeleteMapping("/remove/{userId}/{friendId}")
    public ResponseEntity<String> removeFriend(
            @PathVariable String userId,
            @PathVariable String friendId) {
        try {
            friendService.removeFriend(userId, friendId);
            return ResponseEntity.ok("Ami supprimé avec succès");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la suppression: " + e.getMessage());
        }
    }
    @Autowired
    private UserService userService;
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    @GetMapping("/list/{userId}")
    public ResponseEntity<List<UserDTO>> getFriends(@PathVariable String userId) {
        List<UserDTO> friends = friendService.getFriends(userId);
        return ResponseEntity.ok(friends);
    }
    @GetMapping("/invitations/sent-ids/{userId}")
    public ResponseEntity<List<String>> getSentInvitationIds(@PathVariable String userId) {
        List<String> sentIds = friendService.getSentInvitationIds(userId);
        return ResponseEntity.ok(sentIds);
    }

    // Dans FriendController.java
    @GetMapping("/excluded-ids/{userId}")
    public ResponseEntity<List<String>> getExcludedUserIds(@PathVariable String userId) {
        List<String> excludedIds = friendService.getExcludedUserIds(userId);
        return ResponseEntity.ok(excludedIds);
    }
    @Autowired
    private UserNodeRepository userNodeRepository;

    @GetMapping("/{userId}/third-degree-friends")
    public ResponseEntity<?> getThirdDegreeFriends(@PathVariable String userId) {
        try {
            List<UserNode> thirdDegreeFriends = userNodeRepository.findThirdDegreeFriends(userId);

            if (thirdDegreeFriends.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        Map.of(
                                "success", false,
                                "message", "Aucun ami au troisième degré trouvé pour l'utilisateur ID: " + userId
                        )
                );
            }

            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "count", thirdDegreeFriends.size(),
                            "friends", thirdDegreeFriends
                    )
            );

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of(
                            "success", false,
                            "error", "Erreur lors de la récupération des amis au troisième degré",
                            "details", e.getMessage()
                    )
            );
        }
    }

}