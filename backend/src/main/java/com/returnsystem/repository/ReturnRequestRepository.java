package com.returnsystem.repository;

import com.returnsystem.model.ReturnRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {
    List<ReturnRequest> findAllByOrderByCreatedAtDesc();
    List<ReturnRequest> findByUserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByOrderId(String orderId);
}
