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

## What does a Streamsend file-chunk pipeline do?

A file-chunk streming pipeline must operate as a complete pipeline with Uploaders producing messages, and Downloaders consuming messages from the same topic.

<div style="display: flex; flex-direction: column; width: 100%; max-width: 900px; margin: 20px auto; background: white; border-radius: 8px; padding: 15px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
  <div style="display: flex; gap: 20px;">
    <!-- Uploader Panel -->
    <div style="flex: 1; border-radius: 8px; padding: 12px; height: 280px; overflow: auto; border: 2px solid #4285F4; background-color: rgba(66, 133, 244, 0.1);">
      <div style="font-weight: bold; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid rgba(0,0,0,0.1); color: #4285F4;">Uploader</div>
      <div style="font-family: monospace; font-size: 12px;">
        <div style="color: #174EA6; padding: 3px 0;">audio.mpg: 2200000 bytes, starting chunking</div>
        <div style="color: #174EA6; padding: 3px 0;">audio.mpg: (01 of 03) chunk uploaded</div>
        <div style="color: #174EA6; padding: 3px 0;">audio.mpg: (02 of 03) chunk uploaded</div>
        <div style="color: #174EA6; padding: 3px 0;">audio.mpg: (03 of 03) chunk uploaded</div>
        <div style="color: #174EA6; padding: 3px 0;">audio.mpg: finished 3 chunk uploads</div>
        <div style="color: #174EA6; padding: 3px 0;">audio.mpg: MD5=4fb8086802ae70fc4eef88666eb96d40</div>
      </div>
    </div>
    
    <!-- Kafka Topic Connector -->
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 10px; margin-top: 50px;">
      <div style="font-size: 12px; color: #5F6368; margin-bottom: 10px;">Kafka Topic</div>
      <div style="height: 100px; width: 2px; background: repeating-linear-gradient(to bottom, #5F6368 0, #5F6368 5px, transparent 5px, transparent 10px);"></div>
      <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #5F6368;"></div>
    </div>
    
    <!-- Downloader Panel -->
    <div style="flex: 1; border-radius: 8px; padding: 12px; height: 280px; overflow: auto; border: 2px solid #34A853; background-color: rgba(52, 168, 83, 0.1);">
      <div style="font-weight: bold; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid rgba(0,0,0,0.1); color: #34A853;">Downloader</div>
      <div style="font-family: monospace; font-size: 12px;">
        <div style="color: #0D652D; padding: 3px 0;">audio.mpg: (01 of 03) downloaded first chunk</div>
        <div style="color: #0D652D; padding: 3px 0;">audio.mpg: (02 of 03) consumed next chunk (1024000 downloaded)</div>
        <div style="color: #0D652D; padding: 3px 0;">audio.mpg: (03 of 03) consumed next chunk (2048000 downloaded)</div>
        <div style="color: #0D652D; padding: 3px 0;">audio.mpg: Merge complete (2200000 bytes)</div>
        <div style="color: #0D652D; padding: 3px 0;">audio.mpg: MD5 ok: 4fb8086802ae70fc4eef88666eb96d40</div>
      </div>
    </div>
  </div>
  
  <div style="text-align: center; font-size: 12px; color: #5F6368; margin-top: 10px;">
    Visualization of file chunks being streamed from Uploader to Downloader through a Kafka topic
  </div>
</div>

*The Uploader splits the file into chunks and sends them to the Kafka topic, while the Downloader processes incoming chunks and reassembles the complete file.*

The Uploader splits input files into fixed size messages that are produced to a kafka topic.

The Downloader consumes the file chunks and reassembles the file at the target server.

## What does a Streamsend file-chunk pipeline not do?

A Streamsend file-chunk pipeline doesn't care what is actually in a file: so it cannot register (or validate) a schema; or convert or unzip contents

It only chunks a file along binary.chunk.file.bytes
boundaries: not on any other measure (such as end of line; or object; elapsed time or frames)

A Streamsend file-chunk pipeline recreates the file: it cannot be used to stream chunks to a different consumer (for example, to a stream processor or to a object store)

Chunking and merging require measurable elapsed time: so while this technique is tunable and potentially very fast; it is not in the realm of ultra-low latency data streaming (for high-frequency trading or any microsecond (or indeed millisecond) requirements)
