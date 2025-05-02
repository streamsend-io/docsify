# Compatibility

A Streamsend file-chunk pipeline Streams Files via a Kafka topic. 
This edition is free to deploy and use: no license is required to deploy a Streamsend file-chunk pipeline on any platform and any number of deployments, as described in this documentation. The free edition is fully functional and streams all events via one topic partition.

Prior to version 3.0 (current), a Streamsend file-chunk pipeline was packaged as Kafka Connect Plugins. This packaging has been discontinued.
Version 3 onwards implements a file-chunk pipeline using two executables: Uploader and Downloader; available as:
* executables for Linux (AMD64)
* executables for MacOS (Mach-O 64-bit arm64)
* Docker containers for Linux (AMD64)
* Packaged as a Kubernetes CR for Linux

The executables were developed using Rust for a number of reasons:
* smaller execution footprint, compared with a JVM based Kafka-Connect deployment
* faster produce and consume 
* improved Kafka Cluster interaction, including automatic detection of partition count and max message size

The Uploader and Downloader are kafka-client applications, which require connectivity to a Kafka cluster. Any Kafka-protocol service is (should be!) compatible, including Apache Kafka, Confluent Platform and Confluent Cloud. 


The authentication mechanisms that are supported are currently sasl/ssl and noauth. There is no support; yet; for sasl/scram, oauth, Kerberos or AWS IAM. Please contact Mark Teehan (<mark.teehan\@streamsend.io>) for details about forthcoming releases.

A file-chunk pipeline requires one topic; with one partition or multiple partitions. The free edition always uses one partition for all events.

All events are streamed as "bytestream" payloads - as an unstructured payload type, a schema registry is not required.

Various topologies are possible:
One uploader can stream to one downloader, creating a simple file-chunk pipeline.
Multiple uploaders can run on one host, monitoring and streaming from multiple directories.
Multiple uploaders can stream to one downloader, to create a data funnel.
Multiple downloaders can stream from one (or multiple) uploaders, mirroring files to multiple target filesystems.
