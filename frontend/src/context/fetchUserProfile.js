// Utility to fetch user profile from backend
import axiosInstance from '../axios.config';

export const fetchUserProfile = async () => {
  try {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
  } catch {
    return null;
  }
};
