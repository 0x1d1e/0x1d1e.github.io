/** Rough areas the org works in. Used to filter /projects; the home page does not feature them. */
export const topics = [
  {
    id: 'ai',
    name: 'AI infrastructure',
    blurb:
      'Gateways, routing and plugins that sit between coding agents and model providers.',
  },
  {
    id: 'agents',
    name: 'Agents and automation',
    blurb:
      'Coding agents and tooling that plan, change code in sandboxes, and get reviewed.',
  },
  {
    id: 'desktop',
    name: 'Desktop and interfaces',
    blurb: 'Linux desktop software and small interfaces.',
  },
] as const;

export type TopicId = (typeof topics)[number]['id'];
export const topicIds = topics.map((t) => t.id) as [TopicId, ...TopicId[]];
