import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { fetchUserProfile } from './fetchUserProfile';
import { UserDataContext } from './UserDataContext';

const UserContext = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeUser = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                const profile = await fetchUserProfile();
                if (profile) {
                    setUser(profile);
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };
        initializeUser();
    }, []);

    const value = {
        user,
        setUser,
        token,
        setToken,
        loading
    };

    return (
        <UserDataContext.Provider value={value}>
            {!loading && children}
        </UserDataContext.Provider>
    );
};

UserContext.propTypes = {
    children: PropTypes.node.isRequired,
};

export default UserContext;