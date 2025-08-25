import { useEffect, useState } from 'react';
import { getUsers, createUser, updateUser, replaceUser, deleteUser } from './lib/api';
import type { User, CreateUserRequest, UpdateUserRequest, ReplaceUserRequest } from './lib/api';
import UserForm from './components/UserForm';
import UserList from './components/UserList';
import './App.css';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [isReplaceMode, setIsReplaceMode] = useState(false);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setError('');
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } 
  };

  const handleCreateUser = async (userData: CreateUserRequest) => {
    try {
      setError(''); // Clear any previous errors
      const newUser = await createUser(userData);
      setUsers([...users, newUser]);
      setShowForm(false);
      setSuccess(`User "${newUser.name}" created successfully!`);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      setSuccess(''); // Clear any success message
    }
  };

  const handleUpdateUser = async (userData: UpdateUserRequest) => {
    if (!editingUser) return;
    
    try {
      setError(''); // Clear any previous errors
      const updatedUser = await updateUser(editingUser.id, userData);
      setUsers(users.map(user => user.id === editingUser.id ? updatedUser : user));
      setEditingUser(undefined);
      setShowForm(false);
      setSuccess(`User "${updatedUser.name}" updated successfully!`);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      setSuccess(''); // Clear any success message
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    const userToDelete = users.find(user => user.id === id);
    try {
      setError(''); // Clear any previous errors
      await deleteUser(id);
      setUsers(users.filter(user => user.id !== id));
      setSuccess(`User "${userToDelete?.name || 'Unknown'}" deleted successfully!`);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      setSuccess(''); // Clear any success message
    }
  };

  const handleReplaceUser = async (userData: ReplaceUserRequest) => {
    if (!editingUser) return;
    
    try {
      setError(''); // Clear any previous errors
      const replacedUser = await replaceUser(editingUser.id, userData);
      setUsers(users.map(user => user.id === editingUser.id ? replacedUser : user));
      setEditingUser(undefined);
      setIsReplaceMode(false);
      setShowForm(false);
      setSuccess(`User "${replacedUser.name}" replaced successfully!`);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to replace user');
      setSuccess(''); // Clear any success message
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsReplaceMode(false);
    setShowForm(true);
  };

  const handleReplace = (user: User) => {
    setEditingUser(user);
    setIsReplaceMode(true);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(undefined);
    setIsReplaceMode(false);
  };

  // Unified submit handler to match UserForm's onSubmit type
  const handleFormSubmit = (data: CreateUserRequest | UpdateUserRequest | ReplaceUserRequest) => {
    if (!editingUser) {
      // Create mode
      handleCreateUser(data as CreateUserRequest);
    } else if (isReplaceMode) {
      // Replace mode
      handleReplaceUser(data as ReplaceUserRequest);
    } else {
      // Update mode
      handleUpdateUser(data as UpdateUserRequest);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>🌱 User Dashboard 👥</h1>
      
      {error && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', marginBottom: '20px', borderRadius: '4px' }}>
          Error: {error}
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: '#e8f5e8', color: '#2e7d32', padding: '10px', marginBottom: '20px', borderRadius: '4px' }}>
          ✅ {success}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowForm(true)}
          disabled={showForm}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#4caf50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: showForm ? 'not-allowed' : 'pointer',
            opacity: showForm ? 0.5 : 1
          }}
        >
          Add New User
        </button>
      </div>

      {showForm && (
        <UserForm
          user={editingUser}
          isReplaceMode={isReplaceMode}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      )}

        <>
          <h2>User Count: {users.length}</h2>
          <UserList
            users={users}
            onEdit={handleEdit}
            onReplace={handleReplace}
            onDelete={handleDeleteUser}
          />
        </>
    </div>
  );
}

export default App;