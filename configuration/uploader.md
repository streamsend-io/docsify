# Streamsend Uploader

## Configuration Properties

### input.dir

The directory to read files that will be processed.  For example "/tmp/streamsend_uploader". 
This directory must exist and be readable and writable by the user running the uploader.
All new files in this directory that match the "input.file.pattern" and that exceed the "file.minimum.age.ms" will be streamed by the uploader.
Subdirectories under input.dir are walked: so eligible file in (for example) "/tmp/streamsend_uploader/Wednesday/10am.txt" will be detected, streamed and renamed.
An Uploader reads files from one directory: it is not possible to monitor multiple top-level directories simultaneously.
The Uploader acquires a lock on the directory (lock.pid) to prevent multiple uploaders accidentally processing the same file queue.
If the directory is not accessible, then then uploader exits with an error.
Most top-level OS directories are disallowed : including "/", "/bin", "/usr", "/tmp" etc. Subdirectories are allowed for "/tmp" and "/var".

After processing, the file is renamed by adding ".FINISHED", which prevents subsequent reprocessing.
Finished files are automatically deleted from this directory after "finished.file.retention.mins" minutes.
Subdirectories are not renamed, only the actual files that have been processed.
Note that the Downloader uses "output.dir" and the Uploader uses "input.dir".

- *Type:* STRING
- *Default:* 

### input.file.pattern

The regular expression to check input file names against. This expression must match the entire filename.
Configure a input.file.pattern of "*." to match all files in the files.dir.
If the regular expression cannot be parsed then the Uploader exits with "Invalid regex pattern".
Hidden files (beginning with ".") and symbolic-link files are ignored, even if they match the regular expression.
The following strings are also automatically ignored: "*.PROCESSING", "*.FINISHED".

- *Type:* STRING
- *Default:* .*

### generate.test.file.bytes

Generate test input files automatically in "files.dir"
When configured to a value greater than zero, the Uploader automatically generates a test file with a size matching this value, repeated every ten seconds.
For example generate.test.file.bytes=150000 generates a 150,000 byte file every ten seconds. 
The test file is still subject to "file.pattern" for upload eligibility.
This is logged in the uploader logfile as "generating test file streamsend_testfile_20240416175256999.txt" timestamped for the file generation time.
The filename prefix is configured by "generate.test.files.prefix", which defaults to "streamsend_".
Use test files to generate network traffic automatially when tuning streamsend pipelines, partition sizes, etc.
The test file contains randomized strings of text, sized as specified. The maximum size is 50_000_000 (50m bytes).
A value exceeding this size results in the uploader terminating with 'Test file generation size ... exceeds maximum allowed size of 50000000. Cannot continue.'
The test file will be split into chunks as specified by binary.chunk.size.bytes and streamed, consumed and merged normally.
TODO: discard test files?

- *Type:* Integer
- *Default Value:* 0
- *Valid Range:* 0 - 50000000

### binary.chunk.size.bytes

_The recommended value is "0" - which activates automatic chunk sizing._
Over-ride for the size of each data chunk that will be produced to the topic. 
Eligible files in input.dir exceeding this size will be split (chunked) into multiple events of this size.
Eligible files in input.dir not exceeding this size are streamed as a single event.
This property can be manually configured to over-ride automatic chunk sizing.

If greater than "0", then the value must be less than the Kafka cluster message.max.bytes (and the topic message.max.bytes, if configured).  
As the chunk size includes the key and header, the actual message size will always be larger than this value, so allow a margin (recommended : 10-15%)
Larger chunk sizes improve pipeline throughput.
Automatic configuration of the chunk size (when binary.chunk.size.bytes=0) depends on a number of factors:
1. Kafka Cluster message.max.bytes (or Kafka topic, whichever is smaller), less a 10% headroom allowance.
2. If the Kafka Cluster is Confluent Cloud (as detected by the bootstrap.servers URL) then it headroom is 55% (instead of 10%). Values less than 55% for client producing to Confluent Cloud result in "Message to large" errors. A Confluent Cloud basic cluster, which always has a message,max.bytes of 2MB, always logs 'file-chunk-topic message.max.bytes is 2097164' and always subsequently sets the chunk size automatically as 'Automatic configuration of a chunk size of 943759 (55% of message.max.bytes 2097164)'. 
3. For non-Confluent Cloud systems, the Adjustor of 10% can be tuned using file.chunk.size.auto.adjustor, which is only used if the uploader is configured for automatic chunk sizing.
The chunk size for automatic chunk sizing is calculated at Uploader startup and reported in the logfile '*** Automatic configuration of a chunk size of 943759 (55% of message.max.bytes 2097164)'

