
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

<div class="streamsend-animation-container" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; display: flex; flex-direction: column; width: 100%; max-width: 900px; margin: 20px auto; background: white; border-radius: 8px; padding: 15px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
  <div class="animation-controls" style="text-align: center; margin-bottom: 20px;">
    <button onclick="window.toggleStreamAnimation()" style="background-color: #4285F4; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px;">Pause Animation</button>
  </div>
  
  <div class="log-panels" style="display: flex; gap: 20px;">
    <div class="uploader-panel" style="flex: 1; border-radius: 8px; padding: 12px; height: 280px; overflow: auto; border: 2px solid #4285F4; background-color: rgba(66, 133, 244, 0.1);">
      <div class="uploader-title" style="font-weight: bold; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid rgba(0,0,0,0.1); color: #4285F4;">Uploader</div>
      <div id="uploader-logs-container"></div>
    </div>
    
    <div class="connector" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 10px; margin-top: 50px;">
      <div class="kafka-label" style="font-size: 12px; color: #5F6368; margin-bottom: 10px;">Kafka Topic</div>
      <div class="arrow-line" style="height: 100px; width: 2px; background: repeating-linear-gradient(to bottom, #5F6368 0, #5F6368 5px, transparent 5px, transparent 10px);"></div>
      <div class="arrow-head" style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #5F6368;"></div>
    </div>
    
    <div class="downloader-panel" style="flex: 1; border-radius: 8px; padding: 12px; height: 280px; overflow: auto; border: 2px solid #34A853; background-color: rgba(52, 168, 83, 0.1);">
      <div class="downloader-title" style="font-weight: bold; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid rgba(0,0,0,0.1); color: #34A853;">Downloader</div>
      <div id="downloader-logs-container"></div>
    </div>
  </div>
  
  <div class="animation-footer" style="text-align: center; font-size: 12px; color: #5F6368; margin-top: 10px;">
    Visualization of file chunks being streamed from Uploader to Downloader through a Kafka topic
  </div>
</div>

*The Uploader splits the file into chunks and sends them to the Kafka topic, while the Downloader processes incoming chunks and reassembles the complete file. The animation repeats approximately every 15 seconds.*

<script>
// Global version to avoid scope issues
window.streamAnimation = {
  isRunning: true,
  timeoutId: null,
  cycleCount: 0,
  
  // Animation configuration
  uploaderLogs: [
    { text: "audioRec_2.2MB.mpg: 2200000 bytes, starting chunking", delay: 300 },
    { text: "audioRec_2.2MB.mpg: (00001 of 00003) chunk uploaded", delay: 800 },
    { text: "audioRec_2.2MB.mpg: (00002 of 00003) chunk uploaded", delay: 1200 },
    { text: "audioRec_2.2MB.mpg: (00003 of 00003) chunk uploaded", delay: 900 },
    { text: "audioRec_2.2MB.mpg: finished 3 chunk uploads", delay: 400 },
    { text: "audioRec_2.2MB.mpg: MD5=4fb8086802ae70fc4eef88666eb96d40", delay: 600 }
  ],
  
  downloaderLogs: [
    { text: "audioRec_2.2MB.mpg: (00001 of 00003) downloaded first chunk", delay: 300, requiresUploaderStep: 3 },
    { text: "audioRec_2.2MB.mpg: (00002 of 00003) consumed next chunk (1024000 downloaded)", delay: 1300, requiresUploaderStep: 3 },
    { text: "audioRec_2.2MB.mpg: (00003 of 00003) consumed next chunk (2048000 downloaded)", delay: 1100, requiresUploaderStep: 3 },
    { text: "audioRec_2.2MB.mpg: Merge complete (2200000 bytes)", delay: 800, requiresUploaderStep: 4 },
    { text: "audioRec_2.2MB.mpg: MD5 ok: 4fb8086802ae70fc4eef88666eb96d40", delay: 600, requiresUploaderStep: 5 }
  ]
};

// Add randomness to timing
window.addJitter = function(delay) {
  return delay + (Math.random() * 400 - 200);
};

// Add a log entry to the specified container
window.addLogEntry = function(containerId, text, type) {
  var container = document.getElementById(containerId);
  if (!container) {
    console.error('Container not found:', containerId);
    return;
  }
  
  var logEntry = document.createElement('div');
  logEntry.style.cssText = 'font-family: monospace; padding: 3px 0; font-size: 13px; white-space: pre-wrap; word-break: break-all;';
  logEntry.style.color = type === 'uploader' ? '#174EA6' : '#0D652D';
  logEntry.textContent = text;
  container.appendChild(logEntry);
  container.scrollTop = container.scrollHeight;
  
  console.log('Added log entry to', containerId, text);
};

