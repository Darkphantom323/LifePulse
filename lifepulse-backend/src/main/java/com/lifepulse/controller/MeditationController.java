package com.lifepulse.controller;

import com.lifepulse.dto.ApiResponse;
import com.lifepulse.dto.meditation.MeditationRequest;
import com.lifepulse.entity.MeditationSession;
import com.lifepulse.service.MeditationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/meditation")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class MeditationController {
    
    private final MeditationService meditationService;
    
    public MeditationController(MeditationService meditationService) {
        this.meditationService = meditationService;
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<MeditationSession>> addSession(@Valid @RequestBody MeditationRequest request) {
        try {
            String userId = getCurrentUserId();
            MeditationSession session = meditationService.addSession(request, userId);
            return ResponseEntity.ok(ApiResponse.success(session, "Meditation session added successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<MeditationSession>>> getAllSessions(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            String userId = getCurrentUserId();
            List<MeditationSession> sessions = meditationService.getUserSessions(userId, startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success(sessions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<MeditationSession>>> getTodaySessions() {
        try {
            String userId = getCurrentUserId();
            List<MeditationSession> sessions = meditationService.getTodaySessions(userId);
            return ResponseEntity.ok(ApiResponse.success(sessions));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSession(@PathVariable String id) {
        try {
            String userId = getCurrentUserId();
            meditationService.deleteSession(id, userId);
            return ResponseEntity.ok(ApiResponse.success(null, "Session deleted successfully"));
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