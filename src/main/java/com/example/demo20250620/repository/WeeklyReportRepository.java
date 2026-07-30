package com.example.demo20250620.repository;

import com.example.demo20250620.entity.WeeklyReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WeeklyReportRepository extends JpaRepository<WeeklyReport, Long> {

    Page<WeeklyReport> findByUserId(Long userId, Pageable pageable);

    @Query(value = "SELECT wr FROM WeeklyReport wr LEFT JOIN FETCH wr.user ORDER BY wr.weekRange DESC",
           countQuery = "SELECT COUNT(wr) FROM WeeklyReport wr")
    Page<WeeklyReport> findAllWithUser(Pageable pageable);

    @Query(value = "SELECT wr FROM WeeklyReport wr LEFT JOIN FETCH wr.user WHERE wr.user.id = :userId ORDER BY wr.weekRange DESC",
           countQuery = "SELECT COUNT(wr) FROM WeeklyReport wr WHERE wr.user.id = :userId")
    Page<WeeklyReport> findByUserIdWithUser(Long userId, Pageable pageable);

    Optional<WeeklyReport> findByUserIdAndWeekRange(Long userId, String weekRange);

    @Query("SELECT wr FROM WeeklyReport wr WHERE wr.user.id = :userId ORDER BY wr.weekRange DESC")
    List<WeeklyReport> findByUserIdOrderByWeekRangeDesc(Long userId);

    @Query("SELECT wr FROM WeeklyReport wr LEFT JOIN FETCH wr.user ORDER BY wr.weekRange DESC")
    List<WeeklyReport> findAllWithUserList();

    @Query("SELECT wr FROM WeeklyReport wr WHERE wr.detail = '待确认' OR wr.detail IS NULL")
    List<WeeklyReport> findByDetailPending();
}
