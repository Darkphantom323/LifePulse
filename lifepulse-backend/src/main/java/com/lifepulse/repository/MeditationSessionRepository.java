package com.lifepulse.repository;

import com.lifepulse.entity.MeditationSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MeditationSessionRepository extends MongoRepository<MeditationSession, String> {
    
    List<MeditationSession> findByUserIdOrderByTimestampDesc(String userId);
    
    List<MeditationSession> findByUserIdAndTimestampBetween(String userId, LocalDateTime start, LocalDateTime end);
    
    List<MeditationSession> findByUserIdAndTimestampBetweenOrderByTimestampDesc(String userId, LocalDateTime start, LocalDateTime end);
    
    @Query(value = "{ 'userId': ?0, 'timestamp': { $gte: ?1, $lte: ?2 } }", fields = "{ 'duration': 1 }")
    List<MeditationSession> findDurationsByUserIdAndDateRange(String userId, LocalDateTime start, LocalDateTime end);
} 