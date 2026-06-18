package com.returnsystem.controller;

import com.returnsystem.dto.ReturnRequestDTO;
import com.returnsystem.dto.ReviewDTO;
import com.returnsystem.model.ReturnRequest;
import com.returnsystem.service.ReturnService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/returns")
public class ReturnController {

    private final ReturnService returnService;

    public ReturnController(ReturnService returnService) {
        this.returnService = returnService;
    }

    @PostMapping
    public ResponseEntity<ReturnRequest> submitReturn(
            @Valid @RequestBody ReturnRequestDTO dto,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        ReturnRequest created = returnService.createReturn(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<ReturnRequest>> getAllReturns(Authentication auth) {
        return ResponseEntity.ok(returnService.getAllReturns());
    }

    @GetMapping("/mine")
    public ResponseEntity<List<ReturnRequest>> getMyReturns(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(returnService.getReturnsByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReturnRequest> getReturn(@PathVariable Long id) {
        return ResponseEntity.ok(returnService.getReturnById(id));
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<ReturnRequest> reviewReturn(
            @PathVariable Long id,
            @Valid @RequestBody ReviewDTO dto,
            Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(returnService.reviewReturn(id, dto, userId));
    }
}
