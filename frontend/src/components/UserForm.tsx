import { useState } from "react";
import type { User, CreateUserRequest, UpdateUserRequest, ReplaceUserRequest } from "../lib/api";

interface UserFormProps {
    user?: User;
    isReplaceMode?: boolean;
    onSubmit: (data: CreateUserRequest | UpdateUserRequest | ReplaceUserRequest) => void;
    onCancel: () => void;
}

export default function UserForm({ user, isReplaceMode, onSubmit, onCancel }: UserFormProps) {
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [role, setRole] = useState<'user' | 'admin'>(user?.role || 'user');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // For edit mode, only send fields that have values
        if (user && !isReplaceMode) {
            const updates: UpdateUserRequest = {};
            if (name.trim()) updates.name = name.trim();
            if (email.trim()) updates.email = email.trim();
            if (role) updates.role = role;
            onSubmit(updates);
        } else if (user && isReplaceMode) {
            // Replace mode - send all fields as ReplaceUserRequest
            const replaceData: ReplaceUserRequest = {
                name: name.trim(),
                email: email.trim(),
                role: role
            };
            onSubmit(replaceData);
        } else {
            // Create mode - send as CreateUserRequest
            const createData: CreateUserRequest = {
                name: name.trim(),
                email: email.trim(),
                role: role || 'user' // Default to 'user' if role is somehow undefined
            };
            onSubmit(createData);
        }
    };

    const isEditing = user && !isReplaceMode;
    const formTitle = user 
        ? (isReplaceMode ? 'Replace User (All Fields Required)' : 'Edit User (Optional Fields)')
        : 'Create User';
    const buttonText = user 
        ? (isReplaceMode ? 'Replace' : 'Update')
        : 'Create';

    return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '20px', margin: '20px 0' }}>
      <h3>{formTitle}</h3>
      {isEditing && (
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
          💡 Leave fields empty to keep current values
        </p>
      )}
      
      <div style={{ marginBottom: '10px' }}>
        <label>Name{!isEditing ? ' *' : ''}:</label><br />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required={!isEditing}
          placeholder={isEditing ? 'Leave empty to keep current name' : ''}
          style={{ width: '200px', padding: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Email{!isEditing ? ' *' : ''}:</label><br />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required={!isEditing}
          placeholder={isEditing ? 'Leave empty to keep current email' : ''}
          style={{ width: '200px', padding: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Role:</label><br />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
          style={{ width: '200px', padding: '5px' }}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div>
        <button type="submit" style={{ marginRight: '10px', padding: '5px 15px' }}>
          {buttonText}
        </button>
        <button type="button" onClick={onCancel} style={{ padding: '5px 15px' }}>
          Cancel
        </button>
      </div>
    </form>
  );

}