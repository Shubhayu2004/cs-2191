import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ element: Component, ...rest }) => {
    const { user } = useAuth();

    return user ? <Component {...rest} /> : <Navigate to="/Login" />;
};

export default PrivateRoute;