package com.lifepulse.controller;

import com.lifepulse.dto.ApiResponse;
import com.lifepulse.dto.user.ProfileUpdateRequest;
import com.lifepulse.entity.User;
import com.lifepulse.service.S3Service;
import com.lifepulse.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private S3Service s3Service;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getUserProfile(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            User user = userService.findByEmail(userEmail);
            
            if (user == null) {
                return ResponseEntity.notFound().build();
            }
            
            Map<String, Object> profileData = new HashMap<>();
            profileData.put("id", user.getId());
            profileData.put("name", user.getName());
            profileData.put("email", user.getEmail());
            profileData.put("bio", user.getBio());
            profileData.put("streak", user.getStreak());
            
            // Generate presigned URL for secure image access (1 hour expiry)
            String profilePictureUrl = null;
            if (user.getProfilePictureUrl() != null) {
                if (user.getProfilePictureUrl().startsWith("http")) {
                    // It's already a URL (placeholder or old format)
                    profilePictureUrl = user.getProfilePictureUrl();
                } else {
                    // It's an S3 key - generate presigned URL
                    profilePictureUrl = s3Service.generatePresignedViewUrl(user.getProfilePictureUrl());
                }
            }
            profileData.put("profilePictureUrl", profilePictureUrl);
            
            return ResponseEntity.ok(ApiResponse.success(profileData));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch profile: " + e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse> updateUserProfile(
            @Valid @RequestBody ProfileUpdateRequest request,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            User updatedUser = userService.updateProfile(userEmail, request);
            
            Map<String, Object> profileData = new HashMap<>();
            profileData.put("id", updatedUser.getId());
            profileData.put("name", updatedUser.getName());
            profileData.put("email", updatedUser.getEmail());
            profileData.put("bio", updatedUser.getBio());
            profileData.put("streak", updatedUser.getStreak());
            profileData.put("profilePictureUrl", updatedUser.getProfilePictureUrl());
            
            return ResponseEntity.ok(ApiResponse.success(profileData));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update profile: " + e.getMessage()));
        }
    }

    @PostMapping("/profile/upload-url")
    public ResponseEntity<ApiResponse> getUploadUrl(
            @RequestParam String fileName,
            @RequestParam String contentType) {
        try {
            String uploadUrl = s3Service.generatePresignedUploadUrl(fileName, contentType);
            
            Map<String, String> response = new HashMap<>();
            response.put("uploadUrl", uploadUrl);
            
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to generate upload URL: " + e.getMessage()));
        }
    }

    @PostMapping("/profile/picture")
    public ResponseEntity<ApiResponse> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            System.out.println("=== Profile Picture Upload Debug ===");
            System.out.println("File name: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize());
            System.out.println("Content type: " + file.getContentType());
            
            String userEmail = authentication.getName();
            System.out.println("User email: " + userEmail);
            
            User user = userService.findByEmail(userEmail);
            
            if (user == null) {
                System.out.println("ERROR: User not found for email: " + userEmail);
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("User not found"));
            }
            
            System.out.println("User found: " + user.getId());

            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("File is empty"));
            }

            // Basic file validation
            String contentType = file.getContentType();
            if (contentType == null || (!contentType.startsWith("image/"))) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("File must be an image"));
            }

            if (file.getSize() > 5 * 1024 * 1024) { // 5MB limit
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("File size must be less than 5MB"));
            }

            // Try S3 upload, fall back to placeholder if S3 fails
            String profilePictureRef; // Can be S3 key or placeholder URL
            try {
                System.out.println("Attempting S3 upload...");
                
                // Delete old profile picture if exists (only if it's an S3 key, not placeholder)
                if (user.getProfilePictureUrl() != null && !user.getProfilePictureUrl().startsWith("http")) {
                    s3Service.deleteFileByKey(user.getProfilePictureUrl());
                }
                
                // Upload new picture (returns S3 key, not URL)
                profilePictureRef = s3Service.uploadFile(file, user.getId());
                System.out.println("S3 upload successful. S3 key: " + profilePictureRef);
                
            } catch (Exception s3Error) {
                System.out.println("S3 upload failed: " + s3Error.getMessage());
                System.out.println("Falling back to placeholder URL...");
                
                // Fallback: Use a placeholder URL (for testing without S3)
                profilePictureRef = "https://via.placeholder.com/150x150.png?text=" + user.getName().charAt(0);
                System.out.println("Using placeholder URL: " + profilePictureRef);
            }

            // Update user profile with new image reference (S3 key or placeholder URL)
            ProfileUpdateRequest updateRequest = new ProfileUpdateRequest();
            updateRequest.setName(user.getName());
            updateRequest.setBio(user.getBio());
            updateRequest.setProfilePictureUrl(profilePictureRef);
            
            User updatedUser = userService.updateProfile(userEmail, updateRequest);
            System.out.println("Profile updated successfully with reference: " + updatedUser.getProfilePictureUrl());
            
            // Generate presigned URL for immediate use (if it's an S3 key)
            String responseUrl = updatedUser.getProfilePictureUrl();
            if (responseUrl != null && !responseUrl.startsWith("http")) {
                // It's an S3 key - generate presigned URL for response
                responseUrl = s3Service.generatePresignedViewUrl(responseUrl);
            }
            
            Map<String, String> response = new HashMap<>();
            response.put("profilePictureUrl", responseUrl);
            
            return ResponseEntity.ok(ApiResponse.success(response));
            
        } catch (Exception e) {
            System.out.println("UPLOAD ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to upload profile picture: " + e.getMessage()));
        }
    }

    @DeleteMapping("/profile/picture")
    public ResponseEntity<ApiResponse> deleteProfilePicture(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            User user = userService.findByEmail(userEmail);
            
            if (user == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("User not found"));
            }

            // Delete from S3 (only if it's an S3 key, not a placeholder URL)
            if (user.getProfilePictureUrl() != null && !user.getProfilePictureUrl().startsWith("http")) {
                s3Service.deleteFileByKey(user.getProfilePictureUrl());
            }

            // Update user profile to remove image URL
            ProfileUpdateRequest updateRequest = new ProfileUpdateRequest();
            updateRequest.setName(user.getName());
            updateRequest.setBio(user.getBio());
            updateRequest.setProfilePictureUrl(null);
            
            userService.updateProfile(userEmail, updateRequest);
            
            return ResponseEntity.ok(ApiResponse.success("Profile picture deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to delete profile picture: " + e.getMessage()));
        }
    }

    @PostMapping("/streak")
    public ResponseEntity<ApiResponse> updateStreak(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            User user = userService.updateStreak(userEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("streak", user.getStreak());
            response.put("lastLoginDate", user.getLastLoginDate());
            
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update streak: " + e.getMessage()));
        }
    }
} 