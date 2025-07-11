package com.lifepulse.service;

import com.lifepulse.dto.hydration.HydrationRequest;
import com.lifepulse.dto.hydration.HydrationResponse;
import com.lifepulse.entity.HydrationEntry;
import com.lifepulse.repository.HydrationEntryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class HydrationService {
    
    private final HydrationEntryRepository hydrationRepository;
    
    public HydrationService(HydrationEntryRepository hydrationRepository) {
        this.hydrationRepository = hydrationRepository;
    }
    
    public HydrationEntry addEntry(HydrationRequest request, String userId) {
        HydrationEntry entry = HydrationEntry.builder()
                .amount(request.getAmount())
                .userId(userId)
                .build();
        
        return hydrationRepository.save(entry);
    }
    
    public List<HydrationEntry> getTodayEntries(String userId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return hydrationRepository.findByUserIdAndTimestampBetween(userId, startOfDay, endOfDay);
    }
    
    public HydrationResponse getDayStats(String userId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        List<HydrationEntry> entries = hydrationRepository.findByUserIdAndTimestampBetween(userId, startOfDay, endOfDay);
        
        int totalAmount = entries.stream()
                .mapToInt(HydrationEntry::getAmount)
                .sum();
        
        return HydrationResponse.builder()
                .entries(entries)
                .totalAmount(totalAmount)
                .entryCount(entries.size())
                .build();
    }
    
    public void deleteEntry(String entryId, String userId) {
        HydrationEntry entry = hydrationRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Entry not found"));
        
        if (!entry.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access");
        }
        
        hydrationRepository.delete(entry);
    }

    public HydrationResponse getHydrationEntries(String userId, Boolean today, String startDate, String endDate) {
        List<HydrationEntry> entries;
        
        if (today != null && today) {
            // Get today's entries
            LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
            LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
            entries = hydrationRepository.findByUserIdAndTimestampBetweenOrderByTimestampDesc(
                    userId, startOfDay, endOfDay);
        } else if (startDate != null && endDate != null) {
            // Get entries for date range
            LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDate).atTime(LocalTime.MAX);
            entries = hydrationRepository.findByUserIdAndTimestampBetweenOrderByTimestampDesc(
                    userId, start, end);
        } else {
            // Get all entries
            entries = hydrationRepository.findByUserIdOrderByTimestampDesc(userId);
        }

        int totalAmount = entries.stream()
                .mapToInt(entry -> entry.getAmount())
                .sum();

        return HydrationResponse.builder()
                .entries(entries)
                .totalAmount(totalAmount)
                .entryCount(entries.size())
                .build();
    }

    public void deleteLastHydrationEntry(String userId) {
        HydrationEntry lastEntry = hydrationRepository.findFirstByUserIdOrderByTimestampDesc(userId);
        if (lastEntry != null) {
            hydrationRepository.delete(lastEntry);
        } else {
            throw new RuntimeException("No hydration entries found to delete");
        }
    }

    public int getTodayHydrationAmount(String userId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        
        List<HydrationEntry> todayEntries = hydrationRepository
                .findByUserIdAndTimestampBetweenOrderByTimestampDesc(userId, startOfDay, endOfDay);
        
        return todayEntries.stream()
                .mapToInt(entry -> entry.getAmount())
                .sum();
    }

    public List<HydrationEntry> getTodayHydrationEntries(String userId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        
        return hydrationRepository
                .findByUserIdAndTimestampBetweenOrderByTimestampDesc(userId, startOfDay, endOfDay);
    }
} 