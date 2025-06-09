package com.example.Mongo.Dto;

import java.time.LocalDate;
import java.util.List;


public class UserStatsDTO {

    private long totalUsers;
    private long premiumUsers;
    private long regularUsers;
    private List<MonthlySignup> monthlySignups;
    private List<RecentUser> recentSignups;

    // Getters et Setters

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getPremiumUsers() {
        return premiumUsers;
    }

    public void setPremiumUsers(long premiumUsers) {
        this.premiumUsers = premiumUsers;
    }

    public long getRegularUsers() {
        return regularUsers;
    }

    public void setRegularUsers(long regularUsers) {
        this.regularUsers = regularUsers;
    }

    public List<MonthlySignup> getMonthlySignups() {
        return monthlySignups;
    }

    public void setMonthlySignups(List<MonthlySignup> monthlySignups) {
        this.monthlySignups = monthlySignups;
    }

    public List<RecentUser> getRecentSignups() {
        return recentSignups;
    }

    public void setRecentSignups(List<RecentUser> recentSignups) {
        this.recentSignups = recentSignups;
    }

    // Classe statique pour les inscriptions mensuelles
    public static class MonthlySignup {
        private String month;
        private long count;

        public MonthlySignup(String month, long count) {
            this.month = month;
            this.count = count;
        }

        public String getMonth() {
            return month;
        }

        public void setMonth(String month) {
            this.month = month;
        }

        public long getCount() {
            return count;
        }

        public void setCount(long count) {
            this.count = count;
        }
    }

    // Classe statique pour les utilisateurs récents
    public static class RecentUser {
        private String id;
        private String fullName;
        private String email;
        private LocalDate signupDate;

        public RecentUser(String id, String fullName, String email, LocalDate signupDate) {
            this.id = id;
            this.fullName = fullName;
            this.email = email;
            this.signupDate = signupDate;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public LocalDate getSignupDate() {
            return signupDate;
        }

        public void setSignupDate(LocalDate signupDate) {
            this.signupDate = signupDate;
        }
    }
}