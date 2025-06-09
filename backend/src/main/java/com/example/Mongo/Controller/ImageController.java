//package com.example.Mongo.Controller;
//
//import com.example.Mongo.Service.FileStorageService;
//import org.springframework.core.io.Resource;
//import org.springframework.http.HttpHeaders;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import java.net.MalformedURLException;
//
//@RestController
//@RequestMapping("/api/images")
//public class ImageController {
//    private final FileStorageService fileStorageService;
//
//    public ImageController(FileStorageService fileStorageService) {
//        this.fileStorageService = fileStorageService;
//    }
//
//    @GetMapping("/{filename:.+}")
//    public ResponseEntity<Resource> getImage(@PathVariable String filename) throws MalformedURLException {
//        Resource resource = fileStorageService.loadFile(filename);
//        return ResponseEntity.ok()
//                .header(HttpHeaders.CONTENT_TYPE, "image/jpeg")
//                .body(resource);
//    }
//}
