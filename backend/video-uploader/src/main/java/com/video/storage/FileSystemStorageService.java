package com.video.storage;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileSystemStorageService implements StorageService {

    private final Path rootLocation;

    @Autowired
    public FileSystemStorageService(StorageProperties properties) {
        if (properties.getLocation() == null || properties.getLocation().trim().isEmpty()) {
            throw new StorageException("Storage location must not be empty");
        }
        this.rootLocation = Paths.get(properties.getLocation()).toAbsolutePath().normalize();
    }

    @Override
    public void init() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new StorageException("Could not initialize storage", e);
        }
    }

    @Override
    public StoredFile store(MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                throw new StorageException("The file is empty");
            }

            String original = (file.getOriginalFilename() == null) ? "file" : file.getOriginalFilename();
            original = original.replaceAll("[\\\\/]", "_");

            String stored = UUID.randomUUID() + "-" + original;

            Path destinationFile = rootLocation.resolve(stored).normalize().toAbsolutePath();

            // security check: must remain inside rootLocation
            if (!destinationFile.startsWith(rootLocation)) {
                throw new StorageException("Cannot store file outside current directory");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            String contentType = (file.getContentType() == null) ? "application/octet-stream" : file.getContentType();

            return new StoredFile(
                    original,
                    stored,
                    contentType,
                    file.getSize(),
                    destinationFile.toString()
            );

        } catch (IOException e) {
            throw new StorageException("Failed to store file", e);
        }
    }

    @Override
    public Resource loadAsResource(String storedFilename) {
        try {
            Path file = rootLocation.resolve(storedFilename).normalize().toAbsolutePath();

            // security check
            if (!file.startsWith(rootLocation)) {
                throw new StorageException("Cannot read file outside current directory.");
            }

            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }

            throw new StorageFileNotFoundException("Could not read file: " + storedFilename);

        } catch (MalformedURLException e) {
            throw new StorageFileNotFoundException("Could not read file: " + storedFilename, e);
        }
    }
}
