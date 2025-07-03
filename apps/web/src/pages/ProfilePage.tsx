import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Tabs,
  Card,
  TextInput,
  Textarea,
  Select,
  Switch,
  Button,
  Avatar,
  FileButton,
  Group,
  Text,
  PasswordInput,
  Stack,
  Paper,
  Divider,
  SimpleGrid,
  Box,
  Loader,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconUser, IconBell, IconPalette, IconLock, IconChartBar } from '@tabler/icons-react';
import { userService } from '../services/user';
import { useAuth } from '../contexts/AuthContext';

export function ProfilePage(): JSX.Element {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string | null>('general');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile(),
  });

  const { data: stats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => userService.getStats(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      notifications.show({
        title: 'Success',
        message: 'Profile updated successfully',
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to update profile',
        color: 'red',
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: userService.changePassword,
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Password changed successfully',
        color: 'green',
      });
      // Reset password form
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to change password',
        color: 'red',
      });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: userService.uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      notifications.show({
        title: 'Success',
        message: 'Avatar uploaded successfully',
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to upload avatar',
        color: 'red',
      });
    },
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: userService.deleteAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      notifications.show({
        title: 'Success',
        message: 'Avatar removed successfully',
        color: 'green',
      });
    },
  });

  const [profileForm, setProfileForm] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    bio: profile?.bio || '',
    timezone: profile?.timezone || 'UTC',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: profile?.emailNotifications ?? true,
    mentionNotifications: profile?.mentionNotifications ?? true,
    taskNotifications: profile?.taskNotifications ?? true,
    projectNotifications: profile?.projectNotifications ?? true,
  });

  const [theme, setTheme] = useState(profile?.theme || 'system');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  const handleProfileSubmit = (): void => {
    updateProfileMutation.mutate(profileForm);
  };

  const handlePasswordSubmit = (): void => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notifications.show({
        title: 'Error',
        message: 'Passwords do not match',
        color: 'red',
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const handleNotificationSubmit = (): void => {
    updateProfileMutation.mutate(notificationSettings);
  };

  const handleThemeSubmit = (): void => {
    updateProfileMutation.mutate({ theme: theme as any });
  };

  const handleAvatarUpload = (file: File | null): void => {
    if (file) {
      uploadAvatarMutation.mutate(file);
    }
  };

  return (
    <Container size="lg" py="xl">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

      <Tabs value={activeTab} onTabChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="general" icon={<IconUser size={16} />}>
            General
          </Tabs.Tab>
          <Tabs.Tab value="security" icon={<IconLock size={16} />}>
            Security
          </Tabs.Tab>
          <Tabs.Tab value="notifications" icon={<IconBell size={16} />}>
            Notifications
          </Tabs.Tab>
          <Tabs.Tab value="appearance" icon={<IconPalette size={16} />}>
            Appearance
          </Tabs.Tab>
          <Tabs.Tab value="stats" icon={<IconChartBar size={16} />}>
            Statistics
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="general" pt="xl">
          <Card>
            <Stack spacing="lg">
              <div>
                <Text size="lg" weight={600} mb="md">
                  Profile Information
                </Text>
                
                <Group align="center" mb="xl">
                  <Avatar
                    src={profile?.avatar}
                    size={120}
                    radius="xl"
                  >
                    {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                  </Avatar>
                  <Stack spacing="xs">
                    <FileButton onChange={handleAvatarUpload} accept="image/*">
                      {(props) => (
                        <Button {...props} variant="light" loading={uploadAvatarMutation.isLoading}>
                          Upload Avatar
                        </Button>
                      )}
                    </FileButton>
                    {profile?.avatar && (
                      <Button
                        variant="subtle"
                        color="red"
                        onClick={() => deleteAvatarMutation.mutate()}
                        loading={deleteAvatarMutation.isLoading}
                      >
                        Remove Avatar
                      </Button>
                    )}
                  </Stack>
                </Group>

                <SimpleGrid cols={2} spacing="md" mb="md">
                  <TextInput
                    label="First Name"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  />
                  <TextInput
                    label="Last Name"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  />
                </SimpleGrid>

                <TextInput
                  label="Email"
                  value={profile?.email}
                  disabled
                  mb="md"
                />

                <Textarea
                  label="Bio"
                  placeholder="Tell us about yourself..."
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  minRows={3}
                  maxRows={6}
                  mb="md"
                />

                <Select
                  label="Timezone"
                  value={profileForm.timezone}
                  onChange={(value) => setProfileForm({ ...profileForm, timezone: value || 'UTC' })}
                  data={[
                    { value: 'UTC', label: 'UTC' },
                    { value: 'America/New_York', label: 'Eastern Time' },
                    { value: 'America/Chicago', label: 'Central Time' },
                    { value: 'America/Denver', label: 'Mountain Time' },
                    { value: 'America/Los_Angeles', label: 'Pacific Time' },
                    { value: 'Europe/London', label: 'London' },
                    { value: 'Europe/Paris', label: 'Paris' },
                    { value: 'Asia/Tokyo', label: 'Tokyo' },
                    { value: 'Australia/Sydney', label: 'Sydney' },
                  ]}
                />
              </div>

              <Group position="right">
                <Button
                  onClick={handleProfileSubmit}
                  loading={updateProfileMutation.isLoading}
                >
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="security" pt="xl">
          <Card>
            <Text size="lg" weight={600} mb="md">
              Change Password
            </Text>

            <Stack spacing="md">
              <PasswordInput
                label="Current Password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />
              <PasswordInput
                label="New Password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
              <PasswordInput
                label="Confirm New Password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />

              <Group position="right">
                <Button
                  onClick={handlePasswordSubmit}
                  loading={changePasswordMutation.isLoading}
                  disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                >
                  Change Password
                </Button>
              </Group>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="notifications" pt="xl">
          <Card>
            <Text size="lg" weight={600} mb="md">
              Notification Preferences
            </Text>

            <Stack spacing="md">
              <Switch
                label="Email notifications"
                description="Receive notifications via email"
                checked={notificationSettings.emailNotifications}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  emailNotifications: e.currentTarget.checked,
                })}
              />
              <Switch
                label="Mention notifications"
                description="Notify when someone mentions you in comments"
                checked={notificationSettings.mentionNotifications}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  mentionNotifications: e.currentTarget.checked,
                })}
              />
              <Switch
                label="Task notifications"
                description="Notify about task assignments and updates"
                checked={notificationSettings.taskNotifications}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  taskNotifications: e.currentTarget.checked,
                })}
              />
              <Switch
                label="Project notifications"
                description="Notify about project invitations and updates"
                checked={notificationSettings.projectNotifications}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  projectNotifications: e.currentTarget.checked,
                })}
              />

              <Group position="right">
                <Button
                  onClick={handleNotificationSubmit}
                  loading={updateProfileMutation.isLoading}
                >
                  Save Preferences
                </Button>
              </Group>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="appearance" pt="xl">
          <Card>
            <Text size="lg" weight={600} mb="md">
              Appearance
            </Text>

            <Select
              label="Theme"
              value={theme}
              onChange={(value) => setTheme(value || 'system')}
              data={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'system', label: 'System' },
              ]}
              mb="md"
            />

            <Group position="right">
              <Button
                onClick={handleThemeSubmit}
                loading={updateProfileMutation.isLoading}
              >
                Save Theme
              </Button>
            </Group>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="stats" pt="xl">
          <SimpleGrid cols={2} spacing="md">
            <Paper p="md" withBorder>
              <Text size="sm" color="dimmed" mb="xs">
                Total Projects
              </Text>
              <Text size="xl" weight={700}>
                {stats?.totalProjects || 0}
              </Text>
            </Paper>
            <Paper p="md" withBorder>
              <Text size="sm" color="dimmed" mb="xs">
                Total Tasks
              </Text>
              <Text size="xl" weight={700}>
                {stats?.totalTasks || 0}
              </Text>
            </Paper>
            <Paper p="md" withBorder>
              <Text size="sm" color="dimmed" mb="xs">
                Completed Tasks
              </Text>
              <Text size="xl" weight={700} color="green">
                {stats?.completedTasks || 0}
              </Text>
            </Paper>
            <Paper p="md" withBorder>
              <Text size="sm" color="dimmed" mb="xs">
                Overdue Tasks
              </Text>
              <Text size="xl" weight={700} color="red">
                {stats?.overdueTasks || 0}
              </Text>
            </Paper>
          </SimpleGrid>

          <Divider my="xl" />

          <Box>
            <Text size="sm" color="dimmed" mb="xs">
              Member Since
            </Text>
            <Text>
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
            </Text>
          </Box>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}