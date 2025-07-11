package com.lifepulse.repository;

import com.lifepulse.entity.HydrationEntry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HydrationEntryRepository extends MongoRepository<HydrationEntry, String> {
    
    List<HydrationEntry> findByUserIdOrderByTimestampDesc(String userId);
    
    List<HydrationEntry> findByUserIdAndTimestampBetween(String userId, LocalDateTime start, LocalDateTime end);
    
    List<HydrationEntry> findByUserIdAndTimestampBetweenOrderByTimestampDesc(String userId, LocalDateTime start, LocalDateTime end);
    
    @Query("{ 'userId': ?0, 'timestamp': { $gte: ?1, $lte: ?2 } }")
    List<HydrationEntry> findByUserIdAndDateRange(String userId, LocalDateTime start, LocalDateTime end);
    
    HydrationEntry findFirstByUserIdOrderByTimestampDesc(String userId);
} 