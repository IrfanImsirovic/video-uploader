package com.video.dto;

import java.time.OffsetDateTime;

public record VideoResponse(
        Long id,
        String title,
        String description,
        boolean isPrivate,
        String uploaderUsername,
        OffsetDateTime createdAt
) {}
