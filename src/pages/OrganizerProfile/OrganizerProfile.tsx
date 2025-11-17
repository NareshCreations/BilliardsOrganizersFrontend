import React, { Component } from 'react';
import { BaseComponentComplete } from '../../components/base/BaseComponent';
import organizerProfileApiService, { OrganizerProfile, UpdateOrganizerProfileRequest } from '../../services/organizerProfileApi';
import { Camera, Save, X } from 'lucide-react';
import styles from './OrganizerProfile.module.scss';

interface OrganizerProfileProps {}

interface OrganizerProfileState {
  profile: OrganizerProfile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
  formData: {
    organizationName: string;
    contactPersonName: string;
    phone: string;
    email: string;
    city: string;
    state: string;
    country: string;
    profilePicUrl: string;
  };
  profilePictureFile: File | null;
  profilePicturePreview: string | null;
  isEditing: boolean;
}

export class OrganizerProfile extends BaseComponentComplete<OrganizerProfileProps, OrganizerProfileState> {
  protected getInitialState(): OrganizerProfileState {
    return {
      profile: null,
      loading: true,
      saving: false,
      error: null,
      success: null,
      formData: {
        organizationName: '',
        contactPersonName: '',
        phone: '',
        email: '',
        city: '',
        state: '',
        country: '',
        profilePicUrl: '',
      },
      profilePictureFile: null,
      profilePicturePreview: null,
      isEditing: false,
    };
  }

  componentDidMount() {
    console.log('📄 OrganizerProfile component mounted');
    this.loadProfile();
  }

  private async loadProfile() {
    console.log('📥 Loading organizer profile...');
    this.setState({ loading: true, error: null });
    try {
      const response = await organizerProfileApiService.getProfile();
      console.log('📥 Profile response:', response);
      if (response.success && response.data) {
        const profile = response.data;
        console.log('✅ Profile loaded successfully:', profile);
        this.setState({
          profile,
          formData: {
            organizationName: profile.organizationName || '',
            contactPersonName: profile.contactPersonName || '',
            phone: profile.phone || '',
            email: profile.email || '',
            city: profile.city || '',
            state: profile.state || '',
            country: profile.country || '',
            profilePicUrl: profile.profilePicUrl || '',
          },
          profilePicturePreview: profile.profilePicUrl || null,
          loading: false,
        });
      } else {
        console.error('❌ Profile load failed:', response.message);
        this.setState({
          error: response.message || 'Failed to load profile',
          loading: false,
        });
      }
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      this.setState({
        error: error instanceof Error ? error.message : 'Failed to load profile',
        loading: false,
      });
    }
  }