// Reset the animation
window.resetAnimation = function() {
  var uploaderLogsEl = document.getElementById('uploader-logs-container');
  var downloaderLogsEl = document.getElementById('downloader-logs-container');
  
  if (uploaderLogsEl) uploaderLogsEl.innerHTML = '';
  if (downloaderLogsEl) downloaderLogsEl.innerHTML = '';
  
  window.streamAnimation.cycleCount++;
  window.runAnimation(0, 0);
  
  console.log('Animation reset');
};

// Run the animation
window.runAnimation = function(uploaderStep, downloaderStep) {
  var animation = window.streamAnimation;
  var currentCycle = animation.cycleCount;
  
  if (!animation.isRunning || currentCycle !== animation.cycleCount) return;

  console.log('Running animation step:', uploaderStep, downloaderStep);

  // Handle uploader logs
  if (uploaderStep < animation.uploaderLogs.length) {
    animation.timeoutId = setTimeout(function() {
      if (currentCycle !== animation.cycleCount) return;
      
      window.addLogEntry('uploader-logs-container', animation.uploaderLogs[uploaderStep].text, 'uploader');
      
      window.runAnimation(uploaderStep + 1, downloaderStep);
    }, window.addJitter(animation.uploaderLogs[uploaderStep].delay));
  }
  
  // Handle downloader logs
  else if (downloaderStep < animation.downloaderLogs.length) {
    var currentDownloaderLog = animation.downloaderLogs[downloaderStep];
    
    if (uploaderStep >= currentDownloaderLog.requiresUploaderStep) {
      animation.timeoutId = setTimeout(function() {
        if (currentCycle !== animation.cycleCount) return;
        
        window.addLogEntry('downloader-logs-container', currentDownloaderLog.text, 'downloader');
        
        window.runAnimation(uploaderStep, downloaderStep + 1);
      }, window.addJitter(currentDownloaderLog.delay));
    } else {
      window.runAnimation(uploaderStep, downloaderStep);
    }
  }
  
  // Restart animation after completion and a brief pause
  else if (uploaderStep >= animation.uploaderLogs.length && downloaderStep >= animation.downloaderLogs.length) {
    animation.timeoutId = setTimeout(function() {
      if (currentCycle !== animation.cycleCount) return;
      window.resetAnimation();
    }, 3000);
  }
};

// Toggle animation play/pause
window.toggleStreamAnimation = function() {
  var animation = window.streamAnimation;
  animation.isRunning = !animation.isRunning;
  
  var buttons = document.querySelectorAll('.animation-controls button');
  buttons.forEach(function(button) {
    button.textContent = animation.isRunning ? 'Pause Animation' : 'Start Animation';
  });
  
  if (animation.isRunning) {
    window.resetAnimation();
  } else if (animation.timeoutId) {
    clearTimeout(animation.timeoutId);
  }
  
  console.log('Animation toggled:', animation.isRunning ? 'running' : 'paused');
};

// Start the animation - using multiple methods to ensure it runs
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOMContentLoaded event fired');
  setTimeout(function() {
    console.log('Starting animation (DOMContentLoaded timeout)');
    window.resetAnimation();
  }, 1000);
});

// Alternative approach with window.onload
window.onload = function() {
  console.log('window.onload event fired');
  setTimeout(function() {
    console.log('Starting animation (window.onload timeout)');
    window.resetAnimation();
  }, 1500);
};

// Immediate attempt - may work if script runs after DOM is already loaded
setTimeout(function() {
  console.log('Immediate timeout fired');
  window.resetAnimation();
}, 2000);

console.log('Animation script loaded');
</script>

<style>
.streamsend-animation-container {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 900px;
  margin: 20px auto;
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.animation-controls {
  text-align: center;
  margin-bottom: 20px;
}

.animation-button {
  background-color: #4285F4;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.animation-button:hover {
  background-color: #3367d6;
}

.log-panels {
  display: flex;
  gap: 20px;
}

.log-panel {
  flex: 1;
  border-radius: 8px;
  padding: 12px;
  height: 280px;
  overflow: auto;
}

.uploader-panel {
  border: 2px solid #4285F4;
  background-color: rgba(66, 133, 244, 0.1);
}

.downloader-panel {
  border: 2px solid #34A853;
  background-color: rgba(52, 168, 83, 0.1);
}

.panel-title {
  font-weight: bold;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid rgba(0,0,0,0.1);
}

.uploader-title {
  color: #4285F4;
}

.downloader-title {
  color: #34A853;
}

.log-entry {
  font-family: monospace;
  padding: 3px 0;
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-all;
}

.uploader-log {
  color: #174EA6;
}

.downloader-log {
  color: #0D652D;
}

.connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  margin-top: 50px;
}

