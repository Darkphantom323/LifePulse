package com.lifepulse.controller;

import com.lifepulse.dto.ApiResponse;
import com.lifepulse.dto.schedule.ScheduleEventRequest;
import com.lifepulse.entity.ScheduleEvent;
import com.lifepulse.service.ScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/schedule")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class ScheduleController {
    
    private final ScheduleService scheduleService;
    
    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<ScheduleEvent>> createEvent(@Valid @RequestBody ScheduleEventRequest request) {
        try {
            String userId = getCurrentUserId();
            ScheduleEvent event = scheduleService.createEvent(request, userId);
            return ResponseEntity.ok(ApiResponse.success(event, "Event created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<ScheduleEvent>>> getAllEvents() {
        try {
            String userId = getCurrentUserId();
            List<ScheduleEvent> events = scheduleService.getUserEvents(userId);
            return ResponseEntity.ok(ApiResponse.success(events));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<ScheduleEvent>>> getUpcomingEvents() {
        try {
            String userId = getCurrentUserId();
            List<ScheduleEvent> events = scheduleService.getUpcomingEvents(userId);
            return ResponseEntity.ok(ApiResponse.success(events));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ScheduleEvent>> getEvent(@PathVariable String id) {
        try {
            String userId = getCurrentUserId();
            ScheduleEvent event = scheduleService.getEvent(id, userId)
                    .orElseThrow(() -> new RuntimeException("Event not found"));
            return ResponseEntity.ok(ApiResponse.success(event));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ScheduleEvent>> updateEvent(@PathVariable String id, @Valid @RequestBody ScheduleEventRequest request) {
        try {
            String userId = getCurrentUserId();
            ScheduleEvent event = scheduleService.updateEvent(id, request, userId);
            return ResponseEntity.ok(ApiResponse.success(event, "Event updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable String id) {
        try {
            String userId = getCurrentUserId();
            scheduleService.deleteEvent(id, userId);
            return ResponseEntity.ok(ApiResponse.success(null, "Event deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        com.lifepulse.entity.User user = (com.lifepulse.entity.User) authentication.getPrincipal();
        return user.getId();
    }
} 