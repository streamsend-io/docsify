# Multi-Partition Operation (MPO)

Multi-partition operation streams files using multiple Kafka topic partitions simultaneously, significantly improving throughput for both uploaders and downloaders compared to single-partition operation.

## Overview

**Multi-Partition Operation (MPO)** is an optional high-performance feature that requires a license key for activation. **Single-Partition Operation (SPO)**, which does not require a license key, is free for unlimited usage.

> **Important**: Only consider MPO if your throughput requirements cannot be met by one or several SPO streams. For most use cases, SPO provides sufficient performance.

## License Requirements

MPO requires a valid license key. Contact [mark.teehan@streamsend.io](mailto:mark.teehan@streamsend.io) for a friendly license key discussion.

Once a valid `license.key` has been specified in your configuration, multi-partition operation is automatically activated. You'll see confirmation in the logs:

```text
License status: License is valid for 39 days:


## Key Behavioral Differences

When MPO is activated, there are three significant behavioral changes:
1. Parallel Partition Streaming
Uploaders stream files into all topic partitions simultaneously. The number of topic partitions is detected automatically, and the Uploader coordinates producing to all partitions concurrently.
2. Intelligent File Distribution
For small files (smaller than the configured chunk size), instead of using a single partition, files are distributed randomly across all available partitions. This ensures optimal load balancing even with many small files.
3. Coordinated Multi-Consumer Processing
Downloaders automatically start a consumer group that matches the number of topic partitions, consuming and merging data from all partitions simultaneously.


## Partition Configuration

### Automatic Optimization

A Streamsend pipeline automatically optimizes performance by:

* Auto-detecting the number of topic partitions
* Auto-detecting the max.message.bytes setting
* Configuring chunk sizes accordingly

The system is designed for high-speed operation and can generally achieve excellent throughput with fewer than 10 partitions. The maximum tested partition count is 16.


### Changing Partition Count

Critical: Stop all downloaders and uploaders before changing the number of topic partitions. Changing partition count while the pipeline is active can cause data inconsistency.

## Monitoring and Logging

### Startup Confirmation

When MPO is successfully activated, you'll see detailed startup information:

```text
*** Streamsend Uploader successfully started on my-machine with thread(s)=1, topic=topic-04, partition(s)=6, Chunk Size=891313, Build=2025-05-21 21:33:01 +08:00, Git=6e0835e
```

### Partition Distribution Tracking
You can observe file and chunk distribution across partitions through uploader logging. The Partition ID is appended to the filename:

```text
text20250525-185019_one_hundred_mb.txt:P00 (00081 of 00113) chunk uploaded
```

This example shows:
Chunk 81 of 113 total chunks
Produced to partition ID P00
If the topic has 8 partitions, distribution ranges from P00 to P07

### Technical Note
Distribution is achieved using direct partition assignment rather than message keys, ensuring precise control over partition utilization and optimal load balancing.



## When to Use MPO
Consider Multi-Partition Operation when:

Single-partition throughput is insufficient for your use case
You're processing large volumes of files or very large individual files
You need to maximize utilization of your Kafka infrastructure
You have validated that network and disk I/O can support the increased throughput

For most applications, Single-Partition Operation provides excellent performance and should be your starting point.
RetryClaude can make mistakes. Please double-check responses. Sonnet 4
