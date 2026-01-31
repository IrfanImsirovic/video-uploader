package com.video.controller;
import com.video.dto.VideoResponse;
import com.video.services.VideoService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@RestController
@RequestMapping("/api/videos")
@Validated
public class VideoController {
    private final VideoService videoService;

    public VideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    @GetMapping
    public List<VideoResponse> list(@RequestParam(value = "search", required = false) String search) {
        return videoService.list(search);
    }

    @GetMapping("/{id}")
    public VideoResponse getOne(@PathVariable Long id) {
        return videoService.getOne(id);
    }
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public VideoResponse upload(
            @NotNull(message = "File is required")
            @RequestParam("file") MultipartFile file,

            @NotBlank(message = "Title is required")
            @Size(max = 100, message = "Title must be at most 100 characters")
            @RequestParam("title") String title,

            @Size(max = 500, message = "Description must be at most 500 characters")
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("private") boolean isPrivate){

        return videoService.upload(file, title, description, isPrivate);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        VideoService.FileDownload d = videoService.downloadVideo(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(d.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + d.downloadFilename() + "\"")
                .body(d.resource());
    }

     @GetMapping("/{id}/thumbnail")
    public ResponseEntity<Resource> thumbnail(@PathVariable Long id) {
        VideoService.FileDownload d = videoService.downloadThumbnail(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(d.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + d.downloadFilename() + "\"")
                .body(d.resource());
    }
}





