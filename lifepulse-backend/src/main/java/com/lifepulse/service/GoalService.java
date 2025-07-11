package com.lifepulse.service;

import com.lifepulse.dto.goal.GoalProgressRequest;
import com.lifepulse.dto.goal.GoalRequest;
import com.lifepulse.entity.Goal;
import com.lifepulse.repository.GoalRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class GoalService {
    
    private final GoalRepository goalRepository;
    
    public GoalService(GoalRepository goalRepository) {
        this.goalRepository = goalRepository;
    }
    
    public List<Goal> getAllGoalsByUserId(String userId) {
        return goalRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public Goal createGoal(GoalRequest request, String userId) {
        Goal goal = Goal.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .targetValue(request.getTargetValue())
                .unit(request.getUnit())
                .deadline(request.getDeadline())
                .priority(request.getPriority())
                .userId(userId)
                .build();
        
        return goalRepository.save(goal);
    }
    
    public List<Goal> getUserGoals(String userId) {
        return goalRepository.findByUserId(userId);
    }
    
    public Optional<Goal> getGoal(String goalId, String userId) {
        return goalRepository.findByIdAndUserId(goalId, userId);
    }
    
    public Goal updateGoal(String goalId, GoalRequest request, String userId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        
        goal.setTitle(request.getTitle());
        goal.setDescription(request.getDescription());
        goal.setCategory(request.getCategory());
        goal.setTargetValue(request.getTargetValue());
        goal.setUnit(request.getUnit());
        goal.setDeadline(request.getDeadline());
        goal.setPriority(request.getPriority());
        
        return goalRepository.save(goal);
    }
    
    public Goal updateGoalProgress(String goalId, GoalProgressRequest request, String userId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        
        goal.setCurrentValue(request.getCurrentValue());
        if (goal.getTargetValue() != null && request.getCurrentValue() >= goal.getTargetValue()) {
            goal.setCompleted(true);
        }
        
        return goalRepository.save(goal);
    }
    
    public void deleteGoal(String goalId, String userId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        goalRepository.delete(goal);
    }
    
    public List<Goal> getCompletedGoals(String userId) {
        return goalRepository.findByUserIdAndCompletedOrderByCreatedAtDesc(userId, true);
    }
    
    public List<Goal> getPendingGoals(String userId) {
        return goalRepository.findByUserIdAndCompletedOrderByCreatedAtDesc(userId, false);
    }
    
    public List<Goal> getUpcomingGoals(String userId) {
        return goalRepository.findUpcomingGoalsByUserId(userId, LocalDateTime.now());
    }
    
    public long getCompletedGoalsCount(String userId) {
        return goalRepository.countByUserIdAndCompleted(userId, true);
    }
    
    public long getTotalGoalsCount(String userId) {
        return goalRepository.findByUserIdOrderByCreatedAtDesc(userId).size();
    }
    
    public long getActiveGoalsCount(String userId) {
        return goalRepository.countByUserIdAndCompleted(userId, false);
    }
} 