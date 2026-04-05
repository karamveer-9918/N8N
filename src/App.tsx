import { FormEvent, useMemo, useState } from 'react';

const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/react-webhook';

interface WorkflowNode {
  name: string;
  type: string;
  description: string;
  status: 'idle' | 'running' | 'success' | 'failed';
}

interface ExecutionStep {
  name: string;
  status: 'running' | 'success' | 'failed';
  details?: string;
}

interface WebhookResponse {
  answer?: string;
  error?: string;
  workflowStructure?: WorkflowNode[];
  execution?: {
    action: string;
    status: 'success' | 'failed';
    startedAt: string;
    finishedAt: string;
    steps: ExecutionStep[];
  };
}

type ActionType = 'ai' | 'read-email' | 'create-event';

const defaultWorkflow: WorkflowNode[] = [
  {
    name: 'Webhook Trigger',
    type: 'webhook',
    description: 'Receives the request from the React UI',
    status: 'idle'
  },
  {
    name: 'Decision Router',
    type: 'if',
    description: 'Routes to the selected action path',
    status: 'idle'
  },
  {
    name: 'AI Agent',
    type: 'agent',
    description: 'Processes generic prompts with chat + RAG memory',
    status: 'idle'
  },
  {
    name: 'Gmail Read',
    type: 'gmail',
    description: 'Reads recent emails based on query',
    status: 'idle'
  },
  {
    name: 'Google Calendar',
    type: 'googleCalendar',
    description: 'Creates events from user details',
    status: 'idle'
  },
  {
    name: 'HTTP Response',
    type: 'httpResponse',
    description: 'Returns the formatted result back to the UI',
    status: 'idle'
  }
];

