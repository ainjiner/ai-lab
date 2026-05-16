import type { Experiment, ModelParams } from "../types";
import { getStore } from "../store";

function generateId(): string {
  return `exp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export class ExperimentTracker {
  private store = getStore();

  create(opts: {
    name: string; description?: string; systemPrompt?: string; userPrompt: string;
    variables?: Record<string, string>; providerId: string; modelId: string;
    params?: ModelParams; tags?: string[];
  }): Experiment {
    const id = generateId();
    const now = new Date().toISOString();

    this.store.query<any, any[]>(
      `INSERT INTO experiments (id, name, description, status, system_prompt, user_prompt, variables,
       provider_id, model_id, params, tags, created_at, updated_at)
       VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id, opts.name, opts.description || null, opts.systemPrompt || null,
      opts.userPrompt, JSON.stringify(opts.variables || {}),
      opts.providerId, opts.modelId, JSON.stringify(opts.params || {}),
      JSON.stringify(opts.tags || []), now, now
    );

    return this.get(id)!;
  }

  get(id: string): Experiment | undefined {
    const row = this.store.query<any, [string]>("SELECT * FROM experiments WHERE id = ?").get(id);
    return row ? this.rowToExperiment(row) : undefined;
  }

  list(filter?: { status?: string; providerId?: string; modelId?: string; tags?: string[] }): Experiment[] {
    let sql = "SELECT * FROM experiments WHERE 1=1";
    const params: any[] = [];

    if (filter?.status) { sql += " AND status = ?"; params.push(filter.status); }
    if (filter?.providerId) { sql += " AND provider_id = ?"; params.push(filter.providerId); }
    if (filter?.modelId) { sql += " AND model_id = ?"; params.push(filter.modelId); }

    sql += " ORDER BY created_at DESC";

    const rows = this.store.query<any, any[]>(sql).all(...params);
    return rows.map(r => this.rowToExperiment(r));
  }

  updateStatus(id: string, status: Experiment["status"]): void {
    this.store.query(
      "UPDATE experiments SET status = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(status, id);
  }

  saveResult(id: string, result: {
    output: string; tokensPrompt: number; tokensCompletion: number;
    latencyMs: number; costUsd: number; reasoning?: string;
  }): void {
    this.store.query<any, any[]>(
      `UPDATE experiments SET status='completed', output=?, tokens_prompt=?, tokens_completion=?,
       tokens_total=?, latency_ms=?, cost_usd=?, reasoning=?, updated_at=datetime('now')
       WHERE id=?`
    ).run(
      result.output, result.tokensPrompt, result.tokensCompletion,
      result.tokensPrompt + result.tokensCompletion, result.latencyMs,
      result.costUsd, result.reasoning || null, id
    );
  }

  markFailed(id: string, error: string): void {
    this.store.query(
      "UPDATE experiments SET status='failed', notes=?, updated_at=datetime('now') WHERE id=?"
    ).run(error, id);
  }

  delete(id: string): void {
    this.store.query("DELETE FROM experiments WHERE id = ?").run(id);
  }

  compare(ids: string[]): Experiment[] {
    if (ids.length === 0) return [];
    const placeholders = ids.map(() => "?").join(",");
    const rows = this.store.query<any, string[]>(
      `SELECT * FROM experiments WHERE id IN (${placeholders}) ORDER BY created_at`
    ).all(...ids);
    return rows.map(r => this.rowToExperiment(r));
  }

  private rowToExperiment(row: any): Experiment {
    return {
      id: row.id, name: row.name, description: row.description, status: row.status,
      prompt: {
        system: row.system_prompt, user: row.user_prompt,
        variables: row.variables ? JSON.parse(row.variables) : undefined,
      },
      model: {
        provider: row.provider_id, model: row.model_id,
        params: row.params ? JSON.parse(row.params) : {},
      },
      results: row.output ? {
        output: row.output,
        tokens: { prompt: row.tokens_prompt || 0, completion: row.tokens_completion || 0, total: (row.tokens_prompt || 0) + (row.tokens_completion || 0) },
        latency: row.latency_ms, cost: row.cost_usd, reasoning: row.reasoning,
      } : undefined,
      metadata: {
        createdAt: row.created_at, updatedAt: row.updated_at,
        tags: row.tags ? JSON.parse(row.tags) : [],
        rating: row.rating, notes: row.notes,
      },
    };
  }
}

export const experimentTracker = new ExperimentTracker();
