package com.lifepulse.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;

@Document(collection = "goals")
public class Goal {
    
    @Id
    private String id;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotNull(message = "Category is required")
    private GoalCategory category;
    
    @Min(value = 0, message = "Target value must be positive")
    private Integer targetValue;
    
    private Integer currentValue = 0;
    
    private String unit;
    
    private LocalDateTime deadline;
    
    private boolean completed = false;
    
    private GoalPriority priority = GoalPriority.MEDIUM;
    
    @NotNull(message = "User ID is required")
    @Indexed
    private String userId;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    public Goal() {}
    
    public Goal(String id, String title, String description, GoalCategory category, 
                Integer targetValue, Integer currentValue, String unit, LocalDateTime deadline,
                boolean completed, GoalPriority priority, String userId, 
                LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.targetValue = targetValue;
        this.currentValue = currentValue;
        this.unit = unit;
        this.deadline = deadline;
        this.completed = completed;
        this.priority = priority;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public GoalCategory getCategory() {
        return category;
    }
    
    public void setCategory(GoalCategory category) {
        this.category = category;
    }
    
    public Integer getTargetValue() {
        return targetValue;
    }
    
    public void setTargetValue(Integer targetValue) {
        this.targetValue = targetValue;
    }
    
    public Integer getCurrentValue() {
        return currentValue;
    }
    
    public void setCurrentValue(Integer currentValue) {
        this.currentValue = currentValue;
    }
    
    public String getUnit() {
        return unit;
    }
    
    public void setUnit(String unit) {
        this.unit = unit;
    }
    
    public LocalDateTime getDeadline() {
        return deadline;
    }
    
    public void setDeadline(LocalDateTime deadline) {
        this.deadline = deadline;
    }
    
    public boolean isCompleted() {
        return completed;
    }
    
    public void setCompleted(boolean completed) {
        this.completed = completed;
    }
    
    public GoalPriority getPriority() {
        return priority;
    }
    
    public void setPriority(GoalPriority priority) {
        this.priority = priority;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private String id;
        private String title;
        private String description;
        private GoalCategory category;
        private Integer targetValue;
        private Integer currentValue = 0;
        private String unit;
        private LocalDateTime deadline;
        private boolean completed = false;
        private GoalPriority priority = GoalPriority.MEDIUM;
        private String userId;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        
        public Builder id(String id) {
            this.id = id;
            return this;
        }
        
        public Builder title(String title) {
            this.title = title;
            return this;
        }
        
        public Builder description(String description) {
            this.description = description;
            return this;
        }
        
        public Builder category(GoalCategory category) {
            this.category = category;
            return this;
        }
        
        public Builder targetValue(Integer targetValue) {
            this.targetValue = targetValue;
            return this;
        }
        
        public Builder currentValue(Integer currentValue) {
            this.currentValue = currentValue;
            return this;
        }
        
        public Builder unit(String unit) {
            this.unit = unit;
            return this;
        }
        
        public Builder deadline(LocalDateTime deadline) {
            this.deadline = deadline;
            return this;
        }
        
        public Builder completed(boolean completed) {
            this.completed = completed;
            return this;
        }
        
        public Builder priority(GoalPriority priority) {
            this.priority = priority;
            return this;
        }
        
        public Builder userId(String userId) {
            this.userId = userId;
            return this;
        }
        
        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }
        
        public Builder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }
        
        public Goal build() {
            return new Goal(id, title, description, category, targetValue, currentValue, 
                           unit, deadline, completed, priority, userId, createdAt, updatedAt);
        }
    }
    
    public enum GoalCategory {
        WORK, PERSONAL, HEALTH, FITNESS, OTHER
    }
    
    public enum GoalPriority {
        LOW, MEDIUM, HIGH
    }
} 