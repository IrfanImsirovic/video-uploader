package com.video.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.video.entities.Video;

public interface VideoRepository extends JpaRepository<Video, Long> {
}