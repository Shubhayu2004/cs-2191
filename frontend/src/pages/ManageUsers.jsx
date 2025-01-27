import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/ManageUsers.css';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/users`, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.data && Array.isArray(response.data)) {
                    setUsers(response.data);
                } else {
                    setError('Invalid data received from server');
                }
            } catch (error) {
                setError(error.message);
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchUsers();
        }
    }, [token]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.put(`http://localhost:4000/update-role/${userId}`, 
                { role: newRole }, 
                {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            setUsers(users.map(user => 
                user._id === userId ? { ...user, status: newRole } : user
            ));
        } catch (error) {
            console.error('Error updating user role:', error);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!users.length) return <div>No users found</div>;

    return (
        <div className="manage-users-container">
            <h1>Manage Users</h1>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user.fullname?.firstname} {user.fullname?.lastname}</td>
                            <td>{user.email}</td>
                            <td>{user.status}</td>
                            <td>
                                <select
                                    value={user.status}
                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                >
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                    <option value="chairman">Chairman</option>
                                    <option value="convenor">Convenor</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageUsers;