
# Streamsend Downloader

## Configuration Properties

Streamsend Downloader accepts configuration properties in three forms:

* Config File
* Environment Variables
* Command-line arguments

The descending order of preference is Config File; then Environment Variable and then Command-line arguments.


### files.dir

The directory to write merged files that have been processed, for example "/tmp/streamsend_downloader". 
TODO: if the directory does not exist then it will be created automatically. 
This directory must exist and be readable and writable by the user running the downloader.
If the directory is not accessible, then then downloader exits with an error message.
Downloaded files are never subsequently deleted - maintenance of space for this directory must be managed externally.
If space is exhausted in the files.dir then the downloader remains running, but pauses consumption while space is unavailable, resuming processing automatically.
Files may be overwritten: if the Downloader is restarted without consumer offsets (in order to reprocess topic data) then downloaded files in files.dir will be over-written.
Subdirectories walked by the uploader are recreated automatically in the Downloader files.dir before downloading the file.
Both the Uploader and Downloader have a "files.dir" configuration property.  If co-located, "files.dir" for the uploader and downloader should point to different directories.

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


### bootstrap.servers, security.protocol, ssl.endpoint.identification.algorithm, sasl.mechanism, sasl.username, sasl.password

Authentication properties to connect to a Kafka cluster.
Supported authentication schemes are SASL/SSL and noauth.
The defaults are security.protocol=PLAINTEXT, ssl.endpoint.identification.algorithm=https, sasl.mechanism=PLAIN.
For Confluent Cloud, specify bootstrap.servers, sasl.username (api key), sasl.password (secret).
For a local Kafka Cluster with noauth specify bootstrap.servers, and do not configure sasl.username and sasl.password.
Other authentication schemes may function, but have not been tested.