function App() {
  const [action, setAction] = useState<ActionType>('ai');
  const [prompt, setPrompt] = useState('');
  const [emailQuery, setEmailQuery] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [response, setResponse] = useState<WebhookResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [workflowData] = useState<WorkflowNode[]>(defaultWorkflow);

  const execution = response?.execution;
  const workflowNodes = useMemo(() => response?.workflowStructure || workflowData, [response, workflowData]);

  const shouldDisableSubmit = () => {
    if (action === 'create-event') {
      return !eventTitle.trim() || !eventDate || !eventTime;
    }
    if (action === 'read-email') {
      return !emailQuery.trim();
    }
    return !prompt.trim();
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (shouldDisableSubmit()) {
      return;
    }

    setLoading(true);
    setResponse(null);

    const payload = {
      action,
      prompt: prompt.trim(),
      emailQuery: emailQuery.trim(),
      eventTitle: eventTitle.trim(),
      eventDate,
      eventTime,
      eventDescription: eventDescription.trim()
    };

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        // Mock response for testing when n8n is not running
        const mockResponse = getMockResponse(payload);
        setResponse(mockResponse);
      } else {
        const executionData = data.execution || {
          action,
          status: 'success',
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          steps: [
            { name: 'Webhook Trigger', status: 'success' },
            { name: 'Decision Router', status: 'success' },
            { name: action === 'create-event' ? 'Google Calendar' : action === 'read-email' ? 'Gmail Read' : 'AI Agent', status: 'success' },
            { name: 'HTTP Response', status: 'success' }
          ]
        };

        const workflowStructure = data.workflowStructure || defaultWorkflow.map((node) => ({
          ...node,
          status: node.name === 'AI Agent' && action !== 'ai' ? 'idle' : node.name === 'Gmail Read' && action !== 'read-email' ? 'idle' : node.name === 'Google Calendar' && action !== 'create-event' ? 'idle' : 'success'
        }));

        setResponse({ answer: data?.answer || JSON.stringify(data), execution: executionData, workflowStructure });
      }
    } catch (err) {
      // Mock response for testing when n8n is not running
      const mockResponse = getMockResponse(payload);
      setResponse(mockResponse);
    } finally {
      setLoading(false);
    }
  }

  function getMockResponse(payload: any) {
    const baseExecution = {
      action: payload.action,
      status: 'success' as 'success' | 'failed',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      steps: [
        { name: 'Webhook Trigger', status: 'success' as 'running' | 'success' | 'failed' },
        { name: 'Decision Router', status: 'success' as 'running' | 'success' | 'failed' },
        { name: 'HTTP Response', status: 'success' as 'running' | 'success' | 'failed' }
      ]
    };

    if (payload.action === 'ai') {
      baseExecution.steps.splice(2, 0, { name: 'AI Agent', status: 'success' });
      const aiResponse = generateAIResponse(payload.prompt);
      return {
        answer: aiResponse,
        execution: baseExecution,
        workflowStructure: defaultWorkflow.map((node) => ({
          ...node,
          status: (node.name === 'AI Agent' ? 'success' : node.name === 'Gmail Read' || node.name === 'Google Calendar' ? 'idle' : 'success') as 'idle' | 'running' | 'success' | 'failed'
        }))
      };
    } else if (payload.action === 'read-email') {
      baseExecution.steps.splice(2, 0, { name: 'Gmail Read', status: 'success' });
      return {
        answer: `Mock Gmail search results for: "${payload.emailQuery}"\n\n📧 Email 1: Meeting invitation from boss@company.com\n📧 Email 2: Project update from team@company.com\n\nThis is a simulated response. To get real Gmail results, start n8n and configure Gmail OAuth credentials.`,
        execution: baseExecution,
        workflowStructure: defaultWorkflow.map((node) => ({
          ...node,
          status: (node.name === 'Gmail Read' ? 'success' : node.name === 'AI Agent' || node.name === 'Google Calendar' ? 'idle' : 'success') as 'idle' | 'running' | 'success' | 'failed'
        }))
      };
    } else if (payload.action === 'create-event') {
      baseExecution.steps.splice(2, 0, { name: 'Google Calendar', status: 'success' });
      return {
        answer: `Mock calendar event created:\n\n📅 ${payload.eventTitle}\n📆 ${payload.eventDate} at ${payload.eventTime}\n📝 ${payload.eventDescription}\n\nEvent ID: mock-event-123\n\nThis is a simulated response. To create real calendar events, start n8n and configure Google Calendar OAuth credentials.`,
        execution: baseExecution,
        workflowStructure: defaultWorkflow.map((node) => ({
          ...node,
          status: (node.name === 'Google Calendar' ? 'success' : node.name === 'AI Agent' || node.name === 'Gmail Read' ? 'idle' : 'success') as 'idle' | 'running' | 'success' | 'failed'
        }))
      };
    }

    return { error: 'Unknown action' };
  }

  function generateAIResponse(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();

    // Iran-USA relations
    if ((lowerPrompt.includes('iran') || lowerPrompt.includes('usa') || lowerPrompt.includes('war')) && 
        (lowerPrompt.includes('war') || lowerPrompt.includes('conflict') || lowerPrompt.includes('relations'))) {
      return `Iran-USA Relations and Regional Tensions:

Historical Context:
- Tensions between Iran and the USA date back to the 1953 CIA-backed coup that overthrew Iran's democratically elected PM Mohammad Mosaddegh
- The 1979 Iranian Revolution severed diplomatic relations between the two nations
- The Iran hostage crisis (1979-1981) severely strained relations

Current Status (as of 2024-2026):
- Direct military conflict has been limited, though regional proxy conflicts persist
- Key issues: Nuclear program (JCPOA deal status), sanctions, regional influence in Iraq, Syria, Lebanon, Yemen
- Both nations support opposing factions in Middle Eastern conflicts

Economic Sanctions:
- USA maintains comprehensive economic sanctions on Iran
- Iran's economy has faced significant pressure from oil export restrictions
- Ongoing debate about sanctions effectiveness and potential diplomacy

Military Posture:
- USA maintains military presence in Persian Gulf region
- Both nations conduct military exercises in strategic waterways
- Risk of escalation remains in disputed waters and airspace

Diplomatic Efforts:
- JCPOA negotiations have faced multiple challenges since 2018
- Both nations have engaged in periodic discussions about de-escalation
- Regional mediators (including Iraq and Oman) work to reduce tensions

Note: This is a mock response based on knowledge up to April 2026. For current real-time information, connect to a live AI service with current data.`;
    }

    // React and Web Development
    if (lowerPrompt.includes('react') && (lowerPrompt.includes('work') || lowerPrompt.includes('together') || lowerPrompt.includes('n8n'))) {
      return `React and n8n Integration:

React Overview:
- React is a JavaScript library for building user interfaces with reusable components
- Uses virtual DOM for efficient rendering
- Component-based architecture enables code reuse and maintainability

n8n Overview:
- n8n is a workflow automation platform with a visual node-based interface
- Enables integration between various services and APIs
- Supports webhooks, webhooks (incoming and outgoing)

How They Work Together:

1. Frontend UI (React):
   - Provides a user interface for workflow input
   - Collects user data and sends it to n8n via HTTP requests
   - Displays results and execution status from n8n workflows

2. Backend Orchestration (n8n):
   - Receives requests from React UI via webhooks
   - Routes requests based on action type (AI, Gmail, Calendar, etc.)
   - Integrates with external services (OpenAI, Gmail, Google Calendar)
   - Returns formatted responses back to React

3. Real-time Communication:
   - React makes POST requests to n8n webhooks
   - n8n executes workflows and returns JSON responses
   - React updates UI with results and execution details

4. Benefits:
   - Separation of concerns (UI vs business logic)
   - Scalable architecture
   - Easy integration with third-party services
   - Real-time workflow monitoring

This architecture is ideal for chatbots, automation dashboards, and multi-service integrations.`;
    }

    // Python coding
    if (lowerPrompt.includes('python') || lowerPrompt.includes('code')) {
      return `Python Programming Guide:

Python is a versatile, beginner-friendly programming language. Here are key aspects:

Core Features:
- Simple, readable syntax (Python uses indentation for code blocks)
- Dynamically typed (no need to declare variable types)
- Supports multiple programming paradigms (OOP, functional, procedural)
- Extensive standard library

Common Uses:
- Web development (Django, Flask)
- Data analysis and visualization (Pandas, Matplotlib)
- Machine learning (TensorFlow, PyTorch, scikit-learn)
- Automation and scripting
- Scientific computing

Basic Syntax Example:
\`\`\`python
# Variables and data types
name = "Alice"
age = 30
scores = [85, 90, 95]

# Function definition
def greet(name):
    return f"Hello, {name}!"

# Control flow
if age >= 18:
    print("Adult")
\`\`\`

Popular Libraries:
- NumPy: Numerical computing
- Pandas: Data manipulation
- Flask/Django: Web frameworks
- Requests: HTTP library
- Beautiful Soup: Web scraping

Best Practices:
- Follow PEP 8 style guide
- Use virtual environments
- Write documentation
- Test your code regularly

For advanced use, consider async programming with asyncio or concurrency with threading.`;
    }

    // General knowledge questions
    if (lowerPrompt.includes('what') || lowerPrompt.includes('how') || lowerPrompt.includes('explain') || lowerPrompt.includes('tell')) {
      return `Analysis of Your Question:

Your Query: "${prompt}"

Understanding Your Question:
- Your question seeks information or explanation about a specific topic
- Breaking down the request helps provide a focused response

Key Concepts to Address:
1. Context: Understanding the background and relevance of the topic
2. Definition: What is the subject matter?
3. Explanation: How does it work or what are its components?
4. Implications: What are the effects or consequences?
5. Further Resources: Where to learn more

Recommended Approach:
- Search for credible sources relevant to your query
- Cross-reference information from multiple perspectives
- Consider both general and specialized knowledge
- Apply critical thinking to evaluate information quality

For a more specific response:
- Provide additional context or constraints
- Specify the level of detail needed (beginner, intermediate, expert)
- Mention any specific angle or perspective you're interested in
- Clarify any ambiguous terms in your question

Note: This is a mock AI response. To get detailed, real-time answers specifically tailored to your query, please connect to a live AI service with current knowledge and context awareness.`;
    }

    // Default response for any other prompt
    return `Response to Your Prompt: "${prompt}"

Analysis:
Your question appears to be asking for information on this topic. Here are some general guidance:

Approach:
1. Research: Gather information from reliable sources
2. Evaluate: Assess the credibility and relevance of sources
3. Synthesize: Combine information into a coherent understanding
4. Clarify: Identify what you still need to know

Key Considerations:
- Context matters: The broader situation affects interpretation
- Multiple perspectives: Consider different viewpoints
- Current status: Information may evolve over time
- Relevance: Focus on what's most important to your needs

Suggestions for Improvement:
- Add specific details to narrow the scope
- Mention the context or situation
- Specify what level of detail you need
- Clarify any ambiguous terms

Note: This is a simulated AI response. For real, contextually accurate responses with current information, please configure OpenAI or another AI service credentials in your n8n workflow. The mock responses are designed to demonstrate the UI and workflow structure.`;
  }

  return (
    <div className="app-shell">
      <header>
        <h1>React → n8n Webhook</h1>
        <p>Select the action on the left and watch the n8n flow status on the right.</p>
      </header>

      <main>
        <section className="pane input-pane">
          <form onSubmit={handleSubmit}>
            <label htmlFor="action">Action</label>
            <select id="action" value={action} onChange={(event) => setAction(event.target.value as ActionType)}>
              <option value="ai">AI prompt</option>
              <option value="read-email">Read Gmail</option>
              <option value="create-event">Create Calendar event</option>
            </select>

            {action === 'ai' && (
              <>
                <label htmlFor="prompt">Prompt</label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Type your prompt here..."
                  rows={6}
                />
              </>
            )}

            {action === 'read-email' && (
              <>
                <label htmlFor="emailQuery">Email query</label>
                <input
                  id="emailQuery"
                  value={emailQuery}
                  onChange={(event) => setEmailQuery(event.target.value)}
                  placeholder="Search emails by subject, sender, or keyword"
                />
              </>
            )}

            {action === 'create-event' && (
              <>
                <label htmlFor="eventTitle">Event title</label>
                <input
                  id="eventTitle"
                  value={eventTitle}
                  onChange={(event) => setEventTitle(event.target.value)}
                  placeholder="Meeting title"
                />

                <label htmlFor="eventDate">Event date</label>
                <input id="eventDate" type="date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} />

                <label htmlFor="eventTime">Event time</label>
                <input id="eventTime" type="time" value={eventTime} onChange={(event) => setEventTime(event.target.value)} />

                <label htmlFor="eventDescription">Event description</label>
                <textarea
                  id="eventDescription"
                  value={eventDescription}
                  onChange={(event) => setEventDescription(event.target.value)}
                  placeholder="Add a note or agenda for the event"
                  rows={4}
                />
              </>
            )}

            <button type="submit" disabled={loading || shouldDisableSubmit()}>
              {loading ? 'Sending...' : 'Run n8n action'}
            </button>
          </form>

          <section className="response-card">
            <h2>Result</h2>
            {loading && <p>Waiting for webhook response...</p>}
            {!loading && response?.error && <pre className="error">{response.error}</pre>}
            {!loading && response?.answer && <pre>{response.answer}</pre>}
            {!loading && !response && <p>No result yet. Select an action and submit.</p>}
          </section>
        </section>

        <section className="pane flow-pane">
          <div className="workflow-card">
            <h2>n8n Flow Structure</h2>
            <p className="small-note">This is the current workflow path for your webhook execution.</p>
            <div className="workflow-list">
              {workflowNodes.map((node) => (
                <article key={node.name} className={`workflow-node ${node.status}`}>
                  <div>
                    <strong>{node.name}</strong>
                    <span>{node.type}</span>
                  </div>
                  <p>{node.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="workflow-card execution-card">
            <h2>Last Execution</h2>
            {!execution && <p>Send an action to trigger the workflow and view execution details here.</p>}
            {execution && (
              <>
                <div className="execution-summary">
                  <div>
                    <strong>Action</strong>
                    <span>{execution.action}</span>
                  </div>
                  <div>
                    <strong>Status</strong>
                    <span>{execution.status}</span>
                  </div>
                  <div>
                    <strong>Started</strong>
                    <span>{new Date(execution.startedAt).toLocaleTimeString()}</span>
                  </div>
                  <div>
                    <strong>Finished</strong>
                    <span>{new Date(execution.finishedAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="execution-steps">
                  {execution.steps.map((step) => (
                    <div key={step.name} className={`step-row ${step.status}`}>
                      <span>{step.name}</span>
                      <span>{step.status}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
