package com.example.demo20250620.controller;

import com.example.demo20250620.entity.SysUser;
import com.example.demo20250620.entity.WeeklyReport;
import com.example.demo20250620.repository.WeeklyReportRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/weeklyreport")
@CrossOrigin(origins = "*", maxAge = 3600)
public class WeeklyReportController {

    @Autowired
    private WeeklyReportRepository weeklyReportRepository;

    @GetMapping("/allweeklyreports")
    public Map<String, Object> getAllWeeklyReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            jakarta.servlet.http.HttpServletRequest httpRequest) {
        Map<String, Object> responseObj = new HashMap<>();
        try {
            jakarta.servlet.http.HttpSession session = httpRequest.getSession(false);
            Integer currentUserRole = null;
            Long currentUserId = null;
            if (session != null) {
                Optional<SysUser> currentUser = (Optional<SysUser>) session.getAttribute("SYS_USER");
                if (currentUser.isPresent()) {
                    currentUserRole = currentUser.get().getSysuserrole().intValue();
                    currentUserId = currentUser.get().getId();
                }
            }

            List<WeeklyReport> reports;
            
            if (currentUserRole != null && currentUserRole == 1) {
                reports = weeklyReportRepository.findAllWithUserList();
            } else if (currentUserId != null) {
                reports = weeklyReportRepository.findByUserIdOrderByWeekRangeDesc(currentUserId);
            } else {
                reports = new ArrayList<>();
            }

            int start = (page - 1) * size;
            int end = Math.min(start + size, reports.size());
            List<WeeklyReport> pagedReports = reports.subList(Math.max(0, Math.min(start, reports.size())), end);

            List<Map<String, Object>> dataList = new ArrayList<>();
            for (WeeklyReport report : pagedReports) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", report.getId());
                item.put("weekRange", report.getWeekRange());
                item.put("workContent", report.getWorkContent());
                item.put("detail", report.getDetail() != null ? report.getDetail() : "待确认");
                item.put("createTime", report.getCreateTime() != null ? report.getCreateTime().toString() : "");
                item.put("updateTime", report.getUpdateTime() != null ? report.getUpdateTime().toString() : "");
                if (report.getUser() != null) {
                    item.put("username", report.getUser().getSysusername());
                } else {
                    item.put("username", "");
                }
                dataList.add(item);
            }

            responseObj.put("success", true);
            responseObj.put("total", reports.size());
            responseObj.put("data", dataList);
        } catch (Exception e) {
            e.printStackTrace();
            responseObj.put("success", false);
            responseObj.put("message", "获取周报列表失败: " + e.getMessage());
        }
        return responseObj;
    }

    @GetMapping("/checkRole")
    public Map<String, Object> checkRole(jakarta.servlet.http.HttpServletRequest httpRequest) {
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
            
            responseObj.put("success", true);
            responseObj.put("role", currentUserRole != null ? currentUserRole : 0);
        } catch (Exception e) {
            responseObj.put("success", false);
            responseObj.put("message", "获取角色失败");
        }
        return responseObj;
    }

    @GetMapping("/getWeekRange")
    public Map<String, Object> getWeekRange(@RequestParam(defaultValue = "0") int offset) {
        Map<String, Object> responseObj = new HashMap<>();
        try {
            LocalDate today = LocalDate.now();
            LocalDate monday = today.minusDays(today.getDayOfWeek().getValue() - 1);
            
            if (offset != 0) {
                monday = monday.plusWeeks(offset);
            }

            LocalDate sunday = monday.plusDays(6);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            String weekRange = monday.format(formatter) + " 至 " + sunday.format(formatter);

            responseObj.put("success", true);
            responseObj.put("weekRange", weekRange);
            responseObj.put("monday", monday.format(formatter));
            responseObj.put("sunday", sunday.format(formatter));
        } catch (Exception e) {
            responseObj.put("success", false);
            responseObj.put("message", "获取周范围失败: " + e.getMessage());
        }
        return responseObj;
    }

    @GetMapping("/getWeekRangeList")
    public Map<String, Object> getWeekRangeList() {
        Map<String, Object> responseObj = new HashMap<>();
        try {
            LocalDate today = LocalDate.now();
            LocalDate monday = today.minusDays(today.getDayOfWeek().getValue() - 1);
            
            List<Map<String, String>> weekRanges = java.util.stream.IntStream.range(-12, 1)
                    .mapToObj(i -> {
                        LocalDate weekStart = monday.plusWeeks(i);
                        LocalDate weekEnd = weekStart.plusDays(6);
                        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                        Map<String, String> range = new HashMap<>();
                        range.put("weekRange", weekStart.format(formatter) + " 至 " + weekEnd.format(formatter));
                        range.put("display", weekStart.format(formatter) + " 至 " + weekEnd.format(formatter));
                        return range;
                    })
                    .collect(java.util.stream.Collectors.toList());

            responseObj.put("success", true);
            responseObj.put("data", weekRanges);
        } catch (Exception e) {
            responseObj.put("success", false);
            responseObj.put("message", "获取周范围列表失败: " + e.getMessage());
        }
        return responseObj;
    }

    @PostMapping("/createWeeklyReport")
    public Map<String, Object> createWeeklyReport(@RequestBody WeeklyReport weeklyReport, jakarta.servlet.http.HttpServletRequest httpRequest) {
        Map<String, Object> responseObj = new HashMap<>();
        try {
            jakarta.servlet.http.HttpSession session = httpRequest.getSession(false);
            if (session != null) {
                Optional<SysUser> currentUser = (Optional<SysUser>) session.getAttribute("SYS_USER");
                if (currentUser.isPresent()) {
                    weeklyReport.setUser(currentUser.get());
                }
            }

            weeklyReport.setDetail("待确认");

            WeeklyReport savedReport = weeklyReportRepository.save(weeklyReport);
            responseObj.put("success", true);
            responseObj.put("message", "周报创建成功");
            responseObj.put("data", savedReport);
        } catch (Exception e) {
            responseObj.put("success", false);
            responseObj.put("message", "周报创建失败: " + e.getMessage());
        }
        return responseObj;
    }

    @PutMapping("/updateWeeklyReport")
    public Map<String, Object> updateWeeklyReport(@RequestBody WeeklyReport weeklyReport, jakarta.servlet.http.HttpServletRequest httpRequest) {
        Map<String, Object> responseObj = new HashMap<>();
        try {
            jakarta.servlet.http.HttpSession session = httpRequest.getSession(false);
            Integer currentUserRole = null;
            Long currentUserId = null;
            if (session != null) {
                Optional<SysUser> currentUser = (Optional<SysUser>) session.getAttribute("SYS_USER");
                if (currentUser.isPresent()) {
                    currentUserRole = currentUser.get().getSysuserrole().intValue();
                    currentUserId = currentUser.get().getId();
                }
            }

            Optional<WeeklyReport> existingOpt = weeklyReportRepository.findById(weeklyReport.getId());
            if (existingOpt.isEmpty()) {
                responseObj.put("success", false);
                responseObj.put("message", "周报记录不存在");
                return responseObj;
            }

            WeeklyReport existing = existingOpt.get();
            String detail = existing.getDetail();

            if ("待确认".equals(detail)) {
                if (currentUserRole == null || currentUserRole != 2) {
                    responseObj.put("success", false);
                    responseObj.put("message", "待确认的周报只有普通用户可以修改");
                    return responseObj;
                }
                if (currentUserId == null || !currentUserId.equals(existing.getUser().getId())) {
                    responseObj.put("success", false);
                    responseObj.put("message", "只能修改自己的周报");
                    return responseObj;
                }
            } else if ("审核通过".equals(detail)) {
                if (currentUserRole == null || currentUserRole != 1) {
                    responseObj.put("success", false);
                    responseObj.put("message", "审核通过的周报只有管理员可以修改");
                    return responseObj;
                }
            }

            existing.setWeekRange(weeklyReport.getWeekRange());
            existing.setWorkContent(weeklyReport.getWorkContent());

            WeeklyReport updatedReport = weeklyReportRepository.save(existing);
            responseObj.put("success", true);
            responseObj.put("message", "周报更新成功");
            responseObj.put("data", updatedReport);
        } catch (Exception e) {
            responseObj.put("success", false);
            responseObj.put("message", "周报更新失败: " + e.getMessage());
        }
        return responseObj;
    }

    @DeleteMapping("/deleteWeeklyReport/{id}")
    public Map<String, Object> deleteWeeklyReport(@PathVariable Long id, jakarta.servlet.http.HttpServletRequest httpRequest) {
        Map<String, Object> responseObj = new HashMap<>();
        try {
            jakarta.servlet.http.HttpSession session = httpRequest.getSession(false);
            Integer currentUserRole = null;
            Long currentUserId = null;
            if (session != null) {
                Optional<SysUser> currentUser = (Optional<SysUser>) session.getAttribute("SYS_USER");
                if (currentUser.isPresent()) {
                    currentUserRole = currentUser.get().getSysuserrole().intValue();
                    currentUserId = currentUser.get().getId();
                }
            }

            Optional<WeeklyReport> existingOpt = weeklyReportRepository.findById(id);
            if (existingOpt.isEmpty()) {
                responseObj.put("success", false);
                responseObj.put("message", "周报记录不存在");
                return responseObj;
            }

            WeeklyReport existing = existingOpt.get();
            String detail = existing.getDetail();

            if ("待确认".equals(detail)) {
                if (currentUserRole == null || currentUserRole != 2) {
                    responseObj.put("success", false);
                    responseObj.put("message", "待确认的周报只有普通用户可以删除");
                    return responseObj;
                }
                if (currentUserId == null || !currentUserId.equals(existing.getUser().getId())) {
                    responseObj.put("success", false);
                    responseObj.put("message", "只能删除自己的周报");
                    return responseObj;
                }
            } else if ("审核通过".equals(detail)) {
                if (currentUserRole == null || currentUserRole != 1) {
                    responseObj.put("success", false);
                    responseObj.put("message", "审核通过的周报只有管理员可以删除");
                    return responseObj;
                }
            }

            weeklyReportRepository.deleteById(id);
            responseObj.put("success", true);
            responseObj.put("message", "周报删除成功");
        } catch (Exception e) {
            responseObj.put("success", false);
            responseObj.put("message", "周报删除失败: " + e.getMessage());
        }
        return responseObj;
    }

    @PutMapping("/approveWeeklyReport/{id}")
    public Map<String, Object> approveWeeklyReport(@PathVariable Long id, jakarta.servlet.http.HttpServletRequest httpRequest) {
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
                responseObj.put("message", "只有管理员才能审核周报");
                return responseObj;
            }

            Optional<WeeklyReport> existingOpt = weeklyReportRepository.findById(id);
            if (existingOpt.isEmpty()) {
                responseObj.put("success", false);
                responseObj.put("message", "周报记录不存在");
                return responseObj;
            }

            WeeklyReport existing = existingOpt.get();
            existing.setDetail("审核通过");

            weeklyReportRepository.save(existing);
            responseObj.put("success", true);
            responseObj.put("message", "周报审核通过");
        } catch (Exception e) {
            responseObj.put("success", false);
            responseObj.put("message", "周报审核失败: " + e.getMessage());
        }
        return responseObj;
    }

    @PutMapping("/approveAllWeeklyReports")
    public Map<String, Object> approveAllWeeklyReports(jakarta.servlet.http.HttpServletRequest httpRequest) {
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
                responseObj.put("message", "只有管理员才能批量审核周报");
                return responseObj;
            }

            List<WeeklyReport> pendingReports = weeklyReportRepository.findByDetailPending();
            if (pendingReports.isEmpty()) {
                responseObj.put("success", false);
                responseObj.put("message", "没有待确认的周报");
                return responseObj;
            }

            int count = 0;
            for (WeeklyReport report : pendingReports) {
                report.setDetail("审核通过");
                weeklyReportRepository.save(report);
                count++;
            }

            responseObj.put("success", true);
            responseObj.put("message", "成功审核通过 " + count + " 条周报");
        } catch (Exception e) {
            responseObj.put("success", false);
            responseObj.put("message", "批量审核周报失败: " + e.getMessage());
        }
        return responseObj;
    }

    @GetMapping("/exportWeeklyReports")
    public void exportWeeklyReports(jakarta.servlet.http.HttpServletRequest httpRequest, jakarta.servlet.http.HttpServletResponse httpResponse) {
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
                httpResponse.setStatus(403);
                httpResponse.getWriter().write("只有管理员才能导出周报");
                return;
            }

            List<WeeklyReport> reports = weeklyReportRepository.findAllWithUserList();

            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("周报");

            Row headerRow = sheet.createRow(0);
            String[] headers = {"序号", "周范围", "工作内容", "用户", "状态"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                CellStyle style = workbook.createCellStyle();
                Font font = workbook.createFont();
                font.setBold(true);
                style.setFont(font);
                cell.setCellStyle(style);
            }

            int rowNum = 1;
            for (WeeklyReport report : reports) {
                Row row = sheet.createRow(rowNum);
                row.createCell(0).setCellValue(rowNum);
                row.createCell(1).setCellValue(report.getWeekRange() != null ? report.getWeekRange() : "");
                row.createCell(2).setCellValue(report.getWorkContent() != null ? report.getWorkContent() : "");
                row.createCell(3).setCellValue(report.getUser() != null && report.getUser().getSysusername() != null ? report.getUser().getSysusername() : "");
                row.createCell(4).setCellValue(report.getDetail() != null ? report.getDetail() : "待确认");
                rowNum++;
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            workbook.close();

            byte[] excelBytes = outputStream.toByteArray();

            httpResponse.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            httpResponse.setHeader("Content-Disposition", "attachment; filename=weekly_reports.xlsx");
            httpResponse.setContentLength(excelBytes.length);

            httpResponse.getOutputStream().write(excelBytes);
            httpResponse.getOutputStream().flush();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
