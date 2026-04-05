# 🚀 Quick Start: n8n Cloud + React Integration

## Prerequisites Checklist

- [ ] Google Account (for Gmail & Calendar APIs)
- [ ] OpenAI Account (for AI responses)
- [ ] n8n Cloud free account

## Setup Steps (5 minutes)

### 1️⃣ Create Accounts

```
Google: https://accounts.google.com
OpenAI: https://platform.openai.com
n8n Cloud: https://app.n8n.cloud
```

### 2️⃣ Get OpenAI API Key

1. Log in to https://platform.openai.com
2. Go to "API keys" section
3. Click "Create new secret key"
4. Copy the key and **save it safely**

### 3️⃣ Get Google OAuth Credentials

1. Go to https://console.cloud.google.com
2. Create new project: Name it "n8n-react-integration"
3. Enable APIs:
   - Gmail API
   - Google Calendar API
4. Create OAuth 2.0 Client ID (Desktop application)
5. Download the JSON file with credentials

**Save the following from JSON:**
- Client ID
- Client Secret

### 4️⃣ Import Workflow to n8n Cloud

1. Log in to n8n Cloud (app.n8n.cloud)
2. Click "Import" → "From file"
3. Select `n8n-workflow.json` from this project
4. Workflow imported ✅

### 5️⃣ Configure Credentials in n8n

**Add OpenAI Credential:**
1. Click Credentials
2. Create new → OpenAI
3. Name: `OpenAI - API Key`
4. Paste your API key
5. Save

**Add Gmail Credential:**
1. Create new → Gmail OAuth2
2. Name: `Gmail - OAuth2`
3. Add your Client ID & Secret
4. Click "Authenticate with Google"
5. Grant Gmail access
6. Save

**Add Google Calendar Credential:**
1. Create new → Google Calendar OAuth2
2. Name: `Google Calendar - OAuth2`
3. Use same Client ID & Secret
4. Click "Authenticate with Google"
5. Grant Calendar access
6. Save

### 6️⃣ Update Workflow Nodes

In your imported workflow:
1. Click "AI Agent" node → Select OpenAI credential
2. Click "Gmail Search" node → Select Gmail credential
3. Click "Create Calendar Event" → Select Google Calendar credential

### 7️⃣ Activate Workflow

1. Click "Save" (top right)
2. Toggle "Activate" to ON
3. Status should show "Active" ✅

### 8️⃣ Get Webhook URL

1. Click "Webhook Trigger" node
2. Copy the webhook URL from the right panel
3. Example: `https://app.n8n.cloud/webhook/xyz/react-webhook`

### 9️⃣ Update React .env File

```bash
# Open .env file and update:
VITE_N8N_WEBHOOK_URL=https://app.n8n.cloud/webhook/xyz/react-webhook
```

Replace `xyz` with your actual webhook ID.

### 🔟 Test It!

```bash
npm run dev
```

1. Open http://localhost:4173/
2. Select "AI prompt"
3. Enter: "What is n8n?"
4. Click "Run n8n action"
5. See real OpenAI response! 🎉

## Testing All Features

### Test 1: AI Prompt
- **Action**: AI prompt
- **Prompt**: "Explain quantum computing"
- **Expected**: Real OpenAI response

### Test 2: Gmail Search
- **Action**: Read Gmail
- **Query**: "from:me@gmail.com"
- **Expected**: Your recent emails

### Test 3: Create Event
- **Action**: Create Calendar event
- **Title**: "Team Meeting"
- **Date**: Tomorrow
- **Time**: 10:00
- **Expected**: Event appears in your calendar

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Webhook request failed" | Check webhook URL in .env is correct |
| "API key invalid" | Verify OpenAI API key at platform.openai.com |
| "Gmail failed" | Re-authenticate Gmail OAuth in n8n |
| "Calendar failed" | Re-authenticate Google Calendar OAuth |
| "Slow response" | First call takes 5-10s, normal for AI |

## Important Notes

⚠️ **Never share your API keys or credentials**

💰 **OpenAI Free Trial**: Limited tokens (usually $5)
- Monitor usage at https://platform.openai.com/account/usage/overview

📧 **Gmail API**: Free tier works fine

📅 **Google Calendar API**: Free tier works fine

## Support

- n8n Docs: https://docs.n8n.io/
- OpenAI Docs: https://platform.openai.com/docs
- Google API Docs: https://developers.google.com/

## Next: Advanced Customization

Once basic setup works:
- Add more actions/nodes
- Create custom workflows
- Connect to other services
- Deploy to production
