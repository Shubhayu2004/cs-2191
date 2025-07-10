import { useState, useEffect, useContext } from "react";
import axios from "axios";
import "../styles/committee.css";
import { UserDataContext } from '../context/UserDataContext';
import CommitteeForm from '../components/CommitteeForm';
import Sidebar from '../components/Sidebar';
import CommitteeList from '../components/CommitteeList';

const CommitteeApp = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommitteeVisible, setIsCommitteeVisible] = useState(false);
  const [formData, setFormData] = useState({
    committeeName: "",
    committeePurpose: "",
    chairman: { name: "", email: "" },
    convener: { name: "", email: "" },
    members: []
  });
  const [committees, setCommittees] = useState([]);
  const [users, setUsers] = useState([]);
  const { user } = useContext(UserDataContext);


  useEffect(() => {
    const fetchCommittees = async () => {
      const token = localStorage.getItem("token");
      try {
        let response;
        if (user?.status === 'admin') {
          // Admin: fetch all committees
          response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/committees`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else if (user && typeof user._id === 'string' && user._id.length === 24) {
          // Non-admin: fetch only their committees
          response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/committees/user?userId=${user._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          setCommittees([]);
          return;
        }
        setCommittees(response.data);
      } catch (error) {
        console.error("Error fetching committees:", error);
        setCommittees([]);
      }
    };
    if (user) {
      fetchCommittees();
    }
    // Only fetch users if admin
    if (user?.status === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
        // Only require chairman for admin mode
        if (!formData.committeeName || !formData.committeePurpose || !formData.chairman.email) {
            throw new Error('Please fill all required fields');
        }

        // Find userId for chairman
        const chairmanUser = users.find(u => u.email === formData.chairman.email);
        if (!chairmanUser) {
            throw new Error('Chairman user not found');
        }

        // Only send chairman in payload for admin creation
        const payload = {
            committeeName: formData.committeeName,
            committeePurpose: formData.committeePurpose,
            chairman: {
                userId: chairmanUser._id,
                name: formData.chairman.name,
                email: formData.chairman.email,
            }
        };
        console.log('Committee creation payload:', payload);

        const token = localStorage.getItem("token");
        const response = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/api/committees/create`,
            payload,
            {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        setCommittees(prev => [...prev, response.data]);
        setIsCommitteeVisible(false);
        setFormData({
            committeeName: "",
            committeePurpose: "",
            chairman: { name: "", email: "" },
            convener: { name: "", email: "" },
            members: []
        });

        // Show success message
        alert('Committee created successfully!');
    } catch (error) {
        console.error("Error creating committee:", error);
        alert(error.response?.data?.message || 'Error creating committee');
    }
};

  return (
    <div className="committee-app">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      
      <div className="main-content">
        <h1 className="box">Create Committees</h1>

        {user?.status === "admin" && (
          <button 
            className="form" 
            onClick={() => setIsCommitteeVisible(!isCommitteeVisible)}
          >
            {isCommitteeVisible ? "Hide Form" : "Show Form"}
          </button>
        )}

        {isCommitteeVisible && user?.status === "admin" && (
          <CommitteeForm
            formData={formData}
            users={users}
            onSubmit={handleFormSubmit}
            onChange={handleFormChange}
            onAddMember={() => handleFormChange('members', [
              ...formData.members, 
              { name: "", email: "" }
            ])}
            mode="admin"
          />
        )}

        <CommitteeList committees={committees} />
      </div>
    </div>
  );
};

export default CommitteeApp;