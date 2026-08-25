import type { PropsWithChildren, ReactNode } from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export function Reveal({ children, delay = 0, style }: PropsWithChildren<{ delay?: number; style?: StyleProp<ViewStyle> }>) {
  return <Animated.View entering={FadeInDown.delay(delay).duration(420).springify().damping(18)} style={style}>{children}</Animated.View>;
}

export function MotionPressable({ children, onPress, style, disabled = false, accessibilityLabel }:{
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return <Animated.View style={[style, animated]}>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(.975, { damping: 18, stiffness: 320 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 18, stiffness: 320 }); }}
      style={{ flex: 1 }}
    >{children}</Pressable>
  </Animated.View>;
}
