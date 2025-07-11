package com.lifepulse.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;

@Document(collection = "meditation_sessions")
public class MeditationSession {
    
    @Id
    private String id;
    
    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be positive")
    private Integer duration; // in minutes
    
    @NotNull(message = "Type is required")
    private MeditationType type;
    
    private String notes;
    
    @NotNull(message = "User ID is required")
    @Indexed
    private String userId;
    
    @CreatedDate
    private LocalDateTime timestamp = LocalDateTime.now();
    
    public MeditationSession() {}
    
    public MeditationSession(String id, Integer duration, MeditationType type, String notes, 
                            String userId, LocalDateTime timestamp) {
        this.id = id;
        this.duration = duration;
        this.type = type;
        this.notes = notes;
        this.userId = userId;
        this.timestamp = timestamp;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public Integer getDuration() {
        return duration;
    }
    
    public void setDuration(Integer duration) {
        this.duration = duration;
    }
    
    public MeditationType getType() {
        return type;
    }
    
    public void setType(MeditationType type) {
        this.type = type;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private String id;
        private Integer duration;
        private MeditationType type;
        private String notes;
        private String userId;
        private LocalDateTime timestamp = LocalDateTime.now();
        
        public Builder id(String id) {
            this.id = id;
            return this;
        }
        
        public Builder duration(Integer duration) {
            this.duration = duration;
            return this;
        }
        
        public Builder type(MeditationType type) {
            this.type = type;
            return this;
        }
        
        public Builder notes(String notes) {
            this.notes = notes;
            return this;
        }
        
        public Builder userId(String userId) {
            this.userId = userId;
            return this;
        }
        
        public Builder timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }
        
        public MeditationSession build() {
            return new MeditationSession(id, duration, type, notes, userId, timestamp);
        }
    }
    
    public enum MeditationType {
        BREATHING, MINDFULNESS, GUIDED, OTHER
    }
} 