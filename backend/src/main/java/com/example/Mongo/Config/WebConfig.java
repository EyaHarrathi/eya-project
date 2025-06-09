package com.example.Mongo.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {


@SuppressWarnings("checkstyle:WhitespaceAfter")
@Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry.addResourceHandler("/api/products/images/**","/uploads/**")
            .addResourceLocations("file:uploads/");
    registry.addResourceHandler("/icons/**")
            .addResourceLocations("classpath:/static/icons/", "file:./public/icons/")
            .setCachePeriod(3600);

    registry.addResourceHandler("/photos/**")
            .addResourceLocations("file:./uploads/profile-photos/");
}

}