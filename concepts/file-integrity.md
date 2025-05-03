# File Integrity Checks

The Uploader generates a MD5 checksum for each streamed file.  The Downloader generates a MD5 checksum for each merged file.  The MD5 checksums are compared by the Downloader when the file chunk is merged; in memory. If the md5 checksum's match then the Downloader writes the file to files.dir optionally in a subdirectory; if it was located in a subdirectory by the Uploader.
If the md5 checksum does not match then the Downloader writes the file to files.dir as  <filename>__ERROR_MD5_MISMATCH.

Various integrity checks are performed during pipeline streaming:

* File chunks are numbered, from 1 to n; where n = (filesize / binary.chunk.size.bytes). Each chunk will be exactly binary.chunk.size.bytes bytes; except for the final chunk, which is usually smaller than binary.chunk.size.bytes.
* The Downloader verifies that the size of the (partially) merged target file is always (binary.chunk.size.bytes * chunk-number).
* After merging the final chunk, the MD5 checksum for the target file is compared with the previously generated MD5 checksum for the source file; which is populated into the header for each chunk.
