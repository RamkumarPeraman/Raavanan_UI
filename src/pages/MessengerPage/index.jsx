import CommonLoader from '../../components/common/CommonLoader';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiChevronDown,
  FiEye,
  FiMessageSquare,
  FiMoreVertical,
  FiPlus,
  FiSearch,
  FiSend,
  FiSmile,
  FiTrash2,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import apiService from '../../services/api';

const QUICK_EMOJIS = ['😀', '😂', '😍', '👍', '🙏', '🔥', '🎉', '❤️', '😢', '👏', '🤝', '😊'];

const getInitials = (name = '') =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const formatTime = (timestamp) => {
  if (!timestamp) {
    return '';
  }

  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const MessengerPage = () => {
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const conversationMenuRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("user") || 'null');
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [showMobileConversationList, setShowMobileConversationList] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showConversationMenu, setShowConversationMenu] = useState(false);
  const [showConversationDetailsModal, setShowConversationDetailsModal] = useState(false);
  const [groupEditName, setGroupEditName] = useState('');
  const [groupEditMembers, setGroupEditMembers] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [savingGroupDetails, setSavingGroupDetails] = useState(false);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) {
      return conversations;
    }

    const needle = searchTerm.trim().toLowerCase();
    return conversations.filter((conversation) => {
      return (
        conversation.name?.toLowerCase().includes(needle) ||
        conversation.lastMessage?.toLowerCase().includes(needle)
      );
    });
  }, [conversations, searchTerm]);

  const groupMemberDetails = useMemo(() => {
    const participantMap = new Map(
      (selectedConversation?.participants || [])
        .map((participant) => participant.user)
        .filter(Boolean)
        .map((user) => [user.id, user])
    );

    contacts.forEach((contact) => {
      if (!participantMap.has(contact.id)) {
        participantMap.set(contact.id, contact);
      }
    });

    if (currentUser?.id && !participantMap.has(currentUser.id)) {
      participantMap.set(currentUser.id, currentUser);
    }

    return groupEditMembers
      .map((memberId) => participantMap.get(memberId))
      .filter(Boolean);
  }, [contacts, currentUser, groupEditMembers, selectedConversation]);

  const loadConversations = async (preferredConversationId) => {
    const data = await apiService.getMessengerConversations();
    setConversations(data);

    const queryConversationId = new URLSearchParams(location.search).get('conversation');
    const nextConversationId =
      preferredConversationId ||
      queryConversationId ||
      selectedConversationId ||
      data[0]?.id ||
      null;

    setSelectedConversationId(nextConversationId);
  };

  const loadContacts = async () => {
    const data = await apiService.getMessengerContacts();
    setContacts(data);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        await Promise.all([loadConversations(), loadContacts()]);
      } catch (error) {
        toast.error(error.message || 'Failed to load messenger');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
    // The initial messenger bootstrap intentionally runs once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversationId) {
        setMessages([]);
        return;
      }

      try {
        const data = await apiService.getConversationMessages(selectedConversationId);
        setMessages(data);
        await apiService.markConversationRead(selectedConversationId);
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === selectedConversationId ? { ...conversation, unreadCount: 0 } : conversation
          )
        );
      } catch (error) {
        toast.error(error.message || 'Failed to load messages');
      }
    };

    loadMessages();
  }, [selectedConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!showNewMessageModal && !showGroupModal && !showConversationDetailsModal && !pendingDelete) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [pendingDelete, showConversationDetailsModal, showGroupModal, showNewMessageModal]);

  useEffect(() => {
    setShowEmojiPicker(false);
    setShowConversationMenu(false);
  }, [selectedConversationId]);

  useEffect(() => {
    if (!showConversationMenu) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (!conversationMenuRef.current?.contains(event.target)) {
        setShowConversationMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showConversationMenu]);

  const handleOpenDirectConversation = async (contactId) => {
    try {
      const conversation = await apiService.createDirectConversation(contactId);
      setShowNewMessageModal(false);
      setShowMobileConversationList(false);
      await loadConversations(conversation.id);
    } catch (error) {
      toast.error(error.message || 'Failed to open chat');
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedGroupMembers.length === 0) {
      toast.error('Group name and members are required');
      return;
    }

    try {
      const conversation = await apiService.createGroupConversation({
        name: groupName.trim(),
        participantIds: selectedGroupMembers,
      });
      setGroupName('');
      setSelectedGroupMembers([]);
      setShowGroupModal(false);
      setShowMobileConversationList(false);
      await loadConversations(conversation.id);
    } catch (error) {
      toast.error(error.message || 'Failed to create group');
    }
  };

  const handleSendMessage = async () => {
    if (!selectedConversationId || !newMessage.trim()) {
      return;
    }

    try {
      const sentMessage = await apiService.sendConversationMessage(selectedConversationId, newMessage.trim());
      setMessages((current) => [...current, sentMessage]);
      setNewMessage('');
      await loadConversations(selectedConversationId);
    } catch (error) {
      toast.error(error.message || 'Failed to send message');
    }
  };

  const toggleGroupMember = (contactId) => {
    setSelectedGroupMembers((current) =>
      current.includes(contactId) ? current.filter((id) => id !== contactId) : [...current, contactId]
    );
  };

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    setShowMobileConversationList(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const appendEmoji = (emoji) => {
    setNewMessage((current) => `${current}${emoji}`);
    setShowEmojiPicker(false);
  };

  const handleDeleteConversation = async () => {
    if (!selectedConversationId) {
      return;
    }

    try {
      await apiService.deleteConversation(selectedConversationId);
      const remainingConversations = conversations.filter((conversation) => conversation.id !== selectedConversationId);
      setConversations(remainingConversations);
      setSelectedConversationId(remainingConversations[0]?.id || null);
      setMessages([]);
      setShowConversationMenu(false);
      setPendingDelete(null);
      setShowMobileConversationList(true);
      toast.success('Chat deleted');
    } catch (error) {
      toast.error(error.message || 'Failed to delete chat');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await apiService.deleteMessage(messageId);
      const nextMessages = messages.filter((message) => message.id !== messageId);
      setMessages(nextMessages);
      setPendingDelete(null);
      await loadConversations(selectedConversationId);
      toast.success('Message deleted');
    } catch (error) {
      toast.error(error.message || 'Failed to delete message');
    }
  };

  const isGroupAdmin = selectedConversation?.type === 'group' && selectedConversation?.createdBy === currentUser?.id;

  const availableContactsForGroup = contacts.filter((contact) => !groupEditMembers.includes(contact.id));

  const openConversationDetails = async () => {
    if (!selectedConversationId) {
      return;
    }

    try {
      const conversation = await apiService.getConversationDetails(selectedConversationId);
      setConversations((current) =>
        current.map((item) => (item.id === conversation.id ? conversation : item))
      );
      setGroupEditName(conversation.name || '');
      setGroupEditMembers((conversation.participants || []).map((participant) => participant.user?.id).filter(Boolean));
      setShowConversationDetailsModal(true);
      setShowConversationMenu(false);
    } catch (error) {
      toast.error(error.message || 'Failed to load conversation details');
    }
  };

  const handleSaveGroupDetails = async () => {
    if (!selectedConversationId || selectedConversation?.type !== 'group') {
      return;
    }

    if (!groupEditName.trim()) {
      toast.error('Group name is required');
      return;
    }

    if (groupEditMembers.length === 0) {
      toast.error('At least one member is required');
      return;
    }

    try {
      setSavingGroupDetails(true);
      const updatedConversation = await apiService.updateGroupConversation(selectedConversationId, {
        name: groupEditName.trim(),
        participantIds: groupEditMembers,
      });

      setConversations((current) =>
        current.map((conversation) => (conversation.id === updatedConversation.id ? updatedConversation : conversation))
      );
      setShowConversationDetailsModal(false);
      toast.success('Group updated');
    } catch (error) {
      toast.error(error.message || 'Failed to update group');
    } finally {
      setSavingGroupDetails(false);
    }
  };

  const addMemberToGroup = (contactId) => {
    setGroupEditMembers((current) => (current.includes(contactId) ? current : [...current, contactId]));
  };

  const removeMemberFromGroup = (contactId) => {
    if (contactId === currentUser?.id) {
      toast.error('Admin cannot be removed from the group');
      return;
    }

    setGroupEditMembers((current) => current.filter((id) => id !== contactId));
  };

  const showConversationPanel = selectedConversation && !showMobileConversationList;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16 pt-20">
        <div className="container-custom flex h-64 items-center justify-center">
          <div className="text-center">
            <CommonLoader className="mb-4" />
            <p className="text-gray-600">Loading messenger...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 pt-20">
      <div className="container-custom h-[calc(100vh-7rem)] md:h-[calc(100vh-8rem)]">
        <div className="flex h-full overflow-hidden rounded-2xl bg-white shadow-lg">
          <div
            className={`${
              showConversationPanel ? 'hidden md:flex' : 'flex'
            } w-full flex-col border-r border-gray-200 md:w-80`}
          >
            <div className="border-b border-gray-200 p-3 md:p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center text-base font-semibold md:text-lg">
                  <FiMessageSquare className="mr-2 text-primary-600" />
                  Messenger
                </h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowGroupModal(true)}
                    className="rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-50"
                    data-tooltip="Create group" aria-label="Create group"
                  >
                    <FiUsers size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewMessageModal(true)}
                    className="rounded-lg bg-primary-600 p-2 text-white hover:bg-primary-700"
                    data-tooltip="New message" aria-label="New message"
                  >
                    <FiPlus size={18} />
                  </button>
                </div>
              </div>

              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search conversations..."
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-gray-500">No conversations yet.</div>
              ) : (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => handleSelectConversation(conversation.id)}
                    className={`w-full border-b border-gray-100 p-4 text-left transition hover:bg-gray-50 ${
                      selectedConversationId === conversation.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700 md:h-12 md:w-12">
                        {conversation.type === 'group' ? <FiUsers size={18} /> : getInitials(conversation.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="truncate font-medium text-gray-900">{conversation.name}</h3>
                          <span className="text-xs text-gray-500">{formatTime(conversation.lastMessageAt)}</span>
                        </div>
                        <p className="mt-1 truncate text-sm text-gray-600">{conversation.lastMessage || 'No messages yet'}</p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <span className="rounded-full bg-primary-600 px-2 py-1 text-xs text-white">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {selectedConversation ? (
            <div className={`${showConversationPanel ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
              <div className="flex items-center justify-between border-b border-gray-200 p-3 md:p-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowMobileConversationList(true)}
                    className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 md:hidden"
                    aria-label="Back to conversations"
                  >
                    <FiArrowLeft size={18} />
                  </button>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700">
                    {selectedConversation.type === 'group' ? <FiUsers size={18} /> : getInitials(selectedConversation.name)}
                  </div>
                  <div>
                    <h3 className="max-w-[160px] truncate font-semibold text-gray-900 md:max-w-none">
                      {selectedConversation.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {selectedConversation.type === 'group'
                        ? `${selectedConversation.participants?.length || 0} members`
                        : 'Direct message'}
                    </p>
                  </div>
                </div>
                <div ref={conversationMenuRef} className="relative flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setShowConversationMenu((current) => !current);
                    }}
                    className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50"
                    aria-label="Conversation options"
                  >
                    <FiMoreVertical size={18} />
                  </button>
                  {showConversationMenu && (
                    <div className="absolute right-0 top-12 z-20 min-w-[180px] rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                      <button
                        type="button"
                        onClick={openConversationDetails}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FiEye size={16} />
                        View details
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPendingDelete({
                            type: 'conversation',
                            title: selectedConversation?.type === 'group' ? 'Delete group' : 'Delete chat',
                            message:
                              selectedConversation?.type === 'group'
                                ? 'This group and all its messages will be deleted.'
                                : 'This chat and all its messages will be deleted.',
                          })
                        }
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        <FiTrash2 size={16} />
                        {selectedConversation?.type === 'group' ? 'Delete group' : 'Delete chat'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-3 md:space-y-4 md:p-6">
                {messages.map((message) => {
                  const isMe = message.sender?.id === currentUser?.id;
                  const readByOthers = (message.readBy || []).filter((entry) => entry.userId !== currentUser?.id).length;

                  return (
                    <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[84%] md:max-w-[72%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        <span className="mb-1 text-xs text-gray-500">{isMe ? 'You' : message.sender?.name}</span>
                        <div
                          className={`rounded-2xl px-3 py-2.5 text-sm md:px-4 md:py-3 ${
                            isMe ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {message.content}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                          <span>{formatTime(message.createdAt)}</span>
                          {isMe && readByOthers > 0 && <FiCheckCircle className="text-green-600" size={12} />}
                          {isMe && readByOthers > 0 && <span>Seen</span>}
                          {isMe && (
                            <button
                              type="button"
                              onClick={() =>
                                setPendingDelete({
                                  type: 'message',
                                  messageId: message.id,
                                  title: 'Delete message',
                                  message: 'This message will be removed from the chat.',
                                })
                              }
                              className="ml-1 rounded-full p-1 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                              aria-label="Delete message"
                            >
                              <FiTrash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-200 p-3 md:p-4">
                {showEmojiPicker && (
                  <div className="mb-3 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Emojis</span>
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FiChevronDown size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-6 gap-2 md:grid-cols-12">
                      {QUICK_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => appendEmoji(emoji)}
                          className="rounded-lg bg-white px-2 py-2 text-xl transition hover:bg-primary-50"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-end gap-2 md:gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker((current) => !current)}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:bg-gray-50"
                    aria-label="Add emoji"
                  >
                    <FiSmile size={18} />
                  </button>
                  <textarea
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    rows={1}
                    className="max-h-28 flex-1 resize-none rounded-lg border border-gray-300 px-3 py-3 text-sm focus:border-primary-500 focus:outline-none md:px-4"
                  />
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-300 md:h-14 md:w-14"
                  >
                    <FiSend size={18} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden flex-1 items-center justify-center md:flex">
              <div className="text-center">
                <FiMessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-700">Select a conversation</h3>
                <p className="mt-2 text-sm text-gray-500">Start a direct chat or create a group.</p>
              </div>
            </div>
          )}
        </div>

        {showNewMessageModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 md:items-center md:p-4">
            <div className="max-h-[82vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white">
              <div className="flex items-center justify-between border-b border-gray-200 p-4 md:p-5">
                <h3 className="text-lg font-semibold">New Message</h3>
                <button type="button" onClick={() => setShowNewMessageModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FiX size={20} />
                </button>
              </div>
              <div className="max-h-[68vh] overflow-y-auto p-3 md:p-5">
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => handleOpenDirectConversation(contact.id)}
                      className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition hover:bg-gray-50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700">
                        {getInitials(contact.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900">{contact.name}</p>
                        <p className="truncate text-sm text-gray-500">{contact.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {showGroupModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 md:items-center md:p-4">
            <div className="max-h-[86vh] w-full max-w-xl overflow-hidden rounded-2xl bg-white">
              <div className="flex items-center justify-between border-b border-gray-200 p-4 md:p-5">
                <h3 className="text-lg font-semibold">Create Group</h3>
                <button type="button" onClick={() => setShowGroupModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FiX size={20} />
                </button>
              </div>
              <div className="space-y-4 p-4 md:p-5">
                <input
                  type="text"
                  value={groupName}
                  onChange={(event) => setGroupName(event.target.value)}
                  placeholder="Group name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none"
                />
                <div className="max-h-[45vh] space-y-2 overflow-y-auto">
                  {contacts.map((contact) => (
                    <label key={contact.id} className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedGroupMembers.includes(contact.id)}
                        onChange={() => toggleGroupMember(contact.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700">
                        {getInitials(contact.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900">{contact.name}</p>
                        <p className="truncate text-sm text-gray-500">{contact.role}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleCreateGroup}
                  className="w-full rounded-lg bg-primary-600 px-4 py-3 font-medium text-white transition hover:bg-primary-700"
                >
                  Create Group
                </button>
              </div>
            </div>
          </div>
        )}

        {showConversationDetailsModal && selectedConversation && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 md:items-center md:p-4">
            <div className="max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white">
              <div className="flex items-center justify-between border-b border-gray-200 p-4 md:p-5">
                <div>
                  <h3 className="text-lg font-semibold">Conversation Details</h3>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.type === 'group' ? 'Members and group settings' : 'Chat information'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConversationDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={20} />
                </button>
              </div>
              <div className="space-y-5 overflow-y-auto p-4 md:p-5">
                {selectedConversation.type === 'group' ? (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Group name</label>
                      <input
                        type="text"
                        value={groupEditName}
                        onChange={(event) => setGroupEditName(event.target.value)}
                        disabled={!isGroupAdmin}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700">Members</h4>
                        <span className="text-xs text-gray-500">{groupEditMembers.length} total</span>
                      </div>
                      <div className="space-y-2">
                        {groupMemberDetails.map((user) => {
                            const isCreator = user?.id === selectedConversation.createdBy;

                            return (
                              <div
                                key={user?.id}
                                className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-3"
                              >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700">
                                  {getInitials(user?.name)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-medium text-gray-900">{user?.name}</p>
                                  <p className="truncate text-sm text-gray-500">
                                    {isCreator ? 'Admin' : user?.role || 'Member'}
                                  </p>
                                </div>
                                {isGroupAdmin && !isCreator && (
                                  <button
                                    type="button"
                                    onClick={() => removeMemberFromGroup(user?.id)}
                                    className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {isGroupAdmin && (
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-gray-700">Add members</h4>
                        <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-2">
                          {availableContactsForGroup.length === 0 ? (
                            <p className="px-2 py-3 text-sm text-gray-500">All contacts are already in this group.</p>
                          ) : (
                            availableContactsForGroup.map((contact) => (
                              <div
                                key={contact.id}
                                className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50"
                              >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700">
                                  {getInitials(contact.name)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-medium text-gray-900">{contact.name}</p>
                                  <p className="truncate text-sm text-gray-500">{contact.role}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => addMemberToGroup(contact.id)}
                                  className="rounded-lg bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100"
                                >
                                  Add
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowConversationDetailsModal(false)}
                        className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Close
                      </button>
                      {isGroupAdmin && (
                        <button
                          type="button"
                          onClick={handleSaveGroupDetails}
                          disabled={savingGroupDetails}
                          className="rounded-lg bg-primary-600 px-4 py-3 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          {savingGroupDetails ? 'Saving...' : 'Save changes'}
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-sm text-gray-500">Chat name</p>
                      <p className="mt-1 font-medium text-gray-900">{selectedConversation.name}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-sm text-gray-500">Participants</p>
                      <div className="mt-3 space-y-2">
                        {(selectedConversation.participants || []).map((participant) => (
                          <div key={participant.user?.id} className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700">
                              {getInitials(participant.user?.name)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{participant.user?.name}</p>
                              <p className="text-sm text-gray-500">{participant.user?.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {pendingDelete && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 md:items-center md:p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
              <div className="mb-3 flex items-start gap-3">
                <div className="rounded-full bg-red-100 p-2 text-red-600">
                  <FiTrash2 size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{pendingDelete.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{pendingDelete.message}</p>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPendingDelete(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    pendingDelete.type === 'conversation'
                      ? handleDeleteConversation()
                      : handleDeleteMessage(pendingDelete.messageId)
                  }
                  className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessengerPage;
