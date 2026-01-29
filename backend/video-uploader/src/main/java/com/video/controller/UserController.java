package com.video.controller;

import java.security.Principal;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;

import jakarta.validation.Valid;
import com.video.dto.AuthResponse;
import com.video.dto.LoginRequest;
import com.video.dto.RegisterRequest;
import com.video.entities.User;
import com.video.repositories.UserRepository;
import com.video.security.JwtService;
import com.video.services.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    UserRepository userRepository;
    
    @Autowired
    JwtService jwtService;
    
    @Autowired
    PasswordEncoder passwordEncoder;
    
    @Autowired
    UserService userService;

    @PostMapping("/auth/signup")
    public ResponseEntity<AuthResponse> signup(@Valid@RequestBody RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }
        
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        userRepository.save(user);
        
        String token = jwtService.generateToken(user.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(
            new AuthResponse(token, user.getUsername(), user.getEmail())
        );
    }
    
    @PostMapping("/auth/signin")
    public ResponseEntity<AuthResponse> signin(@Valid@RequestBody LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        
        String token = jwtService.generateToken(user.getUsername());
        return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getEmail()));
    }

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