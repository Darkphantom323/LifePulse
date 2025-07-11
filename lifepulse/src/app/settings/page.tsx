'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers';
// Removed NextAuth dependency
import { 
  Settings,
  Bell,
  Droplets,
  Heart,
  Target,
  Shield,
  Download,
  Trash2,
  Save,
  Palette,
  RefreshCw,
  AlertCircle,
  Info,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { logout } = useAuth();
  
  // Settings state
  const [settings, setSettings] = useState({
    // Notification settings
    notifications: {
      enabled: true,
      goalReminders: true,
      hydrationReminders: true,
      meditationReminders: true,
      scheduleReminders: true,
      emailNotifications: false,
      pushNotifications: true
    },
    
    // Hydration settings
    hydration: {
      dailyGoal: 2500, // ml
      glassSize: 250, // ml
      reminderInterval: 60, // minutes
      soundEnabled: true
    },
    
    // Meditation settings
    meditation: {
      dailyGoal: 20, // minutes
      defaultDuration: 10, // minutes
      reminderTime: '09:00',
      soundEnabled: true,
      guidedVoice: true
    },
    
    // Goal settings
    goals: {
      defaultCategory: 'personal',
      showProgress: true,
      autoArchive: true,
      reminderTime: '18:00'
    },
    
    // Privacy settings
    privacy: {
      profileVisibility: 'private',
      shareProgress: false,
      analyticsEnabled: true
    },
    preferences: {
      language: 'en',
      timezone: 'auto',
      theme: 'light',
      startOfWeek: 'monday',
      units: 'metric',
    }
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
    setHasChanges(true);
    setSaveStatus('idle');
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Here you would save settings to your API
      // await saveUserSettings(settings);
      
      // Save to localStorage for now
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      setHasChanges(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      // Here you would export user data
      // const data = await exportUserData();
      // downloadFile(data, 'lifepulse-data.json');
      
      alert('Data export started! You will receive a download link shortly.');
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
    );
    
    if (!confirmed) return;
    
    const doubleConfirm = prompt(
      'Type "DELETE" to confirm account deletion:'
    );
    
    if (doubleConfirm === 'DELETE') {
      try {
        // Here you would delete the account
        // await deleteUserAccount();
        
        logout();
        window.location.href = '/auth/signin';
      } catch (error) {
        console.error('Failed to delete account:', error);
        alert('Failed to delete account. Please try again.');
      }
    }
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to their defaults?')) {
      setSettings({
        notifications: {
          enabled: true,
          goalReminders: true,
          hydrationReminders: true,
          meditationReminders: true,
          scheduleReminders: true,
          emailNotifications: false,
          pushNotifications: true
        },
        privacy: {
          profileVisibility: 'private',
          shareProgress: false,
          analyticsEnabled: true
        },
        preferences: {
          language: 'en',
          timezone: 'auto',
          theme: 'light',
          startOfWeek: 'monday',
          units: 'metric',
        },
        goals: {
          defaultCategory: 'personal',
          showProgress: true,
          autoArchive: true,
          reminderTime: '18:00'
        },
        hydration: {
          dailyGoal: 2500,
          glassSize: 250,
          reminderInterval: 60,
          soundEnabled: true
        },
        meditation: {
          dailyGoal: 20,
          defaultDuration: 10,
          reminderTime: '09:00',
          soundEnabled: true,
          guidedVoice: true
        }
      });
      setHasChanges(true);
    }
  };

  const SettingSection = ({ title, icon: Icon, children }: { 
    title: string; 
    icon: any; 
    children: React.ReactNode; 
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow p-6 border border-gray-200"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          {title}
        </h2>
      </div>
      {children}
    </motion.div>
  );

  const ToggleSwitch = ({ checked, onChange, label, description }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-900">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 mt-1">
            {description}
          </p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="h-8 w-8 text-gray-600" />
              Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Customize your LifePulse experience
            </p>
          </div>
          
          {/* Save Controls */}
          <div className="flex items-center gap-3">
            {saveStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg"
              >
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Settings saved</span>
              </motion.div>
            )}
            
            {saveStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg"
              >
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Error saving</span>
              </motion.div>
            )}
            
            <button
              onClick={handleResetSettings}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </button>
            
            <button
              onClick={handleSaveSettings}
              disabled={!hasChanges || isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <SettingSection title="Notifications" icon={Bell}>
          <div className="space-y-1">
            <ToggleSwitch
              checked={settings.notifications.enabled}
              onChange={(value) => handleSettingChange('notifications', 'enabled', value)}
              label="Enable Notifications"
              description="Turn on/off all notifications"
            />
            
            <div className="ml-4 space-y-1 opacity-60">
              <ToggleSwitch
                checked={settings.notifications.goalReminders}
                onChange={(value) => handleSettingChange('notifications', 'goalReminders', value)}
                label="Goal Reminders"
                description="Get reminded about your goals"
              />
              <ToggleSwitch
                checked={settings.notifications.hydrationReminders}
                onChange={(value) => handleSettingChange('notifications', 'hydrationReminders', value)}
                label="Hydration Reminders"
                description="Regular reminders to drink water"
              />
              <ToggleSwitch
                checked={settings.notifications.meditationReminders}
                onChange={(value) => handleSettingChange('notifications', 'meditationReminders', value)}
                label="Meditation Reminders"
                description="Daily meditation reminders"
              />
              <ToggleSwitch
                checked={settings.notifications.scheduleReminders}
                onChange={(value) => handleSettingChange('notifications', 'scheduleReminders', value)}
                label="Schedule Reminders"
                description="Upcoming event notifications"
              />
            </div>
            
            <ToggleSwitch
              checked={settings.notifications.emailNotifications}
              onChange={(value) => handleSettingChange('notifications', 'emailNotifications', value)}
              label="Email Notifications"
              description="Receive notifications via email"
            />
            <ToggleSwitch
              checked={settings.notifications.pushNotifications}
              onChange={(value) => handleSettingChange('notifications', 'pushNotifications', value)}
              label="Push Notifications"
              description="Browser push notifications"
            />
          </div>
        </SettingSection>

        {/* Hydration Settings */}
        <SettingSection title="Hydration" icon={Droplets}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Daily Goal (ml)
                </label>
                <input
                  type="number"
                  value={settings.hydration.dailyGoal}
                  onChange={(e) => handleSettingChange('hydration', 'dailyGoal', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Glass Size (ml)
                </label>
                <input
                  type="number"
                  value={settings.hydration.glassSize}
                  onChange={(e) => handleSettingChange('hydration', 'glassSize', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Reminder Interval (minutes)
              </label>
              <select
                value={settings.hydration.reminderInterval}
                onChange={(e) => handleSettingChange('hydration', 'reminderInterval', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
            
            <ToggleSwitch
              checked={settings.hydration.soundEnabled}
              onChange={(value) => handleSettingChange('hydration', 'soundEnabled', value)}
              label="Sound Notifications"
              description="Play sound with hydration reminders"
            />
          </div>
        </SettingSection>

        {/* Meditation Settings */}
        <SettingSection title="Meditation" icon={Heart}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Daily Goal (minutes)
                </label>
                <input
                  type="number"
                  value={settings.meditation.dailyGoal}
                  onChange={(e) => handleSettingChange('meditation', 'dailyGoal', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Default Duration (minutes)
                </label>
                <select
                  value={settings.meditation.defaultDuration}
                  onChange={(e) => handleSettingChange('meditation', 'defaultDuration', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                >
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Daily Reminder Time
              </label>
              <input
                type="time"
                value={settings.meditation.reminderTime}
                onChange={(e) => handleSettingChange('meditation', 'reminderTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              />
            </div>
            
            <ToggleSwitch
              checked={settings.meditation.soundEnabled}
              onChange={(value) => handleSettingChange('meditation', 'soundEnabled', value)}
              label="Meditation Sounds"
              description="Enable background sounds during meditation"
            />
            <ToggleSwitch
              checked={settings.meditation.guidedVoice}
              onChange={(value) => handleSettingChange('meditation', 'guidedVoice', value)}
              label="Guided Voice"
              description="Enable voice guidance for meditation sessions"
            />
          </div>
        </SettingSection>

        {/* Goals Settings */}
        <SettingSection title="Goals" icon={Target}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Default Category
              </label>
              <select
                value={settings.goals.defaultCategory}
                onChange={(e) => handleSettingChange('goals', 'defaultCategory', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              >
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="health">Health</option>
                <option value="fitness">Fitness</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Daily Review Time
              </label>
              <input
                type="time"
                value={settings.goals.reminderTime}
                onChange={(e) => handleSettingChange('goals', 'reminderTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              />
            </div>
            
            <ToggleSwitch
              checked={settings.goals.showProgress}
              onChange={(value) => handleSettingChange('goals', 'showProgress', value)}
              label="Show Progress Bars"
              description="Display visual progress indicators"
            />
            <ToggleSwitch
              checked={settings.goals.autoArchive}
              onChange={(value) => handleSettingChange('goals', 'autoArchive', value)}
              label="Auto-archive Completed Goals"
              description="Automatically archive goals after completion"
            />
          </div>
        </SettingSection>

        {/* Privacy & Data */}
        <SettingSection title="Privacy & Data" icon={Shield}>
          <div className="space-y-4">
            <ToggleSwitch
              checked={settings.privacy.shareProgress}
              onChange={(value) => handleSettingChange('privacy', 'shareProgress', value)}
              label="Share Progress"
              description="Allow sharing your progress with friends"
            />
            <ToggleSwitch
              checked={settings.privacy.analyticsEnabled}
              onChange={(value) => handleSettingChange('privacy', 'analyticsEnabled', value)}
              label="Analytics"
              description="Help improve the app by sharing anonymous usage data"
            />
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex gap-4">
                <button
                  onClick={handleExportData}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </SettingSection>

        {/* Preferences */}
        <SettingSection title="Preferences" icon={Palette}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Language
              </label>
              <select
                value={settings.preferences.language}
                onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Timezone
              </label>
              <select
                value={settings.preferences.timezone}
                onChange={(e) => handleSettingChange('preferences', 'timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              >
                <option value="auto">Auto-detect</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Start of Week
              </label>
              <select
                value={settings.preferences.startOfWeek}
                onChange={(e) => handleSettingChange('preferences', 'startOfWeek', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              >
                <option value="sunday">Sunday</option>
                <option value="monday">Monday</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Units
              </label>
              <select
                value={settings.preferences.units}
                onChange={(e) => handleSettingChange('preferences', 'units', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              >
                <option value="metric">Metric (kg, cm, ml)</option>
                <option value="imperial">Imperial (lbs, ft, fl oz)</option>
              </select>
            </div>
          </div>
        </SettingSection>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">Settings Auto-Save</h3>
              <p className="text-sm text-blue-700">
                Your settings are automatically saved to your browser. For persistent settings across devices, make sure you're signed in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 