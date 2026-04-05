# n8n Cloud Setup Guide

## Step 1: Create n8n Cloud Account

1. Go to: https://app.n8n.cloud/
2. Click "Sign up" 
3. Enter your email and create a password
4. Verify your email
5. You're now logged into n8n Cloud

## Step 2: Import the Workflow

1. In n8n Cloud dashboard, click **"New Workflow"** or **"Import"**
2. Click **"Import from file"**
3. Upload the `n8n-workflow.json` file from this project
4. The workflow will be imported with all nodes ready

## Step 3: Configure Credentials

### 3A. OpenAI Credentials (for AI Agent node)

1. In n8n, click **"Credentials"** in the sidebar
2. Click **"+ New"** and select **"OpenAI"**
3. Name it: `OpenAI - API Key`
4. Get your API key from: https://platform.openai.com/api-keys
   - If you don't have an account: Sign up at https://platform.openai.com
   - Create a new API key
   - Copy it
5. Paste the API key into n8n
6. Click **"Save"**

### 3B. Gmail Credentials (for Gmail Read node)

1. Click **"+ New"** credential and select **"Gmail OAuth2"**
2. Name it: `Gmail - OAuth2`
3. Set up Google OAuth:
   - Go to: https://console.cloud.google.com/
   - Create a new project (or select existing)
   - Enable "Gmail API"
   - Go to "OAuth 2.0 credentials"
   - Create "OAuth 2.0 Client ID" (Desktop application)
   - Download JSON credentials
4. Back in n8n Gmail OAuth2 credential:
   - Click "Use own credentials"
   - Enter Client ID and Client Secret from the JSON file
   - Click "Authenticate with Google"
   - Grant permission to access Gmail
5. Click **"Save"**

### 3C. Google Calendar Credentials (for Calendar node)

1. Click **"+ New"** credential and select **"Google Calendar OAuth2"**
2. Name it: `Google Calendar - OAuth2`
3. In Google Cloud Console (same project as Gmail):
   - Enable "Google Calendar API"
   - Use the same OAuth 2.0 credentials as Gmail
4. Back in n8n Google Calendar OAuth2 credential:
   - Enter the same Client ID and Client Secret
   - Click "Authenticate with Google"
   - Grant permission to access Calendar
5. Click **"Save"**

## Step 4: Update Workflow Nodes with Credentials

1. In your imported workflow, click on each node:
   - **AI Agent node**: Select the OpenAI credential from dropdown
   - **Gmail Read node**: Select the Gmail credential from dropdown
   - **Google Calendar node**: Select the Google Calendar credential from dropdown

## Step 5: Get Your Webhook URL

1. In your workflow, click on the **"Webhook Trigger"** node
2. Copy the webhook URL shown on the right panel
3. Example: `https://app.n8n.cloud/webhook/[unique-id]/react-webhook`

## Step 6: Update React App

1. Open `.env` file in the project
2. Replace the webhook URL:
   ```
   VITE_N8N_WEBHOOK_URL=YOUR_WEBHOOK_URL_HERE
   ```
   Example:
   ```
   VITE_N8N_WEBHOOK_URL=https://app.n8n.cloud/webhook/abc123def/react-webhook
   ```
3. Save the file

## Step 7: Activate the Workflow

1. In n8n, click the **"Save"** button (top right)
2. Click the **"Activate"** toggle to enable the workflow
3. The workflow status should show as "Active"

## Step 8: Test the Connection

1. Start the React app: `npm run dev`
2. Open http://localhost:4173/
3. In the action dropdown, select **"AI prompt"**
4. Enter a test prompt: **"What is n8n?"**
5. Click **"Run n8n action"**
6. Wait for the response (first call may take 5-10 seconds)
7. You should see the real AI response from OpenAI!

## Troubleshooting

### "Webhook request failed" or "Connection refused"
- Check that your webhook URL in `.env` is correct
- Verify the workflow is "Active" in n8n
- Make sure you copied the entire webhook URL

### "OpenAI API key not valid"
- Verify your API key is active: https://platform.openai.com/api-keys
- Check that you have credits remaining in your OpenAI account
- Regenerate the key if needed

### Gmail or Calendar "Authentication failed"
- Make sure APIs are enabled in Google Cloud Console
- Re-authenticate the OAuth credentials
- Grant all requested permissions

### Slow first response
- OpenAI API calls can take 5-10 seconds on first request
- Subsequent calls should be faster

## Summary of URLs You'll Need

1. **n8n Cloud**: https://app.n8n.cloud/
2. **Google Cloud Console**: https://console.cloud.google.com/
3. **OpenAI API Keys**: https://platform.openai.com/api-keys
4. **React App**: http://localhost:4173/

## Next Steps

Once everything is working:
- Test all three action types (AI, Gmail, Calendar)
- Customize the workflow nodes as needed
- Add more actions and integrations
- Deploy to production when ready
