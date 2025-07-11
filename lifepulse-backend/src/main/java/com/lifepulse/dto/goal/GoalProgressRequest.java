package com.lifepulse.dto.goal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

public class GoalProgressRequest {
    
    @NotNull(message = "Current value is required")
    @Min(value = 0, message = "Current value must be positive")
    private Integer currentValue;
    
    public GoalProgressRequest() {}
    
    public GoalProgressRequest(Integer currentValue) {
        this.currentValue = currentValue;
    }
    
    public Integer getCurrentValue() {
        return currentValue;
    }
    
    public void setCurrentValue(Integer currentValue) {
        this.currentValue = currentValue;
    }
} 