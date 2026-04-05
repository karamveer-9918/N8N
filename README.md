# n8n React Webhook UI

A minimal React UI that sends a prompt to an n8n webhook and displays the formatted AI response.

## What this includes

- React + Vite UI
- Prompt form that posts to `VITE_N8N_WEBHOOK_URL`
- Example `n8n` webhook workflow skeleton
- UI response rendering

## Setup

1. Copy `.env.example` to `.env`
2. Set `VITE_N8N_WEBHOOK_URL` to your n8n webhook URL
3. Install dependencies

```bash
npm install
```

4. Run the React app

```bash
npm run dev
```

## Run n8n locally

This repo now includes a `docker-compose.yml` to run n8n locally.

```bash
docker compose up -d
```

Then open `http://localhost:5678` to access the n8n editor.

If you want custom n8n container values, copy `.env.n8n.example` to `.env.n8n`.

## n8n workflow

Use a webhook trigger node and an AI node in n8n, then return a formatted payload with an HTTP response node.

Example webhook path:

- Path: `react-webhook`
- HTTP method: `POST`

Example request body from React:

```json
{
  "action": "ai",
  "prompt": "Write a short answer about how n8n and React can work together."
}
```

For Gmail:

```json
{
  "action": "read-email",
  "emailQuery": "from:alice@example.com subject:meeting"
}
```

For calendar events:

```json
{
  "action": "create-event",
  "eventTitle": "Design sync",
  "eventDate": "2026-04-10",
  "eventTime": "13:30",
  "eventDescription": "Discuss n8n + React integration"
}
```

### Suggested n8n node flow

1. `Webhook` trigger node
2. `If` / `Switch` node to route by `action`
3. `AI` / `OpenAI` / `Agent` node for prompt processing
4. `Gmail` node for reading email
5. `Google Calendar` node for creating events
6. `HTTP Response` node to send back a JSON payload

### Gmail / Calendar credentials

To use Gmail and Google Calendar in n8n, configure Google OAuth credentials in the n8n credentials manager.

- Gmail node: `Gmail OAuth2` credentials
- Google Calendar node: `Google Calendar OAuth2` credentials

If you want, provide your Gmail OAuth client ID and secret and I can show exactly where to enter them in n8n.

### Example JSON response structure

Return this from the last n8n node:

```json
{
  "answer": "Your formatted AI answer goes here.",
  "execution": {
    "action": "create-event",
    "status": "success",
    "startedAt": "2026-04-05T12:00:00.000Z",
    "finishedAt": "2026-04-05T12:00:05.000Z",
    "steps": [
      { "name": "Webhook Trigger", "status": "success" },
      { "name": "Decision Router", "status": "success" },
      { "name": "Google Calendar", "status": "success" },
      { "name": "HTTP Response", "status": "success" }
    ]
  }
}
```

## Example webhook configuration

Use this workflow example as a starting point, then add your AI agent node and RAG memory node between the webhook and response.

### `n8n-workflow.json`

This repo includes a skeleton workflow with just the webhook and HTTP response nodes. Import it into n8n and then add your AI agent node + RAG memory node between the webhook and response.

> Note: n8n runs as a separate service. The React app sends the prompt to a webhook endpoint, and n8n processes it.

---

### Gmail / authentication

This UI does not require Gmail authentication. If you want to add email-based triggers, please share your Gmail OAuth details and I can extend the workflow.
