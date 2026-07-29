# ASC3ND Control Tower — BYOK Agent Contract

## Product rule
The workbook owns the user experience, tools, permissions, event context, and audit trail. The selected language model is replaceable infrastructure.

## Initial user experience
The assistant opens with approved actions, not an empty general-purpose chat:

- Give me today's event briefing
- What needs attention?
- How many families are coming?
- Where are responses coming from?
- Show follow-up items
- How are volunteers and supplies looking?
- What changed since yesterday?

## Provider abstraction
All model providers must implement the same internal interface:

```ts
interface ModelProvider {
  id: string;
  label: string;
  capabilities: {
    chat: boolean;
    tools: boolean;
    vision: boolean;
    speechToText: boolean;
    textToSpeech: boolean;
  };
  complete(request: AgentRequest): Promise<AgentResponse>;
}
```

Supported provider families may include:

- OpenAI-compatible APIs
- Anthropic
- Google
- OpenRouter
- locally hosted Ollama or vLLM
- any self-hosted OpenAI-compatible endpoint

The UI and event tools must never depend on provider-specific response formats.

## Key storage
- Never put provider keys in browser JavaScript, URL state, workbook exports, logs, or analytics.
- Store encrypted credentials server-side, scoped to one ASC3ND workspace.
- The browser receives only provider labels and capability flags.
- Support a managed default provider and optional client BYOK.

## Agent boundary
The model may reason and draft. Deterministic tools remain authoritative.

Read tools:
- get_event_overview
- get_registration_breakdown
- get_follow_up_queue
- get_attribution_summary
- get_readiness
- get_recent_changes

Controlled writes, added later:
- assign_follow_up
- add_note
- update_status
- acknowledge_alert
- draft_message

Any outbound message, bulk change, deletion, youth-related action, or consent change requires explicit human confirmation.

## Progressive disclosure
Phase 1 exposes only:

1. Today
2. Leads
3. Alerts
4. Ask ASC3ND

Additional modules appear only when ASC3ND needs them. Hidden modules are not shown as disabled clutter.

## Grounding and citations
Every factual assistant answer must include the data timestamp and links or identifiers for the records or aggregate query used. The assistant must state when information is unavailable rather than infer it.

## Voice
Voice is an input/output layer over the same agent and tools. Voice does not receive broader permissions. Read actions may run immediately; write actions require a confirmation step.
