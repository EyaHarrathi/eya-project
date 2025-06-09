package com.example.Mongo.Service;

import com.example.Mongo.Dto.UserDTO;
import com.example.Mongo.Entity.Intermediaire;
import com.example.Mongo.Entity.User;
import com.example.Mongo.Entity.UserNode;
import com.example.Mongo.Repository.UserNodeRepository;
import com.example.Mongo.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.data.neo4j.core.Neo4jTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

import com.example.Mongo.Entity.ReseauSocial;
import com.example.Mongo.Repository.ReseauSocialRepository;

@Service
public class FriendService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserNodeRepository userNodeRepository;

    @Autowired
    private ReseauSocialRepository reseauSocialRepository;

    @Autowired
    private NotificationService notificationService; // Injection de NotificationService
    private final Neo4jTemplate neo4jTemplate;

    @Autowired
    public FriendService(
            Neo4jTemplate neo4jTemplate,
            UserRepository userRepository,
            UserNodeRepository userNodeRepository,
            ReseauSocialRepository reseauSocialRepository,
            NotificationService notificationService
    ) {
        this.neo4jTemplate = neo4jTemplate;
        this.userRepository = userRepository;
        this.userNodeRepository = userNodeRepository;
        this.reseauSocialRepository = reseauSocialRepository;
        this.notificationService = notificationService;
    }
    /**
     * Envoyer une invitation d'amitié.
     *
     * @param senderId   L'ID de l'expéditeur.
     * @param receiverId L'ID du destinataire.
     * @return Un message de confirmation.
     */
    public String sendInvitation(String senderId, String receiverId) {
        // Vérifier si les IDs sont valides
        if (senderId == null || receiverId == null || senderId.isEmpty() || receiverId.isEmpty()) {
            throw new IllegalArgumentException("ID invalide.");
        }

        // Vérifier si les utilisateurs existent dans MongoDB
        Optional<User> sender = userRepository.findById(senderId);
        Optional<User> receiver = userRepository.findById(receiverId);

        if (sender.isEmpty() || receiver.isEmpty()) {
            throw new IllegalArgumentException("Utilisateur non trouvé.");
        }

        // Récupérer ou créer le réseau social de l'expéditeur
        ReseauSocial reseauSender = reseauSocialRepository.findById(senderId)
                .orElse(new ReseauSocial(senderId, new ArrayList<>(), new ArrayList<>(), new ArrayList<>()));

        // Vérifier si l'invitation existe déjà
        if (reseauSender.getListDemandeInvitation().stream().anyMatch(u -> u.getId().equals(receiverId))) {
            return "Une invitation a déjà été envoyée à cet utilisateur.";
        }

        // Ajouter l'invitation à la liste des demandes d'invitation de l'expéditeur
        reseauSender.getListDemandeInvitation().add(receiver.get());
        reseauSocialRepository.save(reseauSender);

        // Récupérer ou créer le réseau social du destinataire
        ReseauSocial reseauReceiver = reseauSocialRepository.findById(receiverId)
                .orElse(new ReseauSocial(receiverId, new ArrayList<>(), new ArrayList<>(), new ArrayList<>()));

        // Ajouter l'invitation à la liste des invitations reçues du destinataire
        reseauReceiver.getListRecoiInvitation().add(sender.get());
        reseauSocialRepository.save(reseauReceiver);

        // Créer une notification pour le destinataire
        notificationService.createNotification(
                receiverId, // ID du destinataire
                "nouvelle_invitation", // Type de notification
                sender.get().getPrenom() + " " + sender.get().getNom() + " vous a envoyé une invitation d'amitié.", // Message
                sender.get().getPhotoUrl(), // Photo de l'expéditeur
                "https://example.com/friend-request-icon.png", // Icône de demande d'amitié
                senderId // ID de l'expéditeur
        );

        return "Invitation envoyée à " + receiver.get().getPrenom() + " " + receiver.get().getNom() + ".";
    }

    /**
     * Accepter une invitation d'amitié.
     *
     * @param senderId   L'ID de l'expéditeur.
     * @param receiverId L'ID du destinataire.
     * @return Un message de confirmation.
     */
    public String acceptInvitation(String senderId, String receiverId) {
        // Vérifier si les utilisateurs existent dans MongoDB
        Optional<User> sender = userRepository.findById(senderId);
        Optional<User> receiver = userRepository.findById(receiverId);

        if (sender.isEmpty() || receiver.isEmpty()) {
            throw new IllegalArgumentException("Utilisateur non trouvé.");
        }

        // Récupérer le réseau social du destinataire
        ReseauSocial reseauReceiver = reseauSocialRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Réseau social non trouvé."));

        // Vérifier si l'invitation existe
        if (reseauReceiver.getListRecoiInvitation().stream().noneMatch(u -> u.getId().equals(senderId))) {
            return "Aucune invitation trouvée.";
        }

        // Ajouter l'ami à la liste des amis dans MongoDB
        reseauReceiver.getListAmis().add(sender.get());
        reseauSocialRepository.save(reseauReceiver);

        // Récupérer le réseau social de l'expéditeur
        ReseauSocial reseauSender = reseauSocialRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Réseau social non trouvé."));

        // Ajouter l'ami à la liste des amis de l'expéditeur
        reseauSender.getListAmis().add(receiver.get());
        reseauSocialRepository.save(reseauSender);

        // Ajouter la relation d'amitié dans Neo4j
        UserNode senderNode = userNodeRepository.findById(senderId)
                .orElseGet(() -> {
                    User mongoSender = sender.get();
                    UserNode newSenderNode = new UserNode(
                            senderId,
                            mongoSender.getPrenom(),
                            mongoSender.getNom(),
                            mongoSender.getPhotoUrl()
                    );
                    userNodeRepository.save(newSenderNode);
                    return newSenderNode;
                });

        UserNode receiverNode = userNodeRepository.findById(receiverId)
                .orElseGet(() -> {
                    User mongoReceiver = receiver.get();
                    UserNode newReceiverNode = new UserNode(
                            receiverId,
                            mongoReceiver.getPrenom(),
                            mongoReceiver.getNom(),
                            mongoReceiver.getPhotoUrl()
                    );
                    userNodeRepository.save(newReceiverNode);
                    return newReceiverNode;
                });

        // Ajouter les deux utilisateurs dans la liste d'amis l'un de l'autre
        senderNode.getAmis().add(receiverNode);
        receiverNode.getAmis().add(senderNode);

        // Supprimer l'invitation des listes APRÈS l'avoir acceptée
        reseauReceiver.getListRecoiInvitation().removeIf(u -> u.getId().equals(senderId));
        reseauSender.getListDemandeInvitation().removeIf(u -> u.getId().equals(receiverId));

        // Sauvegarder les modifications
        reseauSocialRepository.save(reseauReceiver);
        reseauSocialRepository.save(reseauSender);

        // Sauvegarder les deux nœuds dans Neo4j
        userNodeRepository.save(senderNode);
        userNodeRepository.save(receiverNode);

        // Créer une notification pour l'expéditeur
        notificationService.createNotification(
                senderId, // ID de l'expéditeur
                "invitation_acceptée", // Type de notification
                receiver.get().getPrenom() + " " + receiver.get().getNom() + " a accepté votre invitation d'amitié.", // Message
                receiver.get().getPhotoUrl(), // Photo du destinataire
                "https://example.com/friend-accepted-icon.png", // Icône d'acceptation
                receiverId // ID du destinataire
        );

        return "Invitation acceptée. " + senderId + " et " + receiverId + " sont maintenant amis.";
    }



    /**
     * Refuser une invitation d'amitié.
     *
     * @param senderId   L'ID de l'expéditeur.
     * @param receiverId L'ID du destinataire.
     * @return Un message de confirmation.
     */
    public String declineInvitation(String senderId, String receiverId) {
        // Vérifier si les utilisateurs existent dans MongoDB
        Optional<User> sender = userRepository.findById(senderId);
        Optional<User> receiver = userRepository.findById(receiverId);

        if (sender.isEmpty() || receiver.isEmpty()) {
            throw new IllegalArgumentException("Utilisateur non trouvé.");
        }

        // Récupérer le réseau social du destinataire
        ReseauSocial reseauReceiver = reseauSocialRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Réseau social non trouvé."));

        // Supprimer l'invitation de la liste des invitations reçues
        reseauReceiver.getListRecoiInvitation().removeIf(u -> u.getId().equals(senderId));
        reseauSocialRepository.save(reseauReceiver);

        // Récupérer le réseau social de l'expéditeur
        ReseauSocial reseauSender = reseauSocialRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Réseau social non trouvé."));

        // Supprimer l'invitation de la liste des demandes d'invitation
        reseauSender.getListDemandeInvitation().removeIf(u -> u.getId().equals(receiverId));
        reseauSocialRepository.save(reseauSender);

        return "Invitation refusée de " + senderId + " à " + receiverId + ".";
    }

    /**
     * Vérifier si deux utilisateurs sont amis.
     *
     * @param userId1 L'ID du premier utilisateur.
     * @param userId2 L'ID du deuxième utilisateur.
     * @return Un message indiquant si les utilisateurs sont amis.
     */
    public String checkFriendship(String userId1, String userId2) {
        // Vérifier si les utilisateurs existent dans MongoDB
        Optional<User> user1 = userRepository.findById(userId1);
        Optional<User> user2 = userRepository.findById(userId2);

        if (user1.isEmpty() || user2.isEmpty()) {
            throw new IllegalArgumentException("Utilisateur non trouvé.");
        }

        // Vérifier la relation d'amitié dans Neo4j
        Optional<UserNode> userNode1 = userNodeRepository.findById(userId1);
        Optional<UserNode> userNode2 = userNodeRepository.findById(userId2);

        if (userNode1.isPresent() && userNode2.isPresent()) {
            UserNode node1 = userNode1.get();
            UserNode node2 = userNode2.get();

            if (node1.getAmis().contains(node2) && node2.getAmis().contains(node1)) {
                return userId1 + " et " + userId2 + " sont amis.";
            } else {
                return userId1 + " et " + userId2 + " ne sont pas amis.";
            }
        } else {
            return "Relation d'amitié non trouvée.";
        }
    }

    /**
     * Récupérer les invitations reçues par un utilisateur.
     *
     * @param userId L'ID de l'utilisateur.
     * @return La liste des invitations reçues.
     */
    public List<User> getInvitations(String userId) {
        // Vérifier si l'utilisateur existe
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            throw new IllegalArgumentException("Utilisateur non trouvé.");
        }

        // Récupérer le réseau social de l'utilisateur
        ReseauSocial reseau = reseauSocialRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Réseau social non trouvé."));

        // Retourner la liste des invitations reçues
        return reseau.getListRecoiInvitation();
    }



    @Autowired
    private Neo4jClient neo4jClient;

    public String removeFriend(String userId, String friendId) {
        // Remove relationship type to match any relationship or correct it if necessary
        String query = "MATCH (u:User {userId: $userId})-[r]-(f:User {userId: $friendId}) DELETE r";

        try {
            var result = neo4jClient.query(query)
                    .bind(userId).to("userId")
                    .bind(friendId).to("friendId")
                    .run();

            if (result.counters().relationshipsDeleted() == 0) {
                throw new RuntimeException("Aucune relation d'amitié trouvée.");
            }
        } catch (Exception e) {
            throw new RuntimeException("Échec de la suppression : " + e.getMessage());
        }
        // Update MongoDB: Remove friend from both users' ReseauSocial listAmis
        Optional<ReseauSocial> userReseauOpt = reseauSocialRepository.findById(userId);
        userReseauOpt.ifPresent(userReseau -> {
            userReseau.getListAmis().removeIf(u -> u.getId().equals(friendId));
            reseauSocialRepository.save(userReseau);
        });

        Optional<ReseauSocial> friendReseauOpt = reseauSocialRepository.findById(friendId);
        friendReseauOpt.ifPresent(friendReseau -> {
            friendReseau.getListAmis().removeIf(u -> u.getId().equals(userId));
            reseauSocialRepository.save(friendReseau);
        });

        return "Friend removed successfully";
    }
    public List<UserDTO> getFriends(String userId) {
        // Récupérer les amis directs depuis Neo4j
        List<UserNode> directFriends = userNodeRepository.findDirectFriends(userId);
        System.out.println("Amis directs : " + directFriends);

        // Récupérer les amis des amis depuis Neo4j
        List<UserNode> friendsOfFriends = userNodeRepository.findFriendsOfFriends(userId);
        System.out.println("Amis des amis : " + friendsOfFriends);

        // Combiner les deux listes et supprimer les doublons
        List<UserNode> allFriends = new ArrayList<>(directFriends);
        allFriends.addAll(friendsOfFriends);
        allFriends = allFriends.stream()
                .distinct()
                .filter(user -> !user.getUserId().equals(userId)) // Exclure l'utilisateur connecté
                .collect(Collectors.toList());
        System.out.println("Amis combinés : " + allFriends);

        // Convertir les UserNode en UserDTO
        return allFriends.stream()

                .map(ami -> userRepository.findById(ami.getUserId()))
                .filter(Optional::isPresent)
                .map(opt -> {
                    User user = opt.get();
                    return new UserDTO(
                            user.getId(),
                            user.getPrenom(),
                            user.getNom(),
                            user.getPhotoUrl() // Assurez-vous que ce champ existe dans votre entité User
                    );
                })
                .collect(Collectors.toList());}

    //////
    public List<String> getSentInvitationIds(String userId) {
        return reseauSocialRepository.findById(userId)
                .map(reseau -> reseau.getListDemandeInvitation()
                        .stream()
                        .map(User::getId)
                        .collect(Collectors.toList()))
                .orElse(Collections.emptyList());
    }

    public List<String> getExcludedUserIds(String userId) {
        ReseauSocial reseau = reseauSocialRepository.findById(userId)
                .orElse(new ReseauSocial(userId, new ArrayList<>(), new ArrayList<>(), new ArrayList<>()));

        List<String> excludedIds = new ArrayList<>();

        // Add friends (from Neo4j)
        excludedIds.addAll(
                getFriends(userId).stream()
                        .map(UserDTO::getUserId)
                        .collect(Collectors.toList())
        );

        // Add sent invitations
        excludedIds.addAll(
                reseau.getListDemandeInvitation().stream()
                        .map(User::getId)
                        .collect(Collectors.toList())
        );

        // Add received invitations
        excludedIds.addAll(
                reseau.getListRecoiInvitation().stream()
                        .map(User::getId)
                        .collect(Collectors.toList())
        );

        List<User> adminUsers = userRepository.findByRole(User.Role.ADMIN);
        List<String> adminIds = adminUsers.stream()
                .map(User::getId)
                .collect(Collectors.toList());
        excludedIds.addAll(adminIds);

        return excludedIds.stream()
                .distinct()
                .collect(Collectors.toList());
    }
    public List<Intermediaire> findIntermediaries(String buyerId, String sellerId) {
        if (buyerId == null || sellerId == null || buyerId.isEmpty() || sellerId.isEmpty()) {
            throw new IllegalArgumentException("Identifiants utilisateur invalides");
        }

        String query =
                "MATCH path = allShortestPaths((b:User {id: $buyerId})-[:FRIEND*]-(s:User {id: $sellerId}))\n" +
                        "UNWIND nodes(path) AS node\n" +
                        "WITH DISTINCT node\n" +
                        "WHERE node.id <> $buyerId AND node.id <> $sellerId\n" +
                        "RETURN node.id AS userId, node.firstName AS firstName, " +
                        "       node.lastName AS lastName, node.photoUrl AS photoUrl";

        Map<String, Object> params = Map.of(
                "buyerId", buyerId,
                "sellerId", sellerId
        );

        try {
            return neo4jTemplate.findAll(query, params, Intermediaire.class);
        } catch (Exception e) {

            return Collections.emptyList();
        }
    }
    public List<UserNode> getThirdDegreeFriends(String userId) {
        return userNodeRepository.findThirdDegreeFriends(userId);
    }
    public List<String> getThirdDegreeFriendsIds(String userId) {
        List<UserNode> thirdDegreeFriends = userNodeRepository.findThirdDegreeFriends(userId);
        return thirdDegreeFriends.stream()
                .map(UserNode::getUserId)
                .collect(Collectors.toList());
    }
    /**
     * Annuler une invitation d'amitié envoyée.
     */
    public String cancelInvitation(String senderId, String receiverId) {
        if (senderId == null || receiverId == null || senderId.isEmpty() || receiverId.isEmpty()) {
            throw new IllegalArgumentException("ID invalide.");
        }

        Optional<User> sender = userRepository.findById(senderId);
        Optional<User> receiver = userRepository.findById(receiverId);

        if (sender.isEmpty() || receiver.isEmpty()) {
            throw new IllegalArgumentException("Utilisateur non trouvé.");
        }

        // Récupérer le réseau social de l'expéditeur
        ReseauSocial reseauSender = reseauSocialRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Réseau social de l'expéditeur non trouvé."));

        // Vérifier si l'invitation existe dans la liste des demandes
        boolean invitationExists = reseauSender.getListDemandeInvitation().stream()
                .anyMatch(u -> u.getId().equals(receiverId));

        if (!invitationExists) {
            throw new IllegalArgumentException("Aucune invitation trouvée à annuler.");
        }

        // Supprimer l'invitation de la liste des demandes de l'expéditeur
        reseauSender.getListDemandeInvitation().removeIf(u -> u.getId().equals(receiverId));
        reseauSocialRepository.save(reseauSender);

        // Récupérer le réseau social du destinataire
        ReseauSocial reseauReceiver = reseauSocialRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Réseau social du destinataire non trouvé."));

        // Supprimer l'invitation de la liste des invitations reçues du destinataire
        reseauReceiver.getListRecoiInvitation().removeIf(u -> u.getId().equals(senderId));
        reseauSocialRepository.save(reseauReceiver);

        return "Invitation annulée avec succès.";
    }

}