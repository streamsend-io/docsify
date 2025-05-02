
# Why send Files? 

Three reasons for streaming file transfer:

## Files alongside events

Sometimes files accompany events: for example a modified Insurance Policy after a _claim-update_; or an image that contains a _face-recognize_. If the infrastructure for a claim-check pattern doesnt exist, then use these connectors to send the file alongside the event using the same Kafka cluster.

## Fault tolerance for edge-uploaders

Command line data send utilities require a reliable network: if connectivity is interrupted then data transfer must restart. While some utilities have improved this; in general restart-from-zero is the recovery mechanism. The file-chunk connectors use a streaming protocol which has sophisticated behaviour for network interruptions: including replay, infinite retry, inflight data, backoff and batch management.

## Expand the role of your Kafka clusters

If your organization already uses Kafka for event-driven processing (or for logging or stream processing) then the same Kafka infrastructure can be used for streaming file transfer. The file chunk connectors are standard Kafka Connect plugins, enabling streaming pipeline patterns like fan-in (many uploaders to one downloader) and fan-out (downloaded files are mirrored to multiple locations simultaneously)

## But Kafka is not for files

Why not? There are patterns for file-send scenarios on Kafka: sometimes they can be used; sometimes not.

### Claim check: file locators, not files

Locators generally require shared object storage accessible enterprise wide. This is common on cloud platforms, but not as common for on-premise infrastructure.

### Producers/Consumers for chunking files

File reassembly can be hard (partitions, tasks, ordering, duplication) - the Springboot/python development cost can be substantial. The file-chunk connectors handle this complexity

### BLOBs

Databases handle BLOBs (binary large objects) - so should Kafka. While a byte-encoded message that fits inside a Kafka message is unproblematic, the lack of BLOB support beyond the max.message.size makes integration with enterprise systems more problematic than necessary.

## Scenarios

It is suitable for data scenarios that include

- file-generating edge devices (including windows clients) where a kafka connect client is preferable to custom-code uploader deployment
- sync filesystems contents to a remote server: this is only suitable for static (completed) files. It is unsuitable for mirroring open files
- edge uploader client endpoints with unreliable networking: Kafka client infinite-retries ensures eventual data delivery with no-touch intervention
- sophisticated uploader encryption - such as cipher selection
- automatic compression & decompression of file content
- Mirror files to multiple downloaders, and/or fan-in many uploaders to one Kafka cluster
