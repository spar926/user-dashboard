import type { User } from '../lib/api';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onReplace: (user: User) => void;
  onDelete: (id: string) => void;
}

export default function UserList({ users, onEdit, onReplace, onDelete }: UserListProps) {
  if (users.length === 0) {
    return <p>No users found.</p>;
  }

  return (
    <table style={{ 
      width: '100%', 
      borderCollapse: 'collapse', 
      marginTop: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <thead>
        <tr style={{ backgroundColor: '#2c3e50' }}>
          <th style={{ 
            border: '1px solid #34495e', 
            padding: '15px 12px', 
            textAlign: 'left',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>Name</th>
          <th style={{ 
            border: '1px solid #34495e', 
            padding: '15px 12px', 
            textAlign: 'left',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>Email</th>
          <th style={{ 
            border: '1px solid #34495e', 
            padding: '15px 12px', 
            textAlign: 'left',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>Role</th>
          <th style={{ 
            border: '1px solid #34495e', 
            padding: '15px 12px', 
            textAlign: 'left',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user, index) => (
          <tr key={user.id} style={{
            backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa'
          }}>
            <td style={{ 
              border: '1px solid #dee2e6', 
              padding: '12px', 
              color: '#2c3e50',
              fontWeight: '500'
            }}>{user.name}</td>
            <td style={{ 
              border: '1px solid #dee2e6', 
              padding: '12px', 
              color: '#495057'
            }}>{user.email}</td>
            <td style={{ 
              border: '1px solid #dee2e6', 
              padding: '12px' 
            }}>
              <span style={{
                padding: '4px 12px',
                borderRadius: '20px',
                backgroundColor: user.role === 'admin' ? '#ffc107' : '#007bff',
                color: user.role === 'admin' ? '#212529' : 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {user.role}
              </span>
            </td>
            <td style={{ 
              border: '1px solid #dee2e6', 
              padding: '12px' 
            }}>
              <button
                onClick={() => onEdit(user)}
                style={{ 
                  marginRight: '6px', 
                  padding: '6px 10px', 
                  backgroundColor: '#17a2b8', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}
              >
                Edit
              </button>
              <button
                onClick={() => onReplace(user)}
                style={{ 
                  marginRight: '6px', 
                  padding: '6px 10px', 
                  backgroundColor: '#6f42c1', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}
              >
                Replace
              </button>
              <button
                onClick={() => onDelete(user.id)}
                style={{ 
                  padding: '6px 10px', 
                  backgroundColor: '#dc3545', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
