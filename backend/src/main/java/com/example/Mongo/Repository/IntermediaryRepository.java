package com.example.Mongo.Repository;

// src/main/java/com/example/repository/neo4j/IntermediaryRepository.java

import com.example.Mongo.Entity.UserNode;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;



public interface IntermediaryRepository extends Neo4jRepository<UserNode, String> {

    @Query("MATCH (a:User {userId: $userIdA})-[:AMI_AVEC]->(commonFriend:User)<-[:AMI_AVEC]-(b:User {userId: $userIdB}) " +
            "RETURN DISTINCT commonFriend")
    List<UserNode> findIntermediariesBetweenUsers(
            @Param("userIdA") String userIdA,
            @Param("userIdB") String userIdB
    );


}

