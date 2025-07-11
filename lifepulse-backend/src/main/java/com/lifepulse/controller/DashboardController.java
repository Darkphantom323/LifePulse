package com.lifepulse.controller;

import com.lifepulse.dto.ApiResponse;
import com.lifepulse.dto.dashboard.DashboardResponse;
import com.lifepulse.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        try {
            String userId = getCurrentUserId();
            DashboardResponse dashboard = dashboardService.getDashboardData(userId);
            return ResponseEntity.ok(ApiResponse.success(dashboard));
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