.kafka-label {
  font-size: 12px;
  color: #5F6368;
  margin-bottom: 10px;
}

.arrow-line {
  height: 100px;
  width: 2px;
  background: repeating-linear-gradient(to bottom, #5F6368 0, #5F6368 5px, transparent 5px, transparent 10px);
}

.arrow-head {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 8px solid #5F6368;
}

.animation-footer {
  text-align: center;
  font-size: 12px;
  color: #5F6368;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .log-panels {
    flex-direction: column;
  }
  
  .connector {
    display: none;
  }
}
</style>

<script>
// Wait for Docsify to finish rendering the page
window.$docsify.plugins = [].concat(function(hook, vm) {
  hook.doneEach(function() {
    // This runs after each page is rendered
    setTimeout(initStreamsendAnimation, 500);
  });
}, window.$docsify.plugins || []);

// This function creates and manages the Streamsend animation
function initStreamsendAnimation() {
  // Create animation container
  const placeholder = document.getElementById('streamsend-animation');
  if (!placeholder) return; // Exit if we're not on the right page
  
  // Clear any previous instances
  placeholder.innerHTML = '';
  
  const container = document.createElement('div');
  container.className = 'streamsend-animation-container';
  container.innerHTML = `
    <div class="animation-controls">
      <button id="toggle-animation" class="animation-button">Pause Animation</button>
    </div>
    
    <div class="log-panels">
      <div class="log-panel uploader-panel">
        <div class="panel-title uploader-title">Uploader</div>
        <div id="uploader-logs"></div>
      </div>
      
      <div class="connector">
        <div class="kafka-label">Kafka Topic</div>
        <div class="arrow-line"></div>
        <div class="arrow-head"></div>
      </div>
      
      <div class="log-panel downloader-panel">
        <div class="panel-title downloader-title">Downloader</div>
        <div id="downloader-logs"></div>
      </div>
    </div>
    
    <div class="animation-footer">
      Visualization of file chunks being streamed from Uploader to Downloader through a Kafka topic
    </div>
  `;
  
  placeholder.appendChild(container);
  
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

  // DOM elements
  const uploaderLogsEl = document.getElementById('uploader-logs');
  const downloaderLogsEl = document.getElementById('downloader-logs');
  const toggleButton = document.getElementById('toggle-animation');
  
  if (!uploaderLogsEl || !downloaderLogsEl || !toggleButton) {
    console.error('Animation elements not found!');
    return;
  }

  // Add randomness to timing
  function addJitter(delay) {
    return delay + (Math.random() * 400 - 200);
  }

  // Add a log entry to the specified container
  function addLogEntry(container, text, type) {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}-log`;
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
      timeoutId = setTimeout(() => {
        if (currentCycle !== cycleCount) return;
        
        addLogEntry(uploaderLogsEl, uploaderLogs[uploaderStep].text, 'uploader');
        
        runAnimation(uploaderStep + 1, downloaderStep);
      }, addJitter(uploaderLogs[uploaderStep].delay));
    }
    
    // Handle downloader logs
    else if (downloaderStep < downloaderLogs.length) {
      const currentDownloaderLog = downloaderLogs[downloaderStep];
      
      if (uploaderStep >= currentDownloaderLog.requiresUploaderStep) {
        timeoutId = setTimeout(() => {
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
      timeoutId = setTimeout(() => {
        if (currentCycle !== cycleCount) return;
        resetAnimation();
      }, 3000);
    }
  }

  // Toggle animation play/pause
  toggleButton.addEventListener('click', () => {
    isRunning = !isRunning;
    toggleButton.textContent = isRunning ? 'Pause Animation' : 'Start Animation';
    
    if (isRunning) {
      resetAnimation();
    } else if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });

  // Start the animation
  resetAnimation();
  
  // Debug info
  console.log('Animation initialized successfully!');
}

// Also try the fallback approach 
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    if (!document.querySelector('.streamsend-animation-container')) {
      console.log('Trying fallback animation initialization');
      initStreamsendAnimation();
    }
  }, 2000);
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
