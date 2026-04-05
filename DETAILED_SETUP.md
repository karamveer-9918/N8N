# n8n Cloud Setup - Complete Guide

## 📊 Architecture Overview

```
┌─────────────────┐
│   React UI      │
│ localhost:4173  │
└────────┬────────┘
         │
         │ POST /webhook/react-webhook
         │ (with prompt, action, etc)
         │
         ▼
┌─────────────────────────────────┐
│     n8n Cloud Workflow          │
│  app.n8n.cloud/workflows        │
└────┬──────────────┬──────────┬──┘
     │              │          │
     ▼              ▼          ▼
┌─────────┐   ┌──────────┐  ┌──────────┐
│OpenAI   │   │Gmail API │  │ Google   │
│(GPT-4o) │   │(Search)  │  │ Calendar │
└─────────┘   └──────────┘  └──────────┘
     │              │          │
     └──────┬───────┴──────┬───┘
            │              │
            ▼              ▼
       ┌──────────────────────┐
       │ HTTP Response Node   │
       │ (returns JSON)       │
       └──────────┬───────────┘
                  │
                  │ Response JSON
                  │
                  ▼
          ┌──────────────────┐
          │  React App UI    │
          │ Display Result   │
          └──────────────────┘
```

---

## 🔑 Step-by-Step Setup

### STEP 1: Sign Up for Services

#### Google Account
- Visit: https://accounts.google.com
- Create account if needed
- Used for: Gmail API + Google Calendar API

#### OpenAI Account  
- Visit: https://platform.openai.com
- Sign up
- Used for: AI responses

#### n8n Cloud Account
- Visit: https://app.n8n.cloud
- Click "Sign up"
- Create account

---

### STEP 2: Get OpenAI API Key

**In OpenAI Platform:**

