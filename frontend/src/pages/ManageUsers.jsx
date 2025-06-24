import { useEffect, useState } from 'react';
import axiosInstance from '../axios.config';
import { useAuth } from '../context/useAuth';
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from '../components/Sidebar';

const ManageUsers = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addEmail, setAddEmail] = useState("");
    const [addName, setAddName] = useState("");
    const [addRole, setAddRole] = useState("member");
    const { token } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get committeeId from router state or query param
    const committeeId = location.state?.committeeId || new URLSearchParams(window.location.search).get('committeeId');
    const committeeName = location.state?.committeeName || "";

    useEffect(() => {
        const fetchCommitteeUsers = async () => {
            try {
                const response = await axiosInstance.get(`/api/committees/${committeeId}/users`);
                setUsers(response.data);
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to fetch users');
            } finally {
                setLoading(false);
            }
        };
        if (token && committeeId) {
            fetchCommitteeUsers();
        }
    }, [token, committeeId]);

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!addEmail || !addName || !addRole) return;
        try {
            const response = await axiosInstance.post(`/api/committees/${committeeId}/users`, {
                email: addEmail,
                name: addName,
                role: addRole
            });
            setUsers([...users, response.data]);
            setAddEmail("");
            setAddName("");
            setAddRole("member");
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Remove this user from the committee?')) return;
        try {
            await axiosInstance.delete(`/api/committees/${committeeId}/users/${userId}`);
            setUsers(users.filter(u => u._id !== userId));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="manage-users-container">
            <Sidebar 
                isOpen={isSidebarOpen} 
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
            />
            <button onClick={handleGoBack} className="button-for-manage-users" style={{ position: 'absolute', top: '20px', right: '20px', padding: '10px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', transition: 'background-color 0.3s ease' }} onMouseEnter={e => e.target.style.backgroundColor = '#0056b3'} onMouseLeave={e => e.target.style.backgroundColor = '#007BFF'}>
                Go Back
            </button>
            <h1 style={{ textAlign: 'center', marginTop: '30px', fontSize: '30px', fontWeight: 'bold' }}>
                Manage Users for {committeeName}
            </h1>
            <form onSubmit={handleAddUser} style={{ margin: '20px 0', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
                <input type="text" placeholder="Name" value={addName} onChange={e => setAddName(e.target.value)} required />
                <input type="email" placeholder="Email" value={addEmail} onChange={e => setAddEmail(e.target.value)} required />
                <select value={addRole} onChange={e => setAddRole(e.target.value)} required>
                    <option value="chairman">Chairman</option>
                    <option value="convener">Convener</option>
                    <option value="member">Member</option>
                </select>
                <button type="submit">Add User</button>
            </form>
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
                            <td>{user.name || user.fullname?.firstname + ' ' + user.fullname?.lastname}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <button onClick={() => handleDeleteUser(user._id)} style={{ background: '#fff', color: '#000', border: '1px solid #000', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageUsers;
