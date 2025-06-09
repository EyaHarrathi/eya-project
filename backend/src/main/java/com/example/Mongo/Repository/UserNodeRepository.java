package com.example.Mongo.Repository;

import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.stereotype.Repository;
import com.example.Mongo.Entity.UserNode;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserNodeRepository extends Neo4jRepository<UserNode, String> {

    @SuppressWarnings("null")
    Optional<UserNode> findById(String userId);

    @Query("MATCH (user:User {userId: $userId})-[:AMI_AVEC]->(ami:User) " +
           "WHERE ami.userId <> $userId " +
           "RETURN ami")
    List<UserNode> findDirectFriends(String userId);

    // Correction du caractère d'espace après 'String'
    @Query("MATCH (user:User {userId: $userId})-[:AMI_AVEC]->(ami:User)-[:AMI_AVEC]->(amiDeAmi:User) " +
           "WHERE NOT (user)-[:AMI_AVEC]->(amiDeAmi) " +
           "AND amiDeAmi.userId <> $userId " +
           "RETURN amiDeAmi")
    List<UserNode> findFriendsOfFriends(String userId); // Espace normal entre String et userId
    @Query("MATCH (user:User {userId: $userId})-[:AMI_AVEC]->()-[*2]->(thirdDegree:User) " +
            "WHERE NOT (user)-[:AMI_AVEC]->(thirdDegree) " +
            "AND thirdDegree.userId <> $userId " +
            "RETURN DISTINCT thirdDegree")
    List<UserNode> findThirdDegreeFriends(String userId);
}