package com.example.Mongo.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH" , "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Combine all permitAll paths in one matcher group
                        .requestMatchers(
                                "/utilisateur/**",
                                "/api/friends/**",
                                "/api/notifications/**",
                                "/api/password/**",
                                "/notifications/**",
                                "/api/products/**",    // All methods + subpaths
                                "/api/categories/**",  // All methods + subpaths
                                "/api/products/available/**",
                                "/api/products/images/**",// Include POST endpoints here since they're covered by path patterns
                                "/api/categories",
                                "/api/**",  // Allow all API endpoint
                                "/api/products",
                                "/api/images/**",
                                "/api/auth/**",
                                "/api/products/images/**" ,// Allow image access without auth
                                "/api/commandes/**",
                                "/api/transactions/**",
                                "/utilisateur/login",
                                "/utilisateur/googleLogin",
                                "/utilisateur/verify-email",
                                "/**"
                        ).permitAll()
                        .anyRequest().authenticated()
                );
        return http.build();

    }
}