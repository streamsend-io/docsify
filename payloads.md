# Payloads

Message payloads are encoded as bytestream: there is no use of message schemas. Any Kafka client can be used to consume events created by the source connector. The accompanying file-chunk-sink connector reassembles chunks as files to a local filesystem using metadata in the message headers. This borrows from the open-source file-sink connector.
