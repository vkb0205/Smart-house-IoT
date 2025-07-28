import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import styles from "../../styles/Profile.module.css";

interface UserPreferences {
  theme: "light" | "dark";
  notifications: boolean;
  temperatureUnit: "celsius" | "fahrenheit";
  autoRefresh: boolean;
  refreshInterval: number;
}

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Profile form state
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // User preferences state
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: "light",
    notifications: true,
    temperatureUnit: "celsius",
    autoRefresh: true,
    refreshInterval: 5000,
  });

  // Load user preferences from Firestore
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setPreferences((prev) => ({ ...prev, ...userData.preferences }));
          }
        } catch (error) {
          console.error("Error loading user preferences:", error);
        }
      }
    };

    loadUserPreferences();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Update display name
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }

      // Update password if provided
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error("Passwords do not match");
        }

        if (newPassword.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }

        // Re-authenticate user before password change
        if (currentPassword) {
          const credential = EmailAuthProvider.credential(
            user.email!,
            currentPassword
          );
          await reauthenticateWithCredential(user, credential);
          await updatePassword(user, newPassword);
        }
      }

      // Save preferences to Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          email: user.email,
          displayName: displayName,
          preferences: preferences,
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      );

      setMessage("Profile updated successfully!");
      setIsEditing(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.profileAvatar}>
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className={styles.avatarImage}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {(user?.displayName || user?.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>
              {user?.displayName || user?.email?.split("@")[0] || "User"}
            </h1>
            <p className={styles.profileEmail}>{user?.email}</p>
            <span className={styles.profileBadge}>
              {user?.emailVerified ? "✅ Verified" : "⚠️ Unverified"}
            </span>
          </div>
        </div>

        {message && <div className={styles.successMessage}>{message}</div>}
        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleUpdateProfile} className={styles.profileForm}>
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Profile Information</h2>

            <div className={styles.inputGroup}>
              <label htmlFor="displayName" className={styles.label}>
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={!isEditing}
                className={styles.input}
                placeholder="Enter your display name"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className={`${styles.input} ${styles.disabled}`}
              />
            </div>
          </div>

          {isEditing && (
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Change Password</h2>

              <div className={styles.inputGroup}>
                <label htmlFor="currentPassword" className={styles.label}>
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={styles.input}
                  placeholder="Enter current password"
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="newPassword" className={styles.label}>
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.input}
                  placeholder="Enter new password (optional)"
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.input}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          )}

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>Dashboard Preferences</h2>

            <div className={styles.preferencesGrid}>
              <div className={styles.preferenceItem}>
                <label className={styles.preferenceLabel}>
                  <span>Dark Mode</span>
                  <input
                    type="checkbox"
                    checked={preferences.theme === "dark"}
                    onChange={(e) =>
                      handlePreferenceChange(
                        "theme",
                        e.target.checked ? "dark" : "light"
                      )
                    }
                    disabled={!isEditing}
                    className={styles.checkbox}
                  />
                </label>
              </div>

              <div className={styles.preferenceItem}>
                <label className={styles.preferenceLabel}>
                  <span>Notifications</span>
                  <input
                    type="checkbox"
                    checked={preferences.notifications}
                    onChange={(e) =>
                      handlePreferenceChange("notifications", e.target.checked)
                    }
                    disabled={!isEditing}
                    className={styles.checkbox}
                  />
                </label>
              </div>

              <div className={styles.preferenceItem}>
                <label className={styles.preferenceLabel}>
                  <span>Temperature Unit</span>
                  <select
                    value={preferences.temperatureUnit}
                    onChange={(e) =>
                      handlePreferenceChange("temperatureUnit", e.target.value)
                    }
                    disabled={!isEditing}
                    className={styles.select}
                  >
                    <option value="celsius">Celsius (°C)</option>
                    <option value="fahrenheit">Fahrenheit (°F)</option>
                  </select>
                </label>
              </div>

              <div className={styles.preferenceItem}>
                <label className={styles.preferenceLabel}>
                  <span>Auto Refresh Data</span>
                  <input
                    type="checkbox"
                    checked={preferences.autoRefresh}
                    onChange={(e) =>
                      handlePreferenceChange("autoRefresh", e.target.checked)
                    }
                    disabled={!isEditing}
                    className={styles.checkbox}
                  />
                </label>
              </div>

              <div className={styles.preferenceItem}>
                <label className={styles.preferenceLabel}>
                  <span>Refresh Interval (seconds)</span>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={preferences.refreshInterval / 1000}
                    onChange={(e) =>
                      handlePreferenceChange(
                        "refreshInterval",
                        parseInt(e.target.value) * 1000
                      )
                    }
                    disabled={!isEditing}
                    className={styles.input}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className={styles.editButton}
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setDisplayName(user?.displayName || "");
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setError("");
                    setMessage("");
                  }}
                  className={styles.cancelButton}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "💾 Save Changes"}
                </button>
              </>
            )}
          </div>
        </form>

        <div className={styles.dangerZone}>
          <h2 className={styles.sectionTitle}>Account Actions</h2>
          <button onClick={logout} className={styles.logoutButton}>
            🚪 Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
