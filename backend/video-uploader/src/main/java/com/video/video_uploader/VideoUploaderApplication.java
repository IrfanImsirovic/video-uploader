package com.video.video_uploader;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.video.storage.StorageProperties;
@EnableConfigurationProperties(StorageProperties.class)
@SpringBootApplication
public class VideoUploaderApplication {

	public static void main(String[] args) {
		SpringApplication.run(VideoUploaderApplication.class, args);
	}

}
