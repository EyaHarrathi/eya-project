package com.example.Mongo.Controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/strategie")
public class StrategieIAController {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String GEMINI_API_KEY = "AIzaSyBD-QPXt7B4MMlXwd7mTyEmBT8mH3JhWY8";
    private final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + GEMINI_API_KEY;

    // Cache for weekly strategies
    private final Map<String, Map<String, Object>> strategyCache = new ConcurrentHashMap<>();
    private final Map<String, LocalDate> cacheDate = new ConcurrentHashMap<>();

    @GetMapping("/{boutiqueId}")
    public ResponseEntity<Map<String, Object>> generateStrategieFromBoutique(@PathVariable String boutiqueId) {
        try {
            LocalDate today = LocalDate.now();
            String todayFormatted = today.format(DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.FRANCE));
            // Use ISO week number and year for cache key
            WeekFields weekFields = WeekFields.ISO;
            int weekNumber = today.get(weekFields.weekOfWeekBasedYear());
            int year = today.getYear();
            String cacheKey = boutiqueId + "_" + year + "_" + weekNumber;

            // Check cache for current week
            if (strategyCache.containsKey(cacheKey) && cacheDate.get(cacheKey).get(weekFields.weekOfWeekBasedYear()) == weekNumber && cacheDate.get(cacheKey).getYear() == year) {
                return ResponseEntity.ok(strategyCache.get(cacheKey));
            }

            // Fetch data
            String topProduitsUrl = "http://localhost:8080/api/boutique/" + boutiqueId + "/top-produits";
            String clientsUrl = "http://localhost:8080/api/boutique/" + boutiqueId + "/clients";
            String chiffreAffairesUrl = "http://localhost:8080/api/boutiques/" + boutiqueId + "/chiffreaffairesparmois";

            List<Map<String, Object>> topProduits = restTemplate.getForObject(topProduitsUrl, List.class);
            List<Map<String, Object>> clients = restTemplate.getForObject(clientsUrl, List.class);
            List<Map<String, Object>> caMensuel = restTemplate.getForObject(chiffreAffairesUrl, List.class);

            // Build enhanced prompt for structured response
            StringBuilder prompt = new StringBuilder();
            prompt.append("Tu es une intelligence artificielle spécialisée dans l'analyse de données commerciales. Génère une stratégie hebdomadaire pour une boutique en ligne.\n\n");
            prompt.append("IMPORTANT: Structure ta réponse EXACTEMENT comme suit:\n\n");
            prompt.append("## RÉSUMÉ\n");
            prompt.append("[Écris ici un résumé de 2-3 phrases de la situation actuelle]\n\n");
            prompt.append("## ACTIONS RECOMMANDÉES\n");
            prompt.append("Pour chaque action, utilise EXACTEMENT ce format:\n");
            prompt.append("### ACTION [numéro]\n");
            prompt.append("**Catégorie:** [sales/inventory/marketing/customer]\n");
            prompt.append("**Titre:** [titre court]\n");
            prompt.append("**Description:** [description détaillée]\n");
            prompt.append("**Priorité:** [haute/moyenne/basse]\n");
            prompt.append("**Impact:** [élevé/moyen/faible]\n\n");
            prompt.append("Génère au minimum 3 actions et au maximum 6 actions basées sur les données suivantes:\n\n");

            prompt.append("📈 **Chiffre d'affaires mensuel**:\n");
            if (caMensuel != null && !caMensuel.isEmpty()) {
                caMensuel.forEach(m -> prompt.append("- ").append(m.get("mois")).append(": ").append(m.get("valeur")).append(" EUR\n"));
            } else {
                prompt.append("- Aucune donnée disponible\n");
            }

            prompt.append("\n🏆 **Top Produits**:\n");
            if (topProduits != null && !topProduits.isEmpty()) {
                topProduits.forEach(p -> prompt.append("- ").append(p.get("nom")).append(": ").append(p.get("valeur")).append(" ventes\n"));
            } else {
                prompt.append("- Aucun produit disponible\n");
            }

            prompt.append("\n👥 **Clients**:\n");
            if (clients != null && !clients.isEmpty()) {
                clients.forEach(c -> prompt.append("- ").append(c.get("name")).append(" (").append(c.get("status")).append("), ")
                        .append("achats: ").append(c.get("spent")).append(" EUR, dernière commande: ").append(c.get("lastOrder")).append("\n"));
            } else {
                prompt.append("- Aucun client enregistré\n");
            }

            // Send to Gemini
            Map<String, Object> payload = Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(Map.of("text", prompt.toString()))
                    ))
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(GEMINI_URL, requestEntity, Map.class);

            // Parse response safely
            Map<String, Object> responseBody = response.getBody();
            if (responseBody == null || !responseBody.containsKey("candidates")) {
                return ResponseEntity.status(500).body(Map.of("error", "Réponse Gemini invalide"));
            }

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            if (candidates.isEmpty()) {
                return ResponseEntity.status(500).body(Map.of("error", "Aucune stratégie générée"));
            }

            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            if (content == null || !content.containsKey("parts")) {
                return ResponseEntity.status(500).body(Map.of("error", "Structure de réponse invalide"));
            }

            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            if (parts.isEmpty() || !parts.get(0).containsKey("text")) {
                return ResponseEntity.status(500).body(Map.of("error", "Texte de stratégie manquant"));
            }

            String strategyText = String.valueOf(parts.get(0).get("text")).trim();

            // Parse the structured response
            Map<String, Object> parsedStrategy = parseStructuredResponse(strategyText);

            // Structure response
            Map<String, Object> result = new HashMap<>();
            result.put("date", todayFormatted);
            result.put("summary", parsedStrategy.get("summary"));
            result.put("actions", parsedStrategy.get("actions")); // Changed from aiInsights to actions
            result.put("metrics", parseMetrics(strategyText));
            result.put("language", "fr");
            result.put("direction", "ltr");

            System.out.println("Generated strategy with " + ((List<?>) parsedStrategy.get("actions")).size() + " actions");

            // Cache result for the week
            strategyCache.put(cacheKey, result);
            cacheDate.put(cacheKey, today);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Erreur IA : " + e.getMessage()));
        }
    }

    @PostMapping("/translate/{boutiqueId}")
    public ResponseEntity<Map<String, Object>> translateStrategy(@PathVariable String boutiqueId, @RequestBody Map<String, Object> strategy) {
        try {
            LocalDate today = LocalDate.now();
            String todayFormatted = today.format(DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.FRANCE));
            WeekFields weekFields = WeekFields.ISO;
            int weekNumber = today.get(weekFields.weekOfWeekBasedYear());
            int year = today.getYear();
            String cacheKey = boutiqueId + "_" + year + "_" + weekNumber + "_translated";

            // Check cache for translated strategy
            if (strategyCache.containsKey(cacheKey) && cacheDate.get(cacheKey).get(weekFields.weekOfWeekBasedYear()) == weekNumber && cacheDate.get(cacheKey).getYear() == year) {
                return ResponseEntity.ok(strategyCache.get(cacheKey));
            }

            // Get the original strategy data
            String summary = (String) strategy.get("summary");
            List<Map<String, Object>> actions = (List<Map<String, Object>>) strategy.get("actions");

            // Create a direct translation request for the summary
            String translationPrompt = "Traduire ce texte du français vers l'arabe, mot pour mot, sans ajouter ou modifier le contenu: \n\n" + summary;

            Map<String, Object> payload = Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(Map.of("text", translationPrompt))
                    ))
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(GEMINI_URL, requestEntity, Map.class);

            // Parse response for summary translation
            Map<String, Object> responseBody = response.getBody();
            if (responseBody == null || !responseBody.containsKey("candidates")) {
                return ResponseEntity.status(500).body(Map.of("error", "Réponse Gemini invalide pour la traduction"));
            }

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            if (candidates.isEmpty()) {
                return ResponseEntity.status(500).body(Map.of("error", "Aucune traduction générée"));
            }

            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            if (content == null || !content.containsKey("parts")) {
                return ResponseEntity.status(500).body(Map.of("error", "Structure de réponse invalide"));
            }

            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            if (parts.isEmpty() || !parts.get(0).containsKey("text")) {
                return ResponseEntity.status(500).body(Map.of("error", "Texte de traduction manquant"));
            }

            String translatedSummary = String.valueOf(parts.get(0).get("text")).trim();
            System.out.println("Translated summary: " + translatedSummary);

            // Translate each action individually
            List<Map<String, Object>> translatedActions = new ArrayList<>();
            for (Map<String, Object> action : actions) {
                Map<String, Object> translatedAction = translateAction(action);
                translatedActions.add(translatedAction);
            }

            // Structure translated response
            Map<String, Object> translatedStrategy = new HashMap<>();
            translatedStrategy.put("date", todayFormatted);
            translatedStrategy.put("summary", translatedSummary);
            translatedStrategy.put("actions", translatedActions);
            translatedStrategy.put("metrics", List.of());
            translatedStrategy.put("language", "ar");
            translatedStrategy.put("direction", "rtl");

            System.out.println("Translated strategy with " + translatedActions.size() + " actions");

            // Cache translated strategy
            strategyCache.put(cacheKey, translatedStrategy);
            cacheDate.put(cacheKey, today);

            return ResponseEntity.ok(translatedStrategy);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Erreur lors de la traduction : " + e.getMessage()));
        }
    }

    private Map<String, Object> translateAction(Map<String, Object> action) {
        try {
            Map<String, Object> translatedAction = new HashMap<>();
            translatedAction.put("id", action.get("id"));
            translatedAction.put("category", action.get("category")); // Keep original category

            // Translate title and description
            String title = (String) action.get("title");
            String description = (String) action.get("description");
            String priority = (String) action.get("priority");
            String impact = (String) action.get("impact");

            translatedAction.put("title", translateText(title));
            translatedAction.put("description", translateText(description));
            translatedAction.put("priority", translatePriority(priority));
            translatedAction.put("impact", translateImpact(impact));

            return translatedAction;
        } catch (Exception e) {
            System.err.println("Error translating action: " + e.getMessage());
            return action; // Return original action if translation fails
        }
    }

    private String translateText(String text) {
        try {
            if (text == null || text.isEmpty()) {
                return "";
            }

            String translationPrompt = "Traduire ce texte du français vers l'arabe, mot pour mot, sans ajouter ou modifier le contenu: \n\n" + text;

            Map<String, Object> payload = Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(Map.of("text", translationPrompt))
                    ))
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(GEMINI_URL, requestEntity, Map.class);

            // Parse response
            Map<String, Object> responseBody = response.getBody();
            if (responseBody == null || !responseBody.containsKey("candidates")) {
                return text; // Return original if translation fails
            }

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            if (candidates.isEmpty()) {
                return text;
            }

            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            if (content == null || !content.containsKey("parts")) {
                return text;
            }

            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            if (parts.isEmpty() || !parts.get(0).containsKey("text")) {
                return text;
            }

            return String.valueOf(parts.get(0).get("text")).trim();
        } catch (Exception e) {
            System.err.println("Error in translation: " + e.getMessage());
            return text; // Return original text if translation fails
        }
    }

    private String translatePriority(String priority) {
        if (priority == null) return "متوسطة";
        switch (priority.toLowerCase()) {
            case "haute": return "عالية";
            case "moyenne": return "متوسطة";
            case "basse": return "منخفضة";
            default: return "متوسطة";
        }
    }

    private String translateImpact(String impact) {
        if (impact == null) return "متوسط";
        switch (impact.toLowerCase()) {
            case "élevé": return "مرتفع";
            case "moyen": return "متوسط";
            case "faible": return "منخفض";
            default: return "متوسط";
        }
    }

    private Map<String, Object> parseStructuredResponse(String response) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> actions = new ArrayList<>();

        try {
            // Extract summary
            Pattern summaryPattern = Pattern.compile("## RÉSUMÉ\\s*\\n([\\s\\S]*?)(?=## ACTIONS RECOMMANDÉES|$)", Pattern.CASE_INSENSITIVE);
            Matcher summaryMatcher = summaryPattern.matcher(response);
            String summary = "";
            if (summaryMatcher.find()) {
                summary = summaryMatcher.group(1).trim();
            }

            // Extract actions
            Pattern actionPattern = Pattern.compile("### ACTION \\d+\\s*\\n([\\s\\S]*?)(?=### ACTION \\d+|$)", Pattern.CASE_INSENSITIVE);
            Matcher actionMatcher = actionPattern.matcher(response);

            int actionId = 1;
            while (actionMatcher.find()) {
                String actionBlock = actionMatcher.group(1).trim();
                Map<String, Object> action = parseAction(actionBlock, actionId);
                if (action != null) {
                    actions.add(action);
                    actionId++;
                }
            }

            // If no structured actions found, try to parse from any action-like content
            if (actions.isEmpty()) {
                actions = parseUnstructuredActions(response);
            }

            result.put("summary", summary.isEmpty() ? response : summary);
            result.put("actions", actions);

        } catch (Exception e) {
            System.err.println("Error parsing structured response: " + e.getMessage());
            // Fallback: create default actions
            result.put("summary", response);
            result.put("actions", createDefaultActions());
        }

        return result;
    }

    private Map<String, Object> parseAction(String actionBlock, int id) {
        try {
            Map<String, Object> action = new HashMap<>();
            action.put("id", id);

            // Extract fields using regex
            String category = extractField(actionBlock, "Catégorie");
            String title = extractField(actionBlock, "Titre");
            String description = extractField(actionBlock, "Description");
            String priority = extractField(actionBlock, "Priorité");
            String impact = extractField(actionBlock, "Impact");

            action.put("category", category.isEmpty() ? "general" : category.toLowerCase());
            action.put("title", title.isEmpty() ? "Action " + id : title);
            action.put("description", description.isEmpty() ? "Description non disponible" : description);
            action.put("priority", priority.isEmpty() ? "moyenne" : priority.toLowerCase());
            action.put("impact", impact.isEmpty() ? "moyen" : impact.toLowerCase());

            return action;
        } catch (Exception e) {
            System.err.println("Error parsing action: " + e.getMessage());
            return null;
        }
    }

    private String extractField(String text, String fieldName) {
        Pattern pattern = Pattern.compile("\\*\\*" + fieldName + ":\\*\\*\\s*([^\\n]*)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return "";
    }

    private List<Map<String, Object>> parseUnstructuredActions(String text) {
        List<Map<String, Object>> actions = new ArrayList<>();

        // Look for bullet points or numbered lists that might be actions
        String[] lines = text.split("\n");
        int actionId = 1;

        for (String line : lines) {
            line = line.trim();
            if (line.startsWith("-") || line.startsWith("•") || line.matches("^\\d+\\..*")) {
                String actionText = line.replaceAll("^[-•\\d\\.\\s]+", "").trim();
                if (actionText.length() > 10) { // Only consider substantial text as actions
                    Map<String, Object> action = new HashMap<>();
                    action.put("id", actionId++);
                    action.put("category", "general");
                    action.put("title", actionText.length() > 50 ? actionText.substring(0, 50) + "..." : actionText);
                    action.put("description", actionText);
                    action.put("priority", "moyenne");
                    action.put("impact", "moyen");
                    actions.add(action);
                }
            }
        }

        return actions.isEmpty() ? createDefaultActions() : actions;
    }

    private List<Map<String, Object>> createDefaultActions() {
        List<Map<String, Object>> defaultActions = new ArrayList<>();

        Map<String, Object> action1 = new HashMap<>();
        action1.put("id", 1);
        action1.put("category", "sales");
        action1.put("title", "Analyser les performances");
        action1.put("description", "Analyser les données de vente pour identifier les opportunités d'amélioration");
        action1.put("priority", "haute");
        action1.put("impact", "élevé");
        defaultActions.add(action1);

        Map<String, Object> action2 = new HashMap<>();
        action2.put("id", 2);
        action2.put("category", "marketing");
        action2.put("title", "Optimiser la visibilité");
        action2.put("description", "Améliorer la visibilité des produits les plus performants");
        action2.put("priority", "moyenne");
        action2.put("impact", "moyen");
        defaultActions.add(action2);

        return defaultActions;
    }

    private List<Map<String, Object>> parseMetrics(String key) {
        return List.of();
    }
}
