package com.lifepulse.dto.user;

import jakarta.validation.constraints.Size;

public class ProfileUpdateRequest {
    
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;
    
    @Size(max = 500, message = "Bio must not exceed 500 characters")
    private String bio;
    
    private String profilePictureUrl;
    
    public ProfileUpdateRequest() {}
    
    public ProfileUpdateRequest(String name, String bio, String profilePictureUrl) {
        this.name = name;
        this.bio = bio;
        this.profilePictureUrl = profilePictureUrl;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getBio() {
        return bio;
    }
    
    public void setBio(String bio) {
        this.bio = bio;
    }
    
    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }
    
    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }
} 