  private handleInputChange = (field: keyof OrganizerProfileState['formData'], value: string) => {
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [field]: value,
      },
    }));
  };

  private handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.setState({ error: 'Please select an image file' });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.setState({ error: 'Image size must be less than 5MB' });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        this.setState({
          profilePictureFile: file,
          profilePicturePreview: reader.result as string,
          profilePicUrl: '', // Clear URL if file is selected
        });
      };
      reader.readAsDataURL(file);
    }
  };

  private handleRemovePicture = () => {
    this.setState({
      profilePictureFile: null,
      profilePicturePreview: null,
      profilePicUrl: '',
    });
  };

  private handleCancel = () => {
    if (this.state.profile) {
      this.setState({
        formData: {
          organizationName: this.state.profile.organizationName || '',
          contactPersonName: this.state.profile.contactPersonName || '',
          phone: this.state.profile.phone || '',
          email: this.state.profile.email || '',
          city: this.state.profile.city || '',
          state: this.state.profile.state || '',
          country: this.state.profile.country || '',
          profilePicUrl: this.state.profile.profilePicUrl || '',
        },
        profilePictureFile: null,
        profilePicturePreview: this.state.profile.profilePicUrl || null,
        isEditing: false,
        error: null,
        success: null,
      });
    }
  };

  private handleSave = async () => {
    this.setState({ saving: true, error: null, success: null });

    try {
      const updateData: UpdateOrganizerProfileRequest = {};

      // Only include fields that have changed
      if (this.state.formData.organizationName !== (this.state.profile?.organizationName || '')) {
        updateData.organizationName = this.state.formData.organizationName;
      }
      if (this.state.formData.contactPersonName !== (this.state.profile?.contactPersonName || '')) {
        updateData.contactPersonName = this.state.formData.contactPersonName;
      }
      if (this.state.formData.phone !== (this.state.profile?.phone || '')) {
        updateData.phone = this.state.formData.phone;
      }
      if (this.state.formData.email !== (this.state.profile?.email || '')) {
        updateData.email = this.state.formData.email;
      }
      if (this.state.formData.city !== (this.state.profile?.city || '')) {
        updateData.city = this.state.formData.city;
      }
      if (this.state.formData.state !== (this.state.profile?.state || '')) {
        updateData.state = this.state.formData.state;
      }
      if (this.state.formData.country !== (this.state.profile?.country || '')) {
        updateData.country = this.state.formData.country;
      }

      // Handle profile picture
      if (this.state.profilePictureFile) {
        updateData.profilePicture = this.state.profilePictureFile;
      } else if (this.state.formData.profilePicUrl && this.state.formData.profilePicUrl !== (this.state.profile?.profilePicUrl || '')) {
        updateData.profilePicUrl = this.state.formData.profilePicUrl;
      }

      // Check if there are any changes
      if (Object.keys(updateData).length === 0) {
        this.setState({
          saving: false,
          error: 'No changes to save',
        });
        return;
      }

      const response = await organizerProfileApiService.updateProfile(updateData);

      if (response.success && response.data) {
        this.setState({
          profile: response.data,
          isEditing: false,
          saving: false,
          success: 'Profile updated successfully!',
          profilePictureFile: null,
          profilePicturePreview: response.data.profilePicUrl || null,
        });

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.setState({ success: null });
        }, 3000);
      } else {
        this.setState({
          error: response.message || 'Failed to update profile',
          saving: false,
        });
      }
    } catch (error) {
      this.setState({
        error: error instanceof Error ? error.message : 'Failed to update profile',
        saving: false,
      });
    }
  };

  render(): React.ReactNode {
    const { profile, loading, saving, error, success, formData, profilePicturePreview, isEditing } = this.state;

    if (loading) {
      return (
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading profile...</p>
          </div>
        </div>
      );
    }

    if (!profile) {
      return (
        <div className={styles.container}>
          <div className={styles.errorState}>
            <p>{error || 'Profile not found'}</p>
            <button onClick={() => this.loadProfile()} className={styles.retryButton}>
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Organizer Profile</h1>
          {!isEditing && (
            <button
              onClick={() => this.setState({ isEditing: true })}
              className={styles.editButton}
            >
              Edit Profile
            </button>
          )}
        </div>

        {error && (
          <div className={styles.alertError}>
            <p>{error}</p>
            <button onClick={() => this.setState({ error: null })} className={styles.closeButton}>
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className={styles.alertSuccess}>
            <p>{success}</p>
            <button onClick={() => this.setState({ success: null })} className={styles.closeButton}>
              <X size={16} />
            </button>
          </div>
        )}

        <div className={styles.profileCard}>
          {/* Profile Picture Section */}
          <div className={styles.profilePictureSection}>
            <div className={styles.profilePictureContainer}>
              {profilePicturePreview ? (
                <img
                  src={profilePicturePreview}
                  alt="Profile"
                  className={styles.profilePicture}
                />
              ) : (
                <div className={styles.profilePicturePlaceholder}>
                  <Camera size={48} />
                </div>
              )}
              {isEditing && (
                <div className={styles.profilePictureActions}>
                  <label className={styles.uploadButton}>
                    <Camera size={16} />
                    <span>Change</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={this.handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {profilePicturePreview && (
                    <button
                      onClick={this.handleRemovePicture}
                      className={styles.removeButton}
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
            {isEditing && (
              <div className={styles.profilePicUrlInput}>
                <label>Or enter profile picture URL:</label>
                <input
                  type="text"
                  value={formData.profilePicUrl}
                  onChange={(e) => this.handleInputChange('profilePicUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  disabled={!!this.state.profilePictureFile}
                />
              </div>
            )}
          </div>

          {/* Profile Information */}
          <div className={styles.profileInfo}>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Organization ID</label>
                <p className={styles.readOnlyValue}>{profile.orgId}</p>
              </div>

              <div className={styles.infoItem}>
                <label>Organization Name *</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => this.handleInputChange('organizationName', e.target.value)}
                    maxLength={100}
                    required
                  />
                ) : (
                  <p>{profile.organizationName}</p>
                )}
              </div>

              <div className={styles.infoItem}>
                <label>Contact Person Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.contactPersonName}
                    onChange={(e) => this.handleInputChange('contactPersonName', e.target.value)}
                    maxLength={100}
                  />
                ) : (
                  <p>{profile.contactPersonName || 'Not provided'}</p>
                )}
              </div>

              <div className={styles.infoItem}>
                <label>Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => this.handleInputChange('phone', e.target.value)}
                    maxLength={15}
                    placeholder="+1234567890"
                  />
                ) : (
                  <p>{profile.phone || 'Not provided'}</p>
                )}
              </div>

              <div className={styles.infoItem}>
                <label>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => this.handleInputChange('email', e.target.value)}
                    maxLength={100}
                    placeholder="contact@example.com"
                  />
                ) : (
                  <p>{profile.email || 'Not provided'}</p>
                )}
              </div>

              <div className={styles.infoItem}>
                <label>City</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => this.handleInputChange('city', e.target.value)}
                    maxLength={100}
                  />
                ) : (
                  <p>{profile.city || 'Not provided'}</p>
                )}
              </div>

              <div className={styles.infoItem}>
                <label>State</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => this.handleInputChange('state', e.target.value)}
                    maxLength={100}
                  />
                ) : (
                  <p>{profile.state || 'Not provided'}</p>
                )}
              </div>

              <div className={styles.infoItem}>
                <label>Country</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => this.handleInputChange('country', e.target.value)}
                    maxLength={100}
                  />
                ) : (
                  <p>{profile.country || 'Not provided'}</p>
                )}
              </div>

              <div className={styles.infoItem}>
                <label>Premium Status</label>
                <p className={styles.readOnlyValue}>
                  <span className={profile.isPremium ? styles.premiumBadge : styles.standardBadge}>
                    {profile.isPremium ? 'Premium' : 'Standard'}
                  </span>
                </p>
              </div>
            </div>

            {isEditing && (
              <div className={styles.actionButtons}>
                <button
                  onClick={this.handleSave}
                  disabled={saving}
                  className={styles.saveButton}
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={this.handleCancel}
                  disabled={saving}
                  className={styles.cancelButton}
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

