package com.returnsystem.service;

import com.returnsystem.dto.ReturnRequestDTO;
import com.returnsystem.dto.ReviewDTO;
import com.returnsystem.exception.ReturnException;
import com.returnsystem.model.*;
import com.returnsystem.repository.ReturnRequestRepository;
import com.returnsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ReturnService {

    private final ReturnRequestRepository repository;
    private final UserRepository userRepository;

    @Value("${return.policy.window-days:30}")
    private int returnWindowDays;

    public ReturnService(ReturnRequestRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    public ReturnRequest createReturn(ReturnRequestDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ReturnException("User not found"));

        if (user.getRole() != Role.CUSTOMER) {
            throw new ReturnException("Only customers can submit return requests");
        }

        if (repository.existsByOrderId(dto.getOrderId())) {
            throw new ReturnException("A return request for this order already exists");
        }

        long daysSincePurchase = ChronoUnit.DAYS.between(dto.getPurchaseDate(), LocalDate.now());
        if (daysSincePurchase > returnWindowDays) {
            throw new ReturnException(
                "Return window has expired. Purchased " + daysSincePurchase +
                " days ago; only " + returnWindowDays + " days allowed."
            );
        }
        if (dto.getPurchaseDate().isAfter(LocalDate.now())) {
            throw new ReturnException("Purchase date cannot be in the future");
        }

        ItemCondition condition;
        try {
            condition = ItemCondition.valueOf(dto.getCondition().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ReturnException("Invalid item condition: " + dto.getCondition());
        }

        ReturnRequest request = new ReturnRequest();
        request.setOrderId(dto.getOrderId());
        request.setItemName(dto.getItemName());
        request.setPurchaseDate(dto.getPurchaseDate());
        request.setCondition(condition);
        request.setReason(dto.getReason());
        request.setStatus(ReturnStatus.PENDING);
        request.setUserId(userId);
        request.setUserName(user.getName());

        return repository.save(request);
    }

    public ReturnRequest reviewReturn(Long id, ReviewDTO dto, Long reviewerId) {
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ReturnException("User not found"));

        if (reviewer.getRole() != Role.EMPLOYEE) {
            throw new ReturnException("Only employees can review return requests");
        }

        ReturnRequest request = repository.findById(id)
                .orElseThrow(() -> new ReturnException("Return request not found with id: " + id));

        if (request.getStatus() != ReturnStatus.PENDING) {
            throw new ReturnException("Return request has already been " + request.getStatus().name().toLowerCase());
        }

        request.setReviewedBy(reviewer.getName());

        if (dto.getApproved()) {
            request.setStatus(ReturnStatus.APPROVED);
        } else {
            if (dto.getRejectionReason() == null || dto.getRejectionReason().isBlank()) {
                throw new ReturnException("Rejection reason is required when rejecting a return");
            }
            request.setStatus(ReturnStatus.REJECTED);
            request.setRejectionReason(dto.getRejectionReason());
        }

        return repository.save(request);
    }

    public List<ReturnRequest> getAllReturns() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public List<ReturnRequest> getReturnsByUser(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public ReturnRequest getReturnById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ReturnException("Return request not found with id: " + id));
    }
}
