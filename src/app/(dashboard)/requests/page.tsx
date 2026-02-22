'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useRequests, useRespondRequest } from '@/hooks/useRequests';
import { useFamilyMembers } from '@/hooks/useFamily';
import { AppCard } from '@/components/shared/AppCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { InlineLoader } from '@/components/shared/InlineLoader';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatDateTime, getRequestStatusClasses, toTitleCase } from '@/lib/utils';

export default function RequestsPage() {
  const [responseMessageById, setResponseMessageById] = useState<Record<string, string>>({});

  const requestsQuery = useRequests();
  const membersQuery = useFamilyMembers();
  const respondRequest = useRespondRequest();

  const memberNameById = useMemo(() => {
    const map = new Map<string, string>();
    (membersQuery.data ?? []).forEach((member) => map.set(member.id, member.name));
    return map;
  }, [membersQuery.data]);

  const pendingCount = useMemo(
    () => (requestsQuery.data ?? []).filter((request) => request.status === 'pending').length,
    [requestsQuery.data]
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Requests"
        subtitle="Review child requests and respond with guidance and clarity."
      />

      <AppCard className="p-4">
        <p className="text-sm text-muted-foreground">Pending requests</p>
        <p className="mt-1 text-2xl font-bold text-panel-900">{pendingCount}</p>
      </AppCard>

      {requestsQuery.isLoading || membersQuery.isLoading ? (
        <InlineLoader label="Loading requests..." />
      ) : requestsQuery.data?.length ? (
        <div className="space-y-3">
          {requestsQuery.data.map((request) => (
            <AppCard key={request.id} className="p-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-panel-900">{request.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      From: {memberNameById.get(request.requester_id) ?? 'Unknown'} • Created:{' '}
                      {formatDateTime(request.created_at)}
                    </p>
                  </div>

                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getRequestStatusClasses(request.status)}`}>
                    {toTitleCase(request.status)}
                  </span>
                </div>

                {request.description ? (
                  <p className="rounded-xl border border-panel-200 bg-panel-50 px-3 py-2 text-sm text-panel-700">
                    {request.description}
                  </p>
                ) : null}

                {request.response_message ? (
                  <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                    Response: {request.response_message}
                  </p>
                ) : null}

                {request.status === 'pending' ? (
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      value={responseMessageById[request.id] ?? ''}
                      onChange={(event) =>
                        setResponseMessageById((prev) => ({
                          ...prev,
                          [request.id]: event.target.value,
                        }))
                      }
                      placeholder="Optional response message"
                      className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm"
                    />

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          respondRequest.mutate({
                            id: request.id,
                            body: {
                              status: 'approved',
                              message: responseMessageById[request.id] || undefined,
                            },
                          })
                        }
                        disabled={respondRequest.isPending}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-70"
                      >
                        {respondRequest.isPending ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          respondRequest.mutate({
                            id: request.id,
                            body: {
                              status: 'declined',
                              message: responseMessageById[request.id] || undefined,
                            },
                          })
                        }
                        disabled={respondRequest.isPending}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-70"
                      >
                        {respondRequest.isPending ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                        Decline
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </AppCard>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No requests yet"
          description="Child requests will appear here when they ask for help or approvals."
        />
      )}
    </div>
  );
}
