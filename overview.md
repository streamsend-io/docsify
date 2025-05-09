# Overview

**Welcome to Streamsend Docs**

Stream files (any content, any size) using a Kafka Cluster.

A Streamsend file-chunk pipeline is a fancy way to send a file:

## Why Stream Files?

Sometimes it make more sense to stream a file rather than to send a file using file-send utilities (such as mv, cp, scp, ftp or curl).

- Stream files as data-chunks, that fit inside the Kafka message limit for your cluster. Kafka is fast, and massively parallel: produce as many chunks as needed to stream a file of any size
- The Kafka protocol uses automatic-retry to ensure that all data is sent, even when network failures occur
- Create a Data Funnel where many Uploaders stream data to one Downloader
- Mirror files to multiple locations via a Kafka topic by starting multiple Downloaders
- Flexible configuration for strong encryption and compression
- Virtually unlimited parallel scalability for data uploaders and downloaders
- Leverage Apache Kafka with its vibrant open source development community

### What is data streaming?

Splitting (or "chunking") input files into events allows files of any size (and of any content type) to be streamed using a file streaming pipline.

A file streaming pipeline is built upon fifteen years of Apache Kafka engineering excellence, including unlimited scalability, low latency, multi-platform compatibility, robust security and a thriving engineering community.

### Files Alongside Events

Use Kafka for more: now you can use the Kafka pipes that send microservice-events to also send file-chunk events, using the same client & server infrastructure; the same authentication, authorisation, quotas, network bandwidth, scaling and observability

## Kafka Protocol

### Infinite Retries

Perhaps you need to send large volumes of images from a remote field-team with a poor network connection; where you want to "click send and forget" and not worry about network service interruptions.

### Low Latency

Most file-senders are sequential and serial: chunks of a file are sent in parallel, using Kafka topic partitions and consumer groups.

### Compression

Reduce bandwidth requirements and transfer times with built-in data compression that maintains file integrity while minimizing network usage.

### Flexible Encryption

Protect sensitive data with advanced encryption options that secure your information throughout the entire streaming process.

## See It In Action

The animation below demonstrates how the Uploader and Downloader work together in real-time, showing the log output from both sides as file chunks are transmitted through a Kafka topic:

<div style="display: flex; flex-direction: column; width: 100%; max-width: 900px; margin: 20px auto; background: white; border-radius: 8px; padding: 15px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
  <div style="text-align: center; margin-bottom: 20px;">
    <button id="toggle-animation-button" style="background-color: #4285F4; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px;">Pause Animation</button>
  </div>
  
  <div style="display: flex; gap: 20px;">
    <div style="flex: 1; border-radius: 8px; padding: 12px; height: 280px; overflow: auto; border: 2px solid #4285F4; background-color: rgba(66, 133, 244, 0.1);">
      <div style="font-weight: bold; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid rgba(0,0,0,0.1); color: #4285F4;">Uploader</div>
      <div id="uploader-logs-container"></div>
    </div>
    
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 10px; margin-top: 50px;">
      <div style="font-size: 12px; color: #5F6368; margin-bottom: 10px;">Kafka Topic</div>
      <div style="height: 100px; width: 2px; background: repeating-linear-gradient(to bottom, #5F6368 0, #5F6368 5px, transparent 5px, transparent 10px);"></div>
      <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #5F6368;"></div>
    </div>
    
    <div style="flex: 1; border-radius: 8px; padding: 12px; height: 280px; overflow: auto; border: 2px solid #34A853; background-color: rgba(52, 168, 83, 0.1);">
      <div style="font-weight: bold; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid rgba(0,0,0,0.1); color: #34A853;">Downloader</div>
      <div id="downloader-logs-container"></div>
    </div>
  </div>
  
  <div style="text-align: center; font-size: 12px; color: #5F6368; margin-top: 10px;">
    Visualization of file chunks being streamed from Uploader to Downloader through a Kafka topic
  </div>
</div>

*The Uploader splits the file into chunks and sends them to the Kafka topic, while the Downloader processes incoming chunks and reassembles the complete file. The animation repeats approximately every 15 seconds.*

