// Cedar Research Orchestrator — Type definitions

export enum SessionStatus {
  Planned = 'planned',
  Running = 'running',
  Complete = 'complete',
  Failed = 'failed',
  Blocked = 'blocked',
  Splintered = 'splintered',
  // NOTE: "ready" is computed at runtime, not stored
}

export type ExecutionRoute = 'api' | 'web';

export interface Prefetch {
  url: string;
  save_as: string;
}

export interface TokenUsage {
  input: number;
  output: number;
}

export interface SessionMetadata {
  actual_tokens?: TokenUsage;
  cost_usd?: number;
  stop_reason?: string;
  error?: string;
  splinter_reason?: string;
  splinter_strategy?: string;
  block_reason?: string;
  estimated_tokens?: number;
  notes?: string;
}

export interface Session {
  id: string;
  part: number;
  session: number;
  sub: string | null;
  title: string;
  description?: string;
  status: SessionStatus;
  dependencies: string[];
  context_inputs: string[];
  execution_route: ExecutionRoute;
  prompt_file: string;
  output_file: string | null;
  context_pack_file: string | null;
  model?: string | null;
  max_output_tokens?: number | null;
  prefetch?: Prefetch[];
  splinter_parent: string | null;
  splinter_children: string[];
  completed_at?: string | null;
  metadata?: SessionMetadata;
}

export interface ManifestMeta {
  project: string;
  version: number;
  created: string;
  synthesis_model: string;
  compression_model: string;
  max_context_budget: number;
  splintering_threshold: number;
  default_max_output_tokens: number;
  output_dir: string;
  context_pack_dir: string;
  prompt_dir: string;
}

export interface Manifest {
  meta: ManifestMeta;
  sessions: Session[];
}

export interface TokenEstimate {
  session_id: string;
  input_tokens: number;
  estimated_output_tokens: number;
  total: number;
  exceeds_budget: boolean;
  exceeds_splintering_threshold: boolean;
}
