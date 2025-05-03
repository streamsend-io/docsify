[Streamsend Documentation](https://docs.streamsend.io/docs/overview/)

# Release Notes

## _NEW_ - version 3.0 (May 2025)

This marks the initial release of the new Lightweight stateless file-chunk pipeline. Prior to this release, a file-chunk pipeline required a Kafka Connect server to host the file-chunk source and sink connectors. With this release, the connectors are self-contained, implemented as producers and consumers (using rust), so Kafka Connect is no longer required.

Significant Changes are:

* The Streamsend File-Chunk Source connector plugin is now packaged as an executable binary, known as the __Uploader__

* The Streamsend File-Chunk Sink connector plugin is now packaged as an executable binary, known as the __Downloader__

* The Uploader and Downloader are packaged in three forms:

  * Docker containers using debian:bullseye-slim. The containers are 90-100MB in size. These can be deployed on any docker-compatible container platform.

  * Kubernetes deployments, wrapping the docker containers while adding secret and configuration management

  * Downloadable executables for Linux & MacOS

* The pipeline is stateless: the Uploader chunks file in-memory and the Downloader merges file in-memory before writing the completed file to storage. Sufficient memory must be available for the largest streamable file.

* The number of topic partitions is auto-detected. In a forthcoming release, the file-streaming pipeline will parallelize optimally automatically

* The Kafka cluster (and topic) max.message.bytes is auto-detected. In a forth-coming release, the Uploader will use an optimal chunk size bytes depending on the configuration of the Kafka topic.

* The supported authentication schemes are SASL/SSL and NoAuth. They operate on Apache Kafka, Confluent Platform and Confluent Cloud. Other auth schemes will be added shortly.

It is free: a license or subscription is _not_ required to deploy the Streamsend File-Chunk pipeline; in any of the three packaged configurations described above. Any number of Uploaders or Downloader can be deployed. They operate in __single-thread mode__; meaning that an Uploader  processes one file at a time (and one chunk at a time). Similarly the downloader consumes and merges one chunk at a time. A multi-threaded version will be available shortly: deployment of the multi-threaded version does not require a license; but it does require an annual five-day Streamsend consulting engagement to ensure correct deployment.

## version 2.9 (Feb 2025)

_Multi-partition multi-task operation_: file-pipeline throughput is now scalable using multiple topic partitions and multiple Kafka Connect tasks. Prior to this release, uploader/downloader streaming was limited to single-partition operation. While a single-task pipeline can achieve throughput of several MB/sec (depending on network latency) multi-task operation unlocks the full parallelized scalability of the Kafka protocol.

_Optional MD5 checks_: MD5 checksums are computationally costly, particularly for large files. With release 2.9, the Sink connector uses chunk ID's from the message headers to ensure that each chunk is streamed and merged in the correct sequence, and that any duplicate chunks are handled correctly. A new configuration property for the Source connector file.maximum.size.bytes.for.md5 sets a limit, beyond which MD5 checksums are skipped.

_Lightweight Dockerized Uploader_: the new Streamsend file-chunk Uploader Docker container is a lightweight lights-out containerized source connector that streams files from the container host. Hundreds (even thousands) of Uploaders can stream to a single Kafka cluster creating a file-streaming data funnel. This can operate alongside event-streaming using the same data channels, infrastructure, bandwidth and security protocols. It is a lights-out container that requires no sysadmin maintenance, operating on a 330MB memory footprint, which can run on client machines, ECS, Azure Container Service and other hosting options. Watch out for a blog post on this soon. (https://hub.docker.com/r/streamsend/uploader)

Bug Fixes:

Bug Fix: If the first file to be chunked (after a cold start) contains a high number of chunks, filesystem metadata delay could cause out of order uploads. The Source connector now pauses for 50ms between each 1,000 chunk file generation to allow the filesystem metadata to catch up

## version 2.8 (Oct 2024)

Source: new property gen.test.files=[false]: Set to true to automatically generate test files (ranging in size from 0 to 2500 bytes) every 5 seconds. Setting this configuration property to true automatically over-rides the binary.chunk.size.bytes to 500.

Source & Sink: Repackaging of docker containers from cp-connect to OneCricketeer/apache-kafka-connect-docker] to reduce the container to 330MB (from 2500MB)

Source & Sink: docker: fixed a premature exit if the curl POST DELETE return=7 becuase the job does not exist

Source: Bug fix for short filenames (for example "a") where the filename may also exist inside the file path causing "java.io.FileNotFoundException" when deleting a .PROCESSING file.

## version 2.7 (Sept 2024)

Bug fix for file ordering: (rarely) chunk files are uploaded out of order; causing merge failure (for single-task)

## version 2.6 (June-2024)

Sink connector configuration property "binary.chunk.size.bytes" has been deprecated. The binary chunk size bytes used by the source connector is included in the Kafka header, which is read by the sink connector.
Sink connector configuration property "topic.partitions" has been deprecated. The topic.partitions used by the uploader is included in the Kafka header, which is read by the sink connector.

Docker support: a containerized uploader and downloader are now available on Docker Hub. These containers use a Kafka Connect Standalone server to run the source or sink connector.  Multiple uploader containers streaming to one Kafka Cluster can be started - ensure that the input.file.pattern and/or files.dir do not overlap. Multiple downloader containers can be started; streaming from the same Kafka Cluster - remember that each container will download all chunked files so they not be writing streamed files to the same destination filesystem.

## version 2.5 (24-June-2024)


Plugin packaging has changed to "streamsend": this changes the "connector.class"

New source connector configuration properties "finished.file.retention.mins" and "error.file.retention.mins" which automate cleanup of uploaded files after the number of minutes specified

New Source & Sink Connector configuration properties "topic.partitions" to inform the connectors of the partition count to distribute messages to.
This configuration property should be set to the partition count of the topic, and it should be set for both the source and the sink connector.

## _New_ -  version 2.4 (03-May-2024)

New Source Connector configuration property "files.dir" (deprecates properties "input.path:, "error.path" and "finished.path")
New Sink Connector configuration property "files.dir" (deprecates property "output.path")
Source: new configuration properties "finished.file.retention.mins" & "error.file.retention.mins" for automated retention & cleanup of uploaded files

The file-chunk connector plugins are now available on Confluent Hub. To install the connectors, run

```text
confluent hub install streamsendio/file-chunk-source:latest
confluent hub install streamsendio/file-chunk-sink:latest
```
