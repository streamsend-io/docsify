# File Chunks

A Streamsend file-chunk pipeline splits files into chunks that fit inside a Kafka message.
The files can be of any content type and of any size (within reason). File sizes from tens to low-thousands of megabytes have been tested successfully.
The chunk size (derived automatically, or manually configured using binary.chunk.size.bytes) must always be smaller than the max.message.bytes configured for the Kafka cluster.

## Files

The contents of the files is immaterial.  

Stream any type of file:

* Contents can be encoded as character or binary

* Character encoded files can use any encoding scheme including UTF-8, big-5, shift-JIS, etc

* Character encoded files can include any content type including text, XML, JSON, YAML, CDR

* Binary contents can include audio, video, image or closed formats such as database redo logs

* files can be uncompressed or compressed (using any compression algorithm)

* files can be unencrypted or encrypted

Queued files must be static: they must not be open by an process or thread.

:::warning

Reading the file can take some time; if any process changes the file during chunking then a target file MD5 mismatch is likely.

:::

## File Sizes

The file must fit inside the memory allocation for Uploader and the Downloader.


## Upload Ordering

The Uploader scans for unprocessed files in the files.dir, selecting eligible files for upload using the input.file.pattern. Renaming a file (after copying it into the files.dir) could also be used (as an alternative to file.minimum.age.ms) as a technique to ensure that chunking begins for fully-copied files.
If multiple eligible files are found in files.dir, then the first file is chunked and sent before chunking the second file; and so on.


## Upload File Age

As each new file is found, if file.minimum.age.ms is configured, then the Uploader waits until the file reaches this age before it begins chunking the file. file.minimum.age.ms should be configured long enough to copy complete files into the files.dir (to avoid chunking of partially copied files).


## Filesystem Considerations

Releases prior to v 3.0 created file-chunks on the filesystem. Release v3.0 onwards is stateless: the file is read into Uploader memory before chunking and producing to Kafka.
Filesystem storage for chunks is no longer required.

The Downloader appends chunks from the first chunk to the final chunk before running a MD5 check and then writing the file to the downloader files.dir. Note that the md5 check is done *before* writing the file to the filesystem: since the likelyhood of file corruption during write is much lower then during consume and merge.

## Chunks

Release v3.0 onwards simplifies chunk.size management by automatically setting the chunk size based on the Kafka cluster (and topic) limits for both the Uploader and Downloader.
