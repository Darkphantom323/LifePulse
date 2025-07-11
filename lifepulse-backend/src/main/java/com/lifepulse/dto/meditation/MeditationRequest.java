package com.lifepulse.dto.meditation;

import com.lifepulse.entity.MeditationSession;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

public class MeditationRequest {
    
    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be positive")
    private Integer duration;
    
    @NotNull(message = "Type is required")
    private MeditationSession.MeditationType type;
    
    private String notes;
    
    public MeditationRequest() {}
    
    public MeditationRequest(Integer duration, MeditationSession.MeditationType type, String notes) {
        this.duration = duration;
        this.type = type;
        this.notes = notes;
    }
    
    public Integer getDuration() {
        return duration;
    }
    
    public void setDuration(Integer duration) {
        this.duration = duration;
    }
    
    public MeditationSession.MeditationType getType() {
        return type;
    }
    
    public void setType(MeditationSession.MeditationType type) {
        this.type = type;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
} 