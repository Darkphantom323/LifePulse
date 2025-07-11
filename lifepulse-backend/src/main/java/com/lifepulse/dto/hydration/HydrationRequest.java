package com.lifepulse.dto.hydration;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

public class HydrationRequest {
    
    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be positive")
    private Integer amount;
    
    public HydrationRequest() {}
    
    public HydrationRequest(Integer amount) {
        this.amount = amount;
    }
    
    public Integer getAmount() {
        return amount;
    }
    
    public void setAmount(Integer amount) {
        this.amount = amount;
    }
} 