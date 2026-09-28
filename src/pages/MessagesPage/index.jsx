import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiMessageSquare, FiSend, FiPaperclip, FiSmile, FiSearch,
  FiUser, FiMoreVertical, FiStar, FiArchive, FiTrash2,
  FiCheck, FiCheckCircle, FiClock, FiImage, FiFile,
  FiDownload, FiEye, FiX, FiPlus, FiUsers, FiMail,
  FiInbox, FiSend as FiSent, FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const MessagesPage = () => {
  const [activeTab, setActiveTab] = useState('inbox');
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Mock contacts
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Priya Sharma', role: 'Volunteer Coordinator', avatar: null, online: true, lastSeen: 'now' },
    { id: 2, name: 'Rajesh Kumar', role: 'Super Admin', avatar: null, online: true, lastSeen: 'now' },
    { id: 3, name: 'Amit Patel', role: 'Project Manager', avatar: null, online: false, lastSeen: '2 hours ago' },
    { id: 4, name: 'Sunita Reddy', role: 'Volunteer', avatar: null, online: true, lastSeen: 'now' },
    { id: 5, name: 'Vikram Singh', role: 'Member', avatar: null, online: false, lastSeen: '1 day ago' },
    { id: 6, name: 'Anjali Desai', role: 'Volunteer', avatar: null, online: true, lastSeen: 'now' },
    { id: 7, name: 'Rajiv Mehta', role: 'Donor', avatar: null, online: false, lastSeen: '3 days ago' },
    { id: 8, name: 'Kavita Nair', role: 'Member', avatar: null, online: false, lastSeen: '1 week ago' },
  ]);

  // Mock conversations
  const mockConversations = [
    {
      id: 1,
      userId: 1,
      name: 'Priya Sharma',
      role: 'Volunteer Coordinator',
      avatar: null,
      lastMessage: 'Hi! Are you available for the volunteer orientation this Saturday?',
      timestamp: '2024-02-22T10:30:00',
      unread: 2,
      online: true,
      messages: [
        {
          id: 101,
          senderId: 1,
          senderName: 'Priya Sharma',
          content: 'Hi! Are you available for the volunteer orientation this Saturday?',
          timestamp: '2024-02-22T10:30:00',
          read: true,
          attachments: []
        },
        {
          id: 102,
          senderId: 'me',
          senderName: 'You',
          content: 'Yes, I can make it. What time does it start?',
          timestamp: '2024-02-22T10:32:00',
          read: true,
          attachments: []
        },
        {
          id: 103,
          senderId: 1,
          senderName: 'Priya Sharma',
          content: 'Great! It starts at 10 AM at our Chennai office.',
          timestamp: '2024-02-22T10:33:00',
          read: false,
          attachments: []
        },
        {
          id: 104,
          senderId: 1,
          senderName: 'Priya Sharma',
          content: 'Also, please bring a photo ID and wear comfortable clothes.',
          timestamp: '2024-02-22T10:34:00',
          read: false,
          attachments: []
        }
      ]
    },
    {
      id: 2,
      userId: 2,
      name: 'Rajesh Kumar',
      role: 'Super Admin',
      avatar: null,
      lastMessage: 'Thank you for your donation!',
      timestamp: '2024-02-21T15:45:00',
      unread: 0,
      online: true,
      messages: [
        {
          id: 201,
          senderId: 2,
          senderName: 'Rajesh Kumar',
          content: 'Thank you for your generous donation to the Education Fund!',
          timestamp: '2024-02-21T15:45:00',
          read: true,
          attachments: []
        },
        {
          id: 202,
          senderId: 'me',
          senderName: 'You',
          content: 'You`re welcome! Happy to support the cause.',
          timestamp: '2024-02-21T15:47:00',
          read: true,
          attachments: []
        }
      ]
    },
    {
      id: 3,
      userId: 3,
      name: 'Amit Patel',
      role: 'Project Manager',
      avatar: null,
      lastMessage: 'The healthcare camp report is ready for review.',
      timestamp: '2024-02-20T09:15:00',
      unread: 1,
      online: false,
      messages: [
        {
          id: 301,
          senderId: 3,
          senderName: 'Amit Patel',
          content: 'The healthcare camp report is ready for review.',
          timestamp: '2024-02-20T09:15:00',
          read: false,
          attachments: [
            { name: 'healthcare-report.pdf', size: '2.4 MB', type: 'pdf' }
          ]
        }
      ]
    },
    {
      id: 4,
      userId: 4,
      name: 'Sunita Reddy',
      role: 'Volunteer',
      avatar: null,
      lastMessage: 'Thanks for the orientation! It was very helpful.',
      timestamp: '2024-02-19T16:30:00',
      unread: 0,
      online: true,
      messages: [
        {
          id: 401,
          senderId: 4,
          senderName: 'Sunita Reddy',
          content: 'Thanks for the orientation! It was very helpful.',
          timestamp: '2024-02-19T16:30:00',
          read: true,
          attachments: []
        },
        {
          id: 402,
          senderId: 'me',
          senderName: 'You',
          content: 'Glad you found it useful! Let me know if you have any questions.',
          timestamp: '2024-02-19T16:35:00',
          read: true,
          attachments: []
        }
      ]
    },
    {
      id: 5,
      userId: 5,
      name: 'Vikram Singh',
      role: 'Member',
      avatar: null,
      lastMessage: 'How can I get more involved with the education project?',
      timestamp: '2024-02-18T11:20:00',
      unread: 0,
      online: false,
      messages: [
        {
          id: 501,
          senderId: 5,
          senderName: 'Vikram Singh',
          content: 'How can I get more involved with the education project?',
          timestamp: '2024-02-18T11:20:00',
          read: true,
          attachments: []
        },
        {
          id: 502,
          senderId: 'me',
          senderName: 'You',
          content: 'We have tutoring opportunities on weekends. Would you be interested?',
          timestamp: '2024-02-18T11:25:00',
          read: true,
          attachments: []
        }
      ]
    }
  ];

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation]);

  const loadMessages = () => {
    setConversations(mockConversations);
    if (mockConversations.length > 0) {
      setSelectedConversation(mockConversations[0]);
      setMessages(mockConversations[0].messages || []);
    }
    setLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMessages(conversation.messages || []);
    
    // Mark as read
    if (conversation.unread > 0) {
      const updatedConversations = conversations.map(c => 
        c.id === conversation.id ? { ...c, unread: 0 } : c
      );
      setConversations(updatedConversations);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() && !replyTo) return;

    const message = {
      id: Date.now(),
      senderId: 'me',
      senderName: 'You',
      content: replyTo || newMessage,
      timestamp: new Date().toISOString(),
      read: false,
      attachments: []
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);

    // Update conversation last message
    const updatedConversations = conversations.map(c => 
      c.id === selectedConversation?.id 
        ? { 
            ...c, 
            lastMessage: message.content,
            timestamp: message.timestamp,
            messages: updatedMessages
          } 
        : c
    );
    setConversations(updatedConversations);

    setNewMessage('');
    setReplyTo(null);

    // Simulate reply after 2 seconds
    setTimeout(() => {
      simulateReply();
    }, 2000);
  };

  const simulateReply = () => {
    if (!selectedConversation) return;

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      
      const reply = {
        id: Date.now() + 1,
        senderId: selectedConversation.userId,
        senderName: selectedConversation.name,
        content: "Thanks for your message! I'll get back to you soon.",
        timestamp: new Date().toISOString(),
        read: false,
        attachments: []
      };

      const updatedMessages = [...messages, reply];
      setMessages(updatedMessages);

      const updatedConversations = conversations.map(c => 
        c.id === selectedConversation?.id 
          ? { 
              ...c, 
              lastMessage: reply.content,
              timestamp: reply.timestamp,
              messages: updatedMessages,
              unread: (c.unread || 0) + 1
            } 
          : c
      );
      setConversations(updatedConversations);
    }, 3000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      toast.info(`Uploading ${file.name}...`);
      // Simulate upload
      setTimeout(() => {
        toast.success(`${file.name} uploaded successfully`);
      }, 1500);
    });
  };

  const handleReply = (message) => {
    setReplyTo(`@${message.senderName} `);
  };

  const handleDeleteMessage = (messageId) => {
    if (window.confirm('Delete this message?')) {
      const updatedMessages = messages.filter(m => m.id !== messageId);
      setMessages(updatedMessages);
      toast.success('Message deleted');
    }
  };

  const handleStarMessage = (messageId) => {
    toast.info('Message starred');
  };

  const handleSelectMessage = (messageId) => {
    setSelectedMessages(prev => 
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleBulkDelete = () => {
    if (selectedMessages.length === 0) return;
    
    if (window.confirm(`Delete ${selectedMessages.length} messages?`)) {
      const updatedMessages = messages.filter(m => !selectedMessages.includes(m.id));
      setMessages(updatedMessages);
      setSelectedMessages([]);
      toast.success(`${selectedMessages.length} messages deleted`);
    }
  };

  const handleBulkArchive = () => {
    if (selectedMessages.length === 0) return;
    setSelectedMessages([]);
    toast.success(`${selectedMessages.length} messages archived`);
  };

  const handleNewMessage = (contact) => {
    // Check if conversation already exists
    const existing = conversations.find(c => c.userId === contact.id);
    
    if (existing) {
      setSelectedConversation(existing);
      setMessages(existing.messages || []);
    } else {
      // Create new conversation
      const newConversation = {
        id: Date.now(),
        userId: contact.id,
        name: contact.name,
        role: contact.role,
        avatar: contact.avatar,
        lastMessage: '',
        timestamp: new Date().toISOString(),
        unread: 0,
        online: contact.online,
        messages: []
      };
      
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
      setMessages([]);
    }
    
    setShowNewMessageModal(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-gray-50">
        <div className="container-custom">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading messages...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50">
      <div className="container-custom h-[calc(100vh-8rem)]">
        <div className="bg-white rounded-lg shadow-lg h-full flex overflow-hidden">
          {/* Sidebar - Conversations List */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <FiMessageSquare className="mr-2 text-primary-600" />
                  Messages
                </h2>
                <button
                  onClick={() => setShowNewMessageModal(true)}
                  className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  title="New Message"
                >
                  <FiPlus size={18} />
                </button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {[
                { id: 'inbox', label: 'Inbox', icon: FiInbox },
                { id: 'unread', label: 'Unread', icon: FiMail },
                { id: 'sent', label: 'Sent', icon: FiSent },
                { id: 'starred', label: 'Starred', icon: FiStar }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 text-sm font-medium flex items-center justify-center ${
                    activeTab === tab.id
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="mr-2" size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length > 0 ? (
                filteredConversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                      selectedConversation?.id === conv.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="relative">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          {conv.avatar ? (
                            <img src={conv.avatar} alt={conv.name} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <span className="text-primary-600 font-semibold">
                              {getInitials(conv.name)}
                            </span>
                          )}
                        </div>
                        {conv.online && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                      </div>
                      
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">{conv.name}</h3>
                          <span className="text-xs text-gray-500">{formatTime(conv.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{conv.role}</p>
                        <p className="text-sm text-gray-600 truncate mt-1">{conv.lastMessage}</p>
                      </div>
                      
                      {conv.unread > 0 && (
                        <span className="ml-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <FiMessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No conversations found</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          {selectedConversation ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      {selectedConversation.avatar ? (
                        <img src={selectedConversation.avatar} alt={selectedConversation.name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <span className="text-primary-600 font-semibold">
                          {getInitials(selectedConversation.name)}
                        </span>
                      )}
                    </div>
                    {selectedConversation.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">{selectedConversation.name}</h3>
                    <p className="text-xs text-gray-500">
                      {selectedConversation.online ? 'Online' : `Last seen ${selectedConversation.lastSeen || 'recently'}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedMessages.length > 0 && (
                    <>
                      <button
                        onClick={handleBulkArchive}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Archive selected"
                      >
                        <FiArchive size={18} />
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete selected"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowDetailsModal(true)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="View details"
                  >
                    <FiEye size={18} />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <FiMoreVertical size={18} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => {
                  const isMe = message.senderId === 'me';
                  const showDate = index === 0 || 
                    new Date(message.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString();

                  return (
                    <React.Fragment key={message.id}>
                      {showDate && (
                        <div className="text-center my-4">
                          <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                            {formatDate(message.timestamp)}
                          </span>
                        </div>
                      )}
                      
                      <div className={`flex items-start ${isMe ? 'justify-end' : ''}`}>
                        {!isMe && (
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                            <span className="text-primary-600 font-semibold text-xs">
                              {getInitials(message.senderName)}
                            </span>
                          </div>
                        )}

                        <div className={`max-w-[70%] ${isMe ? 'order-1' : ''}`}>
                          <div className="flex items-center mb-1">
                            {!isMe && (
                              <span className="text-xs font-medium text-gray-700 mr-2">{message.senderName}</span>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(message.timestamp).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>

                          <div
            className={`p-3 rounded-lg ${
              isMe 
                ? 'bg-primary-600 text-white rounded-br-none' 
                : 'bg-gray-100 text-gray-800 rounded-bl-none'
            }`}
          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                            {message.attachments?.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {message.attachments.map((att, idx) => (
                                  <div key={idx} className="flex items-center bg-white bg-opacity-20 rounded p-2">
                                    {att.type === 'pdf' ? (
                                      <FiFile className="mr-2" size={16} />
                                    ) : (
                                      <FiImage className="mr-2" size={16} />
                                    )}
                                    <span className="text-sm flex-1">{att.name}</span>
                                    <span className="text-xs mr-2">{att.size}</span>
                                    <FiDownload size={14} className="cursor-pointer hover:opacity-75" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Message Actions */}
                          <div className={`flex items-center mt-1 space-x-2 ${isMe ? 'justify-end' : ''}`}>
                            <button
                              onClick={() => handleReply(message)}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Reply
                            </button>
                            <button
                              onClick={() => handleStarMessage(message.id)}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Star
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(message.id)}
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                            <input
                              type="checkbox"
                              checked={selectedMessages.includes(message.id)}
                              onChange={() => handleSelectMessage(message.id)}
                              className="w-3 h-3 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            {isMe && message.read && (
                              <FiCheckCircle className="text-green-500" size={12} />
                            )}
                          </div>
                        </div>

                        {isMe && (
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                            <span className="text-primary-600 font-semibold text-xs">ME</span>
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-primary-600 font-semibold text-xs">
                        {getInitials(selectedConversation.name)}
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                {replyTo && (
                  <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
                    <span className="text-sm text-gray-600">Replying: {replyTo}</span>
                    <button
                      onClick={() => setReplyTo(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                )}
                
                <div className="flex items-end space-x-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      rows="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none resize-none"
                      style={{ minHeight: '50px', maxHeight: '150px' }}
                    />
                    <div className="absolute right-2 bottom-2 flex space-x-1">
                      <button
                        onClick={handleFileUpload}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded"
                        title="Attach file"
                      >
                        <FiPaperclip size={18} />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 rounded"
                        title="Add emoji"
                      >
                        <FiSmile size={18} />
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      multiple
                      className="hidden"
                    />
                  </div>
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() && !replyTo}
                    className="px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSend size={18} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FiMessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No conversation selected</h3>
                <p className="text-gray-500 mb-4">Choose a conversation from the list to start messaging</p>
                <button
                  onClick={() => setShowNewMessageModal(true)}
                  className="btn-primary"
                >
                  <FiPlus className="inline mr-2" />
                  New Message
                </button>
              </div>
            </div>
          )}
        </div>

        {/* New Message Modal */}
        {showNewMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">New Message</h3>
                  <button
                    onClick={() => setShowNewMessageModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 120px)' }}>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Suggested Contacts</h4>
                  {contacts.map(contact => (
                    <button
                      key={contact.id}
                      onClick={() => handleNewMessage(contact)}
                      className="w-full p-3 flex items-center hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">
                            {getInitials(contact.name)}
                          </span>
                        </div>
                        {contact.online && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                      </div>
                      <div className="ml-3 text-left">
                        <p className="font-medium text-gray-900">{contact.name}</p>
                        <p className="text-sm text-gray-500">{contact.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Details Modal */}
        {showDetailsModal && selectedConversation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Contact Details</h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary-600 font-bold text-2xl">
                      {getInitials(selectedConversation.name)}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold">{selectedConversation.name}</h4>
                  <p className="text-gray-600">{selectedConversation.role}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-medium ${selectedConversation.online ? 'text-green-600' : 'text-gray-600'}`}>
                      {selectedConversation.online ? 'Online' : 'Offline'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Last Seen</span>
                    <span className="font-medium">
                      {selectedConversation.online ? 'Now' : selectedConversation.lastSeen || 'Recently'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium">2023</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Total Messages</span>
                    <span className="font-medium">{selectedConversation.messages?.length || 0}</span>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      // Archive conversation
                      toast.info('Conversation archived');
                    }}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Archive
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;