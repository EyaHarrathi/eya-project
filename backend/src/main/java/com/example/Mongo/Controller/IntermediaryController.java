package com.example.Mongo.Controller;



import com.example.Mongo.Dto.UserDTO;
import com.example.Mongo.Service.IntermediaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/intermediaries")
public class IntermediaryController {

    private final IntermediaryService intermediaryService;

    public IntermediaryController(IntermediaryService intermediaryService) {
        this.intermediaryService = intermediaryService;
    }


    @GetMapping("/between/{userIdA}/{userIdB}/{categoryId}")
    public ResponseEntity<List<UserDTO>> getIntermediaries(
            @PathVariable String userIdA,
            @PathVariable String userIdB,
            @PathVariable String categoryId) {

        List<UserDTO> intermediaries = intermediaryService.getIntermediariesBetweenUsers(
                userIdA,
                userIdB,
                categoryId
        );
        return ResponseEntity.ok(intermediaries);
    }
    // IntermediaryController.java
    @GetMapping("/recommendations/{categoryId}")
    public ResponseEntity<List<UserDTO>> getRecommendations(@PathVariable String categoryId) {
        if ("all".equalsIgnoreCase(categoryId)) {
            List<UserDTO> topUsers = intermediaryService.getTop7UsersByPoints();
            return ResponseEntity.ok(topUsers);
        }
        List<UserDTO> recommendations = intermediaryService.getRecommendedUsers(categoryId);
        return ResponseEntity.ok(recommendations);
    }
    // free
    @GetMapping("/around-median/{categoryId}")
    public ResponseEntity<List<UserDTO>> getUsersAroundMedian(@PathVariable String categoryId) {
        List<UserDTO> users = intermediaryService.getUsersAroundMedian(categoryId);
        return ResponseEntity.ok(users);
    }
    @GetMapping("/around-median/all")
    public ResponseEntity<List<UserDTO>> getUsersAroundMedianForAll() {
        List<UserDTO> users = intermediaryService.getUsersAroundMedianForAll();
        return ResponseEntity.ok(users);
    }

}