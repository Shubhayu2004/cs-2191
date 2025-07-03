import { useEffect, useState, useContext } from 'react';
import axiosInstance from '../axios.config';
import { useAuth } from '../context/useAuth';
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from '../components/Sidebar';
import { UserDataContext } from '../context/UserDataContext';

const ManageUsers = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addEmail, setAddEmail] = useState("");
    const [addName, setAddName] = useState("");
    const [addRole, setAddRole] = useState("member");
    const { token } = useAuth();
    const { user } = useContext(UserDataContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Get committeeId from router state or query param
    const committeeId = location.state?.committeeId || new URLSearchParams(window.location.search).get('committeeId');
    const committeeName = location.state?.committeeName || "";
    const [roleLoading, setRoleLoading] = useState(true);
    const isAdmin = user?.status === "admin";

    // Fetch committee data to determine user's role in this committee
    useEffect(() => {
        async function fetchCommittee() {
            if (!committeeId) return;
            try {
                await axiosInstance.get(`/api/committees/${committeeId}`);
            } catch {
                // Do nothing
            } finally {
                setRoleLoading(false);
            }
        }
        fetchCommittee();
    }, [committeeId]);

    // Only admin can manage users
    const canManageUsers = isAdmin;

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
        if (!addEmail || !addName) return;
        try {
            // Fetch userId by email
            const userRes = await axiosInstance.get(`/users/by-email/${encodeURIComponent(addEmail)}`);
            const userId = userRes.data?._id;
            if (!userId) {
                alert('No user found with this email. Please ensure the user is registered.');
                return;
            }
            await axiosInstance.post(`/api/committees/${committeeId}/users`, {
                userId,
                email: addEmail,
                name: addName,
                role: 'member'
            });
            // Refetch users after adding
            const refreshed = await axiosInstance.get(`/api/committees/${committeeId}/users`);
            setUsers(refreshed.data);
            setAddEmail("");
            setAddName("");
            setAddRole("member");
        } catch (error) {
            if (error.response?.status === 404) {
                alert('No user found with this email. Please ensure the user is registered.');
            } else {
                alert(error.response?.data?.message || 'Failed to add user');
            }
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Remove this user from the committee?')) return;
        if (!userId) {
            alert('User ID not found. Cannot delete this user.');
            return;
        }
        try {
            await axiosInstance.delete(`/api/committees/${committeeId}/users/${userId}`);
            // Refetch users after delete
            const refreshed = await axiosInstance.get(`/api/committees/${committeeId}/users`);
            setUsers(refreshed.data);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    if (loading || roleLoading) return <div>Loading...</div>;
    if (!canManageUsers) return <div>You do not have permission to manage users for this committee.</div>;
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
                <select value={addRole} onChange={e => setAddRole(e.target.value)} required disabled>
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
                    {users.map((user, idx) => (
                        <tr key={user._id || user.email || idx}>
                            <td>{user.name || (user.fullname?.firstname ? user.fullname.firstname + ' ' + (user.fullname.lastname || '') : '')}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                {user.role === 'member' && user._id && (
                                    <button onClick={() => handleDeleteUser(user._id)} style={{ background: '#fff', color: '#000', border: '1px solid #000', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageUsers;
