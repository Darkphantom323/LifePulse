package com.lifepulse.dto.dashboard;

import com.lifepulse.entity.Goal;
import com.lifepulse.entity.ScheduleEvent;
import java.util.List;

public class DashboardResponse {
    private TodayStats today;
    private List<Goal> recentGoals;
    private List<ScheduleEvent> upcomingEvents;
    
    public DashboardResponse() {}
    
    public DashboardResponse(TodayStats today, List<Goal> recentGoals, List<ScheduleEvent> upcomingEvents) {
        this.today = today;
        this.recentGoals = recentGoals;
        this.upcomingEvents = upcomingEvents;
    }
    
    public TodayStats getToday() {
        return today;
    }
    
    public void setToday(TodayStats today) {
        this.today = today;
    }
    
    public List<Goal> getRecentGoals() {
        return recentGoals;
    }
    
    public void setRecentGoals(List<Goal> recentGoals) {
        this.recentGoals = recentGoals;
    }
    
    public List<ScheduleEvent> getUpcomingEvents() {
        return upcomingEvents;
    }
    
    public void setUpcomingEvents(List<ScheduleEvent> upcomingEvents) {
        this.upcomingEvents = upcomingEvents;
    }
    
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private TodayStats today;
        private List<Goal> recentGoals;
        private List<ScheduleEvent> upcomingEvents;
        
        public Builder today(TodayStats today) {
            this.today = today;
            return this;
        }
        
        public Builder recentGoals(List<Goal> recentGoals) {
            this.recentGoals = recentGoals;
            return this;
        }
        
        public Builder upcomingEvents(List<ScheduleEvent> upcomingEvents) {
            this.upcomingEvents = upcomingEvents;
            return this;
        }
        
