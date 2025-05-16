# Overview

**Welcome to Streamsend Docs**

Stream files (any content, any size) using a Kafka Cluster.

## What does a Streamsend file-chunk pipeline do?

A Streamsend file-chunk pipeline is a fancy way to send a file: operating end to end with Uploaders producing messages and Downloaders consuming messages using the same topic.

<div id="streamsend-animation-target" style="display: flex; flex-direction: column; width: 100%; max-width: 900px; margin: 20px auto; background: white; border-radius: 8px; padding: 15px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
  <div style="display: flex; gap: 20px;">
    <!-- Uploader Panel -->
    <div style="flex: 1; border-radius: 8px; padding: 12px; height: 280px; overflow: auto; border: 2px solid #4285F4; background-color: rgba(66, 133, 244, 0.1);">
      <div style="font-weight: bold; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid rgba(0,0,0,0.1); color: #4285F4;">Uploader</div>
      <div style="font-family: monospace; font-size: 12px;">
      </div>
    </div>
    
    <!-- Kafka Topic Connector -->
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 10px; margin-top: 50px;">
      <div style="font-size: 12px; color: #5F6368; margin-bottom: 10px;">file-chunk-topic</div>
      <div style="height: 100px; width: 2px; background: repeating-linear-gradient(to bottom, #5F6368 0, #5F6368 5px, transparent 5px, transparent 10px);"></div>
      <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #5F6368;"></div>
    </div>
    
    <!-- Downloader Panel -->
    <div style="flex: 1; border-radius: 8px; padding: 12px; height: 280px; overflow: auto; border: 2px solid #34A853; background-color: rgba(52, 168, 83, 0.1);">
      <div style="font-weight: bold; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid rgba(0,0,0,0.1); color: #34A853;">Downloader</div>
      <div style="font-family: monospace; font-size: 12px;">
      </div>
    </div>
  </div>
  
  <div style="text-align: center; font-size: 12px; color: #5F6368; margin-top: 10px;">
    Visualization of file chunks being streamed from Uploader to Downloader through a Kafka topic
  </div>
</div>

*The Uploader splits the file into chunks and sends them to the Kafka topic, while the Downloader processes incoming chunks and reassembles the complete file.*

## Why Stream Files?

Sometimes it make more sense to stream a file rather than to send a file using file-send utilities (such as mv, cp, scp, ftp or curl).

- Stream files as data-chunks, that fit inside the Kafka message limit for your cluster. Kafka is fast, and massively parallel: produce as many chunks as needed to stream a file of any size
- The Kafka protocol uses automatic-retry to ensure that all data is sent, even when network failures occur
- Create a Data Funnel where many Uploaders stream data to one Downloader
- Mirror files to multiple locations via a Kafka topic by starting multiple Downloaders
- Flexible configuration for strong encryption and compression
- Virtually unlimited parallel scalability for data uploaders and downloaders
- Leverage Apache Kafka with its vibrant open source development community

## Key Use Cases

### Files Alongside Events

Use Kafka for more: now you can use the Kafka pipes that send microservice-events to also send file-chunk events, using the same client & server infrastructure; the same authentication, authorisation, quotas, network bandwidth, scaling and observability.

Beneficial for event-driven industries that also send files: manufacturing, retail, automotive, airlines.

### Edge Data Collection

Stream files using the Kafka Protocol over unreliable networks using infinite retries, parallelism, flexible encryption, and compression. Use a Streamsend Uploader to send files at the edge for applications like drones, vehicles, offshore utilities, and mining operations.

### Data Funnels

Create data collection hubs where hundreds or thousands of Uploaders stream to a single Downloader, creating a funnel of data. Ideal for workstation data backup, point of sale systems, and centralized data collection.

## Kafka Protocol

### Infinite Retries

A streaming protocol handles network service interruptions by retrying: when configured to *retry infinitely* a Streamsend Uploader will silently and automatically continue to try to send file-chunks when network disconnections occur. This differs from some file-send protocols; which fail and terminate when network errors occur

### Low Latency

An Uploader, like any Kafka producer, can send file chunks serially or in parallel, using features such as topic partitions and in-flight connections. This edition is serial, but a parallelized edition will be available soon.

### Compression

Reduce bandwidth requirements and transfer times with built-in data compression that maintains file integrity while minimizing network usage.

### Flexible Encryption

Protect sensitive data with advanced encryption options that secure your information throughout the entire streaming process.

## Technical Details

The latest Streamsend release is built with Rust, making it:
- Smaller and faster than previous versions
- Able to run on much smaller resources (no Kafka Connect required)
- Stateless, with chunking and merging performed in-memory
- Single-threaded but highly efficient

Additional features include:
- Support for directory structures (mirroring subdirectories to the downloader)
- Automatic creation of separate directories for each uploader
- Works on local filesystems and Kubernetes persistent volumes

## What does a Streamsend file-chunk pipeline not do?

A Streamsend file-chunk pipeline doesn't care what is actually in a file: so it cannot register (or validate) a schema; or convert or unzip contents

It only chunks a file along binary.chunk.file.bytes boundaries: not on any other measure (such as end of line; or object; elapsed time or frames)

A Streamsend file-chunk pipeline recreates the file: it cannot be used to stream chunks to a different consumer (for example, to a stream processor or to a object store)

Chunking and merging require measurable elapsed time: so while this technique is tunable and potentially very fast; it is not in the realm of ultra-low latency data streaming (for high-frequency trading or any microsecond (or indeed millisecond) requirements)

### Limitations

- Works with closed files only - no "live" streaming media, video feeds, or appending files
- File sizes are limited by the uploader & downloader memory size
- Local filesystems only (S3/HDFS support planned for future releases)
- No stream processing or schema registry integration as this requires awareness of content-data
