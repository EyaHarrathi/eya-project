package com.example.Mongo.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "settings")
public class Settings {
    @Id
    private String id;

    // General settings
    private String applicationName;
    private String email;
    private String phone;
    private String address;

    // Social media
    private String facebookLink;
    private String twitterLink;
    private String instagramLink;
    private String linkedinLink;

    // Footer
    private String copyright;

    // Admin settings
    private String adminEmailDomain;
    private Integer adminPasswordMinLength;
    private Boolean adminRequireStrongPassword;
    private Integer adminAccountExpiration;
    private Integer adminSessionTimeout;
    private Integer adminMaxLoginAttempts;
    private Integer adminLockoutDuration;
    private String adminDefaultRole;
    private Boolean adminMustVerifyEmail;
    private Boolean adminCanCreateUsers;
    private Boolean adminNotifyOnNewUser;
    private String adminNotifyEmail;
    private String adminTermsUrl;
    private String adminPrivacyUrl;

    // Theme settings
    private String defaultTheme;
    private String primaryColor;
    private String secondaryColor;
    private String accentColor;
    private Boolean allowUserThemeChange;
    private Boolean useDarkHeader;
    private Boolean useDarkSidebar;

    // Default constructor
    public Settings() {
        // Set default values
        this.applicationName = "EcoMarket";
        this.email = "contact@ecomarket.com";
        this.phone = "+33 1 23 45 67 89";
        this.address = "123 Rue du Commerce, Paris";

        this.facebookLink = "#";
        this.twitterLink = "#";
        this.instagramLink = "#";
        this.linkedinLink = "#";

        this.copyright = "2025 EcoMarket. Tous droits réservés.";

        this.adminEmailDomain = "ecomarket.com";
        this.adminPasswordMinLength = 8;
        this.adminRequireStrongPassword = true;
        this.adminAccountExpiration = 0;
        this.adminSessionTimeout = 60;
        this.adminMaxLoginAttempts = 5;
        this.adminLockoutDuration = 30;
        this.adminDefaultRole = "ADMIN";
        this.adminMustVerifyEmail = true;
        this.adminCanCreateUsers = true;
        this.adminNotifyOnNewUser = true;
        this.adminNotifyEmail = "admin@ecomarket.com";
        this.adminTermsUrl = "/terms";
        this.adminPrivacyUrl = "/privacy";

        this.defaultTheme = "light";
        this.primaryColor = "#2563eb";
        this.secondaryColor = "#1e40af";
        this.accentColor = "#10b981";
        this.allowUserThemeChange = true;
        this.useDarkHeader = false;
        this.useDarkSidebar = false;
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getApplicationName() {
        return applicationName;
    }

    public void setApplicationName(String applicationName) {
        this.applicationName = applicationName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getFacebookLink() {
        return facebookLink;
    }

    public void setFacebookLink(String facebookLink) {
        this.facebookLink = facebookLink;
    }

    public String getTwitterLink() {
        return twitterLink;
    }

    public void setTwitterLink(String twitterLink) {
        this.twitterLink = twitterLink;
    }

    public String getInstagramLink() {
        return instagramLink;
    }

    public void setInstagramLink(String instagramLink) {
        this.instagramLink = instagramLink;
    }

    public String getLinkedinLink() {
        return linkedinLink;
    }

    public void setLinkedinLink(String linkedinLink) {
        this.linkedinLink = linkedinLink;
    }

    public String getCopyright() {
        return copyright;
    }

    public void setCopyright(String copyright) {
        this.copyright = copyright;
    }

    public String getAdminEmailDomain() {
        return adminEmailDomain;
    }

    public void setAdminEmailDomain(String adminEmailDomain) {
        this.adminEmailDomain = adminEmailDomain;
    }

    public Integer getAdminPasswordMinLength() {
        return adminPasswordMinLength;
    }

    public void setAdminPasswordMinLength(Integer adminPasswordMinLength) {
        this.adminPasswordMinLength = adminPasswordMinLength;
    }

    public Boolean getAdminRequireStrongPassword() {
        return adminRequireStrongPassword;
    }

    public void setAdminRequireStrongPassword(Boolean adminRequireStrongPassword) {
        this.adminRequireStrongPassword = adminRequireStrongPassword;
    }

    public Integer getAdminAccountExpiration() {
        return adminAccountExpiration;
    }

    public void setAdminAccountExpiration(Integer adminAccountExpiration) {
        this.adminAccountExpiration = adminAccountExpiration;
    }

    public Integer getAdminSessionTimeout() {
        return adminSessionTimeout;
    }

    public void setAdminSessionTimeout(Integer adminSessionTimeout) {
        this.adminSessionTimeout = adminSessionTimeout;
    }

    public Integer getAdminMaxLoginAttempts() {
        return adminMaxLoginAttempts;
    }

    public void setAdminMaxLoginAttempts(Integer adminMaxLoginAttempts) {
        this.adminMaxLoginAttempts = adminMaxLoginAttempts;
    }

    public Integer getAdminLockoutDuration() {
        return adminLockoutDuration;
    }

    public void setAdminLockoutDuration(Integer adminLockoutDuration) {
        this.adminLockoutDuration = adminLockoutDuration;
    }

    public String getAdminDefaultRole() {
        return adminDefaultRole;
    }

    public void setAdminDefaultRole(String adminDefaultRole) {
        this.adminDefaultRole = adminDefaultRole;
    }

    public Boolean getAdminMustVerifyEmail() {
        return adminMustVerifyEmail;
    }

    public void setAdminMustVerifyEmail(Boolean adminMustVerifyEmail) {
        this.adminMustVerifyEmail = adminMustVerifyEmail;
    }

    public Boolean getAdminCanCreateUsers() {
        return adminCanCreateUsers;
    }

    public void setAdminCanCreateUsers(Boolean adminCanCreateUsers) {
        this.adminCanCreateUsers = adminCanCreateUsers;
    }

    public Boolean getAdminNotifyOnNewUser() {
        return adminNotifyOnNewUser;
    }

    public void setAdminNotifyOnNewUser(Boolean adminNotifyOnNewUser) {
        this.adminNotifyOnNewUser = adminNotifyOnNewUser;
    }

    public String getAdminNotifyEmail() {
        return adminNotifyEmail;
    }

    public void setAdminNotifyEmail(String adminNotifyEmail) {
        this.adminNotifyEmail = adminNotifyEmail;
    }

    public String getAdminTermsUrl() {
        return adminTermsUrl;
    }

    public void setAdminTermsUrl(String adminTermsUrl) {
        this.adminTermsUrl = adminTermsUrl;
    }

    public String getAdminPrivacyUrl() {
        return adminPrivacyUrl;
    }

    public void setAdminPrivacyUrl(String adminPrivacyUrl) {
        this.adminPrivacyUrl = adminPrivacyUrl;
    }

    public String getDefaultTheme() {
        return defaultTheme;
    }

    public void setDefaultTheme(String defaultTheme) {
        this.defaultTheme = defaultTheme;
    }

    public String getPrimaryColor() {
        return primaryColor;
    }

    public void setPrimaryColor(String primaryColor) {
        this.primaryColor = primaryColor;
    }

    public String getSecondaryColor() {
        return secondaryColor;
    }

    public void setSecondaryColor(String secondaryColor) {
        this.secondaryColor = secondaryColor;
    }

    public String getAccentColor() {
        return accentColor;
    }

    public void setAccentColor(String accentColor) {
        this.accentColor = accentColor;
    }

    public Boolean getAllowUserThemeChange() {
        return allowUserThemeChange;
    }

    public void setAllowUserThemeChange(Boolean allowUserThemeChange) {
        this.allowUserThemeChange = allowUserThemeChange;
    }

    public Boolean getUseDarkHeader() {
        return useDarkHeader;
    }

    public void setUseDarkHeader(Boolean useDarkHeader) {
        this.useDarkHeader = useDarkHeader;
    }

    public Boolean getUseDarkSidebar() {
        return useDarkSidebar;
    }

    public void setUseDarkSidebar(Boolean useDarkSidebar) {
        this.useDarkSidebar = useDarkSidebar;
    }
}
