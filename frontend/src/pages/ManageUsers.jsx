import React, { useEffect, useState } from 'react';
import axiosInstance from '../axios.config';
import { useAuth } from '../context/UserContext';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                console.log('Token:', localStorage.getItem('token'));
                const response = await axiosInstance.get('/users/users');
                if (response.data && Array.isArray(response.data)) {
                    setUsers(response.data);
                } else {
                    setError('Invalid data received from server');
                }
            } catch (error) {
                console.log('Request headers:', error.config?.headers);
                console.log('Response status:', error.response?.status);
                console.log('Response data:', error.response?.data);
                setError(error.response?.data?.message || 'Failed to fetch users');
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
            const response = await axiosInstance.put(`/users/update-role/${userId}`, { 
                role: newRole 
            });

            if (response.status === 200) {
                setUsers(users.map(user => 
                    user._id === userId ? { ...user, status: newRole } : user
                ));
                alert('Role updated successfully');
            }
        } catch (error) {
            console.error('Error updating user role:', error.response?.data || error.message);
            alert('Failed to update user role');
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