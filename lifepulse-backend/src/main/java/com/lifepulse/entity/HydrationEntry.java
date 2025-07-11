package com.lifepulse.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;

@Document(collection = "hydration_entries")
public class HydrationEntry {
    
    @Id
    private String id;
    
    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be positive")
    private Integer amount; // in ml
    
    @NotNull(message = "User ID is required")
    @Indexed
    private String userId;
    
    @CreatedDate
    private LocalDateTime timestamp = LocalDateTime.now();
    
    public HydrationEntry() {}
    
    public HydrationEntry(String id, Integer amount, String userId, LocalDateTime timestamp) {
        this.id = id;
        this.amount = amount;
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
    
    public Integer getAmount() {
        return amount;
    }
    
    public void setAmount(Integer amount) {
        this.amount = amount;
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
        private Integer amount;
        private String userId;
        private LocalDateTime timestamp = LocalDateTime.now();
        
        public Builder id(String id) {
            this.id = id;
            return this;
        }
        
        public Builder amount(Integer amount) {
            this.amount = amount;
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
        
        public HydrationEntry build() {
            return new HydrationEntry(id, amount, userId, timestamp);
        }
    }
} 