package com.lifepulse.service;

import com.lifepulse.dto.schedule.ScheduleEventRequest;
import com.lifepulse.entity.ScheduleEvent;
import com.lifepulse.repository.ScheduleEventRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class ScheduleService {
    
    private final ScheduleEventRepository scheduleRepository;
    
    public ScheduleService(ScheduleEventRepository scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }
    
    public ScheduleEvent createEvent(ScheduleEventRequest request, String userId) {
        ScheduleEvent event = ScheduleEvent.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .category(request.getCategory())
                .priority(request.getPriority())
                .userId(userId)
                .build();
        
        return scheduleRepository.save(event);
    }
    
    public List<ScheduleEvent> getUserEvents(String userId) {
        return scheduleRepository.findByUserIdOrderByStartTime(userId);
    }
    
    public List<ScheduleEvent> getUpcomingEvents(String userId) {
        LocalDateTime now = LocalDateTime.now();
        return scheduleRepository.findByUserIdAndStartTimeAfterOrderByStartTime(userId, now);
    }
    
    public Optional<ScheduleEvent> getEvent(String eventId, String userId) {
        return scheduleRepository.findByIdAndUserId(eventId, userId);
    }
    
    public ScheduleEvent updateEvent(String eventId, ScheduleEventRequest request, String userId) {
        ScheduleEvent event = scheduleRepository.findByIdAndUserId(eventId, userId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setCategory(request.getCategory());
        event.setPriority(request.getPriority());
        
        return scheduleRepository.save(event);
    }
    
    public void deleteEvent(String eventId, String userId) {
        ScheduleEvent event = scheduleRepository.findByIdAndUserId(eventId, userId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        scheduleRepository.delete(event);
    }

    public List<ScheduleEvent> getScheduleEvents(String userId, String startDate, String endDate) {
        if (startDate != null && endDate != null) {
            LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDate).atTime(LocalTime.MAX);
            return scheduleRepository.findEventsByUserIdAndDateRange(userId, start, end);
        } else {
            return scheduleRepository.findByUserIdOrderByStartTimeAsc(userId);
        }
    }

    public List<ScheduleEvent> getTodayEvents(String userId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        
        return scheduleRepository.findEventsByUserIdAndDateRange(userId, startOfDay, endOfDay);
    }

    public long getTodayEventsCount(String userId) {
        return getTodayEvents(userId).size();
    }

    public long getTodayUpcomingEventsCount(String userId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        
        return scheduleRepository.findEventsByUserIdAndDateRange(userId, now, endOfDay).size();
    }

    public long getTodayPastEventsCount(String userId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime now = LocalDateTime.now();
        
        return scheduleRepository.findEventsByUserIdAndDateRange(userId, startOfDay, now).size();
    }
} 