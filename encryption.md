# Security

Files are re-assembled at the Downloader as-is: the streamed files in the Downloader output.dir directory are identical to the files in the Uploader input.dir directory.
The files selected for upload can be of any format (including any binary format): for example they can be compressed (.gz, .zip etc) or encrypted.
Topic messages (file chunks) may be optionally encrypted by setting SSL/TLS based configuration for the source and sink connectors.

The support all Kafka Connect communication protocols, including communication with secure Kafka over TLS/SSL as well as TLS/SSL or SASL for
authentication.

| Security Goal         | using this encryption | and this auth     | configure this security.protocol | and this sasl.mechanism | Comments |
| --------------------- | ---------- | -------- | ----------------- | -------------- | --------------------------- |
| no encryption or auth | none       | none     | _unset_           | _unset_        | Use for dev only            |
| username/password, no encryption    | Plaintext  | SASL     | SASL_PLAINTEXT    | _unset_        | Not recommended (insecure)  |
| username/password, traffic encrypted| TLS/SSL    | SASL     | SASL_SSL          | PLAIN          | Use for Confluent Cloud     |
| Kerberos (GSSAPI)     | TLS/SSL    | Kerberos | SASL_SSL          | GSSAPI         |                             |
| SASL SCRAM            | TLS/SSL    | SCRAM   | SASL_SSL          | SCRAM-SHA-256  |                             |

To connect to Confluent Cloud, the file chunk connectors must use SASL_SSL & PLAIN.
Although Confluent Cloud also supports OAUTH authorisation (CP 7.2.1 or later), OAUTH is not yet supported for self-managed Kafka Connect clusters.
