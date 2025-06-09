package com.example.Mongo.Service;

// src/main/java/com/example/service/IntermediaryService.java

import com.example.Mongo.Dto.UserDTO;
import com.example.Mongo.Entity.Points;
import com.example.Mongo.Entity.User;
import com.example.Mongo.Entity.UserNode;
import com.example.Mongo.Repository.IntermediaryRepository;
import com.example.Mongo.Repository.PointsRepository;
import com.example.Mongo.Repository.UserRepository;
import org.bson.types.ObjectId;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
// Updated IntermediaryService.java
public class IntermediaryService {
    private final IntermediaryRepository intermediaryRepository;
    private final UserRepository userRepository;
    private final PointsRepository pointsRepository;

    public IntermediaryService(IntermediaryRepository intermediaryRepository,
                               UserRepository userRepository,
                               PointsRepository pointsRepository) {
        this.intermediaryRepository = intermediaryRepository;
        this.userRepository = userRepository;
        this.pointsRepository = pointsRepository;
    }

    public List<UserDTO> getIntermediariesBetweenUsers(String userIdA, String userIdB, String categoryId) {
        List<UserNode> intermediaries = intermediaryRepository.findIntermediariesBetweenUsers(userIdA, userIdB);

        return intermediaries.stream()
                .map(intermediary -> {
                    try {
                        String neo4jUserId = intermediary.getUserId();
                        ObjectId mongoId = new ObjectId(neo4jUserId);
                        Optional<User> userOpt = userRepository.findById(String.valueOf(mongoId));

                        if (userOpt.isEmpty()) return null;

                        // Update category-specific points
                        Points points = pointsRepository.findByUserId(neo4jUserId);
                        if (points == null) {
                            points = new Points(neo4jUserId);
                        }
                        points.addPoints(categoryId, 10); // Add 10 points to this category
                        pointsRepository.save(points);

                        User user = userOpt.get();
                        return new UserDTO(
                                user.getPrenom(),
                                user.getId().toString(),

                                user.getNom(),
                                user.getPhotoUrl(),
                                points.getCategoryPoints() // Return all category points
                        );
                    } catch (IllegalArgumentException e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
    // IntermediaryService.java
    public List<UserDTO> getRecommendedUsers(String categoryId) {
        // Fetch top 10 users for the category
        List<Points> topPoints = pointsRepository.findTopByCategory(categoryId, PageRequest.of(0, 10));

        return topPoints.stream()
                .map(points -> {
                    try {
                        ObjectId mongoId = new ObjectId(points.getUserId());
                        Optional<User> userOpt = userRepository.findById(String.valueOf(mongoId));
                        return userOpt.map(user -> new UserDTO(
                                user.getPrenom(),
                                user.getId().toString(),

                                user.getNom(),
                                user.getPhotoUrl(),
                                points.getCategoryPoints()
                        )).orElse(null);
                    } catch (IllegalArgumentException e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
    public List<UserDTO> getTop7UsersByPoints() {
        List<Points> topPoints = pointsRepository.findTop7ByTotalPoints();

        return topPoints.stream()
                .map(points -> {
                    try {
                        ObjectId userId = new ObjectId(points.getUserId());
                        Optional<User> userOpt = userRepository.findById(String.valueOf(userId));

                        if (userOpt.isEmpty()) return null;

                        User user = userOpt.get();
                        return new UserDTO(

                                user.getPrenom(),
                                user.getId().toString(),
                                user.getNom(),
                                user.getPhotoUrl(),
                                points.getCategoryPoints()
                        );
                    } catch (IllegalArgumentException e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
    // In IntermediaryService.java
    public List<UserDTO> getUsersAroundMedian(String categoryId) {
        List<Points> allPoints = pointsRepository.findAllByCategory(categoryId);
        int size = allPoints.size();
        if (size == 0) {
            return new ArrayList<>();
        }

        int medianIndex = (size - 1) / 2; // Zero-based median index
        int startBefore = Math.max(0, medianIndex - 5);
        int endBefore = medianIndex;
        List<Points> beforeMedian = allPoints.subList(startBefore, endBefore);

        int startAfter = medianIndex + 1;
        int endAfter = Math.min(size, medianIndex + 6); // +5 elements after median
        List<Points> afterMedian = allPoints.subList(startAfter, endAfter);

        List<Points> combined = new ArrayList<>();
        combined.addAll(beforeMedian);
        combined.addAll(afterMedian);

        return combined.stream()
                .map(points -> {
                    try {
                        ObjectId mongoId = new ObjectId(points.getUserId());
                        Optional<User> userOpt = userRepository.findById(String.valueOf(mongoId));
                        return userOpt.map(user -> new UserDTO(
                                user.getPrenom(),
                                user.getId().toString(),
                                user.getNom(),
                                user.getPhotoUrl(),
                                points.getCategoryPoints()
                        )).orElse(null);
                    } catch (IllegalArgumentException e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
    public List<UserDTO> getUsersAroundMedianForAll() {
        List<Points> allPoints = pointsRepository.findAllByTotalPoints();
        int size = allPoints.size();
        if (size == 0) {
            return new ArrayList<>();
        }

        int medianIndex = (size - 1) / 2;
        int start = Math.max(0, medianIndex - 5);
        int end = Math.min(size, medianIndex + 6); // Exclusive end

        List<Points> aroundMedian = allPoints.subList(start, end);

        return aroundMedian.stream()
                .map(points -> {
                    try {
                        ObjectId mongoId = new ObjectId(points.getUserId());
                        Optional<User> userOpt = userRepository.findById(String.valueOf(mongoId));
                        return userOpt.map(user -> new UserDTO(
                                user.getPrenom(),
                                user.getId().toString(),
                                user.getNom(),
                                user.getPhotoUrl(),
                                points.getCategoryPoints()
                        )).orElse(null);
                    } catch (IllegalArgumentException e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}