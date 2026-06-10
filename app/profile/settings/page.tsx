// app/profile/settings/page.tsx
'use client';

import { useAuth } from '@/app/_components/auth-context';
import { useState, useEffect, useRef } from 'react';
import { FiUser, FiMail, FiLock, FiSave, FiUpload, FiTrash2, FiCamera } from 'react-icons/fi';
import { toast } from 'sonner';
import { 
  getMyProfile, 
  uploadAvatar, 
  deleteAvatar,
  changePassword,
  Profile 
} from '@/lib/admin-api';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile State
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Profile Edit State
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Avatar Upload State
  const [isUploading, setIsUploading] = useState(false);

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await getMyProfile();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Populate name/email/phone from GET /auth/me
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
      });
    }
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const result = await uploadAvatar(file);
      
      // Update profile with new avatar
      setProfile(prev => prev ? { ...prev, avatarUrl: result.avatarUrl } : null);
      
      toast.success('Avatar uploaded successfully!');
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm('Are you sure you want to delete your avatar?')) return;

    try {
      await deleteAvatar();
      setProfile(prev => prev ? { ...prev, avatarUrl: null } : null);
      toast.success('Avatar deleted successfully!');
    } catch (error) {
      console.error('Error deleting avatar:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete avatar');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileLoading(true);

    try {
      await updateProfile({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone || undefined,
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsPasswordLoading(true);

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Account Settings</h1>
      <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">Manage your profile information and security settings</p>

      {/* Profile Avatar Section */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-6">
          <FiUser className="text-xl text-blue-600" />
          <h2 className="text-lg sm:text-xl font-bold">Profile Picture</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          {/* Avatar Display */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-gray-100">
              {profile?.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiUser className="text-4xl sm:text-6xl text-gray-400" />
              )}
            </div>
            
            {/* Upload Overlay Button */}
            <button
              onClick={handleAvatarClick}
              disabled={isUploading}
              className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition shadow-lg disabled:opacity-50"
              aria-label="Upload avatar"
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <FiCamera className="text-sm sm:text-base" />
              )}
            </button>
          </div>

          {/* Avatar Actions */}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">{profile?.name || 'Your Name'}</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload a profile picture. Maximum file size: 5MB. Supported formats: JPG, PNG, GIF.
            </p>
            
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={handleAvatarClick}
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm disabled:opacity-50"
              >
                <FiUpload className="text-sm" />
                Upload Photo
              </button>
              
              {profile?.avatarUrl && (
                <button
                  onClick={handleDeleteAvatar}
                  className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition text-sm"
                >
                  <FiTrash2 className="text-sm" />
                  Remove Photo
                </button>
              )}
            </div>
            
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              aria-label="Upload avatar"
            />
          </div>
        </div>
      </div>

      {/* Profile Information Section */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-6">
          <FiUser className="text-xl text-blue-600" />
          <h2 className="text-lg sm:text-xl font-bold">Profile Information</h2>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your phone number (optional)"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isProfileLoading}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <FiSave />
              {isProfileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <FiLock className="text-xl text-red-600" />
          <h2 className="text-lg sm:text-xl font-bold">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter current password"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter new password"
                  required
                  minLength={8}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPasswordLoading}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <FiLock />
              {isPasswordLoading ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}