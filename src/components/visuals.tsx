import type { ComponentType } from 'react';
import type { Project } from '../content/projects';
import { IslandDemo } from './IslandDemo/IslandDemo';
import { PipelineAgents } from './PipelineAgents/PipelineAgents';
import { RouteGraph } from './RouteGraph/RouteGraph';

type Visual = NonNullable<Project['visual']>;

/** Illustrations a project page can show, keyed by the `visual` frontmatter field. */
export const visuals: Record<Visual, ComponentType<{ name?: string }>> = {
  gateway: RouteGraph,
  pipeline: PipelineAgents,
  island: IslandDemo,
};
