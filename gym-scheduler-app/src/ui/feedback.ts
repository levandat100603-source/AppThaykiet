import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const canHaptic = Platform.OS !== 'web';

export const notifySuccess = () => {
  if (!canHaptic) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

export const notifyError = () => {
  if (!canHaptic) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

export const notifySelection = () => {
  if (!canHaptic) return;
  Haptics.selectionAsync();
};