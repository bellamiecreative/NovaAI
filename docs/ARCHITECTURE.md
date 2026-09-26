# NovaAI Architecture

```text
Mobile / Web
     |
     v
NovaAI UI
     |
     v
Server API
  |   |   |
  v   v   v
 Chat Image Voice
     |
     v
 Database / Storage
```

The client never receives private AI provider keys. The server owns provider calls.
The mobile app will use the same server API as the web app.

## Milestones

1. Foundation
2. Chat API + real model
3. Database + chat history
4. Authentication
5. Image generation
6. Voice
7. Expo mobile client
8. Production deployment and monitoring
