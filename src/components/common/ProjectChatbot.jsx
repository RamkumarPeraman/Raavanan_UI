import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiChevronDown,
  FiChevronUp,
  FiArrowRight,
  FiTrash2,
  FiLoader,
  FiMessageCircle,
  FiSend,
  FiUser,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import apiService from '../../services/api';

const QUICK_QUESTIONS = [
  'How can I donate?',
  'How can I volunteer?',
  'What projects are ongoing?',
  'Are there any upcoming events?',
  'How do I contact the team?',
];

const BUILT_IN_FAQS = [
  {
    id: 'donate',
    question: 'How can I donate?',
    answer:
      'You can support the organization from the Donate page. Open the donate section, choose the amount and purpose, then submit your payment details to complete the contribution.',
    cta: { label: 'Open Donate Page', path: '/donate' },
    keywords: ['donate', 'donation', 'payment', 'support', 'fund', 'contribute'],
  },
  {
    id: 'volunteer',
    question: 'How can I volunteer?',
    answer:
      'Go to the Volunteer page and submit the volunteer registration form with your contact details, skills, interests, and availability. The team can then review and connect with you.',
    cta: { label: 'Open Volunteer Page', path: '/volunteer' },
    keywords: ['volunteer', 'join', 'help', 'support team', 'register volunteer'],
  },
  {
    id: 'projects',
    question: 'What projects does this platform have?',
    answer:
      'The Projects page lists education, healthcare, women empowerment, environment, and other community initiatives. You can search, filter by category, and open any project for more details.',
    cta: { label: 'Browse Projects', path: '/projects' },
    keywords: ['project', 'projects', 'initiative', 'initiatives', 'program', 'programs'],
  },
  {
    id: 'events',
    question: 'How do I see events?',
    answer:
      'The Events page shows scheduled events and registrations. If you are logged in, you can also register for supported events from the event listing.',
    cta: { label: 'Open Events Page', path: '/events' },
    keywords: ['event', 'events', 'calendar', 'upcoming event', 'program schedule'],
  },
  {
    id: 'contact',
    question: 'How do I contact the team?',
    answer:
      'You can reach the team from the Contact page. The site also shows the main contact details in the sidebar, including email and Chennai location.',
    cta: { label: 'Open Contact Page', path: '/contact' },
    keywords: ['contact', 'email', 'phone', 'reach', 'address', 'location'],
  },
  {
    id: 'reports',
    question: 'Where can I find reports?',
    answer:
      'The Reports page contains the available project and organizational reports. Some project cards also include a direct report download link.',
    cta: { label: 'Open Reports Page', path: '/reports' },
    keywords: ['report', 'reports', 'download report', 'annual report', 'documents'],
  },
  {
    id: 'login',
    question: 'How do I log in or sign up?',
    answer:
      'Use the Login page if you already have an account. New users can create an account from the Sign Up flow and then access profile, impact, messages, and settings pages.',
    cta: { label: 'Open Login Page', path: '/login' },
    keywords: ['login', 'log in', 'signin', 'sign in', 'signup', 'sign up', 'account'],
  },
];

const normalizeText = (value = '') =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (value = '') =>
  normalizeText(value)
    .split(' ')
    .filter((token) => token.length > 2);

const isProjectCreateIntent = (value = '') => {
  const normalizedValue = normalizeText(value);

  return (
    (normalizedValue.includes('project') &&
      (normalizedValue.includes('create') ||
        normalizedValue.includes('add') ||
        normalizedValue.includes('new project') ||
        normalizedValue.includes('make project'))) ||
    normalizedValue.startsWith('create project') ||
    normalizedValue.startsWith('add project')
  );
};

const formatCompactDate = (value) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatCurrency = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

const scoreTokens = (queryTokens, haystack) => {
  if (!queryTokens.length || !haystack) {
    return 0;
  }

  const normalizedHaystack = normalizeText(haystack);

  return queryTokens.reduce((score, token) => {
    if (normalizedHaystack.includes(token)) {
      return score + (token.length > 5 ? 3 : 2);
    }

    return score;
  }, 0);
};

const buildProjectAnswer = (matches) => {
  if (!matches.length) {
    return null;
  }

  const [topMatch, ...rest] = matches;
  const lines = [
    `${topMatch.title} is a ${topMatch.status || 'active'} ${topMatch.category || 'community'} project${topMatch.location ? ` in ${topMatch.location}` : ''}. ${topMatch.description || ''}`.trim(),
  ];

  if (topMatch.goal && topMatch.raised !== undefined) {
    lines.push(`Funding progress: ${formatCurrency(topMatch.raised)} raised out of ${formatCurrency(topMatch.goal)}.`);
  }

  if (topMatch.startDate) {
    lines.push(`Timeline: ${formatCompactDate(topMatch.startDate)}${topMatch.endDate ? ` to ${formatCompactDate(topMatch.endDate)}` : ''}.`);
  }

  if (rest.length) {
    lines.push(`Related projects: ${rest.slice(0, 2).map((item) => item.title).join(', ')}.`);
  }

  return {
    text: lines.join(' '),
    cta: { label: 'View Projects', path: '/projects' },
  };
};

