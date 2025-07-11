package com.lifepulse.repository;

import com.lifepulse.entity.Goal;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface GoalRepository extends MongoRepository<Goal, String> {
    
    List<Goal> findByUserId(String userId);
    
    Optional<Goal> findByIdAndUserId(String goalId, String userId);
    
    List<Goal> findByUserIdOrderByCreatedAtDesc(String userId);
    
    List<Goal> findByUserIdAndCompletedOrderByCreatedAtDesc(String userId, boolean completed);
    
    List<Goal> findByUserIdAndDeadlineBetweenOrderByDeadlineAsc(String userId, LocalDateTime start, LocalDateTime end);
    
    @Query("{ 'userId': ?0, 'deadline': { $gte: ?1 }, 'completed': false }")
    List<Goal> findUpcomingGoalsByUserId(String userId, LocalDateTime now);
    
    long countByUserIdAndCompleted(String userId, boolean completed);
} 