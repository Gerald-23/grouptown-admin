# Storage Paths

Keep upload structure consistent across mobile and web.

Suggested path patterns:

- `users/{userId}/avatars/{fileName}`
- `groups/{groupId}/cover/{fileName}`
- `groups/{groupId}/attachments/{fileName}`
- `events/{eventId}/media/{fileName}`

For each path, define:

- who can upload
- who can read
- allowed file types
- size limits
