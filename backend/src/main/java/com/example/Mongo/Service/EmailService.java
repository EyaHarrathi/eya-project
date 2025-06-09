package com.example.Mongo.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;



import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class EmailService {

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    @Value("${brevo.sender.name}")
    private String senderName;

    // Returns true if email is sent successfully, false otherwise
    public boolean sendResetLink(String recipientEmail, String resetToken) {
        try {
            HttpClient client = HttpClient.newHttpClient();

            String requestBody = String.format(
                    "{\"sender\":{\"email\":\"%s\",\"name\":\"%s\"}," +
                            "\"to\":[{\"email\":\"%s\"}]," +
                            "\"subject\":\"Password Reset Request\"," +
                            "\"htmlContent\":\"<p>Your password reset code is: <strong>%s</strong></p>\"}",
                    senderEmail, senderName, recipientEmail, resetToken
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("accept", "application/json")
                    .header("api-key", brevoApiKey)
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            // Check if the response status code indicates success (e.g., 200 or 201)
            return response.statusCode() >= 200 && response.statusCode() < 300;
        } catch (Exception e) {
            e.printStackTrace();
            return false; // Return false if an exception occurs
        }
    }

    // Similarly, update other email methods if they return void
    public boolean sendPasswordChangeConfirmation(String recipientEmail) {
        try {
            // Your existing code to send confirmation email...
            return true; // Return true on success
        } catch (Exception e) {
            return false; // Return false on failure
        }
    }
}