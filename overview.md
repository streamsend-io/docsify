# Overview

**Welcome to Streamsend Docs**

Stream files (any content, any size) using a Kafka Cluster.

The Kafka Connect File Chunk connectors are a fancy way to send a file:

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

For example, if you are an Insurance Provider, you may need to send an updated policy pdf alongside an updateEvent from an updatePolicy microservice.

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

<div id="streamsend-animation"></div>

*The Uploader splits the file into chunks and sends them to the Kafka topic, while the Downloader processes incoming chunks and reassembles the complete file. The animation repeats approximately every 15 seconds.*

## What does a file-chunk connectors pipeline do?

A file-chunk streming pipeline must operate as a complete pipeline with Uploaders producing messages, and Downloaders consuming messages from the same topic.

The Uploader splits input files into fixed size messages that are produced to a kafka topic.

The Downloader consumes the file chunks and reassembles the file at the target server.

## What does a file-chunk connectors pipeline not do?

A file chunk pipeline doesn't care what is actually in a file: so it cannot register (or validate) a schema; or convert or unzip contents

It only chunks a file along binary.chunk.file.bytes
boundaries: not on any other measure (such as end of line; or object; elapsed time or frames)

A file-chunk pipeline recreates the file: it cannot be used to stream chunks to a different consumer (for example, to a stream processor or to a object store)

Chunking and merging require measurable elapsed time: so while this technique is tunable and potentially very fast; it is not in the realm of ultra-low latency data streaming (for high-frequency trading or any microsecond (or indeed millisecond) requirements)
