import { component$, useStore, useTask$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { PageHeader } from "~/components/ui/page-header";
import { StatCard, StatGrid } from "~/components/ui/stat-card";
import { StatusBadge } from "~/components/ui/status-badge";
import { Avatar } from "~/components/ui/avatar";
import { ListItem } from "~/components/ui/list-item";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/toast";
import { EmptyState } from "~/components/ui/empty-state";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/lib/api";


interface Team {
  id: string;
  name: string;
  description: string;
  members: number;
  role: "owner" | "admin" | "member";
  created: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  lastActive: string;
  status: "active" | "pending" | "inactive";
}

export default component$(() => {
  const state = useStore<{
    teams: Team[];
    members: Member[];
    selectedTeam: string | null;
    showInviteModal: boolean;
    showCreateModal: boolean;
    inviteEmail: string;
    createName: string;
    loading: boolean;
  }>({
    teams: [],
    members: [],
    selectedTeam: null,
    showInviteModal: false,
    showCreateModal: false,
    inviteEmail: "",
    createName: "",
    loading: true,
  });

  const toast = useToast();

  useTask$(async () => {
    try {
      const res: any = await api.get("/teams");
      state.teams = Array.isArray(res) ? res : res.teams || [];
      if (state.teams.length > 0) {
        state.selectedTeam = state.teams[0].id;
        const membersRes: any = await api.get(`/teams/${state.selectedTeam}/members`);
        state.members = Array.isArray(membersRes) ? membersRes : membersRes.members || [];
      }
    } catch (e) {
      state.teams = [];
      toast.error("Failed to load team data");
    } finally {
      state.loading = false;
    }
  });

  useTask$(({ track }) => {
    track(() => state.selectedTeam);
    if (state.selectedTeam) {
      (async () => {
        try {
          const membersRes: any = await api.get(`/teams/${state.selectedTeam}/members`);
          state.members = Array.isArray(membersRes) ? membersRes : membersRes.members || [];
        } catch (e) {
          state.members = [];
          toast.error("Failed to load team data");
        }
      })();
    }
  });

  const getRoleVariant = (role: string) => {
    if (role === "owner") return "pending";
    if (role === "admin") return "info";
    return "default";
  };

  const getStatusVariant = (status: string) => {
    if (status === "active") return "success";
    if (status === "pending") return "warning";
    return "error";
  };

  const createTeam = $(async () => {
    if (!state.createName.trim()) return;
    try {
      await api.post("/teams", { name: state.createName });
      toast.success("Team created");
      state.showCreateModal = false;
      state.createName = "";
      const res: any = await api.get("/teams");
      state.teams = Array.isArray(res) ? res : res.teams || [];
      if (state.teams.length > 0) state.selectedTeam = state.teams[0].id;
    } catch (e) {
      toast.error("Failed to create team");
    }
  });

  const inviteMember = $(async () => {
    if (!state.inviteEmail.trim() || !state.selectedTeam) return;
    try {
      await api.post(`/teams/${state.selectedTeam}/invite`, { email: state.inviteEmail });
      toast.success("Member invited");
      state.showInviteModal = false;
      state.inviteEmail = "";
      const membersRes: any = await api.get(`/teams/${state.selectedTeam}/members`);
      state.members = Array.isArray(membersRes) ? membersRes : membersRes.members || [];
    } catch (e) {
      toast.error("Failed to invite member");
    }
  });

  return (
    <div class="space-y-6">
      <PageHeader title="Teams" description="Manage teams, members, and access control">
        <Button onClick$={() => { state.showCreateModal = true; }}>
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Team
        </Button>
      </PageHeader>

      {state.loading ? (
        <div class="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent class="pt-6">
                <Skeleton class="h-6 w-24 mb-2" />
                <Skeleton class="h-4 w-full mb-4" />
                <Skeleton class="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : state.teams.length === 0 ? (
        <EmptyState
          title="No teams yet"
          description="Create your first team to start collaborating"
        />
      ) : (
        <div class="grid gap-4 md:grid-cols-3">
          {state.teams.map((team) => (
            <Card
              key={team.id}
              class={`cursor-pointer transition-colors ${state.selectedTeam === team.id ? "border-primary" : "hover:border-surface-light/80"}`}
              onClick$={() => (state.selectedTeam = team.id)}
            >
              <CardContent class="pt-6">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-medium">{team.name}</h3>
                  <StatusBadge status={team.role} variant={getRoleVariant(team.role)} />
                </div>
                <p class="text-sm text-text-muted mb-4">{team.description}</p>
                <div class="flex items-center justify-between text-xs text-text-muted">
                  <span>{team.members} members</span>
                  <span>Created {team.created}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {state.loading ? (
        <StatGrid cols={3}>
          <Card><CardContent class="pt-6"><Skeleton class="h-8 w-16 mb-1" /><Skeleton class="h-4 w-20" /></CardContent></Card>
          <Card><CardContent class="pt-6"><Skeleton class="h-8 w-16 mb-1" /><Skeleton class="h-4 w-20" /></CardContent></Card>
          <Card><CardContent class="pt-6"><Skeleton class="h-8 w-16 mb-1" /><Skeleton class="h-4 w-20" /></CardContent></Card>
        </StatGrid>
      ) : (
        <StatGrid cols={3}>
          <StatCard value={state.teams.length} label="Total Teams" />
          <StatCard value={state.members.length} label="Total Members" />
          <StatCard value={state.members.filter((m) => m.status === "active").length} label="Active Members" valueColor="text-green-400" />
        </StatGrid>
      )}

      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>Team Members</CardTitle>
            <Button size="sm" onClick$={() => (state.showInviteModal = true)}>
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {state.members.length === 0 && !state.loading ? (
            <EmptyState
              title="No members"
              description="Invite members to your team to start collaborating"
            />
          ) : (
            <div class="space-y-2">
              {state.members.map((member) => (
                <ListItem key={member.id}>
                  <div class="flex items-center gap-4">
                    <Avatar name={member.name} />
                    <div>
                      <div class="flex items-center gap-2">
                        <h3 class="font-medium">{member.name}</h3>
                        <StatusBadge status={member.role} variant={getRoleVariant(member.role)} />
                        <StatusBadge status={member.status} variant={getStatusVariant(member.status)} />
                      </div>
                      <p class="text-sm text-text-muted">{member.email}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="text-right">
                      <p class="text-xs text-text-muted">Last active</p>
                      <p class="text-sm">{new Date(member.lastActive).toLocaleDateString()}</p>
                    </div>
                    <div class="flex gap-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      {member.role !== "owner" && (
                        <Button variant="ghost" size="sm" class="text-red-400 hover:text-red-300">Remove</Button>
                      )}
                    </div>
                  </div>
                </ListItem>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access Control</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-surface-light">
              <div>
                <p class="text-sm font-medium">API Keys Management</p>
                <p class="text-xs text-text-muted">Create, revoke, and manage API keys</p>
              </div>
              <div class="flex gap-2">
                <Badge variant="outline" class="text-xs">Owner</Badge>
                <Badge variant="outline" class="text-xs">Admin</Badge>
              </div>
            </div>
            <div class="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-surface-light">
              <div>
                <p class="text-sm font-medium">Provider Configuration</p>
                <p class="text-xs text-text-muted">Add, edit, and remove provider instances</p>
              </div>
              <div class="flex gap-2">
                <Badge variant="outline" class="text-xs">Owner</Badge>
                <Badge variant="outline" class="text-xs">Admin</Badge>
              </div>
            </div>
            <div class="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-surface-light">
              <div>
                <p class="text-sm font-medium">Experiments & Datasets</p>
                <p class="text-xs text-text-muted">Create and manage experiments and datasets</p>
              </div>
              <div class="flex gap-2">
                <Badge variant="outline" class="text-xs">Owner</Badge>
                <Badge variant="outline" class="text-xs">Admin</Badge>
                <Badge variant="outline" class="text-xs">Member</Badge>
              </div>
            </div>
            <div class="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-surface-light">
              <div>
                <p class="text-sm font-medium">View Analytics</p>
                <p class="text-xs text-text-muted">Access cost, usage, and tracing data</p>
              </div>
              <div class="flex gap-2">
                <Badge variant="outline" class="text-xs">Owner</Badge>
                <Badge variant="outline" class="text-xs">Admin</Badge>
                <Badge variant="outline" class="text-xs">Member</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {state.showCreateModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card class="w-full max-w-md mx-4">
            <CardHeader><CardTitle>Create Team</CardTitle></CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium">Team Name</label>
                  <Input value={state.createName} onInput$={(e) => { state.createName = (e.target as HTMLInputElement).value; }} placeholder="e.g., ML Engineering" />
                </div>
                <div class="flex gap-2 justify-end">
                  <Button variant="outline" onClick$={() => { state.showCreateModal = false; }}>Cancel</Button>
                  <Button onClick$={createTeam}>Create Team</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {state.showInviteModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card class="w-full max-w-md mx-4">
            <CardHeader><CardTitle>Invite Member</CardTitle></CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium">Email Address</label>
                  <Input value={state.inviteEmail} onInput$={(e) => { state.inviteEmail = (e.target as HTMLInputElement).value; }} placeholder="colleague@company.com" type="email" />
                </div>
                <div class="flex gap-2 justify-end">
                  <Button variant="outline" onClick$={() => { state.showInviteModal = false; }}>Cancel</Button>
                  <Button onClick$={inviteMember}>Send Invite</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Teams",
};
