package com.milktea.supplysystem.controller;

import com.milktea.supplysystem.dto.LoginRequest;
import com.milktea.supplysystem.entity.User;
import com.milktea.supplysystem.repository.UserRepository;
import com.milktea.supplysystem.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest loginRequest) {
        System.out.println("收到登录请求: " + loginRequest.getUsername());

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 不校验密码，任何密码都能登录（仅用于演示，后续可改）
        String token = jwtUtil.generateToken(user.getUsername());
        String role = user.getRoles().iterator().next().getRoleName();

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("type", "Bearer");
        response.put("username", user.getUsername());
        response.put("role", role);

        return response;
    }
}