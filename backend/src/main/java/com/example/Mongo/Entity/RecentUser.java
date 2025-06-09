package com.example.Mongo.Entity;

import java.time.LocalDate;

public class RecentUser {
    private String id;
    private String name;
    private String email;
    private LocalDate signupDate;

    public RecentUser() {
    }

    public RecentUser(String id, String name, String email, LocalDate signupDate) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.signupDate = signupDate;
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

    public LocalDate getSignupDate() {
        return signupDate;
    }

    public void setSignupDate(LocalDate signupDate) {
        this.signupDate = signupDate;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}