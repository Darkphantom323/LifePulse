package com.lifepulse.dto.schedule;

import com.lifepulse.entity.ScheduleEvent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class ScheduleEventRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalDateTime endTime;
    
    @NotNull(message = "Category is required")
    private ScheduleEvent.EventCategory category;
    
    private ScheduleEvent.EventPriority priority;
    
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
    
    public LocalDateTime getStartTime() {
        return startTime;
    }
    
    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }
    
    public LocalDateTime getEndTime() {
        return endTime;
    }
    
    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }
    
    public ScheduleEvent.EventCategory getCategory() {
        return category;
    }
    
    public void setCategory(ScheduleEvent.EventCategory category) {
        this.category = category;
    }
    
    public ScheduleEvent.EventPriority getPriority() {
        return priority;
    }
    
    public void setPriority(ScheduleEvent.EventPriority priority) {
        this.priority = priority;
    }
} 