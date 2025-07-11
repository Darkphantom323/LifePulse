package com.lifepulse.controller;

import com.lifepulse.dto.ApiResponse;
import com.lifepulse.dto.goal.GoalProgressRequest;
import com.lifepulse.dto.goal.GoalRequest;
import com.lifepulse.entity.Goal;
import com.lifepulse.service.GoalService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class GoalController {
    
    private final GoalService goalService;
    
    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<Goal>> createGoal(@Valid @RequestBody GoalRequest request) {
        try {
            String userId = getCurrentUserId();
            Goal goal = goalService.createGoal(request, userId);
            return ResponseEntity.ok(ApiResponse.success(goal, "Goal created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<Goal>>> getAllGoals() {
        try {
            String userId = getCurrentUserId();
            List<Goal> goals = goalService.getUserGoals(userId);
            return ResponseEntity.ok(ApiResponse.success(goals));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Goal>> getGoal(@PathVariable String id) {
        try {
            String userId = getCurrentUserId();
            Goal goal = goalService.getGoal(id, userId)
                    .orElseThrow(() -> new RuntimeException("Goal not found"));
            return ResponseEntity.ok(ApiResponse.success(goal));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Goal>> updateGoal(@PathVariable String id, @Valid @RequestBody GoalRequest request) {
        try {
            String userId = getCurrentUserId();
            Goal goal = goalService.updateGoal(id, request, userId);
            return ResponseEntity.ok(ApiResponse.success(goal, "Goal updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/progress")
    public ResponseEntity<ApiResponse<Goal>> updateGoalProgress(@PathVariable String id, @Valid @RequestBody GoalProgressRequest request) {
        try {
            String userId = getCurrentUserId();
            Goal goal = goalService.updateGoalProgress(id, request, userId);
            return ResponseEntity.ok(ApiResponse.success(goal, "Goal progress updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/progress")
    public ResponseEntity<ApiResponse<Goal>> updateGoalProgressPost(@PathVariable String id, @Valid @RequestBody GoalProgressRequest request) {
        try {
            String userId = getCurrentUserId();
            Goal goal = goalService.updateGoalProgress(id, request, userId);
            return ResponseEntity.ok(ApiResponse.success(goal, "Goal progress updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(@PathVariable String id) {
        try {
            String userId = getCurrentUserId();
            goalService.deleteGoal(id, userId);
            return ResponseEntity.ok(ApiResponse.success(null, "Goal deleted successfully"));
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