const buildEventAnswer = (matches) => {
  if (!matches.length) {
    return null;
  }

  const lines = matches.slice(0, 3).map((event) => {
    const parts = [event.title];

    if (event.date) {
      parts.push(`on ${formatCompactDate(event.date)}`);
    }

    if (event.location) {
      parts.push(`at ${event.location}`);
    }

    return parts.join(' ');
  });

  return {
    text: `Here are relevant events: ${lines.join('; ')}.`,
    cta: { label: 'Open Events', path: '/events' },
  };
};

const buildBlogAnswer = (matches) => {
  if (!matches.length) {
    return null;
  }

  return {
    text: `I found related blog or media entries: ${matches.slice(0, 3).map((blog) => blog.title).join(', ')}.`,
    cta: { label: 'Open Blogs', path: '/blogs' },
  };
};

const buildFallbackAnswer = (context) => {
  const ongoingCount = context.projects.filter((project) => project.status === 'ongoing').length;
  const eventCount = context.events.length;

  return {
    text: `I can help with donations, volunteering, contact details, reports, events, and project information. Right now I can see ${ongoingCount} ongoing projects and ${eventCount} events in the system. Try asking about education projects, upcoming events, reports, or how to donate.`,
    cta: { label: 'Browse Projects', path: '/projects' },
  };
};

const createInitialMessages = () => [
  {
    id: 'welcome',
    role: 'bot',
    text:
      'Hello. I can answer built-in questions about this platform and also help with project, event, blog, donation, volunteer, and report queries.',
  },
];

const createWelcomeMessages = () => createInitialMessages();

const mapMessagesToHistory = (messages) =>
  messages
    .filter((message) => message.role === 'user' || message.role === 'bot')
    .slice(-6)
    .map((message) => ({
      role: message.role === 'bot' ? 'assistant' : 'user',
      text: message.text,
    }));

