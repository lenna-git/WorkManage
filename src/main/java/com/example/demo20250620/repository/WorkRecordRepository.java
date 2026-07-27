package com.example.demo20250620.repository;

import com.example.demo20250620.entity.WorkRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkRecordRepository extends JpaRepository<WorkRecord, Long> {

    @Query("SELECT wr FROM WorkRecord wr LEFT JOIN FETCH wr.user")
    Page<WorkRecord> findAllWithUser(Pageable pageable);

    @Query("SELECT wr FROM WorkRecord wr LEFT JOIN FETCH wr.user WHERE wr.user.id = :userId")
    Page<WorkRecord> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT wr FROM WorkRecord wr LEFT JOIN FETCH wr.user WHERE wr.workContent LIKE %:keyword% OR wr.workLocation LIKE %:keyword%")
    Page<WorkRecord> findByKeyword(String keyword, Pageable pageable);

    @Query("SELECT wr FROM WorkRecord wr LEFT JOIN FETCH wr.user WHERE wr.user.id = :userId AND (wr.workContent LIKE %:keyword% OR wr.workLocation LIKE %:keyword%)")
    Page<WorkRecord> findByUserIdAndKeyword(Long userId, String keyword, Pageable pageable);
}
