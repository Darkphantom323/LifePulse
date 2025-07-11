package com.lifepulse.service;

import com.lifepulse.dto.dashboard.DashboardResponse;
import com.lifepulse.entity.Goal;
import com.lifepulse.entity.ScheduleEvent;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
    
    private final GoalService goalService;
    private final HydrationService hydrationService;
    private final MeditationService meditationService;
    private final ScheduleService scheduleService;
    
    public DashboardService(GoalService goalService, HydrationService hydrationService,
                           MeditationService meditationService, ScheduleService scheduleService) {
        this.goalService = goalService;
        this.hydrationService = hydrationService;
        this.meditationService = meditationService;
        this.scheduleService = scheduleService;
    }
    
    public DashboardResponse getDashboardData(String userId) {
        // Get today's stats
        DashboardResponse.TodayStats todayStats = getTodayStats(userId);
        
        // Get recent goals (limit to 5)
        java.util.List<Goal> recentGoals = goalService.getUserGoals(userId).stream()
                .limit(5)
                .collect(java.util.stream.Collectors.toList());
        
        // Get upcoming events (limit to 5)
        java.util.List<ScheduleEvent> upcomingEvents = scheduleService.getUpcomingEvents(userId).stream()
                .limit(5)
                .collect(java.util.stream.Collectors.toList());
        
        return DashboardResponse.builder()
                .today(todayStats)
                .recentGoals(recentGoals)
                .upcomingEvents(upcomingEvents)
                .build();
    }
    
    private DashboardResponse.TodayStats getTodayStats(String userId) {
        // Goal stats
        long totalGoals = goalService.getTotalGoalsCount(userId);
        long completedGoals = goalService.getCompletedGoalsCount(userId);
        double goalPercentage = totalGoals > 0 ? (double) completedGoals / totalGoals * 100 : 0;
        
        DashboardResponse.GoalStats goalStats = DashboardResponse.GoalStats.builder()
                .total(totalGoals)
                .completed(completedGoals)
                .active(totalGoals - completedGoals)
                .percentage(goalPercentage)
                .build();
        
        // Hydration stats (simplified)
        int todayHydration = hydrationService.getTodayEntries(userId).stream()
                .mapToInt(entry -> entry.getAmount())
                .sum();
        int hydrationGoal = 2000; // Default goal
        double hydrationPercentage = (double) todayHydration / hydrationGoal * 100;
        
        DashboardResponse.HydrationStats hydrationStats = DashboardResponse.HydrationStats.builder()
                .amount(todayHydration)
                .goal(hydrationGoal)
                .percentage(hydrationPercentage)
                .build();
        
        // Meditation stats
        var todaySessions = meditationService.getTodaySessions(userId);
        int todayMinutes = todaySessions.stream()
                .mapToInt(session -> session.getDuration())
                .sum();
        
        DashboardResponse.MeditationStats meditationStats = DashboardResponse.MeditationStats.builder()
                .minutes(todayMinutes)
                .sessions(todaySessions.size())
                .goal(20) // Default goal
                .build();
        
        // Schedule stats
        long todayTotal = scheduleService.getTodayEventsCount(userId);
        long todayUpcoming = scheduleService.getTodayUpcomingEventsCount(userId);
        long todayPast = scheduleService.getTodayPastEventsCount(userId);
        
        DashboardResponse.ScheduleStats scheduleStats = DashboardResponse.ScheduleStats.builder()
                .total(todayTotal)
                .upcoming(todayUpcoming)
                .past(todayPast)
                .build();
        
        return DashboardResponse.TodayStats.builder()
                .goals(goalStats)
                .hydration(hydrationStats)
                .meditation(meditationStats)
                .schedule(scheduleStats)
                .build();
    }
} 