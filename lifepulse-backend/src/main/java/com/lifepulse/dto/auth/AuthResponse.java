package com.lifepulse.dto.auth;

public class AuthResponse {
    private String token;
    private String id;
    private String name;
    private String email;
    
    public AuthResponse() {}
    
    public AuthResponse(String token, String id, String name, String email) {
        this.token = token;
        this.id = id;
        this.name = name;
        this.email = email;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private String token;
        private String id;
        private String name;
        private String email;
        
        public Builder token(String token) {
            this.token = token;
            return this;
        }
        
        public Builder id(String id) {
            this.id = id;
            return this;
        }
        
        public Builder name(String name) {
            this.name = name;
            return this;
        }
        
        public Builder email(String email) {
            this.email = email;
            return this;
        }
        
        public AuthResponse build() {
            return new AuthResponse(token, id, name, email);
        }
    }
} 