package com.clintchecketts.example.errorlogging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.*;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

@Controller
@EnableAutoConfiguration
public class MainConfiguration {
    private static Logger LOG = LoggerFactory.getLogger(MainConfiguration.class);

    public static void main(String[] args) throws Exception {
        SpringApplication.run(MainConfiguration.class, args);
    }

    @RequestMapping(method = RequestMethod.POST, value = "/logError", produces = {MediaType.APPLICATION_JSON_VALUE})
    @ResponseStatus(HttpStatus.CREATED)
    void logError( @RequestBody Map<String,String> log) {
        LOG.error("Client Error: {}", log);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/boom", produces = {MediaType.APPLICATION_JSON_VALUE})
    ResponseEntity<Void> boom() {
        return new ResponseEntity<Void>(HttpStatus.FORBIDDEN);
    }

}

