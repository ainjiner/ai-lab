import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "~/components/ui/table";

export default component$(() => {
  const models = [
    { id: "meta-llama-3.1-8b", name: "Llama 3.1 8B", provider: "Baseten", status: "active", type: "chat" },
    { id: "meta-llama-3.1-70b", name: "Llama 3.1 70B", provider: "Baseten", status: "active", type: "chat" },
    { id: "qwen-2.5-72b", name: "Qwen 2.5 72B", provider: "Baseten", status: "active", type: "chat" },
    { id: "deepseek-r1", name: "DeepSeek R1", provider: "Baseten", status: "inactive", type: "reasoning" },
    { id: "stable-diffusion-xl", name: "SDXL 1.0", provider: "Baseten", status: "active", type: "image" },
  ];

  return (
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Models</h1>
          <p class="text-text-muted">Manage and configure LLM models</p>
        </div>
        <Button>Scan Models</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Models</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell>
                    <div class="flex flex-col">
                      <span class="font-medium">{model.name}</span>
                      <span class="text-xs text-text-muted">{model.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{model.type}</Badge>
                  </TableCell>
                  <TableCell>{model.provider}</TableCell>
                  <TableCell>
                    <Badge variant={model.status === "active" ? "success" : "secondary"}>
                      {model.status}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-right">
                    <Button variant="ghost" size="sm">Configure</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
});

export const head: DocumentHead = {
  title: "AI Lab - Models",
};
