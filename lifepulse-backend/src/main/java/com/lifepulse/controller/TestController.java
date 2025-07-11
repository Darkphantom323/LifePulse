package com.lifepulse.controller;

import com.lifepulse.dto.ApiResponse;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.bson.Document;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class TestController {
    
    private final MongoTemplate mongoTemplate;
    
    public TestController(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }
    
    @GetMapping("/mongodb")
    public ResponseEntity<ApiResponse<String>> testMongoDB() {
        try {
            // Try to ping the database
            Document pingResult = mongoTemplate.getDb().runCommand(new Document("ping", 1));
            System.out.println("MongoDB ping result: " + pingResult.toJson());
            return ResponseEntity.ok(ApiResponse.success("MongoDB connection successful! Ping result: " + pingResult.toJson()));
        } catch (Exception e) {
            System.err.println("MongoDB test failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(ApiResponse.error("MongoDB connection failed: " + e.getMessage()));
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("Backend is running!"));
    }
} 