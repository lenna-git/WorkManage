package com.example.demo20250620.controller;

import com.example.demo20250620.entity.SysUser;
import com.example.demo20250620.entity.WorkRecord;
import com.example.demo20250620.repository.SysUserRepository;
import com.example.demo20250620.repository.WorkRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/workrecord")
public class WorkRecordController {

    @Autowired
    private WorkRecordRepository workRecordRepository;

    @Autowired
    private SysUserRepository sysUserRepository;

    @GetMapping("/allworkrecords")
    public Map<String, Object> getAllWorkRecords(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            jakarta.servlet.http.HttpServletRequest httpRequest) {
        Map<String, Object> responseObj = new HashMap<>();
        try {
            int pageIndex = Math.max(0, page - 1);

            jakarta.servlet.http.HttpSession session = httpRequest.getSession(false);
            Long currentUserId = null;
            Integer currentUserRole = null;
            if (session != null) {
                Optional<SysUser> currentUser = (Optional<SysUser>) session.getAttribute("SYS_USER");
                if (currentUser.isPresent()) {
                    currentUserId = currentUser.get().getId();
                    currentUserRole = currentUser.get().getSysuserrole().intValue();
                }
            }

            Page<WorkRecord> workRecordPage;

            if (currentUserRole != null && currentUserRole == 2 && currentUserId != null) {
                if (keyword == null || keyword.trim().isEmpty()) {
                    workRecordPage = workRecordRepository.findByUserId(currentUserId, PageRequest.of(pageIndex, limit));
                } else {
                    workRecordPage = workRecordRepository.findByUserIdAndKeyword(currentUserId, keyword.trim(), PageRequest.of(pageIndex, limit));
                }
            } else {
                if (keyword == null || keyword.trim().isEmpty()) {
                    workRecordPage = workRecordRepository.findAllWithUser(PageRequest.of(pageIndex, limit));
                } else {
                    workRecordPage = workRecordRepository.findByKeyword(keyword.trim(), PageRequest.of(pageIndex, limit));
                }
            }

            List<WorkRecord> records = workRecordPage.getContent();

            responseObj.put("data", records);
            responseObj.put("total", workRecordPage.getTotalElements());
            responseObj.put("success", true);
        } catch (Exception e) {
            responseObj.put("success", false);
            responseObj.put("message", "获取工作记录失败: " + e.getMessage());
        }
        return responseObj;
    }

    @PostMapping("/createWorkRecord")
    public Map<String, Object> createWorkRecord(@RequestBody WorkRecord workRecord, jakarta.servlet.http.HttpServletRequest httpRequest) {
        Map<String, Object> responseObj = new HashMap<>();
        try {
            jakarta.servlet.http.HttpSession session = httpRequest.getSession(false);
            if (session != null) {
                Optional<SysUser> currentUser = (Optional<SysUser>) session.getAttribute("SYS_USER");
                if (currentUser.isPresent()) {
                    workRecord.setUser(currentUser.get());
                }
            }

            if (workRecord.getWorkTime() == null || workRecord.getWorkTime().trim().isEmpty()) {
                workRecord.setWorkTime(java.time.LocalDateTime.now().toString());
            }

            if (workRecord.getDetail() == null || workRecord.getDetail().trim().isEmpty()) {
                workRecord.setDetail("待确认");
            }

            WorkRecord savedRecord = workRecordRepository.save(workRecord);
            responseObj.put("success", true);
            responseObj.put("message", "工作记录创建成功");
            responseObj.put("data", savedRecord);
        } catch (Exception e) {
            responseObj.put("success", false);
            responseObj.put("message", "工作记录创建失败: " + e.getMessage());
        }
        return responseObj;
    }

    @PutMapping("/updateWorkRecord")
    public Map<String, Object> updateWorkRecord(@RequestBody WorkRecord workRecord) {
        Map<String, Object> responseObj = new HashMap<>();
        try {
            if (workRecord.getId() == null) {
                responseObj.put("success", false);
                responseObj.put("message", "记录ID不能为空");
                return responseObj;
            }

            Optional<WorkRecord> existingOpt = workRecordRepository.findById(workRecord.getId());
            if (!existingOpt.isPresent()) {
                responseObj.put("success", false);
                responseObj.put("message", "记录不存在");
                return responseObj;
            }

            WorkRecord existing = existingOpt.get();
            existing.setWorkTime(workRecord.getWorkTime());
            existing.setWorkLocation(workRecord.getWorkLocation());
            existing.setWorkContent(workRecord.getWorkContent());
            existing.setDetail(workRecord.getDetail());

            workRecordRepository.save(existing);
            responseObj.put("success", true);
            responseObj.put("message", "工作记录更新成功");
        } catch (Exception e) {
            responseObj.put("success", false);
            responseObj.put("message", "工作记录更新失败: " + e.getMessage());
        }
        return responseObj;
    }

    @PutMapping("/approveWorkRecord/{id}")
    public Map<String, Object> approveWorkRecord(@PathVariable Long id, jakarta.servlet.http.HttpServletRequest httpRequest) {
        Map<String, Object> responseObj = new HashMap<>();
        try {
            jakarta.servlet.http.HttpSession session = httpRequest.getSession(false);
            Integer currentUserRole = null;
            if (session != null) {
                Optional<SysUser> currentUser = (Optional<SysUser>) session.getAttribute("SYS_USER");
                if (currentUser.isPresent()) {
                    currentUserRole = currentUser.get().getSysuserrole().intValue();
                }
            }

            if (currentUserRole == null || currentUserRole != 1) {
                responseObj.put("success", false);
                responseObj.put("message", "只有管理员才能审核工作记录");
                return responseObj;
            }

            Optional<WorkRecord> existingOpt = workRecordRepository.findById(id);
            if (!existingOpt.isPresent()) {
                responseObj.put("success", false);
                responseObj.put("message", "记录不存在");
                return responseObj;
            }

            WorkRecord existing = existingOpt.get();
            existing.setDetail("审核通过");

            workRecordRepository.save(existing);
            responseObj.put("success", true);
            responseObj.put("message", "工作记录审核通过");
        } catch (Exception e) {
            responseObj.put("success", false);
            responseObj.put("message", "工作记录审核失败: " + e.getMessage());
        }
        return responseObj;
    }

    @DeleteMapping("/deleteWorkRecord/{id}")
    public Map<String, Object> deleteWorkRecord(@PathVariable Long id) {
        Map<String, Object> responseObj = new HashMap<>();
        try {
            if (!workRecordRepository.existsById(id)) {
                responseObj.put("success", false);
                responseObj.put("message", "记录不存在");
                return responseObj;
            }

            workRecordRepository.deleteById(id);
            responseObj.put("success", true);
            responseObj.put("message", "工作记录删除成功");
        } catch (Exception e) {
            responseObj.put("success", false);
            responseObj.put("message", "工作记录删除失败: " + e.getMessage());
        }
        return responseObj;
    }
}
