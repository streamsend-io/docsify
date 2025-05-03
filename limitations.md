# Limitations

These limitations are in place for the current release:

- the maximum chunk count for any single file is 100,000
- the maximum file size must fit inside the JVM of the source (and sink) machine (this is needed for MD5 verification)
  Release 2.9: a new property `file.maximum.size.bytes.for.md5` can be used to skip MD5 checks for large files, lifting this limitation
- the source connector should operate on a single-node Kafka Connect cluster: this is becuase each task must be able to locate the files in the input.dir locally. Multiple source connectors, however can send to a single topic on the same Kafka cluster.
- the sink connector should operate on a single-node Kafka Connect cluster: this is because each task must be able to write files to the download subdirectories (builds, merged and locked) that are accessible to the other tasks running on the Kafka Connect server.
