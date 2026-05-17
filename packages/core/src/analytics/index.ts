import { getStore } from "../store";
import type { Budget } from "../types";

function generateId(): string {
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export interface UsageSummary {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalCost: number;
  requestCount: number;
  avgLatency: number;
}

export interface UsageBreakdown {
  byProvider: Array<{ name: string; tokens: number; cost: number; requests: number }>;
  byModel: Array<{ name: string; tokens: number; cost: number; requests: number }>;
}

export class AnalyticsTracker {
  private store = getStore();

  recordUsage(opts: {
    provider: string; model: string; tokensPrompt: number; tokensCompletion: number;
    costTotal: number; latencyMs: number; experimentId?: string;
  }): void {
    this.store.query<any, any[]>(
      `INSERT INTO usage_records (id, timestamp, provider, model, tokens_prompt, tokens_completion,
       cost_total, latency_ms, experiment_id)
       VALUES (?, datetime('now'), ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      generateId(), opts.provider, opts.model,
      opts.tokensPrompt, opts.tokensCompletion,
      opts.costTotal, opts.latencyMs, opts.experimentId || null
    );
  }

  getSummary(period: "daily" | "weekly" | "monthly" = "monthly"): UsageSummary {
    let interval: string;
    switch (period) {
      case "daily": interval = "-1 day"; break;
      case "weekly": interval = "-7 days"; break;
      default: interval = "-30 days";
    }

    const row = this.store.query<any, [string]>(
      `SELECT
        COALESCE(SUM(tokens_prompt + tokens_completion), 0) as total_tokens,
        COALESCE(SUM(tokens_prompt), 0) as prompt_tokens,
        COALESCE(SUM(tokens_completion), 0) as completion_tokens,
        COALESCE(SUM(cost_total), 0) as total_cost,
        COUNT(*) as request_count,
        COALESCE(AVG(latency_ms), 0) as avg_latency
       FROM usage_records
       WHERE timestamp >= datetime('now', ?)`
    ).get(interval);

    return {
      totalTokens: row.total_tokens, promptTokens: row.prompt_tokens,
      completionTokens: row.completion_tokens, totalCost: row.total_cost,
      requestCount: row.request_count, avgLatency: Math.round(row.avg_latency),
    };
  }

  getBreakdown(period: "daily" | "weekly" | "monthly" = "monthly"): UsageBreakdown {
    let interval: string;
    switch (period) {
      case "daily": interval = "-1 day"; break;
      case "weekly": interval = "-7 days"; break;
      default: interval = "-30 days";
    }

    const byProvider = this.store.query<any, [string]>(
      `SELECT provider as name,
        COALESCE(SUM(tokens_prompt + tokens_completion), 0) as tokens,
        COALESCE(SUM(cost_total), 0) as cost,
        COUNT(*) as requests,
        COALESCE(AVG(latency_ms), 0) as avg_latency
       FROM usage_records
       WHERE timestamp >= datetime('now', ?)
       GROUP BY provider ORDER BY cost DESC`
    ).all(interval);

    const byModel = this.store.query<any, [string]>(
      `SELECT model as name,
        COALESCE(SUM(tokens_prompt + tokens_completion), 0) as tokens,
        COALESCE(SUM(cost_total), 0) as cost,
        COUNT(*) as requests,
        COALESCE(AVG(latency_ms), 0) as avg_latency
       FROM usage_records
       WHERE timestamp >= datetime('now', ?)
       GROUP BY model ORDER BY cost DESC`
    ).all(interval);

    return {
      byProvider: byProvider.map((p: any) => ({
        name: p.name,
        tokens: p.tokens,
        cost: p.cost,
        requests: p.requests,
        avgLatency: Math.round(p.avg_latency || 0),
      })),
      byModel: byModel.map((m: any) => ({
        name: m.name,
        tokens: m.tokens,
        cost: m.cost,
        requests: m.requests,
        avgLatency: Math.round(m.avg_latency || 0),
      })),
    };
  }

  getCostProjection(days: number = 30): { dailyAvg: number; projected: number; currentTotal: number } {
    const current = this.getSummary("monthly");
    const daysRow = this.store.query<{ days_with_data: number }, []>(
      `SELECT COUNT(DISTINCT DATE(timestamp)) as days_with_data FROM usage_records WHERE timestamp >= datetime('now', '-30 days')`
    ).get();
    const daysWithData = daysRow?.days_with_data || 1;
    const dailyAvg = current.totalCost / daysWithData;
    return {
      dailyAvg,
      projected: dailyAvg * days,
      currentTotal: current.totalCost,
    };
  }

  exportUsage(format: "csv" | "json" = "json"): string {
    const rows = this.store.query<any, []>(
      "SELECT * FROM usage_records ORDER BY timestamp DESC LIMIT 1000"
    ).all();

    if (format === "json") return JSON.stringify(rows, null, 2);

    const headers = Object.keys(rows[0] || {}).join(",");
    const csv = [headers];
    for (const row of rows) {
      csv.push(Object.values(row).join(","));
    }
    return csv.join("\n");
  }
}

export class BudgetManager {
  private store = getStore();

  list(): Budget[] {
    const rows = this.store.query<any, []>("SELECT * FROM budgets ORDER BY name").all();
    return rows.map(r => ({
      id: r.id, name: r.name, limit: r.limit_amount, period: r.period,
      alerts: JSON.parse(r.alerts || "[]"),
      scope: {
        providers: r.scope_providers ? JSON.parse(r.scope_providers) : undefined,
        models: r.scope_models ? JSON.parse(r.scope_models) : undefined,
        projects: r.scope_projects ? JSON.parse(r.scope_projects) : undefined,
      },
      enabled: !!r.enabled,
    }));
  }

  create(opts: { name: string; limit: number; period: "daily" | "weekly" | "monthly"; alerts?: Array<{ threshold: number; action: "notify" | "disable" }> }): Budget {
    const id = generateId();
    this.store.query(
      "INSERT INTO budgets (id, name, limit_amount, period, alerts) VALUES (?, ?, ?, ?, ?)"
    ).run(id, opts.name, opts.limit, opts.period, JSON.stringify(opts.alerts || []));
    return { id, name: opts.name, limit: opts.limit, period: opts.period, alerts: opts.alerts || [], enabled: true };
  }

  update(id: string, updates: Partial<Budget>): void {
    if (updates.name !== undefined) this.store.query("UPDATE budgets SET name = ? WHERE id = ?").run(updates.name, id);
    if (updates.limit !== undefined) this.store.query("UPDATE budgets SET limit_amount = ? WHERE id = ?").run(updates.limit, id);
    if (updates.period !== undefined) this.store.query("UPDATE budgets SET period = ? WHERE id = ?").run(updates.period, id);
    if (updates.alerts !== undefined) this.store.query("UPDATE budgets SET alerts = ? WHERE id = ?").run(JSON.stringify(updates.alerts), id);
  }

  delete(id: string): void {
    this.store.query("DELETE FROM budgets WHERE id = ?").run(id);
  }

  checkBudgets(summary: UsageSummary): Array<{ budget: Budget; usage: number; exceeded: boolean }> {
    return this.list()
      .filter(b => b.enabled)
      .map(b => {
        const usage = summary.totalCost;
        const exceeded = usage >= b.limit;
        return { budget: b, usage, exceeded };
      });
  }
}

export const analyticsTracker = new AnalyticsTracker();
export const budgetManager = new BudgetManager();
