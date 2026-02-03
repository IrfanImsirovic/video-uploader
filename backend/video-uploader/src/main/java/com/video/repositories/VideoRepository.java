package com.video.repositories;


import com.video.entities.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VideoRepository extends JpaRepository<Video, Long> {

    
    @Query("""
        SELECT v FROM Video v
        WHERE (:userId IS NULL AND v.isPrivate = false)
           OR (:userId IS NOT NULL AND (v.isPrivate = false OR v.uploader.id = :userId))
        ORDER BY v.createdAt DESC
    """)
    List<Video> findVisibleVideos(@Param("userId") Long userId);

    @Query("""
        SELECT v FROM Video v
        WHERE (
              LOWER(v.title) LIKE LOWER(CONCAT('%', :q, '%'))
           OR LOWER(v.description) LIKE LOWER(CONCAT('%', :q, '%'))
        )
        AND (
              (:userId IS NULL AND v.isPrivate = false)
           OR (:userId IS NOT NULL AND (v.isPrivate = false OR v.uploader.id = :userId))
        )
        ORDER BY v.createdAt DESC
    """)
    List<Video> searchVisibleVideos(@Param("q") String q, @Param("userId") Long userId);
}