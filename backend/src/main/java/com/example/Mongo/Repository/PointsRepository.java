// src/main/java/com/example/Mongo/Repository/PointsRepository.java
package com.example.Mongo.Repository;

import com.example.Mongo.Entity.Points;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.domain.Pageable;
import java.util.List;

public interface PointsRepository extends MongoRepository<Points, String> {
    Points findByUserId(String userId);
    @Query(value = "{ 'categoryPoints.?0' : { $exists: true } }", sort = "{ 'categoryPoints.?0' : -1 }")
    List<Points> findTopByCategory(@Param("categoryId") String categoryId, Pageable pageable);
    @Aggregation(pipeline = {
            "{ $addFields: { " +
                    "totalPoints: { " +
                    "$sum: { " +
                    "$map: { " +
                    "input: { $objectToArray: \"$categoryPoints\" }, " +
                    "as: \"item\", " +
                    "in: \"$$item.v\" " +
                    "} " +
                    "} " +
                    "} " +
                    "}}",
            "{ $sort: { totalPoints: -1 } }",
            "{ $limit: 7 }"
    })
    List<Points> findTop7ByTotalPoints();
    // In PointsRepository.java
    @Query(value = "{ 'categoryPoints.?0' : { $exists: true } }", sort = "{ 'categoryPoints.?0' : -1 }")
    List<Points> findAllByCategory(@Param("categoryId") String categoryId);
    @Aggregation(pipeline = {
            "{ $addFields: { " +
                    "totalPoints: { " +
                    "$sum: { " +
                    "$map: { " +
                    "input: { $objectToArray: \"$categoryPoints\" }, " +
                    "as: \"item\", " +
                    "in: \"$$item.v\" " +
                    "} " +
                    "} " +
                    "} " +
                    "}}",
            "{ $sort: { totalPoints: -1 } }"
    })
    List<Points> findAllByTotalPoints();
}