- *Type:* Integer
- *Default Value:* 0


### upload.payload.percentage

The percentake of the Kafka cluster message.max.bytes (or topic message.max.bytes, whichever is smaller) to use for file chunks when using automatic chunk sizing.
The default is 95%, meaning that file chunks are sized at 95% of message.max.bytes.
This applies for all Kafka cluster types, including Apache Kafka and Confluent Cloud.  Earlier releases had different values for Confluent Cloud and Apache Kafka - this limitation has been lifted.
The remaining 5% accomodates the message header and message key. Values larger than 95 are likely to cause message-too-large errors.
Use this property to fine-tune message sizes to maximize uploader throughput or to accomodate other Kafka cluster sizing requirements.
The valid range is 1-99.
If both binary.chunk.size.bytes and upload.payload.percentage  are configured, then the Uploader terminates with 'file.chunk.size.bytes={}, yet file.chunk.size.auto.adjustor={}. Unable to start'.
If automatic chunk sizing is activated (binary.chunk.size.bytes=0) but file.chunk.size.auto.adjustor is unset, then it is automatically set to 15 (or 55 for a Confluent Cloud cluster);

- *Type:* Integer
- *Default Value:* 95
- *Valid Range* : 1-99



### uploader.name

The folder name used by the Downloader to merge all files sent by this Uploader.
The default is the machine hostname.
Multiple uploaders can be started on a single machine by configuring each with a different uploader.name, files.dir and input.file.pattern.

For example a machine may have two uploaders: boston-branch-xml & boston-branch-pdf

- *Type:* STRING
- *Default: `hostname`


### file.minimum.age.ms

The amount of time in milliseconds after the file was last written to before the file can be processed. This should be set appropriatly to enable large files to be copied into the files.dir before it is processed.

- *Type:* LONG
- *Default Value:* 5000


### topic

The Kafka topic to produce the data to.
If the topic is inaccessible then the Uploader attempts to create the topic (with one partition), exiting if this is unsuccessful.
An Uploader produces all chunks to this topic. Multiple uploaders can be configured to produce chunks to a single topic - the Downloader uses message headers to ensure correct file merge.
Events produced to this topic can only be processed by the Streamsend Downloader.
The topic can have one partition or multiple partitions: Uploaders explicitly direct events to specific partitions to ensure event ordering.
The free edition of Streamsend Uploader uses one-partition for all file-chunk streaming.
The licensed edition of Streamsend Uploader automatically uses all partitions to distribute the pipeline and to improve parallelism.
Uploaders detect the partition count at startup and report it in the logfile '<topic> number of partitions is ...'
If the Uploader cannot detect the partition count (due to ACLs) then it logs 'Warning: Unable to fetch partition count, using default' and assumes 1 partition.
Topic retention should be set to the maximum anticipated recovery window that a Downloader may require. Downloaders can safely overwrite files: if a Downloader is restarted without consumer offsets (in order to reprocess topic data), then topic events will be consumed again and downloaded files in files.dir will be over-written. 


- *Type:* STRING



### finished.file.retention.mins

Then number of minutes to retain a file in the files.dir directory after it has been uploaded successfully. 
The default is 60, meaning that streamed files (with a post-fix .FINISHED) are deleted automatically after 60 minutes.
Subdirectories are not removed automatically.
Set this to -1 to disable deletion of finished files; which must then be managed manually.

- *Type:* INTEGER
- - *Default:* 60

### error.file.retention.mins

Then number of minutes to retain a file in the files.dir directory after it has been uploaded unsuccessfully. Set to -1 to disable deletion.

- *Type:* INTEGER
- - *Default:* -1


