package com.example.warehousemanagement.service;

import com.example.warehousemanagement.dto.VerificationTokenDTO;
import com.example.warehousemanagement.entity.User;
import com.example.warehousemanagement.entity.VerificationToken;
import com.example.warehousemanagement.mapper.VerificationTokenMapper;
import com.example.warehousemanagement.repository.UserRepository;
import com.example.warehousemanagement.repository.VerificationTokenRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class VerificationTokenService {

    private final VerificationTokenRepository tokenRepository;
    private final VerificationTokenMapper tokenMapper;
    private final UserRepository userRepository;

    public VerificationTokenService(VerificationTokenRepository tokenRepository,
                                    VerificationTokenMapper tokenMapper,
                                    UserRepository userRepository) {
        this.tokenRepository = tokenRepository;
        this.tokenMapper = tokenMapper;
        this.userRepository = userRepository;
    }

    // Create and persist a token for a user (for registration flow)
    public VerificationToken createToken(User user) {
        String tokenValue = UUID.randomUUID().toString();
        VerificationToken token = new VerificationToken();
        token.setToken(tokenValue);
        token.setUser(user);
        token.setExpiryDate(LocalDateTime.now().plusDays(1));
        return tokenRepository.save(token);
    }

    // Find token by token string
    public Optional<VerificationToken> findByToken(String token) {
        return tokenRepository.findByToken(token);
    }

    // Confirm user and delete token if valid
    public boolean confirmUser(String tokenValue) {
        VerificationToken token = tokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }

        User user = token.getUser();
        user.setEnabled(true);
        userRepository.save(user);
        tokenRepository.delete(token); // Remove the used token
        return true;
    }

    // For DTO conversion (if needed elsewhere in your app)
    public VerificationTokenDTO toDTO(VerificationToken token) {
        return tokenMapper.verificationTokenToVerificationTokenDTO(token);
    }
}
