# Overview

A Streamsend File-chunk pipeline Streams Files via a Kafka topic.

![Streams Files via a Kafka topic](../images/streamsend-file-streaming-pipeline.png)

## What is data streaming?

Data streaming is the continuous transmission of data, typically in real time, from a source to a destination. Instead of collecting and storing the data first (like in traditional batch processing), it’s processed and analyzed as it arrives. An application that streams data is sometimes known as an "event driven application".

## Why Stream Files?

Event driven applications implement application functions using events, rather than files.
Almost all systems; somewhere within their architecture, still depend on files.
A Streamsend File-chunk pipeline allows an event driven application to use the same data pipes to send files, alongside events, rather than using send-u1tilities such as mv, cp, scp, ftp or curl.


### Files Alongside Events

Using the same data pipe for events and files reduces infrastructure complexity: authentication, access control, scaling, maintenance etc. 
Becuase events are usually small and files are usually big, the necessary size limits for data streaming have generally been a barrier to file streaming. Reliably chunking and merging a file to fit inside streaming threasholds allows files of any size to accompany events using the same data pipes.

For example, if you are an Insurance Provider, you may need to stream an updated policy pdf alongside an ___updateEvent___ from an ___updatePolicy___ microservice.


### Infinite Retries

Data streaming is robust, becuase it uses a protocol that enables continuation of data transfer when unplanned failures occur.
Perhaps you need to send large volumes of images from a remote field-team with a poor network connection; where you want to "click send and forget" and not worry about network service interruptions. A file send utility may terminate and halt; a data streaming protocol can retry infinitely until it succeeds.


### Low Latency

Most file-senders are sequential and serial: chunks of a file are sent in parallel, using Kafka topic partitions and consumer groups.


### Data Funnel

A Kafka cluster acts as a hub for data streaming: hundreds (thousands) of clients can upload simultaneously without concerns over concurrency, locking, scalability or system uptime..


### Stateless File-Streaming

Stateless File-streaming is now available using a high-speed producer and consumer, written using the Rust Kafka client; rather than Kafka Connect. It can be deployed on the command line, in docker, or as Kubernetes pods.
A streamsend file-streaming pipeline is stateless: files are streamed without creating intermediate file-chunks. The Uploader should be configured with sufficient memory to read each file.
File Uploaders can now be deployed to run on smaller devices: including point of sale terminals, vehicles and devices.  Numerous lightweight stateless Uploaders can create a File-streaming funnel to one (or several) Downloaders via a single Kafka topic.


### Benefits of sending files as Streams

* binary data as events: smaller, more flexible units of data on the network than sending files

* automatic retry whenever any transmission failures occur

* many uploaders sending to one downloader (a data funnel)

* one uploader distributing files to many downloaders (___fan-out___)

* strong encryption and authentication

* virtually unlimited parallel scalability for data uploaders and downloaders


### Show me with Logfiles

#### Uploader

```text

   [20250415 20:30:49.202] INFO [stms-upl-1] video_100mb.avi: 100000000 bytes, creating 106 943759-byte chunks
   [20250415 20:30:50.125] INFO [stms-upl-1] video_100mb.avi: (00001 of 00106) chunk uploaded
   [20250415 20:30:50.175] INFO [stms-upl-1] video_100mb.avi: (00002 of 00106) chunk uploaded
   [20250415 20:30:50.230] INFO [stms-upl-1] video_100mb.avi: (00003 of 00106) chunk uploaded
   ...
   [20250415 20:30:57.315] INFO [stms-upl-1] video_100mb.avi: (00105 of 00106) chunk uploaded
   [20250415 20:30:57.412] INFO [stms-upl-1] video_100mb.avi: (00106 of 00106) chunk uploaded Finished 106 chunk uploads
   [20250415 20:30:57.413] INFO [stms-upl-1] video_100mb.avi: Successfully processed. md5 checksum 7660e6fe89066db4eff65e0cf3c4c6c0
```

#### Downloader

```text

   [20250415 20:30:50.216] INFO [stms-dwn-1] video_100mb.avi (00001/00106):    first chunk, downloaded: 943759 bytes
   [20250415 20:30:50.282] INFO [stms-dwn-1] video_100mb.avi (00002/00106): appended chunk, downloaded: 1887518 bytes
   [20250415 20:30:50.349] INFO [stms-dwn-1] video_100mb.avi (00003/00106): appended chunk, downloaded: 2831277 bytes
   ...
   [20250415 20:30:57.291] INFO [stms-dwn-1] video_100mb.avi (00104/00106): appended chunk, downloaded: 98150936 bytes
   [20250415 20:30:57.374] INFO [stms-dwn-1] video_100mb.avi (00105/00106): appended chunk, downloaded: 99094695 bytes
   [20250415 20:30:57.676] INFO [stms-dwn-1] video_100mb.avi (00106/00106):    final chunk, downloaded: 100000000 bytes, mds checksum 7660e6fe89066db4eff65e0cf3c4c6c0

```

:::info

### What does a Streamsend File-chunk pipeline do?

A Streamsend File-chunk pipeline streams files via a Kafka topic; of any size and of any content-type.
The Uploader splits (or "chunks") input files into fixed size messages that are produced to a Kafka topic.
The Downloader consumes the file chunks, reassembles the file and checks file integrity at the target server.

A file-chunk streaming pipeline must operate as an end to end pair of one or more Uploaders streaming to a Kafka topic; and one or more Downloaders consuming and merging the events to recreate the files.

Files of any type can be streamed: documents, images, video, text, binary: the content type doesnt matter.
Files can be compressed or encrypted.
Entire directory trees can be streamed: the Downloader recreates all of the subdirectories traversed by the Uploader.
Many Uploaders can stream to one Downloader (creating a data funnell).
Multiple Downloaders can run in parallel; mirroring data from Uploaders to multiple locations.



Splitting (or "chunking") input files into events allows files of any size (and of any content type) to be streamed.

A file streaming pipeline is built upon fifteen years of Apache Kafka engineering excellence, including unlimited scalability, low latency, multi-platform compatibility, robust security and a thriving engineering community.

:::

:::warning

### What does a file-chunk connectors pipeline __not__ do?

A file-chunk streaming pipeline doesnt care what is actually __in__ a file: so it cannot register (or validate) a schema; or convert or unzip contents

It only chunks a file along ```binary.chunk.file.bytes``` boundaries: not on any other measure (such as end of line; or object; elapsed time or frames)

A file-chunk streaming pipeline recreates the file: it cannot be used to stream chunks to a different consumer (for example, to a stream processor or to a object store)

Chunking and merging require measurable elapsed time: so while this technique is tunable and potentially very fast; it is not in the realm of ultra-low latency data streaming (for high-frequency trading or any microsecond (or indeed millisecond) requirements)

The files must be static: there is no capability for hot-file transfer. It is unsuitable for backups of open files.

The downloader creates files using default file ownership and permissions - it does not mirror source file ownership and permissions.

Files and subdirectories are mirrored; but symbolic links (and other are special file types) are not mirrored.

:::
