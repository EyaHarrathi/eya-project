//package com.example.Mongo.Service;
//
//
//
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.core.io.Resource;
//import org.springframework.core.io.UrlResource;
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.net.MalformedURLException;
//import java.nio.file.Files;
//import java.nio.file.Path;
//import java.nio.file.Paths;
//import java.nio.file.StandardCopyOption;
//import java.util.UUID;
//
//
//@Service
//public class FileStorageService {
//    private final Path fileStorageLocation;
//
//    public FileStorageService(@Value("${file.upload-dir}") String uploadDir) throws IOException {
//        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
//        Files.createDirectories(this.fileStorageLocation);
//    }
//
//    public String storeFile(MultipartFile file) throws IOException {
//        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
//        Path targetLocation = this.fileStorageLocation.resolve(filename);
//        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
//        return filename;
//    }
//
//    public Resource loadFile(String filename) throws MalformedURLException {
//        Path filePath = this.fileStorageLocation.resolve(filename).normalize();
//        return new UrlResource(filePath.toUri());
//    }
//}
