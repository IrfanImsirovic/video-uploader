package com.video.controller;

import java.security.Principal;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;

import com.video.entities.User;
import com.video.repositories.UserRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@RequestParam String username, Principal principal) {
        if (principal == null){
            return ResponseEntity.status(401).body("Unauthorized");
        }
        if (!principal.getName().equals(username)) {
            return ResponseEntity.status(403).body("Forbidden");
        }
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        Map<String, Object> response = new HashMap<>();
        response.put("username", user.getUsername());
        return ResponseEntity.ok(response);
    }
}