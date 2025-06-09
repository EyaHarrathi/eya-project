package com.example.Mongo.Controller;

import com.example.Mongo.Entity.Settings;
import com.example.Mongo.Service.SettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/settings")
@CrossOrigin(origins = "http://localhost:5173") // Allow frontend access
public class SettingsController {

    @Autowired
    private SettingsService settingsService;

    // Get all settings
    @GetMapping
    public ResponseEntity<Settings> getAllSettings() {
        return ResponseEntity.ok(settingsService.getAllSettings());
    }

    // Update all settings
    @PutMapping
    public ResponseEntity<Settings> updateAllSettings(@RequestBody Settings settings) {
        return ResponseEntity.ok(settingsService.updateAllSettings(settings));
    }

    // Get setting by key
    @GetMapping("/{key}")
    public ResponseEntity<Object> getSettingByKey(@PathVariable String key) {
        return ResponseEntity.ok(settingsService.getSettingByKey(key));
    }

    // Update setting by key
    @PutMapping("/{key}")
    public ResponseEntity<Settings> updateSettingByKey(
            @PathVariable String key,
            @RequestBody Map<String, Object> value) {
        return ResponseEntity.ok(settingsService.updateSettingByKey(key, value.get("value")));
    }

    // Reset settings to default
    @PostMapping("/reset")
    public ResponseEntity<Settings> resetSettings() {
        return ResponseEntity.ok(settingsService.resetToDefaults());
    }
}
