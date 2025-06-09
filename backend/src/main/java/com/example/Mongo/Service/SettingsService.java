package com.example.Mongo.Service;

import com.example.Mongo.Entity.Settings;
import com.example.Mongo.Repository.SettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.reflect.Field;
import java.util.Optional;

@Service
public class SettingsService {

    @Autowired
    private SettingsRepository settingsRepository;

    // Get all settings, create default if none exist
    public Settings getAllSettings() {
        Optional<Settings> settings = settingsRepository.findAll().stream().findFirst();
        return settings.orElseGet(() -> {
            Settings defaultSettings = new Settings();
            return settingsRepository.save(defaultSettings);
        });
    }

    // Update all settings
    public Settings updateAllSettings(Settings settings) {
        Settings currentSettings = getAllSettings();
        settings.setId(currentSettings.getId());
        return settingsRepository.save(settings);
    }

    // Get setting by key
    public Object getSettingByKey(String key) {
        Settings settings = getAllSettings();
        try {
            Field field = Settings.class.getDeclaredField(key);
            field.setAccessible(true);
            return field.get(settings);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            throw new RuntimeException("Setting not found: " + key, e);
        }
    }

    // Update setting by key
    public Settings updateSettingByKey(String key, Object value) {
        Settings settings = getAllSettings();
        try {
            Field field = Settings.class.getDeclaredField(key);
            field.setAccessible(true);
            field.set(settings, value);
            return settingsRepository.save(settings);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            throw new RuntimeException("Failed to update setting: " + key, e);
        }
    }

    // Reset to defaults
    public Settings resetToDefaults() {
        Settings currentSettings = getAllSettings();
        settingsRepository.delete(currentSettings);
        return settingsRepository.save(new Settings());
    }
}
