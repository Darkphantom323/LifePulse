package com.lifepulse.controller;

import com.lifepulse.dto.ApiResponse;
import com.lifepulse.dto.hydration.HydrationRequest;
import com.lifepulse.dto.hydration.HydrationResponse;
import com.lifepulse.entity.HydrationEntry;
import com.lifepulse.service.HydrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/hydration")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class HydrationController {
    
    private final HydrationService hydrationService;
    
    public HydrationController(HydrationService hydrationService) {
        this.hydrationService = hydrationService;
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<HydrationEntry>> addEntry(@Valid @RequestBody HydrationRequest request) {
        try {
            String userId = getCurrentUserId();
            HydrationEntry entry = hydrationService.addEntry(request, userId);
            return ResponseEntity.ok(ApiResponse.success(entry, "Hydration entry added successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<HydrationResponse>> getHydrationEntries(
            @RequestParam(required = false) Boolean today,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            String userId = getCurrentUserId();
            HydrationResponse response = hydrationService.getHydrationEntries(userId, today, startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<HydrationEntry>>> getTodayEntries() {
        try {
            String userId = getCurrentUserId();
            List<HydrationEntry> entries = hydrationService.getTodayEntries(userId);
            return ResponseEntity.ok(ApiResponse.success(entries));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<HydrationResponse>> getDayStats(@RequestParam(required = false) String date) {
        try {
            String userId = getCurrentUserId();
            LocalDate queryDate = date != null ? LocalDate.parse(date) : LocalDate.now();
            HydrationResponse stats = hydrationService.getDayStats(userId, queryDate);
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEntry(@PathVariable String id) {
        try {
            String userId = getCurrentUserId();
            hydrationService.deleteEntry(id, userId);
            return ResponseEntity.ok(ApiResponse.success(null, "Entry deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteLastEntry() {
        try {
            String userId = getCurrentUserId();
            hydrationService.deleteLastHydrationEntry(userId);
            return ResponseEntity.ok(ApiResponse.success(null, "Last entry deleted successfully"));
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