const ProjectChatbot = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(createWelcomeMessages);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [contextLoaded, setContextLoaded] = useState(false);
  const [context, setContext] = useState({
    projects: [],
    events: [],
    blogs: [],
    reports: [],
  });

  useEffect(() => {
    if (!isChatOpen) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isChatOpen, messages, isReplying]);

  useEffect(() => {
    let isMounted = true;

    const loadUnreadNotifications = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        if (isMounted) {
          setUnreadNotificationCount(0);
        }
        return;
      }

      try {
        const notifications = await apiService.getNotifications();
        if (isMounted) {
          setUnreadNotificationCount(notifications.filter((notification) => !notification.isRead).length);
        }
      } catch (error) {
        if (isMounted) {
          setUnreadNotificationCount(0);
        }
      }
    };

    loadUnreadNotifications();

    const handleAuthChange = () => loadUnreadNotifications();
    window.addEventListener('auth-changed', handleAuthChange);

    return () => {
      isMounted = false;
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, []);

  const quickQuestionSet = useMemo(() => QUICK_QUESTIONS, []);

  const loadContext = async () => {
    if (contextLoaded || isLoadingContext) {
      return;
    }

    setIsLoadingContext(true);

    try {
      const [projects, events, blogs, reports] = await Promise.all([
        apiService.getProjects().catch(() => []),
        apiService.getEvents().catch(() => []),
        apiService.getBlogs().catch(() => []),
        apiService.getReports().catch(() => []),
      ]);

      setContext({
        projects: Array.isArray(projects) ? projects : [],
        events: Array.isArray(events) ? events : [],
        blogs: Array.isArray(blogs) ? blogs : [],
        reports: Array.isArray(reports) ? reports : [],
      });
      setContextLoaded(true);
    } finally {
      setIsLoadingContext(false);
    }
  };

  const openChat = async () => {
    setIsLauncherOpen(false);
    setIsChatOpen(true);
    await loadContext();
  };

  const openMessenger = () => {
    setIsLauncherOpen(false);
    navigate(localStorage.getItem('authToken') ? '/messages' : '/login');
  };

  const getFaqMatch = (query) => {
    const normalizedQuery = normalizeText(query);

    return BUILT_IN_FAQS
      .map((faq) => ({
        ...faq,
        score: faq.keywords.reduce((score, keyword) => {
          return normalizedQuery.includes(normalizeText(keyword)) ? score + 3 : score;
        }, normalizedQuery.includes(normalizeText(faq.question)) ? 4 : 0),
      }))
      .sort((left, right) => right.score - left.score)[0];
  };

  const getEntityMatches = (query) => {
    const queryTokens = tokenize(query);
    const normalizedQuery = normalizeText(query);

    const projectMatches = context.projects
      .map((project) => ({
        ...project,
        score:
          scoreTokens(queryTokens, `${project.title} ${project.category} ${project.description} ${project.longDescription} ${project.location}`) +
          (normalizedQuery.includes(normalizeText(project.title || '')) ? 8 : 0),
      }))
      .filter((project) => project.score > 0)
      .sort((left, right) => right.score - left.score);

    const eventMatches = context.events
      .map((event) => ({
        ...event,
        score:
          scoreTokens(queryTokens, `${event.title} ${event.description} ${event.location}`) +
          (normalizedQuery.includes(normalizeText(event.title || '')) ? 8 : 0),
      }))
      .filter((event) => event.score > 0)
      .sort((left, right) => right.score - left.score);

    const blogMatches = context.blogs
      .map((blog) => ({
        ...blog,
        score:
          scoreTokens(queryTokens, `${blog.title} ${blog.excerpt} ${blog.content} ${blog.category}`) +
          (normalizedQuery.includes(normalizeText(blog.title || '')) ? 8 : 0),
      }))
      .filter((blog) => blog.score > 0)
      .sort((left, right) => right.score - left.score);

    return { projectMatches, eventMatches, blogMatches };
  };

  const answerQuestion = async (question) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmedQuestion,
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput('');
    setIsReplying(true);

    if (!contextLoaded) {
      await loadContext();
    }

    let reply;
    const isCreateRequest = isProjectCreateIntent(trimmedQuestion);

    try {
      const aiReply = await apiService.askChatbot({
        message: trimmedQuestion,
        history: mapMessagesToHistory(nextMessages),
      });

      if (aiReply?.answer) {
        reply = {
          text: aiReply.answer,
        };
      }
    } catch (error) {
      if (isCreateRequest) {
        reply = {
          text:
            error?.message ||
            'Project creation failed. Make sure the API server is updated, OPENAI_API_KEY is configured, and you are logged in as admin.',
        };
      }

      const faqMatch = getFaqMatch(trimmedQuestion);
      const { projectMatches, eventMatches, blogMatches } = getEntityMatches(trimmedQuestion);

      if (!reply && faqMatch?.score >= 3) {
        reply = {
          text: faqMatch.answer,
          cta: faqMatch.cta,
        };
      }

      if (!reply && /(ongoing|current|active).*(project|projects)|project|initiative|program/.test(normalizeText(trimmedQuestion))) {
        reply = buildProjectAnswer(
          projectMatches.length
            ? projectMatches
            : context.projects.filter((project) => project.status === 'ongoing').slice(0, 3)
        );
      }

      if (!reply && /(event|events|calendar|upcoming)/.test(normalizeText(trimmedQuestion))) {
        reply = buildEventAnswer(eventMatches.length ? eventMatches : context.events.slice(0, 3));
      }

      if (!reply && /(blog|blogs|news|media|article)/.test(normalizeText(trimmedQuestion))) {
        reply = buildBlogAnswer(blogMatches.length ? blogMatches : context.blogs.slice(0, 3));
      }

      if (!reply && projectMatches[0]?.score >= 4) {
        reply = buildProjectAnswer(projectMatches.slice(0, 3));
      }

      if (!reply && eventMatches[0]?.score >= 4) {
        reply = buildEventAnswer(eventMatches.slice(0, 3));
      }

      if (!reply && blogMatches[0]?.score >= 4) {
        reply = buildBlogAnswer(blogMatches.slice(0, 3));
      }

      if (!reply && /(report|reports)/.test(normalizeText(trimmedQuestion)) && context.reports.length) {
        reply = {
          text: `Available reports include ${context.reports.slice(0, 3).map((report) => report.title).join(', ')}.`,
          cta: { label: 'Open Reports', path: '/reports' },
        };
      }

      if (!reply) {
        reply = buildFallbackAnswer(context);
      }
    }

    setMessages((current) => [
      ...current,
      {
        id: `bot-${Date.now()}`,
        role: 'bot',
        text: reply.text,
        cta: reply.cta,
      },
    ]);
    setIsReplying(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await answerQuestion(input);
  };

  const handleClearChat = () => {
    setMessages(createWelcomeMessages());
    setInput('');
    setIsReplying(false);
  };

  const handleInputKeyDown = async (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      if (!input.trim() || isReplying) {
        return;
      }

      await answerQuestion(input);
    }
  };

  const handleCta = (path) => {
    navigate(path);
    setIsChatOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsLauncherOpen((current) => !current)}
        className="fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-primary-700 text-white shadow-[0_18px_40px_-18px_rgba(15,23,42,0.85)] transition duration-300 hover:-translate-y-1 hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label="Open chat options"
      >
        <FiMessageCircle size={28} />
        {unreadNotificationCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-[1.5rem] rounded-full bg-red-600 px-1.5 py-0.5 text-center text-xs font-bold text-white">
            {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
          </span>
        )}
      </button>

      {isLauncherOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsLauncherOpen(false)}>
          <div
            className="absolute bottom-24 right-5 w-[280px] rounded-[1.75rem] border border-white/70 bg-[#fffaf1] p-3 shadow-[0_26px_80px_-30px_rgba(15,23,42,0.7)]"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.22em] text-ink-500">Choose chat</p>
            <button
              type="button"
              onClick={openChat}
              className="flex w-full items-start gap-3 rounded-[1.25rem] px-4 py-3 text-left transition hover:bg-white"
            >
              <span className="mt-1 flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                <FiMessageCircle size={20} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink-900">Chatbot</span>
                <span className="block text-xs text-ink-500">Ask about projects, events, reports, volunteering, and platform details.</span>
              </span>
            </button>
            <button
              type="button"
              onClick={openMessenger}
              className="flex w-full items-start gap-3 rounded-[1.25rem] px-4 py-3 text-left transition hover:bg-white"
            >
              <span className="mt-1 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <FiUsers size={20} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink-900">Messenger</span>
                <span className="block text-xs text-ink-500">Message another user, create groups, and track unread notifications and seen status.</span>
              </span>
            </button>
          </div>
        </div>
      )}

      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-ink-950/25 p-3 sm:p-5" onClick={() => setIsChatOpen(false)}>
          <div
            className="flex h-[min(85vh,720px)] w-full max-w-[420px] flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-[#fffaf1] shadow-[0_30px_90px_-35px_rgba(15,23,42,0.75)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative overflow-hidden bg-[#1f544d] px-5 py-4 text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%)]" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">Assistant</p>
                  <h2 className="mt-1 text-2xl font-bold">Project Chat</h2>
                  <p className="mt-1 text-sm text-white/80">Ask about this platform, projects, events, reports, or volunteering.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(false)}
                  className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                  aria-label="Close chat"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            <div className="border-b border-amber-100 bg-white/80 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink-900">Suggested questions</p>
                  <p className="text-xs text-ink-500">Use these or ask your own question.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuickQuestions((current) => !current)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-900 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
                  aria-label={showQuickQuestions ? 'Collapse suggested questions' : 'Expand suggested questions'}
                >
                  {showQuickQuestions ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </button>
              </div>
              {showQuickQuestions && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {quickQuestionSet.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => answerQuestion(question)}
                      className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-left text-xs font-medium text-amber-900 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {isLoadingContext && (
                <div className="mb-4 flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <FiLoader className="animate-spin" />
                  Loading project knowledge...
                </div>
              )}

              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[88%] ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                      <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] ${message.role === 'user' ? 'text-primary-700' : 'text-ink-500'}`}>
                        {message.role === 'user' ? <FiUser size={12} /> : <FiMessageCircle size={12} />}
                        {message.role === 'user' ? 'You' : 'Assistant'}
                      </div>
                      <div
                        className={`rounded-[1.5rem] px-4 py-3 text-sm leading-6 shadow-sm ${
                          message.role === 'user'
                            ? 'bg-primary-700 text-white'
                            : 'border border-stone-200 bg-white text-ink-800'
                        }`}
                      >
                        {message.text}
                      </div>
                      {message.cta && (
                        <button
                          type="button"
                          onClick={() => handleCta(message.cta.path)}
                          className="inline-flex items-center gap-2 rounded-full bg-ink-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-ink-800"
                        >
                          {message.cta.label}
                          <FiArrowRight size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {isReplying && (
                  <div className="flex justify-start">
                    <div className="rounded-[1.5rem] border border-stone-200 bg-white px-4 py-3 text-sm text-ink-700">
                      <div className="flex items-center gap-2">
                        <FiLoader className="animate-spin" />
                        Preparing answer...
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="border-t border-stone-200 bg-white px-4 py-4">
              <div className="mb-3 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <FiTrash2 size={12} />
                  Clear
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex items-end gap-3">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Ask a question about the project..."
                  rows={2}
                  className="min-h-[56px] flex-1 resize-none rounded-[1.25rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-primary-400 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isReplying}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-700 text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:bg-stone-300"
                  aria-label="Send message"
                >
                  <FiSend size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectChatbot;
