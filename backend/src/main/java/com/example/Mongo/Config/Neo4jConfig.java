package com.example.Mongo.Config;

import org.neo4j.driver.Driver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.data.neo4j.core.Neo4jTemplate;

@Configuration
public class Neo4jConfig {

    @Bean
    public Neo4jTemplate neo4jTemplate(Driver driver) {
        return new Neo4jTemplate(Neo4jClient.create(driver));
    }
}