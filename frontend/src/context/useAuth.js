import { useContext } from 'react';
import { UserDataContext } from './UserDataContext';

export function useAuth() {
    const context = useContext(UserDataContext);
    if (!context) {
        throw new Error('useAuth must be used within a UserContext provider');
    }
    return context;
}