        public DashboardResponse build() {
            return new DashboardResponse(today, recentGoals, upcomingEvents);
        }
    }
    
    public static class TodayStats {
        private GoalStats goals;
        private HydrationStats hydration;
        private MeditationStats meditation;
        private ScheduleStats schedule;
        
        public TodayStats() {}
        
        public TodayStats(GoalStats goals, HydrationStats hydration, MeditationStats meditation, ScheduleStats schedule) {
            this.goals = goals;
            this.hydration = hydration;
            this.meditation = meditation;
            this.schedule = schedule;
        }
        
        public GoalStats getGoals() {
            return goals;
        }
        
        public void setGoals(GoalStats goals) {
            this.goals = goals;
        }
        
        public HydrationStats getHydration() {
            return hydration;
        }
        
        public void setHydration(HydrationStats hydration) {
            this.hydration = hydration;
        }
        
        public MeditationStats getMeditation() {
            return meditation;
        }
        
        public void setMeditation(MeditationStats meditation) {
            this.meditation = meditation;
        }
        
        public ScheduleStats getSchedule() {
            return schedule;
        }
        
        public void setSchedule(ScheduleStats schedule) {
            this.schedule = schedule;
        }
        
        public static Builder builder() {
            return new Builder();
        }
        
        public static class Builder {
            private GoalStats goals;
            private HydrationStats hydration;
            private MeditationStats meditation;
            private ScheduleStats schedule;
            
            public Builder goals(GoalStats goals) {
                this.goals = goals;
                return this;
            }
            
            public Builder hydration(HydrationStats hydration) {
                this.hydration = hydration;
                return this;
            }
            
            public Builder meditation(MeditationStats meditation) {
                this.meditation = meditation;
                return this;
            }
            
            public Builder schedule(ScheduleStats schedule) {
                this.schedule = schedule;
                return this;
            }
            
            public TodayStats build() {
                return new TodayStats(goals, hydration, meditation, schedule);
            }
        }
    }
    
    public static class GoalStats {
        private long total;
        private long completed;
        private long active;
        private double percentage;
        
        public GoalStats() {}
        
        public GoalStats(long total, long completed, long active, double percentage) {
            this.total = total;
            this.completed = completed;
            this.active = active;
            this.percentage = percentage;
        }
        
        public long getTotal() {
            return total;
        }
        
        public void setTotal(long total) {
            this.total = total;
        }
        
        public long getCompleted() {
            return completed;
        }
        
        public void setCompleted(long completed) {
            this.completed = completed;
        }
        
        public long getActive() {
            return active;
        }
        
        public void setActive(long active) {
            this.active = active;
        }
        
        public double getPercentage() {
            return percentage;
        }
        
        public void setPercentage(double percentage) {
            this.percentage = percentage;
        }
        
        public static Builder builder() {
            return new Builder();
        }
        
        public static class Builder {
            private long total;
            private long completed;
            private long active;
            private double percentage;
            
            public Builder total(long total) {
                this.total = total;
                return this;
            }
            
            public Builder completed(long completed) {
                this.completed = completed;
                return this;
            }
            
            public Builder active(long active) {
                this.active = active;
                return this;
            }
            
            public Builder percentage(double percentage) {
                this.percentage = percentage;
                return this;
            }
            
            public GoalStats build() {
                return new GoalStats(total, completed, active, percentage);
            }
        }
    }
    
    public static class HydrationStats {
        private int amount;
        private int goal;
        private double percentage;
        
        public HydrationStats() {}
        
        public HydrationStats(int amount, int goal, double percentage) {
            this.amount = amount;
            this.goal = goal;
            this.percentage = percentage;
        }
        
        public int getAmount() {
            return amount;
        }
        
        public void setAmount(int amount) {
            this.amount = amount;
        }
        
        public int getGoal() {
            return goal;
        }
        
        public void setGoal(int goal) {
            this.goal = goal;
        }
        
        public double getPercentage() {
            return percentage;
        }
        
        public void setPercentage(double percentage) {
            this.percentage = percentage;
        }
        
        public static Builder builder() {
            return new Builder();
        }
        
        public static class Builder {
            private int amount;
            private int goal;
            private double percentage;
            
            public Builder amount(int amount) {
                this.amount = amount;
                return this;
            }
            
            public Builder goal(int goal) {
                this.goal = goal;
                return this;
            }
            
            public Builder percentage(double percentage) {
                this.percentage = percentage;
                return this;
            }
            
            public HydrationStats build() {
                return new HydrationStats(amount, goal, percentage);
            }
        }
    }
    
    public static class MeditationStats {
        private int minutes;
        private int sessions;
        private int goal;
        
        public MeditationStats() {}
        
        public MeditationStats(int minutes, int sessions, int goal) {
            this.minutes = minutes;
            this.sessions = sessions;
            this.goal = goal;
        }
        
        public int getMinutes() {
            return minutes;
        }
        
        public void setMinutes(int minutes) {
            this.minutes = minutes;
        }
        
        public int getSessions() {
            return sessions;
        }
        
        public void setSessions(int sessions) {
            this.sessions = sessions;
        }
        
        public int getGoal() {
            return goal;
        }
        
        public void setGoal(int goal) {
            this.goal = goal;
        }
        
        public static Builder builder() {
            return new Builder();
        }
        
        public static class Builder {
            private int minutes;
            private int sessions;
            private int goal;
            
            public Builder minutes(int minutes) {
                this.minutes = minutes;
                return this;
            }
            
            public Builder sessions(int sessions) {
                this.sessions = sessions;
                return this;
            }
            
            public Builder goal(int goal) {
                this.goal = goal;
                return this;
            }
            
            public MeditationStats build() {
                return new MeditationStats(minutes, sessions, goal);
            }
        }
    }
    
    public static class ScheduleStats {
        private long total;
        private long upcoming;
        private long past;
        
        public ScheduleStats() {}
        
        public ScheduleStats(long total, long upcoming, long past) {
            this.total = total;
            this.upcoming = upcoming;
            this.past = past;
        }
        
        public long getTotal() {
            return total;
        }
        
        public void setTotal(long total) {
            this.total = total;
        }
        
        public long getUpcoming() {
            return upcoming;
        }
        
        public void setUpcoming(long upcoming) {
            this.upcoming = upcoming;
        }
        
        public long getPast() {
            return past;
        }
        
        public void setPast(long past) {
            this.past = past;
        }
        
        public static Builder builder() {
            return new Builder();
        }
        
        public static class Builder {
            private long total;
            private long upcoming;
            private long past;
            
            public Builder total(long total) {
                this.total = total;
                return this;
            }
            
            public Builder upcoming(long upcoming) {
                this.upcoming = upcoming;
                return this;
            }
            
            public Builder past(long past) {
                this.past = past;
                return this;
            }
            
            public ScheduleStats build() {
                return new ScheduleStats(total, upcoming, past);
            }
        }
    }
} 