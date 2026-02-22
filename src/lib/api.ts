import { useAuthStore } from '@/store/authStore';
import type {
  AuthSession,
  AvailableGame,
  DailyGameTime,
  DailyTaskCompletion,
  DueReward,
  DashboardSummary,
  Family,
  FamilyAccessControl,
  GameSession,
  Hadith,
  HadithQuiz,
  LearnContent,
  LearnProgressEntry,
  Message,
  Notification,
  Prophet,
  ProphetQuiz,
  TopicQuiz,
  QuranLesson,
  QuranQuiz,
  QuranVerse,
  QuizAnswer,
  QuizScoreEntry,
  RecurringTask,
  Request,
  Reward,
  Task,
  UploadPresignResponse,
  User,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/v1';

export class APIError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

function buildQuery(params?: Record<string, string | number | undefined | null>) {
  if (!params) return '';
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== ''
  );

  if (!entries.length) return '';

  const search = new URLSearchParams();
  entries.forEach(([key, value]) => search.set(key, String(value)));
  return `?${search.toString()}`;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  let token: string | null = null;
  try {
    token = useAuthStore.getState().accessToken;
  } catch {
    // SSR-safe no-op
  }

  const isPublicAuthPath =
    path.startsWith('/auth/sign') ||
    path.startsWith('/auth/refresh') ||
    path.startsWith('/auth/child/signin');

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token && !isPublicAuthPath) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (response.status === 401 && !isPublicAuthPath) {
    useAuthStore.getState().clearSession();
    if (typeof window !== 'undefined') {
      window.location.href = '/signin';
    }
    throw new APIError(401, 'Session expired. Please sign in again.');
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = (await response.json()) as { error?: string };
      message = data.error ?? message;
    } catch {
      // no-op
    }
    throw new APIError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const authApi = {
  signup: (body: {
    family_name: string;
    slug: string;
    name: string;
    email: string;
    password: string;
  }) => apiFetch<AuthSession>('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  signin: (body: { email: string; password: string }) =>
    apiFetch<AuthSession>('/auth/signin', { method: 'POST', body: JSON.stringify(body) }),
  me: () => apiFetch<{ user: User; family: Family }>('/auth/me'),
  signout: () => apiFetch<{ message: string }>('/auth/signout', { method: 'POST' }),
  refresh: () => apiFetch<AuthSession>('/auth/refresh', { method: 'POST' }),
  changePassword: (body: { current_password: string; new_password: string }) =>
    apiFetch<{ message: string }>('/auth/me/password', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};

export const familyApi = {
  get: () => apiFetch<Family>('/family'),
  update: (body: { name: string; logo_url?: string | null }) =>
    apiFetch<Family>('/family', { method: 'PATCH', body: JSON.stringify(body) }),
  members: () => apiFetch<{ members: User[] }>('/family/members'),
  createMember: (body: {
    role: User['role'];
    name: string;
    username?: string;
    email?: string;
    password: string;
    child_age?: number;
    date_of_birth?: string;
    game_limit_minutes?: number;
  }) => apiFetch<User>('/family/members', { method: 'POST', body: JSON.stringify(body) }),
  getMember: (id: string) => apiFetch<User>(`/family/members/${id}`),
  updateMember: (
    id: string,
    body: {
      name?: string;
      theme?: string;
      game_limit_minutes?: number;
      child_age?: number;
      date_of_birth?: string;
    }
  ) => apiFetch<User>(`/family/members/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deactivateMember: (id: string) =>
    apiFetch<{ message: string }>(`/family/members/${id}`, { method: 'DELETE' }),
  rantCount: (id: string) => apiFetch<{ count: number }>(`/family/members/${id}/rant-count`),
  listAccessControl: () =>
    apiFetch<{ access_control: FamilyAccessControl[] }>('/family/access-control'),
  setAccessControl: (granteeId: string, permissions: string[]) =>
    apiFetch<FamilyAccessControl>(`/family/access-control/${granteeId}`, {
      method: 'PUT',
      body: JSON.stringify({ permissions }),
    }),
  revokeAccessControl: (granteeId: string) =>
    apiFetch<{ message: string }>(`/family/access-control/${granteeId}`, {
      method: 'DELETE',
    }),
};

export const tasksApi = {
  list: (params?: { assigned_to?: string; status?: string }) =>
    apiFetch<{ tasks: Task[] }>(`/tasks${buildQuery(params)}`),
  dueRewards: (params?: {
    assigned_to?: string;
    status?: 'reward_requested' | 'reward_approved';
  }) => apiFetch<{ due_rewards: DueReward[] }>(`/tasks/due-rewards${buildQuery(params)}`),
  get: (id: string) => apiFetch<Task>(`/tasks/${id}`),
  create: (body: {
    title: string;
    description?: string;
    assigned_to: string;
    reward_id?: string;
    due_date?: string;
  }) => apiFetch<Task>('/tasks', { method: 'POST', body: JSON.stringify(body) }),
  update: (
    id: string,
    body: {
      title: string;
      description?: string;
      reward_id?: string;
      due_date?: string;
    }
  ) => apiFetch<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) => apiFetch<{ message: string }>(`/tasks/${id}`, { method: 'DELETE' }),
  approveReward: (id: string) =>
    apiFetch<Task>(`/tasks/${id}/approve-reward`, { method: 'POST' }),
  declineReward: (id: string) =>
    apiFetch<Task>(`/tasks/${id}/decline-reward`, { method: 'POST' }),
};

export const recurringTasksApi = {
  list: () => apiFetch<{ recurring_tasks: RecurringTask[] }>('/tasks/recurring'),
  create: (body: { title: string; description?: string; assigned_to: string; reward_id?: string }) =>
    apiFetch<RecurringTask>('/tasks/recurring', { method: 'POST', body: JSON.stringify(body) }),
  remove: (id: string) =>
    apiFetch<{ message: string }>(`/tasks/recurring/${id}`, { method: 'DELETE' }),
};

export const rewardsApi = {
  list: () => apiFetch<{ rewards: Reward[] }>('/rewards'),
  create: (body: {
    title: string;
    description?: string;
    value?: number;
    type?: string;
    icon?: string;
  }) => apiFetch<Reward>('/rewards', { method: 'POST', body: JSON.stringify(body) }),
  update: (
    id: string,
    body: {
      title: string;
      description?: string;
      value?: number;
      type?: string;
      icon?: string;
    }
  ) => apiFetch<Reward>(`/rewards/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) =>
    apiFetch<{ message: string }>(`/rewards/${id}`, { method: 'DELETE' }),
};

export const hadithApi = {
  list: (params?: { difficulty?: string }) =>
    apiFetch<{ hadiths: Hadith[] }>(`/hadiths${buildQuery(params)}`),
  random: (params?: { difficulty?: string }) => apiFetch<Hadith>(`/hadiths/random${buildQuery(params)}`),
  get: (id: string) => apiFetch<Hadith>(`/hadiths/${id}`),
};

export const prophetsApi = {
  list: () => apiFetch<{ prophets: Prophet[] }>('/prophets'),
  get: (id: string) => apiFetch<Prophet>(`/prophets/${id}`),
};

export const quranApi = {
  list: (params?: { topic?: string; difficulty?: string }) =>
    apiFetch<{ verses: QuranVerse[] }>(`/quran/verses${buildQuery(params)}`),
  get: (id: string) => apiFetch<QuranVerse>(`/quran/verses/${id}`),
};

export const quizzesApi = {
  list: (params?: { type?: 'hadith' | 'prophet' | 'quran' | 'topic' }) =>
    apiFetch<{
      hadith_quizzes?: HadithQuiz[];
      prophet_quizzes?: ProphetQuiz[];
      quran_quizzes?: QuranQuiz[];
      topic_quizzes?: TopicQuiz[];
    }>(`/quizzes${buildQuery(params)}`),
  get: (type: string, id: string) =>
    apiFetch<HadithQuiz | ProphetQuiz | QuranQuiz | TopicQuiz>(`/quizzes/${type}/${id}`),
  assignHadith: (body: {
    assigned_to: string;
    difficulty?: string;
    memorize_until?: string;
  }) => apiFetch<HadithQuiz>('/quizzes/hadith', { method: 'POST', body: JSON.stringify(body) }),
  assignProphet: (body: { prophet_id: string; assigned_to: string }) =>
    apiFetch<ProphetQuiz>('/quizzes/prophet', { method: 'POST', body: JSON.stringify(body) }),
  assignQuran: (body: {
    verse_id: string;
    lesson_id?: string;
    assigned_to: string;
  }) => apiFetch<QuranQuiz>('/quizzes/quran', { method: 'POST', body: JSON.stringify(body) }),
  assignTopic: (body: {
    assigned_to: string;
    category: 'hadith' | 'quran' | 'science' | 'fun_facts' | 'custom' | 'general';
    topic: string;
    question_count?: number;
  }) => apiFetch<TopicQuiz>('/quizzes/topic', { method: 'POST', body: JSON.stringify(body) }),
};

export const aiApi = {
  ask: (body: { question: string }) =>
    apiFetch<{ answer: string }>('/ai/ask', { method: 'POST', body: JSON.stringify(body) }),
};

export const lessonsApi = {
  listQuran: () => apiFetch<{ lessons: QuranLesson[] }>('/lessons/quran'),
  createQuran: (body: { verse_id: string; assigned_to: string; reward_id?: string }) =>
    apiFetch<QuranLesson>('/lessons/quran', { method: 'POST', body: JSON.stringify(body) }),
  getQuran: (id: string) => apiFetch<QuranLesson>(`/lessons/quran/${id}`),
  listLearn: () => apiFetch<{ content: LearnContent[] }>('/learn'),
  createLearn: (body: {
    assigned_to?: string;
    title: string;
    content_type: LearnContent['content_type'];
    content: string;
    reward_id?: string;
  }) => apiFetch<LearnContent>('/learn', { method: 'POST', body: JSON.stringify(body) }),
};

export const requestsApi = {
  list: () => apiFetch<{ requests: Request[] }>('/requests'),
  get: (id: string) => apiFetch<Request>(`/requests/${id}`),
  respond: (id: string, body: { status: 'approved' | 'declined'; message?: string }) =>
    apiFetch<Request>(`/requests/${id}/respond`, { method: 'POST', body: JSON.stringify(body) }),
};

export const messagesApi = {
  conversations: () => apiFetch<{ conversations: Message[] }>('/messages/conversations'),
  thread: (userId: string) => apiFetch<{ messages: Message[] }>(`/messages/${userId}`),
  send: (body: { recipient_id: string; content: string }) =>
    apiFetch<Message>('/messages', { method: 'POST', body: JSON.stringify(body) }),
  markRead: (id: string) => apiFetch<{ message: string }>(`/messages/${id}/read`, { method: 'PATCH' }),
};

export const gamesApi = {
  list: () => apiFetch<{ games: AvailableGame[] }>('/games'),
  sessions: (params?: { user_id?: string }) =>
    apiFetch<{ sessions: GameSession[] }>(`/games/sessions${buildQuery(params)}`),
};

export const dashboardApi = {
  summary: () => apiFetch<DashboardSummary>('/dashboard/summary'),
  taskCompletion: (days = 30) =>
    apiFetch<{ data: DailyTaskCompletion[]; days: number }>(`/dashboard/task-completion${buildQuery({ days })}`),
  gameTime: (days = 30) =>
    apiFetch<{ data: DailyGameTime[]; days: number }>(`/dashboard/game-time${buildQuery({ days })}`),
  quizScores: (days = 30) =>
    apiFetch<{ data: QuizScoreEntry[]; days: number }>(`/dashboard/quiz-scores${buildQuery({ days })}`),
  learnProgress: () => apiFetch<{ data: LearnProgressEntry[] }>('/dashboard/learn-progress'),
};

export const notificationsApi = {
  list: () => apiFetch<{ notifications: Notification[] }>('/notifications'),
  readAll: () => apiFetch<{ message: string }>('/notifications/read-all', { method: 'PATCH' }),
  readOne: (id: string) =>
    apiFetch<{ message: string }>(`/notifications/${id}/read`, { method: 'PATCH' }),
};

export const uploadsApi = {
  presignAvatar: () =>
    apiFetch<UploadPresignResponse>('/upload/avatar', {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  confirmAvatar: (body: { key: string }) =>
    apiFetch<{ avatar_url: string }>('/upload/avatar/confirm', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  presignLogo: () =>
    apiFetch<UploadPresignResponse>('/upload/logo', {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  confirmLogo: (body: { key: string }) =>
    apiFetch<{ logo_url: string }>('/upload/logo/confirm', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
