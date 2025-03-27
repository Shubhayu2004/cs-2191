import React, { createContext, useState, useContext } from 'react'

export const UserDataContext = createContext()

export const useAuth = () => {
    const context = useContext(UserDataContext);
    if (!context) {
        throw new Error('useAuth must be used within a UserContext provider');
    }
    return context;
}

const UserContext = ({ children }) => {
    const [user, setUser] = useState({
        email: '',
        fullName: {
            firstName: '',
            lastName: '',
            status: ''
        }
    });

    const [token, setToken] = useState(localStorage.getItem('token'));

    const value = {
        user,
        setUser,
        token,
        setToken
    };

    return (
        <UserDataContext.Provider value={value}>
            {children}
        </UserDataContext.Provider>
    );
}

export default UserContext;