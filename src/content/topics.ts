/** The kinds of work the org does. The home page shows these, not individual projects. */
export const topics = [
  {
    id: 'ai',
    name: 'AI infrastructure',
    title: 'Between your agents and the models.',
    blurb:
      'Gateways, routing and plugins that sit between coding agents and model providers: virtual keys, automatic fallback, usage tracking, all self-hosted.',
    tags: ['LLM gateways', 'routing and fallback', 'plugins', 'self-hosted'],
  },
  {
    id: 'agents',
    name: 'Agents and automation',
    title: 'Agents that ship. Humans that approve.',
    blurb:
      'Coding agents that take work from a backlog, change code in isolated sandboxes, get an independent review, and land merged pull requests once a person approves the plan.',
    tags: ['coding agents', 'sandboxed workers', 'review', 'automation'],
  },
  {
    id: 'desktop',
    name: 'Desktop and interfaces',
    title: 'Software that stays out of the way.',
    blurb:
      'Linux desktop software and small interfaces: quiet until you need them, then fast. Developer tools live here too.',
    tags: ['Linux desktop', 'Wayland', 'interfaces', 'developer tools'],
  },
] as const;

export type TopicId = (typeof topics)[number]['id'];
export const topicIds = topics.map((t) => t.id) as [TopicId, ...TopicId[]];
