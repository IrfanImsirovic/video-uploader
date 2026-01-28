package com.video.dto;

import java.time.LocalDateTime;

public record VideoResponse(
        Long id,
        String title,
        String description,
        boolean isPrivate,
        String uploaderUsername,
        LocalDateTime createdAt
) {}
