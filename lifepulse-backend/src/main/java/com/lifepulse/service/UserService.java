package com.lifepulse.service;

import com.lifepulse.dto.user.ProfileUpdateRequest;
import com.lifepulse.entity.User;
import com.lifepulse.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class UserService implements UserDetailsService {
    
    private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
    
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public User findById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElse(null);
    }

    public User updateProfile(String email, ProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }

        if (request.getBio() != null) {
            user.setBio(request.getBio().trim().isEmpty() ? null : request.getBio().trim());
        }

        if (request.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(request.getProfilePictureUrl().trim().isEmpty() ? null : request.getProfilePictureUrl().trim());
        }

        return userRepository.save(user);
    }

    public User updateStreak(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        LocalDate today = LocalDate.now();
        LocalDate lastLogin = user.getLastLoginDate();
        
        if (lastLogin == null) {
            // First login
            user.setStreak(1);
            user.setLastLoginDate(today);
        } else if (lastLogin.equals(today)) {
            // Already logged in today, no change
            return user;
        } else if (lastLogin.equals(today.minusDays(1))) {
            // Consecutive day login
            user.setStreak(user.getStreak() + 1);
            user.setLastLoginDate(today);
        } else {
            // Streak broken, reset to 1
            user.setStreak(1);
            user.setLastLoginDate(today);
        }

        return userRepository.save(user);
    }
} 