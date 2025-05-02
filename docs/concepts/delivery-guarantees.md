# Delivery Guarantees

## Pipeline pair: Uplaoder and Downloader

A Streamsend file-chunk pipeline must operate as a pipeline pair, with no other producers/consumers for the topic.
The uploader populates message headers with file metadata which is required by the downloader to merge chunks: which involves ordering, checksums, file creation time and partitions.

## Exactly Once delivery

### Uploader

A Streamsend Uploader guarantees an exactly-once pipeline - a combination of an at-least delivery guarantee for the Uplaoder and duplicate handling by the Downloader. The Uploader is always configured for unlimited retries:

```properties
max.in.flight.requests.per.connection = 1
retries = 2147483647
retry.backoff.ms = 500
```


### Downloader

Duplicate file-chunks (caused either by an Uploader resend, or by a manual replay) results in replay of file chunks by the Downloader. If the out-of-order file-chunk is consumed then it is simply logged and discarded. As replay proceeds through file chunks, they are consumed, merged and written as normal: if the file already exists then it is over-written. Unlike an event-driven pipeline, files are static and can be safely over-written.

:::note

If an upstream file is recreated and queued a second time, then although the file has the same name, it has a  different **file last-modified time**. When merging chunks, the downloader verifies that **file last-modified time** for chunks are the same, to avoid merging chunks from files named the same (but with different last-modified times). When file chunks from two different file generations are detected, the old generation is discarded and only the new generation is merged

:::
