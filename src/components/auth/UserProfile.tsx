/**
 * User Profile Component
 * Displays user information and logout functionality
 */

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout(); // AuthContext clears auth state
      window.location.href = '/login'; // Redirect to login page
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">User Profile</h3>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">User ID</label>
            <p className="mt-1 text-sm text-gray-900 font-mono">{user.id}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">Email</label>
            <p className="mt-1 text-sm text-gray-900">{user.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">Phone</label>
            <p className="mt-1 text-sm text-gray-900">{user.phone || 'Not provided'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">Account Type</label>
            <p className="mt-1 text-sm text-gray-900 capitalize">{user.accountType}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1 flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
              {user.isPremium && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Premium
                </span>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">Verification Status</label>
            <div className="mt-1 flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                Email {user.emailVerified ? 'Verified' : 'Not Verified'}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.phoneVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                Phone {user.phoneVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Last Login</label>
              <p className="mt-1 text-sm text-gray-900">{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Account Created</label>
              <p className="mt-1 text-sm text-gray-900">{user.createdAt ? formatDate(user.createdAt) : 'Unknown'}</p>
            </div>
          </div>
        </div>

        {user.firstName || user.lastName ? (
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">First Name</label>
                <p className="mt-1 text-sm text-gray-900">{user.firstName || 'Not provided'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Last Name</label>
                <p className="mt-1 text-sm text-gray-900">{user.lastName || 'Not provided'}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default UserProfile;
