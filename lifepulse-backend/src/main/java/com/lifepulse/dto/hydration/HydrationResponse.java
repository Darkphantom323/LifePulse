package com.lifepulse.dto.hydration;

import com.lifepulse.entity.HydrationEntry;
import java.util.List;

public class HydrationResponse {
    private List<HydrationEntry> entries;
    private Integer totalAmount;
    private Integer entryCount;
    
    public HydrationResponse() {}
    
    public HydrationResponse(List<HydrationEntry> entries, Integer totalAmount, Integer entryCount) {
        this.entries = entries;
        this.totalAmount = totalAmount;
        this.entryCount = entryCount;
    }
    
    public List<HydrationEntry> getEntries() {
        return entries;
    }
    
    public void setEntries(List<HydrationEntry> entries) {
        this.entries = entries;
    }
    
    public Integer getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(Integer totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public Integer getEntryCount() {
        return entryCount;
    }
    
    public void setEntryCount(Integer entryCount) {
        this.entryCount = entryCount;
    }
    
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private List<HydrationEntry> entries;
        private Integer totalAmount;
        private Integer entryCount;
        
        public Builder entries(List<HydrationEntry> entries) {
            this.entries = entries;
            return this;
        }
        
        public Builder totalAmount(Integer totalAmount) {
            this.totalAmount = totalAmount;
            return this;
        }
        
        public Builder entryCount(Integer entryCount) {
            this.entryCount = entryCount;
            return this;
        }
        
        public HydrationResponse build() {
            return new HydrationResponse(entries, totalAmount, entryCount);
        }
    }
} 