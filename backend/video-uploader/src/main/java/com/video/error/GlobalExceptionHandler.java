package com.video.error;

import com.video.storage.StorageException;
import com.video.storage.StorageFileNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleBodyValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest req) {

        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.putIfAbsent(fe.getField(), fe.getDefaultMessage());
        }

        String message = fieldErrors.isEmpty() ? "Validation failed" : fieldErrors.values().iterator().next();
        return build(HttpStatus.BAD_REQUEST, req, message, fieldErrors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleParamValidation(
            ConstraintViolationException ex,
            HttpServletRequest req) {

        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (ConstraintViolation<?> v : ex.getConstraintViolations()) {
            String key = (v.getPropertyPath() == null) ? "request" : v.getPropertyPath().toString();
            int lastDot = key.lastIndexOf('.');
            if (lastDot >= 0 && lastDot < key.length() - 1) {
                key = key.substring(lastDot + 1);
            }
            fieldErrors.putIfAbsent(key, v.getMessage());
        }

        String message = fieldErrors.isEmpty() ? "Validation failed" : fieldErrors.values().iterator().next();
        return build(HttpStatus.BAD_REQUEST, req, message, fieldErrors);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleResponseStatus(
            ResponseStatusException ex,
            HttpServletRequest req) {

        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        String message = (ex.getReason() == null || ex.getReason().isBlank()) ? status.getReasonPhrase() : ex.getReason();
        return build(status, req, message, null);
    }

    @ExceptionHandler(StorageFileNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleStorageNotFound(
            StorageFileNotFoundException ex,
            HttpServletRequest req) {

        return build(HttpStatus.NOT_FOUND, req, ex.getMessage(), null);
    }

    @ExceptionHandler(StorageException.class)
    public ResponseEntity<ApiErrorResponse> handleStorage(
            StorageException ex,
            HttpServletRequest req) {

        return build(HttpStatus.BAD_REQUEST, req, ex.getMessage(), null);
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<ApiErrorResponse> handleMultipart(
            MultipartException ex,
            HttpServletRequest req) {

        return build(HttpStatus.BAD_REQUEST, req, "Invalid multipart request", null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(
            Exception ex,
            HttpServletRequest req) {

        log.error("Unhandled exception for {} {}", req.getMethod(), req.getRequestURI(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, req, "Internal server error", null);
    }

    private ResponseEntity<ApiErrorResponse> build(
            HttpStatus status,
            HttpServletRequest req,
            String message,
            Map<String, String> fieldErrors) {

        ApiErrorResponse body = new ApiErrorResponse(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                req.getRequestURI(),
                (fieldErrors == null || fieldErrors.isEmpty()) ? null : fieldErrors
        );

        return ResponseEntity.status(status).body(body);
    }
}