### dry.run

When set to "yes" the Uploader functions normally except events are not actually produced to the topic. Use Dry run mode to setup and tune client-side aspects of a pipeline.

- *Type:* STRING
- - *Default:* "no"


### bootstrap.servers, security.protocol, ssl.endpoint.identification.algorithm, sasl.mechanism, sasl.username, sasl.password, max.poll.interval.ms, fetch.min.bytes, request.timeout.ms, metadata.max.age.ms, linger.ms, batch.num.messages, max.in.flight.requests.per.connection

Authentication properties to connect to a Kafka cluster.
Supported authentication schemes are SASL/SSL and noauth.
The defaults are security.protocol=PLAINTEXT, ssl.endpoint.identification.algorithm=https, sasl.mechanism=PLAIN.
For Confluent Cloud, specify bootstrap.servers, sasl.username (api key), sasl.password (secret).
For a local Kafka Cluster with noauth specify bootstrap.servers, and do not configure sasl.username and sasl.password.
Other authentication schemes may function, but have not been tested.

## Kafka Producer Configuration Properties

The following Kafka producer configuration properties can be tuned to optimize performance and reliability. These properties directly control how the underlying librdkafka producer behaves.

### linger.ms

The producer groups together any records that arrive in between request transmissions into a single batched request. This setting accomplishes batching by adding a small amount of artificial delay—rather than immediately sending out a record, the producer will wait for up to the given delay to allow other records to be sent so that the sends can be batched together.

A higher value can lead to fewer, more efficient requests at the cost of a small amount of latency. Setting to 0 disables batching delay entirely.

- *Type:* STRING  
- *Default:* "5"
- *librdkafka default:* 5ms

### batch.num.messages

Maximum number of messages batched in one MessageSet. The total MessageSet size is also limited by batch.size and message.max.bytes.

Higher values improve throughput by reducing the number of requests sent to brokers, but may increase latency for individual messages.

- *Type:* STRING
- *Default:* "10000" 
- *librdkafka default:* 10000

### max.in.flight.requests.per.connection

Maximum number of in-flight requests per broker connection. This is a global setting that limits the total number of unacknowledged requests across all partitions.

Higher values can improve throughput but may cause message reordering if retries are enabled and a request fails. For strict ordering, set to 1.

- *Type:* STRING
- *Default:* "5"
- *librdkafka default:* 5

### retries  

How many times to retry sending a failing message. Note that retrying may cause reordering unless enable.idempotence is set to true.

The default value allows for effectively unlimited retries. Set to 0 to disable retries entirely.

- *Type:* STRING
- *Default:* "2147483647"
- *librdkafka default:* 2147483647 (effectively unlimited)

### retry.backoff.ms

The backoff time in milliseconds before retrying a protocol request. This is the initial backoff time, which will be increased exponentially for each failed request.

Lower values result in faster retries but may overwhelm brokers experiencing issues. Higher values reduce broker load but increase recovery time.

- *Type:* STRING  
- *Default:* "100"
- *librdkafka default:* 100ms

### enable.auto.commit

Automatically and periodically commit offsets in the background. Note: setting this to false does not prevent the consumer from fetching previously committed start offsets.

For the Uploader (producer), this setting affects consumer group behavior when the client also acts as a consumer for metadata operations.

- *Type:* STRING
- *Default:* "true"
- *librdkafka default:* true

### auto.offset.reset

What to do when there is no initial offset in Kafka or if the current offset does not exist any more on the server. Valid values are:
- `earliest`: automatically reset the offset to the earliest offset
- `latest`: automatically reset the offset to the latest offset  
- `error`: throw exception if no previous offset is found

For the Uploader, this primarily affects consumer group behavior during metadata operations.

- *Type:* STRING
- *Default:* "latest"
- *librdkafka default:* latest

### session.timeout.ms

Client group session and failure detection timeout. The consumer sends periodic heartbeats to indicate its liveness to the broker. If no heartbeats are received by the broker for a group member within the session timeout, the broker will remove the consumer from the group and trigger a rebalance.

- *Type:* STRING
- *Default:* "45000"  
- *librdkafka default:* 45000ms
