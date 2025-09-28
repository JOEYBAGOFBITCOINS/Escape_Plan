import React, { useState } from 'react';
import { ArrowLeft, UserPlus, Download, Users, BarChart3, Mail, Shield, FileText, Trash2, CheckCircle } from 'lucide-react';
import { GlassmorphicButton } from './GlassmorphicButton';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { User, FuelEntry } from '../App';

interface AdminPanelProps {
  users: User[];
  fuelEntries: FuelEntry[];
  onAddUser: (userData: Omit<User, 'id' | 'createdAt'>) => User;
  onBack: () => void;
  onLogout: () => void;
}

type AdminView = 'overview' | 'addUser' | 'manageUsers' | 'fuelEntries' | 'reports';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  users,
  fuelEntries,
  onAddUser,
  onBack,
  onLogout
}) => {
  const [activeView, setActiveView] = useState<AdminView>('overview');
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    name: '',
    role: 'porter' as 'porter' | 'admin'
  });
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Calculate statistics
  const totalUsers = users.length;
  const porterUsers = users.filter(u => u.role === 'porter').length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const totalEntries = fuelEntries.length;
  const totalCost = fuelEntries.reduce((sum, entry) => sum + entry.fuelCost, 0);
  const thisMonthEntries = fuelEntries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    const now = new Date();
    return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUserForm.email.trim() || !newUserForm.name.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!newUserForm.email.toLowerCase().includes('@napleton.com')) {
      toast.error('Email must be a Napleton domain address');
      return;
    }

    // Check if user already exists
    if (users.some(u => u.email.toLowerCase() === newUserForm.email.toLowerCase())) {
      toast.error('User with this email already exists');
      return;
    }

    setIsAddingUser(true);

    // Simulate API call
    setTimeout(() => {
      const newUser = onAddUser(newUserForm);
      
      if (newUser) {
        toast.success(`User ${newUser.name} added successfully!`);
        setNewUserForm({ email: '', name: '', role: 'porter' });
        setActiveView('overview');
      }
      
      setIsAddingUser(false);
    }, 1500);
  };

  const handleExportData = (format: 'csv' | 'excel') => {
    // Simulate export
    toast.info(`Preparing ${format.toUpperCase()} export...`);
    
    setTimeout(() => {
      // In a real app, this would generate and download the file
      const filename = `fuel-entries-${new Date().toISOString().split('T')[0]}.${format}`;
      toast.success(`Export ready: ${filename}`);
    }, 2000);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mr-2">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-slate-300 text-sm">Total Users</span>
          </div>
          <p className="text-white text-2xl font-medium">{totalUsers}</p>
          <p className="text-slate-400 text-xs">{porterUsers} porters, {adminUsers} admins</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-2">
              <FileText className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-slate-300 text-sm">Total Entries</span>
          </div>
          <p className="text-white text-2xl font-medium">{totalEntries}</p>
          <p className="text-slate-400 text-xs">{thisMonthEntries.length} this month</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mr-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-slate-300 text-sm">Total Cost</span>
          </div>
          <p className="text-white text-2xl font-medium">${totalCost.toFixed(0)}</p>
          <p className="text-slate-400 text-xs">all time</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center mr-2">
              <CheckCircle className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-slate-300 text-sm">This Month</span>
          </div>
          <p className="text-white text-2xl font-medium">{thisMonthEntries.length}</p>
          <p className="text-slate-400 text-xs">
            ${thisMonthEntries.reduce((sum, entry) => sum + entry.fuelCost, 0).toFixed(0)} spent
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
        <h3 className="text-white text-lg mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <GlassmorphicButton
            variant="primary"
            onClick={() => setActiveView('addUser')}
            className="w-full"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Add New User
          </GlassmorphicButton>
          
          <div className="grid grid-cols-2 gap-3">
            <GlassmorphicButton
              variant="secondary"
              onClick={() => handleExportData('csv')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </GlassmorphicButton>
            
            <GlassmorphicButton
              variant="secondary"
              onClick={() => handleExportData('excel')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </GlassmorphicButton>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
        <h3 className="text-white text-lg mb-4">Recent Fuel Entries</h3>
        {fuelEntries.length > 0 ? (
          <div className="space-y-3">
            {fuelEntries.slice(0, 5).map((entry, index) => (
              <div key={index} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                <div>
                  <p className="text-white text-sm">
                    {entry.stockNumber || (entry.vin === 'VIN_FROM_PHOTO' ? 'VIN from Photo' : `VIN: ${entry.vin?.slice(-6)}`)}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {entry.userName} • {new Date(entry.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm">${entry.fuelCost.toFixed(2)}</p>
                  <p className="text-slate-400 text-xs">{entry.fuelAmount} gal</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-4">No fuel entries yet</p>
        )}
      </div>
    </div>
  );

  const renderAddUser = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-white text-xl mb-2">Add New User</h3>
        <p className="text-slate-300/80">
          Invite a new team member to use FuelTrakr
        </p>
      </div>

      <form onSubmit={handleAddUser} className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
        <div className="space-y-4">
          <div>
            <label className="text-white text-sm font-medium mb-2 block flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Email Address *
            </label>
            <Input
              type="email"
              value={newUserForm.email}
              onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="name@napleton.com"
              className="bg-white/5 border-white/20 text-white placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20"
              required
            />
            <p className="text-slate-400 text-xs mt-1">Must be a Napleton domain email</p>
          </div>

          <div>
            <label className="text-white text-sm font-medium mb-2 block flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Full Name *
            </label>
            <Input
              type="text"
              value={newUserForm.name}
              onChange={(e) => setNewUserForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="John Doe"
              className="bg-white/5 border-white/20 text-white placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20"
              required
            />
          </div>

          <div>
            <label className="text-white text-sm font-medium mb-2 block flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Role *
            </label>
            <Select 
              value={newUserForm.role} 
              onValueChange={(value: 'porter' | 'admin') => setNewUserForm(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-blue-400/50 focus:ring-blue-400/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="porter">Porter</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-slate-400 text-xs mt-1">
              {newUserForm.role === 'admin' 
                ? 'Full access to admin panel and all entries' 
                : 'Can create and view their own fuel entries'
              }
            </p>
          </div>
        </div>

        <div className="mt-6">
          <GlassmorphicButton
            variant="primary"
            size="large"
            className="w-full"
          >
            {isAddingUser ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Adding User...
              </div>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                Add User
              </>
            )}
          </GlassmorphicButton>
        </div>
      </form>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-white text-xl mb-2">Manage Users</h3>
        <p className="text-slate-300/80">
          View and manage all FuelTrakr users
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-white font-medium">All Users ({users.length})</h4>
          <GlassmorphicButton
            variant="secondary"
            onClick={() => setActiveView('addUser')}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </GlassmorphicButton>
        </div>
        
        <div className="space-y-3">
          {users.map((user, index) => (
            <div key={user.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    user.role === 'admin' ? 'bg-purple-500/20' : 'bg-blue-500/20'
                  }`}>
                    {user.role === 'admin' ? (
                      <Shield className="w-5 h-5 text-purple-400" />
                    ) : (
                      <Users className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-white font-medium">{user.name}</h5>
                    <p className="text-slate-400 text-sm">{user.email}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {user.role === 'admin' ? 'Admin' : 'Porter'}
                  </span>
                  <p className="text-slate-500 text-xs mt-1">
                    Added {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {/* User's fuel entries count */}
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Fuel Entries:</span>
                  <span className="text-white">
                    {fuelEntries.filter(entry => entry.userId === user.id).length}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <button
            onClick={onBack}
            className="flex items-center text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-white text-lg font-medium">Admin Panel</h1>
          <button
            onClick={onLogout}
            className="text-slate-400 hover:text-white transition-colors text-sm"
          >
            Logout
          </button>
        </div>

        {/* Navigation */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex space-x-2 overflow-x-auto">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                activeView === 'overview'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30'
                  : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('addUser')}
              className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                activeView === 'addUser'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30'
                  : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              Add User
            </button>
            <button
              onClick={() => setActiveView('manageUsers')}
              className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                activeView === 'manageUsers'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30'
                  : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              Users
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {activeView === 'overview' && renderOverview()}
          {activeView === 'addUser' && renderAddUser()}
          {activeView === 'manageUsers' && renderUserManagement()}
        </div>
      </div>
    </div>
  );
};