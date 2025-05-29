# Streamsend Downloader

## Configuration Properties

Streamsend Downloader accepts configuration properties in three forms:

* Config File
* Environment Variables
* Command-line arguments

The descending order of preference is Config File; then Environment Variable and then Command-line arguments.


### output.dir

The directory to write merged files that have been processed, for example "/tmp/streamsend_downloader". 
This directory must exist and be readable and writable by the user running the downloader.
If the directory is not accessible, then then downloader exits with an error message "Failed to write to output.dir: Unable to start."
Downloaded files are never subsequently deleted - maintenance of space for this directory must be managed externally.
If space is exhausted in the output.dir then the downloader remains running, but pauses consumption while space is unavailable, resuming processing automatically.
While paused the downloader reports the filesystem status: for example:
'Downloading Paused! output.dir status: 0 bytes available, 11,362,262 bytes required for "/tmp/downloaded/edge-uploader-774/DSC011721.mpg"'
Files may be overwritten: if the Downloader is restarted without consumer offsets (in order to reprocess topic data) then downloaded files in output.dir will be over-written.
Subdirectories walked by the uploader are recreated automatically in the Downloader output.dir before downloading the file.
Note that the Downloader uses "output.dir" and the Uploader uses "input.dir".

- *Type:* STRING
- *Default:* 

### topic

The Kafka topic to consumer data from.
The Downloader can only process events produced by the Streamsend Uploader.

TODO: If the topic is inaccessible then the Downloader terminates with 'Message consumption error: UnknownTopicOrPartition (Broker: Unknown topic or partition)'
Multiple downloaders can be configured to consume chunks from a single topic - each Downloader mirrors all files from all Uploaders.
The topic can have one partition or multiple partitions: Uploaders explicitly direct events to specific partitions to ensure event ordering.
Downloaders start one  consumer thread.

- *Type:* STRING


### bootstrap.servers, security.protocol, ssl.endpoint.identification.algorithm, sasl.mechanism, sasl.username, sasl.password, max.poll.interval.ms, fetch.min.bytes, request.timeout.ms
, metadata.max.age.ms


Authentication properties to connect to a Kafka cluster.
Supported authentication schemes are SASL/SSL and noauth.
The defaults are security.protocol=PLAINTEXT, ssl.endpoint.identification.algorithm=https, sasl.mechanism=PLAIN.
For Confluent Cloud, specify bootstrap.servers, sasl.username (api key), sasl.password (secret).
For a local Kafka Cluster with noauth specify bootstrap.servers, and do not configure sasl.username and sasl.password.
Other authentication schemes may function, but have not been tested.

## Kafka Consumer Configuration Properties

The following Kafka consumer configuration properties can be tuned to optimize performance and reliability. These properties directly control how the underlying librdkafka consumer behaves.

### enable.auto.commit

If true, the consumer's offset will be periodically committed in the background. When disabled, offsets must be committed manually using explicit commit calls.

Disabling auto-commit provides more control over when offsets are committed, which can be important for exactly-once processing semantics.

- *Type:* STRING
- *Default:* "true"
- *librdkafka default:* true

### auto.offset.reset

What to do when there is no initial offset in Kafka or if the current offset does not exist any more on the server (e.g. because that data has been deleted). Valid values are:

- `earliest`: automatically reset the offset to the earliest offset in the partition
- `latest`: automatically reset the offset to the latest offset in the partition  
- `error`: throw exception to the consumer if no previous offset is found

Note that changing this from `latest` to `earliest` may cause the Downloader to reprocess all historical messages in the topic.

- *Type:* STRING
- *Default:* "latest"
- *librdkafka default:* latest

### session.timeout.ms

Client group session and failure detection timeout. The consumer sends periodic heartbeats (heartbeat.interval.ms) to indicate its liveness to the broker. If no heartbeats are received by the broker for a group member within the session timeout, the broker will remove the consumer from the group and trigger a rebalance.

The value must be within the range configured by the broker's group.min.session.timeout.ms and group.max.session.timeout.ms properties.

- *Type:* STRING
- *Default:* "45000"
- *librdkafka default:* 45000ms

### heartbeat.interval.ms

The expected time between heartbeats to the consumer coordinator when using Kafka's group management facilities. Heartbeats are used to ensure that the consumer's session stays active and to facilitate rebalancing when new consumers join or leave the group.

The value must be set lower than session.timeout.ms, but typically should be set no higher than 1/3 of that value. It can be adjusted even lower to control the expected time for normal rebalances.

- *Type:* STRING
- *Default:* "3000"  
- *librdkafka default:* 3000ms

### max.poll.interval.ms

The maximum delay between invocations of poll() when using consumer group management. This places an upper bound on the amount of time that the consumer can be idle before fetching more records.

If poll() is not called before expiration of this timeout, then the consumer is considered failed and the group will rebalance to reassign the partitions to another member. 

- *Type:* STRING
- *Default:* "300000"
- *librdkafka default:* 300000ms (5 minutes)

### fetch.min.bytes

The minimum amount of data the server should return for a fetch request. If insufficient data is available the request will wait for that much data to accumulate before answering the request.

Setting this to something greater than 1 will cause the server to wait for larger amounts of data to accumulate which can improve server throughput a bit at the cost of some additional latency.

- *Type:* STRING
- *Default:* "1"
- *librdkafka default:* 1 byte

### request.timeout.ms

The configuration controls the maximum amount of time the client will wait for the response of a request. If the response is not received before the timeout elapses the client will resend the request if necessary or fail the request if retries are exhausted.

This should be larger than replica.lag.time.max.ms (a broker configuration) to reduce the possibility of message duplication due to unnecessary producer retries.

- *Type:* STRING  
- *Default:* "30000"
- *librdkafka default:* 30000ms

### metadata.max.age.ms

The period of time in milliseconds after which we force a refresh of metadata even if we haven't seen any partition leadership changes to proactively discover any new brokers or partitions.

Smaller values result in more frequent metadata refreshes but increase network overhead. Larger values reduce overhead but may delay discovery of topology changes.

- *Type:* STRING
- *Default:* "300000"  
- *librdkafka default:* 300000ms (5 minutes)
