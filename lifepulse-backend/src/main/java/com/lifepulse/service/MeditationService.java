package com.lifepulse.service;

import com.lifepulse.dto.meditation.MeditationRequest;
import com.lifepulse.entity.MeditationSession;
import com.lifepulse.repository.MeditationSessionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class MeditationService {
    
    private final MeditationSessionRepository meditationRepository;
    
    public MeditationService(MeditationSessionRepository meditationRepository) {
        this.meditationRepository = meditationRepository;
    }
    
    public MeditationSession addSession(MeditationRequest request, String userId) {
        MeditationSession session = MeditationSession.builder()
                .duration(request.getDuration())
                .type(request.getType())
                .notes(request.getNotes())
                .userId(userId)
                .build();
        
        return meditationRepository.save(session);
    }
    
    public List<MeditationSession> getTodaySessions(String userId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return meditationRepository.findByUserIdAndTimestampBetween(userId, startOfDay, endOfDay);
    }
    
    public List<MeditationSession> getUserSessions(String userId) {
        return meditationRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    public List<MeditationSession> getUserSessions(String userId, String startDate, String endDate) {
        if (startDate != null && endDate != null) {
            LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDate).atTime(23, 59, 59);
            return meditationRepository.findByUserIdAndTimestampBetween(userId, start, end);
        } else {
            return meditationRepository.findByUserIdOrderByTimestampDesc(userId);
        }
    }
    
    public void deleteSession(String sessionId, String userId) {
        MeditationSession session = meditationRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        if (!session.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access");
        }
        
        meditationRepository.delete(session);
    }
} 