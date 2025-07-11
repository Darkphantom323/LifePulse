package com.lifepulse.dto.goal;

import com.lifepulse.entity.Goal;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;

public class GoalRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotNull(message = "Category is required")
    private Goal.GoalCategory category;
    
    @Min(value = 0, message = "Target value must be positive")
    private Integer targetValue;
    
    private String unit;
    
    private LocalDateTime deadline;
    
    private Goal.GoalPriority priority;
    
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
    
    public Goal.GoalCategory getCategory() {
        return category;
    }
    
    public void setCategory(Goal.GoalCategory category) {
        this.category = category;
    }
    
    public Integer getTargetValue() {
        return targetValue;
    }
    
    public void setTargetValue(Integer targetValue) {
        this.targetValue = targetValue;
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
    
    public Goal.GoalPriority getPriority() {
        return priority;
    }
    
    public void setPriority(Goal.GoalPriority priority) {
        this.priority = priority;
    }
} 