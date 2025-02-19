package com.dariotintore.tesi.exerciseservice.config;

import lombok.AllArgsConstructor;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@EnableWebSecurity
@AllArgsConstructor

public class SecurityConfig extends WebSecurityConfigurerAdapter {
    
    @Override
    public void configure(HttpSecurity httpSecurity) throws Exception {
    	httpSecurity
                .cors()
                .and()
                .csrf().disable()
                .authorizeRequests()
                .antMatchers("/**").permitAll();
        httpSecurity.headers().frameOptions().disable();
    }
}