package com.video.services;

import com.video.dto.VideoResponse;
import com.video.entities.RawFile;
import com.video.entities.User;
import com.video.entities.Video;
import com.video.repositories.UserRepository;
import com.video.repositories.VideoRepository;
import com.video.storage.StorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.nio.file.Path;
import java.util.List;

@Service
public class VideoService {

    private final VideoRepository videoRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    public VideoService(VideoRepository videoRepository,
                        UserRepository userRepository,
                        StorageService storageService) {
        this.videoRepository = videoRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
    }

    // ----------------- Helpers -------------------------------
    private String currentUsernameOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) return null;
        if ("anonymousUser".equals(auth.getName())) return null;
        return auth.getName();
    }

    private User requireCurrentUser() {
        String username = currentUsernameOrNull();
        if (username == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private Long currentUserIdOrNull() {
        String username = currentUsernameOrNull();
        if (username == null) return null;
        return userRepository.findByUsername(username).map(User::getId).orElse(null);
    }

    private void enforcePrivacy(Video video) {
        if (!video.isPrivate()) return;

        Long currentUserId = currentUserIdOrNull();
        if (currentUserId == null || !video.getUploader().getId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Private video access denied");
        }
    }

    private VideoResponse toResponse(Video v) {
        return new VideoResponse(
                v.getId(),
                v.getTitle(),
                v.getDescription(),
                v.isPrivate(),
                v.getUploader().getUsername(),
                v.getCreatedAt()
        );
    }
    // ----------------------------------------------------------

    public List<VideoResponse> list(String search) {
        Long userId = currentUserIdOrNull();

        List<Video> videos = (search == null || search.trim().isEmpty())
                ? videoRepository.findVisibleVideos(userId)
                : videoRepository.searchVisibleVideos(search.trim(), userId);

        return videos.stream().map(this::toResponse).toList();
    }

    public VideoResponse getOne(Long id) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Video not found"));
        enforcePrivacy(video);
        return toResponse(video);
    }

    public VideoResponse upload(MultipartFile file, String title, String description, boolean isPrivate) {
        User uploader = requireCurrentUser();

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
        }

        if (title == null || title.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title is required");
        }

        String trimmedTitle = title.trim();
        if (trimmedTitle.length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title must be at most 100 characters");
        }

        if (description != null && description.length() > 500) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Description must be at most 500 characters");
        }

        StorageService.StoredFile storedVideo = storageService.store(file);

        RawFile videoRaw = new RawFile();
        videoRaw.setOriginalFilename(storedVideo.originalFilename());
        videoRaw.setStoredFilename(storedVideo.storedFilename());
        videoRaw.setContentType(storedVideo.contentType());
        videoRaw.setSizeBytes(storedVideo.sizeBytes());
        videoRaw.setFilePath(storedVideo.filePath());

        Video video = new Video();
        video.setTitle(trimmedTitle);
        video.setDescription(description);
        video.setPrivate(isPrivate);
        video.setUploader(uploader);
        video.setVideoFile(videoRaw);

        RawFile thumb = tryGenerateThumbnail(videoRaw);
        video.setThumbnailFile(thumb);

        Video saved = videoRepository.save(video);
        return toResponse(saved);
    }

    public FileDownload downloadVideo(Long id) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Video not found"));
        enforcePrivacy(video);

        RawFile rf = video.getVideoFile();
        Resource resource = storageService.loadAsResource(rf.getStoredFilename());

        return new FileDownload(resource, rf.getContentType(), rf.getOriginalFilename());
    }

    public FileDownload downloadThumbnail(Long id) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Video not found"));
        enforcePrivacy(video);

        if (video.getThumbnailFile() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Thumbnail not found");
        }

        RawFile rf = video.getThumbnailFile();
        Resource resource = storageService.loadAsResource(rf.getStoredFilename());

        return new FileDownload(resource, rf.getContentType(), rf.getOriginalFilename());
    }

    public record FileDownload(Resource resource, String contentType, String downloadFilename) {}

    private RawFile tryGenerateThumbnail(RawFile videoRaw) {
    try {
        Path videoPath = Path.of(videoRaw.getFilePath());
        Path dir = videoPath.getParent();

        String thumbStored = "thumb-" + videoRaw.getStoredFilename() + ".jpg";
        Path thumbPath = dir.resolve(thumbStored);

        Process p = new ProcessBuilder(
                "ffmpeg",
                "-y",
                "-ss", "00:00:01",
                "-i", videoPath.toString(),
                "-frames:v", "1",
                thumbPath.toString()
        ).redirectErrorStream(true).start();

        int code = p.waitFor();
        if (code != 0 || !thumbPath.toFile().exists()) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Thumbnail generation failed (ffmpeg exit code " + code + ")"
            );
        }

        File f = thumbPath.toFile();

        RawFile thumb = new RawFile();
        thumb.setOriginalFilename("thumbnail.jpg");
        thumb.setStoredFilename(thumbStored);
        thumb.setContentType("image/jpeg");
        thumb.setSizeBytes(f.length());
        thumb.setFilePath(thumbPath.toString());

        return thumb;

    } catch (Exception e) {
        throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Thumbnail generation failed",
                e
        );
    }
}
}