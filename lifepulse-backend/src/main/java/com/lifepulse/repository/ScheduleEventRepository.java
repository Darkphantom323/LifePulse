package com.lifepulse.repository;

import com.lifepulse.entity.ScheduleEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleEventRepository extends MongoRepository<ScheduleEvent, String> {
    
    List<ScheduleEvent> findByUserIdOrderByStartTime(String userId);
    
    List<ScheduleEvent> findByUserIdOrderByStartTimeAsc(String userId);
    
    List<ScheduleEvent> findByUserIdAndStartTimeAfterOrderByStartTime(String userId, LocalDateTime after);
    
    Optional<ScheduleEvent> findByIdAndUserId(String eventId, String userId);
    
    List<ScheduleEvent> findByUserIdAndStartTimeBetweenOrderByStartTimeAsc(String userId, LocalDateTime start, LocalDateTime end);
    
    @Query("{ 'userId': ?0, 'startTime': { $gte: ?1 } }")
    List<ScheduleEvent> findUpcomingEventsByUserId(String userId, LocalDateTime now);
    
    @Query("{ 'userId': ?0, 'startTime': { $gte: ?1, $lte: ?2 } }")
    List<ScheduleEvent> findEventsByUserIdAndDateRange(String userId, LocalDateTime start, LocalDateTime end);
} 