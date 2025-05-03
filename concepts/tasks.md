# Threads

Deployment of a Streamsend file-chunk pipeline is free for single-thread configuration.
A license or subscription is _not_ required to deploy in any of the three packaged configurations:
- command line for macOS or Linux
- Docker container
- Kubernetes CR using the Docker container 

 Any number of Uploaders or Downloader can be deployed. They operate in __single-thread mode__; meaning that an Uploader processes one file at a time (and one chunk at a time). Similarly the downloader consumes and merges one chunk at a time. 

The Uploader operates one thread to chunk files and produce the chunks to a topic.
The Downloader operates one task to consume from the same topic.
One partition is used for all file chunks messages.

Multiple Uploaders or Downloaders can run using the same topic, or multiple topics.
