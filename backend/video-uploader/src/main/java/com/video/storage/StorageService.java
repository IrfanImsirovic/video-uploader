package com.video.storage;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;

public interface StorageService {
      
    void init();
    StoredFile store (MultipartFile file);
    Resource loadAsResource(String filename);

    record StoredFile(String originalFilename,
                        String storedFilename,
                        String contentType,
                        long sizeBytes,
                        String filePath){}
}
