package com.lifepulse.controller;

import com.lifepulse.dto.ApiResponse;
import com.lifepulse.dto.auth.AuthResponse;
import com.lifepulse.dto.auth.LoginRequest;
import com.lifepulse.dto.auth.RegisterRequest;
import com.lifepulse.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class AuthController {
    
    private final AuthService authService;
    
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            System.out.println("=== REGISTRATION REQUEST ===");
            System.out.println("Name: " + request.getName());
            System.out.println("Email: " + request.getEmail());
            System.out.println("Password length: " + (request.getPassword() != null ? request.getPassword().length() : "null"));
            
            AuthResponse response = authService.register(request);
            System.out.println("Registration successful for user: " + response.getEmail());
            return ResponseEntity.ok(ApiResponse.success(response, "User registered successfully"));
        } catch (Exception e) {
            System.err.println("=== REGISTRATION ERROR ===");
            System.err.println("Error type: " + e.getClass().getSimpleName());
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(ApiResponse.error("Registration failed: " + e.getMessage()));
        }
    }
    
    @PostMapping("/signin")
    public ResponseEntity<ApiResponse<AuthResponse>> signin(@Valid @RequestBody LoginRequest request) {
        try {
            System.out.println("=== SIGNIN REQUEST ===");
            System.out.println("Email: " + request.getEmail());
            System.out.println("Password provided: " + (request.getPassword() != null && !request.getPassword().isEmpty()));
            
            AuthResponse response = authService.signin(request);
            System.out.println("Signin successful for user: " + response.getEmail());
            return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
        } catch (Exception e) {
            System.err.println("=== SIGNIN ERROR ===");
            System.err.println("Error type: " + e.getClass().getSimpleName());
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(ApiResponse.error("Signin failed: " + e.getMessage()));
        }
    }
} 