<script>
document.addEventListener('DOMContentLoaded', function() {
  // Animation configuration
  const uploaderLogs = [
    { text: "audioRec_2.2MB.mpg: 2200000 bytes, starting chunking", delay: 300 },
    { text: "audioRec_2.2MB.mpg: (00001 of 00003) chunk uploaded", delay: 800 },
    { text: "audioRec_2.2MB.mpg: (00002 of 00003) chunk uploaded", delay: 1200 },
    { text: "audioRec_2.2MB.mpg: (00003 of 00003) chunk uploaded", delay: 900 },
    { text: "audioRec_2.2MB.mpg: finished 3 chunk uploads", delay: 400 },
    { text: "audioRec_2.2MB.mpg: MD5=4fb8086802ae70fc4eef88666eb96d40", delay: 600 }
  ];

  const downloaderLogs = [
    { text: "audioRec_2.2MB.mpg: (00001 of 00003) downloaded first chunk", delay: 300, requiresUploaderStep: 3 },
    { text: "audioRec_2.2MB.mpg: (00002 of 00003) consumed next chunk (1024000 downloaded)", delay: 1300, requiresUploaderStep: 3 },
    { text: "audioRec_2.2MB.mpg: (00003 of 00003) consumed next chunk (2048000 downloaded)", delay: 1100, requiresUploaderStep: 3 },
    { text: "audioRec_2.2MB.mpg: Merge complete (2200000 bytes)", delay: 800, requiresUploaderStep: 4 },
    { text: "audioRec_2.2MB.mpg: MD5 ok: 4fb8086802ae70fc4eef88666eb96d40", delay: 600, requiresUploaderStep: 5 }
  ];

  // Animation state
  let isRunning = true;
  let timeoutId = null;
  let cycleCount = 0;

  function initAnimation() {
    const toggleButton = document.getElementById('toggle-animation-button');
    const uploaderLogsEl = document.getElementById('uploader-logs-container');
    const downloaderLogsEl = document.getElementById('downloader-logs-container');
    
    if (!toggleButton || !uploaderLogsEl || !downloaderLogsEl) {
      console.log('Animation elements not found, retrying in 1 second...');
      setTimeout(initAnimation, 1000);
      return;
    }
    
    // Add toggle button functionality
    toggleButton.addEventListener('click', function() {
      isRunning = !isRunning;
      this.textContent = isRunning ? 'Pause Animation' : 'Start Animation';
      
      if (isRunning) {
        resetAnimation();
      } else if (timeoutId) {
        clearTimeout(timeoutId);
      }
    });
    
    // Add randomness to timing
    function addJitter(delay) {
      return delay + (Math.random() * 400 - 200);
    }

    // Add a log entry to the specified container
    function addLogEntry(container, text, type) {
      const logEntry = document.createElement('div');
      logEntry.style.cssText = 'font-family: monospace; padding: 3px 0; font-size: 13px; white-space: pre-wrap; word-break: break-all;';
      logEntry.style.color = type === 'uploader' ? '#174EA6' : '#0D652D';
      logEntry.textContent = text;
      container.appendChild(logEntry);
      container.scrollTop = container.scrollHeight;
    }

    // Reset the animation
    function resetAnimation() {
      uploaderLogsEl.innerHTML = '';
      downloaderLogsEl.innerHTML = '';
      cycleCount++;
      runAnimation(0, 0);
    }

    // Run the animation
    function runAnimation(uploaderStep, downloaderStep) {
      const currentCycle = cycleCount;
      
      if (!isRunning || currentCycle !== cycleCount) return;

      // Handle uploader logs
      if (uploaderStep < uploaderLogs.length) {
        timeoutId = setTimeout(function() {
          if (currentCycle !== cycleCount) return;
          
          addLogEntry(uploaderLogsEl, uploaderLogs[uploaderStep].text, 'uploader');
          
          runAnimation(uploaderStep + 1, downloaderStep);
        }, addJitter(uploaderLogs[uploaderStep].delay));
      }
      
      // Handle downloader logs
      else if (downloaderStep < downloaderLogs.length) {
        const currentDownloaderLog = downloaderLogs[downloaderStep];
        
        if (uploaderStep >= currentDownloaderLog.requiresUploaderStep) {
          timeoutId = setTimeout(function() {
            if (currentCycle !== cycleCount) return;
            
            addLogEntry(downloaderLogsEl, currentDownloaderLog.text, 'downloader');
            
            runAnimation(uploaderStep, downloaderStep + 1);
          }, addJitter(currentDownloaderLog.delay));
        } else {
          runAnimation(uploaderStep, downloaderStep);
        }
      }
      
      // Restart animation after completion and a brief pause
      else if (uploaderStep >= uploaderLogs.length && downloaderStep >= downloaderLogs.length) {
        timeoutId = setTimeout(function() {
          if (currentCycle !== cycleCount) return;
          resetAnimation();
        }, 3000);
      }
    }
    
    // Start the animation
    resetAnimation();
  }

  // Try to initialize as soon as possible
  initAnimation();
  
  // Also try initializing when Docsify is ready (if using Docsify)
  if (window.$docsify) {
    window.$docsify.plugins = [].concat(function(hook) {
      hook.doneEach(function() {
        setTimeout(initAnimation, 500);
      });
    }, window.$docsify.plugins || []);
  }
});
</script>

## What does a Streamsend file-chunk pipeline do?

A file-chunk streming pipeline must operate as a complete pipeline with Uploaders producing messages, and Downloaders consuming messages from the same topic.

The Uploader splits input files into fixed size messages that are produced to a kafka topic.

The Downloader consumes the file chunks and reassembles the file at the target server.

## What does a Streamsend file-chunk pipeline not do?

A Streamsend file-chunk pipeline doesn't care what is actually in a file: so it cannot register (or validate) a schema; or convert or unzip contents

It only chunks a file along binary.chunk.file.bytes
boundaries: not on any other measure (such as end of line; or object; elapsed time or frames)

A Streamsend file-chunk pipeline recreates the file: it cannot be used to stream chunks to a different consumer (for example, to a stream processor or to a object store)

Chunking and merging require measurable elapsed time: so while this technique is tunable and potentially very fast; it is not in the realm of ultra-low latency data streaming (for high-frequency trading or any microsecond (or indeed millisecond) requirements)
