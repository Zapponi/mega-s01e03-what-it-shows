<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { groupByProblem, type Problem } from '#lib/kb/problems';

  // issues: problem → link to its own ticket. status: problem → where it stands, in words.
  let {
    ticket,
    issues = {},
    status = {},
  }: { ticket: number; issues?: Partial<Record<Problem, string>>; status?: Partial<Record<Problem, string>> } = $props();

  const result = $derived(groupByProblem(reports as Report[], ticket, tenantOf, notes.oneDayMove));
</script>

<p class="sum">
  <strong>{result.merged}</strong> reports merged into #{ticket} ·
  <strong>{result.groups.length}</strong> {result.groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead><tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>status</th><th>ticket</th></tr></thead>
  <tbody>
    {#each result.groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{status[g.problem] ?? 'open'}</td>
        <td>{#if issues[g.problem]}<a href={issues[g.problem]}>own ticket</a>{:else}none yet{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
</style>
