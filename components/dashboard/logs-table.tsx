"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { QueryLog } from "@/lib/types/database";

const PAGE_SIZE = 20;

const dateFmt = new Intl.DateTimeFormat("uk-UA", {
  dateStyle: "short",
  timeStyle: "short",
});

export function LogsTable({ projectId }: { projectId: string }) {
  const [logs, setLogs] = useState<QueryLog[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("ai_agent_query_logs")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .range(from, to + 1); // fetch one extra to check hasMore

    if (!error && data) {
      setHasMore(data.length > PAGE_SIZE);
      setLogs(data.slice(0, PAGE_SIZE) as QueryLog[]);
    }
    setLoading(false);
  }, [projectId, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="rounded-lg border bg-white">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Query Logs</h2>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Loading...</div>
      ) : logs.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          No queries recorded yet
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Query</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Results</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="max-w-xs truncate font-medium">
                    {log.query_text}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {dateFmt.format(new Date(log.created_at))}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {log.ip_address ?? "—"}
                  </TableCell>
                  <TableCell>
                    {log.results_shown ? (
                      <Badge variant="secondary">
                        {log.results_shown.length} results
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
