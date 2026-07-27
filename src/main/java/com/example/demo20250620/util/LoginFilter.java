package com.example.demo20250620.util;

import com.example.demo20250620.entity.SysUser;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

//import javax.servlet.*;
// 修改前
// import javax.servlet.annotation.WebFilter;
// 修改后
import jakarta.servlet.annotation.WebFilter;
import org.springframework.util.AntPathMatcher;
//import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

// @Component
@WebFilter(urlPatterns = "/*", filterName = "LoginFilter")
public class LoginFilter implements Filter {
    private static final Logger logger = LoggerFactory.getLogger(LoginFilter.class);
    //路径匹配器，支持通配符
    public static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        System.out.println("过滤器初始化");
        logger.info("过滤器初始化");
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        String url = request.getRequestURI();
//        System.out.println("过滤器执行，请求路径: "+url);

        String[] urls = new String[]{
                "/sysuseraction/login*",
                "/login*",
                "/useraction/demo",
                "/sysuseraction/logout*",
                "/sysuseraction/forgotPassword*",
                "/sysuseraction/resetPassword*",
                "/sysuseraction/register*",
        };

        //3、判断本次请求是否需要处理
        boolean check = check(urls, url);
        logger.info("过滤器执行，请求路径: {}",url);
        if(check){
            logger.info("不需要拦截的请求：{}",url);
            //将请求传递给链中的下一个过滤器
            filterChain.doFilter(servletRequest, servletResponse);
            return;
        }
        //判断登录状态，如果已经登录直接放行
        if(request.getSession().getAttribute("SYS_USER") != null){
            logger.info("通过该请求：id为{}用户已登录",request.getSession().getAttribute("SYS_USER"));
//            System.out.println("用户已登录: ");
//            SysUser a = (SysUser) request.getSession().getAttribute("SYS_USER");
//            System.out.println("用户已登录: "+a.getSysusername());
//            Long empId = (Long) request.getSession().getAttribute("employee");
            //这里将用户id放入当前线程中，方便后续使用
//            BaseContext.setCurrentId(empId);
            filterChain.doFilter(servletRequest,servletResponse);
            return;
        }else {
            logger.info("用户未登陆,拦截请求");
            HttpServletResponse response = (HttpServletResponse) servletResponse;
            response.setContentType("application/json;charset=UTF-8");
            response.setStatus(401);
            response.getWriter().write("{\"success\":false,\"message\":\"请先登录\"}");
            return;
        }
        //5、如果未登录则返回未登录结果，通过输出流方式向客户端页面响应数据
//        response.getWriter().write(JSON.toJSONString(R.error("NOTLOGIN")));
    }

    @Override
    public void destroy() {
        logger.info("过滤器销毁");
    }

    public boolean check(String[] urls, String requestURI){
        for(String url : urls){
            boolean match = PATH_MATCHER.match(url, requestURI);
            if(match){
                return true;
            }
        }
        return false;
    }
}