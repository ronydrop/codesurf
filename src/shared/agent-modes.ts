import type { AgentMode } from './types'

export const DEFAULT_AGENT_MODES: AgentMode[] = [
  {
    id: 'agent',
    name: 'Agent',
    description: 'Full autonomous access to all tools',
    systemPrompt: '',
    tools: null,
    icon: 'robot',
    color: '#3568ff',
    isBuiltin: true,
  },
  {
    id: 'ask',
    name: 'Ask',
    description: 'Read-only Q&A mode — no file modifications',
    systemPrompt: 'You are in read-only mode. Do not modify files or run destructive commands.',
    tools: ['Read', 'Glob', 'Grep', 'WebSearch', 'WebFetch'],
    icon: 'help',
    color: '#56c288',
    isBuiltin: true,
  },
  {
    id: 'plan',
    name: 'Plan',
    description: 'Plan without execution — outline steps before acting',
    systemPrompt: 'Create a detailed plan. Do not execute changes until the user approves.',
    tools: ['Read', 'Glob', 'Grep', 'WebSearch'],
    icon: 'map',
    color: '#f5a623',
    isBuiltin: true,
  },
]