1. Log in to https://platform.openai.com
2. Left menu → "API keys"
3. Click "+ Create new secret key"
4. Copy the key immediately (won't show again!)
5. Save in a safe place

**Note:** You might need to:
- Add a payment method
- Check your usage at https://platform.openai.com/account/usage/overview

---

### STEP 3: Set Up Google Cloud OAuth

**In Google Cloud Console:**

1. Go to https://console.cloud.google.com
2. Click "Select a project" → "New project"
3. Name: `n8n-react-integration`
4. Click "Create"
5. Wait for project to be created (2-3 seconds)

**Enable Gmail API:**
1. Search bar at top: "Gmail API"
2. Click the result
3. Click "Enable"

**Enable Google Calendar API:**
1. Search bar: "Google Calendar API"
2. Click the result
3. Click "Enable"

**Create OAuth Credentials:**
1. Left menu → "Credentials"
2. Click "+ Create Credentials" → "OAuth 2.0 Client ID"
3. If prompted, set up OAuth consent screen first:
   - User type: External
   - Add required info
   - Add yourself as test user
4. Application type: **Desktop application**
5. Name: `n8n-react`
6. Click "Create"
7. Click "Download" (saves JSON file)

**Save these values from the JSON file:**
```
Client ID: xxxxxx...
Client Secret: xxxxxx...
```

---

### STEP 4: Import Workflow to n8n

**In n8n Cloud:**

1. Log in to https://app.n8n.cloud
2. Click "New" or "Import"
3. Select "Import from file"
4. Choose `n8n-workflow.json` from your project folder
5. Click "Import"
6. Workflow created! ✅

---

### STEP 5: Add Credentials to n8n

**Create OpenAI Credential:**

1. Click "Credentials" in left sidebar
2. Click "+ New"
3. Search: "OpenAI"
4. Name: `OpenAI - API Key`
5. Paste your OpenAI API key
6. Click "Save"

**Create Gmail OAuth Credential:**

1. Click "+ New" credential
2. Search: "Gmail"
3. Select "Gmail OAuth2"
4. Name: `Gmail - OAuth2`
5. Check "Use own credentials"
6. Enter:
   - **Client ID** (from JSON file)
   - **Client Secret** (from JSON file)
7. Click "Authenticate with Google"
8. Select your Google account
9. Click "Allow" for all permissions
10. Wait for confirmation
11. Click "Save"

**Create Google Calendar Credential:**

1. Click "+ New" credential
2. Search: "Google Calendar"
3. Select "Google Calendar OAuth2"
4. Name: `Google Calendar - OAuth2`
5. Check "Use own credentials"  
6. Enter:
   - **Client ID** (same as Gmail)
   - **Client Secret** (same as Gmail)
7. Click "Authenticate with Google"
8. Select your Google account
9. Click "Allow" for calendar permissions
10. Click "Save"

---

### STEP 6: Connect Credentials to Workflow Nodes

**In your imported workflow:**

1. **Click "AI Agent" node**
   - Right panel: Select "OpenAI - API Key" from dropdown
   
2. **Click "Gmail Search" node**
   - Right panel: Select "Gmail - OAuth2" from dropdown

3. **Click "Create Calendar Event" node**
   - Right panel: Select "Google Calendar - OAuth2" from dropdown

---

### STEP 7: Save & Activate Workflow

1. Click "Save" button (top right)
2. You'll see "Workflow saved" message
3. Toggle the **"Activate"** switch (top right)
4. Status should show: **"Active"**

---

### STEP 8: Get Your Webhook URL

1. In the workflow, click **"Webhook Trigger"** node
2. Look at the **right panel**
3. Copy the full webhook URL:
   ```
   https://app.n8n.cloud/webhook/[UNIQUE-ID]/react-webhook
   ```

---

### STEP 9: Update React App

**Edit your `.env` file:**

```bash
# OLD:
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/react-webhook

# NEW (paste your n8n Cloud webhook URL):
VITE_N8N_WEBHOOK_URL=https://app.n8n.cloud/webhook/[UNIQUE-ID]/react-webhook
```

**Make sure:** 
- You're pasting the FULL URL from the Webhook Trigger node
- No extra spaces or characters
- File is saved

---

### STEP 10: Test Everything

**Start your React app:**
```bash
npm run dev
```

**Open in browser:**
```
http://localhost:4173/
```

**Test #1: AI Prompt**
- Select: "AI prompt"
- Enter: "What can you tell me about artificial intelligence?"
- Click: "Run n8n action"
- **Result:** Real AI response from OpenAI ✅

**Test #2: Gmail Search** 
- Select: "Read Gmail"
- Enter: "from:me subject:important"
- Click: "Run n8n action"
- **Result:** Your actual emails from Gmail ✅

**Test #3: Create Calendar Event**
- Select: "Create Calendar event"
- Enter:
  - Title: "Team Sync"
  - Date: Tomorrow's date
  - Time: 10:00
  - Description: "Weekly meeting"
- Click: "Run n8n action"
- **Result:** Event appears in your Google Calendar ✅

---

## ⚠️ Common Issues & Fixes

### Issue: "Webhook request failed" or "Connection refused"

**Check:**
1. Is your webhook URL correct in `.env`?
2. Did you copy the full URL from n8n?
3. Is the workflow activated (toggle ON)?
4. Did you click "Save" after changes?

**Fix:**
- Go back to n8n Cloud
- Click Webhook Trigger node
- Copy the URL again (exactly)
- Update `.env` file
- Restart React app: `npm run dev`

---

### Issue: "Invalid API key" (OpenAI)

**Check:**
1. Did you add a payment method to OpenAI?
2. Is your API key still active?
3. Do you have enough credits?

**Fix:**
- Go to https://platform.openai.com/account/usage/overview
- Check your usage and credits
- Create a new API key if needed
- Update in n8n credentials
- Re-authenticate the credential

---

### Issue: Gmail not working

**Check:**
1. Is Gmail API enabled in Google Cloud?
2. Did you authenticate successfully?

**Fix:**
- Go to n8n Cloud
- Click Credentials
- Find your Gmail credential
- Click "Delete"
- Create new one and re-authenticate
- Update the Gmail Search node with new credential

---

### Issue: First response is very slow (10+ seconds)

**This is normal!**
- First OpenAI request takes 5-10 seconds
- Subsequent requests are faster
- Nothing to fix ✅

---

## 📝 Useful Links

| What | Where |
|------|-------|
| OpenAI API Dashboard | https://platform.openai.com |
| OpenAI API Keys | https://platform.openai.com/api-keys |
| OpenAI Usage | https://platform.openai.com/account/usage/overview |
| Google Cloud Console | https://console.cloud.google.com |
| n8n Cloud | https://app.n8n.cloud |
| n8n Documentation | https://docs.n8n.io |
| Your React App | http://localhost:4173 |

---

## 🎉 Congratulations!

Your complete n8n + React integration is working! 🚀

**You can now:**
- Ask AI questions in real-time
- Search your Gmail emails
- Create calendar events from the UI
- Build more features by adding nodes to your n8n workflow

Enjoy!
