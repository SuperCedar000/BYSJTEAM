package com.milktea.supplysystem.config;

import com.milktea.supplysystem.entity.Role;
import com.milktea.supplysystem.entity.User;
import com.milktea.supplysystem.repository.RoleRepository;
import com.milktea.supplysystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 确保角色存在
        Role adminRole = roleRepository.findByRoleName("ROLE_ADMIN").orElseGet(() -> {
            Role r = new Role();
            r.setRoleName("ROLE_ADMIN");
            return roleRepository.save(r);
        });
        roleRepository.findByRoleName("ROLE_STORE_MANAGER").orElseGet(() -> {
            Role r = new Role();
            r.setRoleName("ROLE_STORE_MANAGER");
            return roleRepository.save(r);
        });
        roleRepository.findByRoleName("ROLE_WAREHOUSE_MANAGER").orElseGet(() -> {
            Role r = new Role();
            r.setRoleName("ROLE_WAREHOUSE_MANAGER");
            return roleRepository.save(r);
        });

        // 创建 admin 用户
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRoles(Set.of(adminRole));
            userRepository.save(admin);
            System.out.println("Admin user created: admin / admin123");
        }
    }
}