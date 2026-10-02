import CommonLoader from '../../components/common/CommonLoader';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar,
  FiEdit2, FiTrash2, FiSearch, FiFilter, FiChevronLeft,
  FiChevronRight, FiShield, FiAward, FiClock, FiEye,
  FiLock, FiUnlock, FiDownload, FiGrid, FiList, FiUserPlus
} from 'react-icons/fi';
import { FaUserShield, FaUserCog, FaUserTie, FaUserGraduate } from 'react-icons/fa';
import { toast } from 'react-toastify';
import UserPopup from '../../components/common/UserPopup';

const UserGroupPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Popup state
  const [showPopup, setShowPopup] = useState(false);
  const [popupMode, setPopupMode] = useState('view'); // 'view', 'add', 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  
  const usersPerPage = 12;

  // Role definitions with permissions
  const roles = {
    super_admin: {
      name: 'Super Admin',
      level: 100,
      icon: FaUserShield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      permissions: ['all']
    },
    admin: {
      name: 'Admin',
      level: 80,
      icon: FaUserCog,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      permissions: ['manage_users', 'manage_projects', 'manage_events']
    },
    manager: {
      name: 'Manager',
      level: 60,
      icon: FaUserTie,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      permissions: ['manage_projects', 'manage_events']
    },
    volunteer_coordinator: {
      name: 'Coordinator',
      level: 50,
      icon: FaUserGraduate,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      permissions: ['manage_volunteers', 'schedule_events']
    },
    member: {
      name: 'Member',
      level: 20,
      icon: FiUser,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      permissions: ['view_projects', 'view_events']
    },
    volunteer: {
      name: 'Volunteer',
      level: 30,
      icon: FiUsers,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      permissions: ['view_projects', 'view_events', 'attend_events']
    },
    donor: {
      name: 'Donor',
      level: 25,
      icon: FiAward,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      permissions: ['view_projects', 'view_impact', 'donate']
    }
  };

  // Departments
  const departments = [
    'All',
    'Administration',
    'Education',
    'Healthcare',
    'Women Empowerment',
    'Environment',
    'Fundraising',
    'Communications',
    'HR',
    'Finance',
    'Events',
    'Field Operations',
    'Volunteer Management'
  ];

  useEffect(() => {
    // Check current user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setCurrentUser(parsed);
    } else {
      toast.error('Please login to access this page');
      navigate('/login');
    }

    // Load mock users data
    loadMockUsers();
  }, [navigate]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRole, selectedDepartment, selectedStatus]);

  const loadMockUsers = () => {
    // Mock users data
    const mockUsers = [
      {
        id: 1,
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@rtngo.org',
        phone: '+91 94878 14418',
        role: 'super_admin',
        department: 'Administration',
        status: 'active',
        joinDate: '2022-01-15',
        lastActive: '2024-02-20',
        profileImage: null,
        location: 'Chennai',
        volunteerHours: 450,
        eventsAttended: 32,
        donations: 25000,
        bio: 'Founder and Director with 20 years of experience in social work.',
        dateOfBirth: '1975-05-15',
        gender: 'Male',
        bloodGroup: 'O+',
        address: {
          street: '45 NGO Colony',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600001',
          country: 'India'
        },
        occupation: 'Social Worker',
        organization: 'Raavana Thalaigal Trust',
        membershipId: 'RT001',
        membershipType: 'Founder',
        socialLinks: {
          facebook: 'https://facebook.com/rajesh.kumar',
          twitter: 'https://twitter.com/rajesh_k',
          linkedin: 'https://linkedin.com/in/rajeshkumar',
          instagram: 'https://instagram.com/rajesh.k'
        },
        interests: ['Education', 'Healthcare', 'Environment'],
        skills: ['Leadership', 'Fundraising', 'Project Management']
      },
      {
        id: 2,
        name: 'Priya Sharma',
        email: 'priya.sharma@rtngo.org',
        phone: '+91 87654 32109',
        role: 'admin',
        department: 'Education',
        status: 'active',
        joinDate: '2022-03-10',
        lastActive: '2024-02-19',
        profileImage: null,
        location: 'Mumbai',
        volunteerHours: 320,
        eventsAttended: 28,
        donations: 15000,
        bio: 'Education program manager passionate about child literacy.',
        dateOfBirth: '1988-08-22',
        gender: 'Female',
        bloodGroup: 'B+',
        address: {
          street: '23 Lake View Apartments',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India'
        },
        occupation: 'Program Manager',
        organization: 'Raavana Thalaigal Trust',
        membershipId: 'RT002',
        membershipType: 'Staff',
        socialLinks: {
          facebook: 'https://facebook.com/priya.sharma',
          twitter: 'https://twitter.com/priya_s',
          linkedin: 'https://linkedin.com/in/priyasharma',
          instagram: 'https://instagram.com/priya.sharma'
        },
        interests: ['Education', 'Child Welfare', 'Skill Development'],
        skills: ['Teaching', 'Curriculum Development', 'Team Management']
      },
      {
        id: 3,
        name: 'Amit Patel',
        email: 'amit.patel@rtngo.org',
        phone: '+91 76543 21098',
        role: 'manager',
        department: 'Healthcare',
        status: 'active',
        joinDate: '2022-06-20',
        lastActive: '2024-02-18',
        profileImage: null,
        location: 'Ahmedabad',
        volunteerHours: 280,
        eventsAttended: 22,
        donations: 10000,
        bio: 'Healthcare initiative lead, coordinating medical camps.',
        dateOfBirth: '1985-11-30',
        gender: 'Male',
        bloodGroup: 'A+',
        address: {
          street: '12 Medical Complex',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pincode: '380001',
          country: 'India'
        },
        occupation: 'Healthcare Coordinator',
        organization: 'Raavana Thalaigal Trust',
        membershipId: 'RT003',
        membershipType: 'Staff',
        socialLinks: {
          facebook: 'https://facebook.com/amit.patel',
          twitter: 'https://twitter.com/amit_p',
          linkedin: 'https://linkedin.com/in/amitpatel',
          instagram: 'https://instagram.com/amit.patel'
        },
        interests: ['Healthcare', 'Public Health', 'First Aid'],
        skills: ['Medical Camp Organization', 'Health Education', 'First Aid']
      },
      {
        id: 4,
        name: 'Sunita Reddy',
        email: 'sunita.reddy@rtngo.org',
        phone: '+91 65432 10987',
        role: 'volunteer_coordinator',
        department: 'Volunteer Management',
        status: 'active',
        joinDate: '2022-08-05',
        lastActive: '2024-02-20',
        profileImage: null,
        location: 'Hyderabad',
        volunteerHours: 520,
        eventsAttended: 45,
        donations: 5000,
        bio: 'Coordinating volunteers across all projects.',
        dateOfBirth: '1990-03-18',
        gender: 'Female',
        bloodGroup: 'AB+',
        address: {
          street: '78 Cyber Heights',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500001',
          country: 'India'
        },
        occupation: 'Volunteer Coordinator',
        organization: 'Raavana Thalaigal Trust',
        membershipId: 'RT004',
        membershipType: 'Staff',
        socialLinks: {
          facebook: 'https://facebook.com/sunita.reddy',
          twitter: 'https://twitter.com/sunita_r',
          linkedin: 'https://linkedin.com/in/sunitareddy',
          instagram: 'https://instagram.com/sunita.reddy'
        },
        interests: ['Volunteer Management', 'Community Development'],
        skills: ['Communication', 'Scheduling', 'Team Building']
      },
      {
        id: 5,
        name: 'Vikram Singh',
        email: 'vikram.singh@rtngo.org',
        phone: '+91 54321 09876',
        role: 'member',
        department: 'Education',
        status: 'active',
        joinDate: '2023-01-12',
        lastActive: '2024-02-15',
        profileImage: null,
        location: 'Jaipur',
        volunteerHours: 120,
        eventsAttended: 8,
        donations: 2000,
        bio: 'Regular member supporting education initiatives.',
        dateOfBirth: '1992-07-07',
        gender: 'Male',
        bloodGroup: 'B-',
        address: {
          street: '34 Pink City Apartments',
          city: 'Jaipur',
          state: 'Rajasthan',
          pincode: '302001',
          country: 'India'
        },
        occupation: 'Teacher',
        organization: 'Public School',
        membershipId: 'RT005',
        membershipType: 'Regular Member',
        socialLinks: {
          facebook: 'https://facebook.com/vikram.singh',
          twitter: 'https://twitter.com/vikram_s',
          linkedin: 'https://linkedin.com/in/vikramsingh',
          instagram: 'https://instagram.com/vikram.singh'
        },
        interests: ['Education', 'Teaching'],
        skills: ['Teaching', 'Mentoring', 'Communication']
      },
      {
        id: 6,
        name: 'Anjali Desai',
        email: 'anjali.desai@rtngo.org',
        phone: '+91 43210 98765',
        role: 'volunteer',
        department: 'Environment',
        status: 'active',
        joinDate: '2023-03-18',
        lastActive: '2024-02-17',
        profileImage: null,
        location: 'Pune',
        volunteerHours: 180,
        eventsAttended: 15,
        donations: 0,
        bio: 'Environmental volunteer passionate about tree plantation.',
        dateOfBirth: '1995-09-25',
        gender: 'Female',
        bloodGroup: 'O-',
        address: {
          street: '56 Green Park',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
          country: 'India'
        },
        occupation: 'Environmentalist',
        organization: 'Green Earth Society',
        membershipId: 'RT006',
        membershipType: 'Volunteer',
        socialLinks: {
          facebook: 'https://facebook.com/anjali.desai',
          twitter: 'https://twitter.com/anjali_d',
          linkedin: 'https://linkedin.com/in/anjalidesai',
          instagram: 'https://instagram.com/anjali.desai'
        },
        interests: ['Environment', 'Tree Plantation', 'Wildlife'],
        skills: ['Gardening', 'Awareness Campaigns', 'Event Organization']
      },
      {
        id: 7,
        name: 'Rajiv Mehta',
        email: 'rajiv.mehta@rtngo.org',
        phone: '+91 32109 87654',
        role: 'donor',
        department: 'Fundraising',
        status: 'active',
        joinDate: '2023-05-22',
        lastActive: '2024-02-10',
        profileImage: null,
        location: 'Delhi',
        volunteerHours: 50,
        eventsAttended: 12,
        donations: 50000,
        bio: 'Major donor supporting multiple projects.',
        dateOfBirth: '1980-12-12',
        gender: 'Male',
        bloodGroup: 'A-',
        address: {
          street: '101 Corporate Tower',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          country: 'India'
        },
        occupation: 'Businessman',
        organization: 'Mehta Industries',
        membershipId: 'RT007',
        membershipType: 'Patron',
        socialLinks: {
          facebook: 'https://facebook.com/rajiv.mehta',
          twitter: 'https://twitter.com/rajiv_m',
          linkedin: 'https://linkedin.com/in/rajivmehta',
          instagram: 'https://instagram.com/rajiv.mehta'
        },
        interests: ['Philanthropy', 'Education', 'Healthcare'],
        skills: ['Business', 'Networking', 'Fundraising']
      },
      {
        id: 8,
        name: 'Kavita Nair',
        email: 'kavita.nair@rtngo.org',
        phone: '+91 21098 76543',
        role: 'member',
        department: 'Women Empowerment',
        status: 'inactive',
        joinDate: '2023-07-30',
        lastActive: '2024-01-05',
        profileImage: null,
        location: 'Kochi',
        volunteerHours: 80,
        eventsAttended: 5,
        donations: 1000,
        bio: 'Supporting women empowerment programs.',
        dateOfBirth: '1987-04-04',
        gender: 'Female',
        bloodGroup: 'AB-',
        address: {
          street: '22 Beach Road',
          city: 'Kochi',
          state: 'Kerala',
          pincode: '682001',
          country: 'India'
        },
        occupation: 'Counselor',
        organization: 'Women\'s Helpline',
        membershipId: 'RT008',
        membershipType: 'Regular Member',
        socialLinks: {
          facebook: 'https://facebook.com/kavita.nair',
          twitter: 'https://twitter.com/kavita_n',
          linkedin: 'https://linkedin.com/in/kavitanair',
          instagram: 'https://instagram.com/kavita.nair'
        },
        interests: ['Women Empowerment', 'Counseling'],
        skills: ['Counseling', 'Communication', 'Empathy']
      },
      {
        id: 9,
        name: 'Suresh Iyer',
        email: 'suresh.iyer@rtngo.org',
        phone: '+91 10987 65432',
        role: 'admin',
        department: 'Communications',
        status: 'active',
        joinDate: '2022-11-11',
        lastActive: '2024-02-19',
        profileImage: null,
        location: 'Chennai',
        volunteerHours: 290,
        eventsAttended: 25,
        donations: 8000,
        bio: 'Managing communications and social media.',
        dateOfBirth: '1983-10-10',
        gender: 'Male',
        bloodGroup: 'O+',
        address: {
          street: '67 Media House',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600002',
          country: 'India'
        },
        occupation: 'Communications Manager',
        organization: 'Raavana Thalaigal Trust',
        membershipId: 'RT009',
        membershipType: 'Staff',
        socialLinks: {
          facebook: 'https://facebook.com/suresh.iyer',
          twitter: 'https://twitter.com/suresh_i',
          linkedin: 'https://linkedin.com/in/sureshiyer',
          instagram: 'https://instagram.com/suresh.iyer'
        },
        interests: ['Media', 'Communications', 'Social Media'],
        skills: ['Content Writing', 'Social Media', 'Photography']
      },
      {
        id: 10,
        name: 'Meera Krishnan',
        email: 'meera.krishnan@rtngo.org',
        phone: '+91 19876 54321',
        role: 'volunteer_coordinator',
        department: 'Events',
        status: 'active',
        joinDate: '2022-09-14',
        lastActive: '2024-02-20',
        profileImage: null,
        location: 'Bangalore',
        volunteerHours: 380,
        eventsAttended: 35,
        donations: 3000,
        bio: 'Organizing fundraising and community events.',
        dateOfBirth: '1991-06-06',
        gender: 'Female',
        bloodGroup: 'B+',
        address: {
          street: '89 Garden City',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
          country: 'India'
        },
        occupation: 'Event Coordinator',
        organization: 'Raavana Thalaigal Trust',
        membershipId: 'RT010',
        membershipType: 'Staff',
        socialLinks: {
          facebook: 'https://facebook.com/meera.krishnan',
          twitter: 'https://twitter.com/meera_k',
          linkedin: 'https://linkedin.com/in/meerakrishnan',
          instagram: 'https://instagram.com/meera.krishnan'
        },
        interests: ['Event Management', 'Fundraising'],
        skills: ['Event Planning', 'Coordination', 'Public Speaking']
      }
    ];

    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
    setLoading(false);
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm) ||
        user.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Department filter
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(user => user.department === selectedDepartment);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setPopupMode('view');
    setShowPopup(true);
  };

  const handleAddUser = () => {
    if (!canEdit()) {
      toast.error('You do not have permission to add users');
      return;
    }
    setSelectedUser(null);
    setPopupMode('add');
    setShowPopup(true);
  };

  const handleEditUser = (user) => {
    if (!canEdit()) {
      toast.error('You do not have permission to edit users');
      return;
    }
    setSelectedUser(user);
    setPopupMode('edit');
    setShowPopup(true);
  };

  const handleDeleteUser = (user) => {
    if (!canDelete()) {
      toast.error('Only Super Admin can delete users');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      const updatedUsers = users.filter(u => u.id !== user.id);
      setUsers(updatedUsers);
      toast.success('User deleted successfully');
    }
  };

  const handleSaveUser = (userData) => {
    if (popupMode === 'add') {
      // Add new user
      const newUser = {
        ...userData,
        id: Date.now(),
        joinDate: new Date().toISOString().split('T')[0],
        lastActive: new Date().toISOString().split('T')[0],
        volunteerHours: userData.volunteerHours || 0,
        eventsAttended: userData.eventsAttended || 0,
        donations: userData.donations || 0
      };
      setUsers(prev => [...prev, newUser]);
      toast.success('New member added successfully!');
    } else if (popupMode === 'edit') {
      // Update existing user
      const updatedUsers = users.map(u => 
        u.id === userData.id ? { ...u, ...userData } : u
      );
      setUsers(updatedUsers);
      toast.success('Member details updated successfully!');
    }
    
    setShowPopup(false);
    setSelectedUser(null);
  };

  const toggleUserStatus = (user) => {
    if (!canEdit()) {
      toast.error('You do not have permission to change user status');
      return;
    }

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const updatedUsers = users.map(u => 
      u.id === user.id ? { ...u, status: newStatus } : u
    );

    setUsers(updatedUsers);
    toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
  };

  const exportUsers = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Role', 'Department', 'Status', 'Join Date', 'Last Active', 'Location', 'Volunteer Hours', 'Events', 'Donations'],
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.phone,
        user.role,
        user.department,
        user.status,
        user.joinDate,
        user.lastActive,
        user.location || '',
        user.volunteerHours || 0,
        user.eventsAttended || 0,
        user.donations || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Users exported successfully');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleIcon = (roleName) => {
    const role = roles[roleName] || roles.member;
    const IconComponent = role.icon;
    return <IconComponent className={`${role.color}`} size={18} />;
  };

  // Permission checks
  const canEdit = () => {
    return currentUser?.role === 'super_admin' || currentUser?.role === 'admin';
  };

  const canDelete = () => {
    return currentUser?.role === 'super_admin';
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (loading) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-gray-50">
        <div className="container-custom">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <CommonLoader className="mb-4" />
              <p className="text-gray-600">Loading members...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Family</h1>
            <p className="text-gray-600">
              Connect with all members, volunteers, and staff of Raavana Thalaigal Trust
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={exportUsers}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <FiDownload className="mr-2" />
              Export Directory
            </button>
            {canEdit() && (
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
              >
                <FiUserPlus className="mr-2" />
                Add Member
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards - Everyone can see */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
            <div className="text-sm text-gray-600">Total Members</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}
            </div>
            <div className="text-sm text-gray-600">Leadership</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === 'volunteer' || u.role === 'volunteer_coordinator').length}
            </div>
            <div className="text-sm text-gray-600">Volunteers</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-indigo-600">
              {users.filter(u => u.role === 'member').length}
            </div>
            <div className="text-sm text-gray-600">Members</div>
          </div>
        </div>

        {/* Filters - Everyone can use */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
              >
                <option value="all">All Roles</option>
                {Object.entries(roles).map(([key, role]) => (
                  <option key={key} value={key}>{role.name}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept === 'All' ? 'all' : dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex justify-end mt-4">
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 flex items-center ${
                  viewMode === 'grid' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiGrid className="mr-2" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 flex items-center ${
                  viewMode === 'list' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiList className="mr-2" />
                List
              </button>
            </div>
          </div>
        </div>

        {/* Users Display - Everyone can view */}
        {viewMode === 'grid' ? (
          // Grid View - 3 columns per row
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentUsers.map(user => {
              const role = roles[user.role] || roles.member;
              const RoleIcon = role.icon;
              
              return (
                <div key={user.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className={`h-2 ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          {user.profileImage ? (
                            <img 
                              src={user.profileImage} 
                              alt={user.name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <span className="text-xl font-bold text-primary-600">
                              {user.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="ml-3">
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <RoleIcon className={`${role.color}`} size={20} />
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <FiPhone className="text-gray-400 mr-2" size={14} />
                        <span className="text-gray-700">{user.phone}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <FiMapPin className="text-gray-400 mr-2" size={14} />
                        <span className="text-gray-700">{user.location || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <FiCalendar className="text-gray-400 mr-2" size={14} />
                        <span className="text-gray-700">Joined {formatDate(user.joinDate)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${role.bgColor} ${role.color}`}>
                        {role.name}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {user.department}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center mb-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{user.volunteerHours}</div>
                        <div className="text-xs text-gray-500">Hours</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{user.eventsAttended}</div>
                        <div className="text-xs text-gray-500">Events</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">₹{user.donations}</div>
                        <div className="text-xs text-gray-500">Donated</div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      {/* View button - Everyone can see */}
                      <button
                        onClick={() => handleViewUser(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        data-tooltip="View Details" aria-label="View details"
                      >
                        <FiEye size={18} />
                      </button>
                      
                      {/* Status toggle - Only admins */}
                      {canEdit() && (
                        <button
                          onClick={() => toggleUserStatus(user)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.status === 'active'
                              ? 'text-orange-600 hover:bg-orange-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          data-tooltip={user.status === 'active' ? 'Deactivate' : 'Activate'} aria-label={user.status === 'active' ? 'Deactivate user' : 'Activate user'}
                        >
                          {user.status === 'active' ? <FiLock size={18} /> : <FiUnlock size={18} />}
                        </button>
                      )}
                      
                      {/* Edit button - Only admins */}
                      {canEdit() && (
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          data-tooltip="Edit User" aria-label="Edit user"
                        >
                          <FiEdit2 size={18} />
                        </button>
                      )}
                      
                      {/* Delete button - Only super admin */}
                      {canDelete() && user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          data-tooltip="Delete User" aria-label="Delete user"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List View - Everyone can view
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRoleIcon(user.role)}
                        <span className="ml-2 text-sm text-gray-900">
                          {roles[user.role]?.name || user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{user.department}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.joinDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* View button - Everyone can see */}
                      <button
                        onClick={() => handleViewUser(user)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        data-tooltip="View Details" aria-label="View details"
                      >
                        <FiEye size={16} />
                      </button>
                      
                      {/* Status toggle - Only admins */}
                      {canEdit() && (
                        <button
                          onClick={() => toggleUserStatus(user)}
                          className={`mr-3 ${
                            user.status === 'active'
                              ? 'text-orange-600 hover:text-orange-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          data-tooltip={user.status === 'active' ? 'Deactivate' : 'Activate'} aria-label={user.status === 'active' ? 'Deactivate user' : 'Activate user'}
                        >
                          {user.status === 'active' ? <FiLock size={16} /> : <FiUnlock size={16} />}
                        </button>
                      )}
                      
                      {/* Edit button - Only admins */}
                      {canEdit() && (
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-green-600 hover:text-green-900 mr-3"
                          data-tooltip="Edit User" aria-label="Edit user"
                        >
                          <FiEdit2 size={16} />
                        </button>
                      )}
                      
                      {/* Delete button - Only super admin */}
                      {canDelete() && user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-900"
                          data-tooltip="Delete User" aria-label="Delete user"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50"
              >
                <FiChevronLeft />
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === i + 1
                      ? 'bg-primary-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50"
              >
                <FiChevronRight />
              </button>
            </nav>
          </div>
        )}

        {/* Common Popup for View/Add/Edit */}
        {showPopup && (
          <UserPopup
            mode={popupMode}
            user={selectedUser}
            onClose={() => {
              setShowPopup(false);
              setSelectedUser(null);
            }}
            onSave={handleSaveUser}
            currentUser={currentUser}
          />
        )}
      </div>
    </div>
  );
};

export default UserGroupPage;