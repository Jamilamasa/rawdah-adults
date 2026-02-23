'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSessionForm } from '@/hooks/useSessionForm';
import { Send, Loader2 } from 'lucide-react';
import { useConversations, useMarkMessageRead, useMessageThread, useSendMessage } from '@/hooks/useMessages';
import { useFamilyMembers } from '@/hooks/useFamily';
import { useAuthStore } from '@/store/authStore';
import { AppCard } from '@/components/shared/AppCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { InlineLoader } from '@/components/shared/InlineLoader';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatRelativeTime, getInitials } from '@/lib/utils';

export default function MessagesPage() {
  const user = useAuthStore((state) => state.user);
  const [activeUserId, setActiveUserId] = useState<string>('');
  const [content, setContent, clearContent] = useSessionForm<string>('form:message-draft', '');

  const membersQuery = useFamilyMembers();
  const conversationsQuery = useConversations();
  const threadQuery = useMessageThread(activeUserId);

  const sendMessage = useSendMessage();
  const markRead = useMarkMessageRead();
  const markedMessageIdsRef = useRef<Set<string>>(new Set());

  const memberById = useMemo(() => {
    const map = new Map<string, { name: string }>();
    (membersQuery.data ?? []).forEach((member) => {
      map.set(member.id, { name: member.name });
    });
    return map;
  }, [membersQuery.data]);

  const availableRecipients = useMemo(
    () =>
      (membersQuery.data ?? []).filter(
        (member) => member.id !== user?.id && member.is_active
      ),
    [membersQuery.data, user?.id]
  );

  const latestMessageByRecipientId = useMemo(() => {
    const map = new Map<
      string,
      {
        sender_id: string;
        recipient_id: string;
        content: string;
        read_at?: string;
        created_at: string;
      }
    >();
    (conversationsQuery.data ?? []).forEach((message) => {
      const otherId = message.sender_id === user?.id ? message.recipient_id : message.sender_id;
      map.set(otherId, message);
    });
    return map;
  }, [conversationsQuery.data, user?.id]);

  const recipientOptions = useMemo(() => {
    return [...availableRecipients].sort((a, b) => {
      const aMessage = latestMessageByRecipientId.get(a.id);
      const bMessage = latestMessageByRecipientId.get(b.id);

      if (aMessage && bMessage) {
        return bMessage.created_at.localeCompare(aMessage.created_at);
      }
      if (aMessage) return -1;
      if (bMessage) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [availableRecipients, latestMessageByRecipientId]);

  useEffect(() => {
    if (!activeUserId && recipientOptions.length) {
      setActiveUserId(recipientOptions[0].id);
      return;
    }

    if (activeUserId && !recipientOptions.some((recipient) => recipient.id === activeUserId)) {
      setActiveUserId(recipientOptions[0]?.id ?? '');
    }
  }, [activeUserId, recipientOptions]);

  useEffect(() => {
    if (!threadQuery.data || !user?.id) return;
    const unreadIds = threadQuery.data
      .filter((message) => !message.read_at && message.recipient_id === user.id)
      .map((message) => message.id)
      .filter((id) => !markedMessageIdsRef.current.has(id));

    if (!unreadIds.length) return;

    unreadIds.forEach((id) => {
      markedMessageIdsRef.current.add(id);
      void markRead.mutateAsync(id);
    });
  }, [threadQuery.data, user?.id, markRead.mutateAsync]);

  const activeName = memberById.get(activeUserId)?.name ?? 'Conversation';

  const handleSend = (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeUserId || !content.trim()) return;

    sendMessage.mutate(
      { recipient_id: activeUserId, content: content.trim() },
      {
        onSuccess: () => {
          clearContent();
        },
      }
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Messages"
        subtitle="Support your family with timely, thoughtful communication."
      />

      {membersQuery.isLoading || conversationsQuery.isLoading ? (
        <InlineLoader label="Loading conversations..." />
      ) : recipientOptions.length ? (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <AppCard className="max-h-[70dvh] overflow-auto p-2">
            <div className="space-y-1">
              {recipientOptions.map((recipient) => {
                const latestMessage = latestMessageByRecipientId.get(recipient.id);
                const name = memberById.get(recipient.id)?.name ?? 'Unknown member';
                const isActive = recipient.id === activeUserId;
                const isUnread =
                  latestMessage?.recipient_id === user?.id && !latestMessage?.read_at;

                return (
                  <button
                    key={recipient.id}
                    type="button"
                    onClick={() => setActiveUserId(recipient.id)}
                    className={`w-full rounded-xl px-3 py-2 text-left transition ${
                      isActive ? 'bg-panel-700 text-white' : 'hover:bg-panel-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-panel-900'}`}>{name}</p>
                      {isUnread ? (
                        <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                          New
                        </span>
                      ) : null}
                    </div>
                    <p className={`mt-1 truncate text-xs ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {latestMessage?.content ?? 'No messages yet'}
                    </p>
                    <p className={`mt-1 text-[11px] ${isActive ? 'text-white/75' : 'text-muted-foreground'}`}>
                      {latestMessage ? formatRelativeTime(latestMessage.created_at) : 'Start a new chat'}
                    </p>
                  </button>
                );
              })}
            </div>
          </AppCard>

          <AppCard className="flex min-h-[70dvh] flex-col p-0">
            <header className="border-b border-panel-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-panel-900">{activeName}</h2>
            </header>

            <div className="flex-1 space-y-2 overflow-auto px-4 py-3">
              {threadQuery.isLoading ? (
                <InlineLoader label="Loading thread..." />
              ) : threadQuery.data?.length ? (
                threadQuery.data.map((message) => {
                  const mine = message.sender_id === user?.id;
                  return (
                    <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                          mine ? 'bg-panel-700 text-white' : 'border border-panel-200 bg-panel-50 text-panel-800'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className={`mt-1 text-[10px] ${mine ? 'text-white/75' : 'text-muted-foreground'}`}>
                          {formatRelativeTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState title="No messages yet" description="Send the first message in this conversation." />
              )}
            </div>

            <form onSubmit={handleSend} className="border-t border-panel-200 px-3 py-3">
              <div className="mb-2">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-panel-600">
                  Send to
                </label>
                <select
                  value={activeUserId}
                  onChange={(event) => setActiveUserId(event.target.value)}
                  className="w-full rounded-xl border border-panel-300 px-3 py-2 text-sm"
                >
                  {recipientOptions.map((recipient) => (
                    <option key={recipient.id} value={recipient.id}>
                      {recipient.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Type your message"
                  className="flex-1 rounded-xl border border-panel-300 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={sendMessage.isPending || !activeUserId || !content.trim()}
                  className="inline-flex items-center gap-1 rounded-xl bg-panel-700 px-3 py-2 text-sm font-semibold text-white hover:bg-panel-800 disabled:opacity-70"
                >
                  {sendMessage.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Send
                </button>
              </div>
            </form>
          </AppCard>
        </div>
      ) : (
        <EmptyState
          title="No recipients available"
          description="Add or reactivate family members in People to start messaging."
          icon={
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-panel-100 text-panel-700">
              {getInitials(user?.name)}
            </span>
          }
        />
      )}
    </div>
  );
}
