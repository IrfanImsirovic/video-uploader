package com.video.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.video.entities.RawFile;

public interface RawFileRepository extends JpaRepository<RawFile, Long> {
}