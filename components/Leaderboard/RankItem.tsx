import { Text, TouchableOpacity, View } from 'react-native';
import { FREE_FRAME_ID } from '../../constants/frames';
import { useResponsive } from '../../hooks/useResponsive';
import { AvatarWithFrame } from '../Cosmetics/AvatarWithFrame';
import { UserDisplayName } from '../Cosmetics/UserDisplayName';

interface RankItemProps {
  rank: number;
  username: string;
  score: string;
  avatar_url?: string;
  active_frame?: string;
  active_nametag?: string | null;
  active_title?: string | null;
  isCurrentUser?: boolean;
  accentColor?: string;
  onPress?: () => void;
}

export const RankItem = ({
  rank,
  username,
  score,
  avatar_url,
  active_frame,
  active_nametag,
  active_title,
  isCurrentUser,
  accentColor = '#4CAF50',
  onPress
}: RankItemProps) => {
  const { wp, moderateScale, spacing } = useResponsive();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: isCurrentUser ? `${accentColor}1A` : 'rgba(255,255,255,0.03)',
        borderRadius: moderateScale(16),
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: isCurrentUser ? `${accentColor}4D` : 'rgba(255,255,255,0.05)',
      }}
    >
      {/* Rank Number */}
      <Text style={{
        color: isCurrentUser ? accentColor : '#666',
        fontSize: moderateScale(16),
        fontWeight: '900',
        width: moderateScale(30),
        textAlign: 'center'
      }}>
        {rank}
      </Text>

      {/* Avatar */}
      <View style={{ marginHorizontal: spacing.sm }}>
        <AvatarWithFrame
          avatarUrl={avatar_url}
          frameId={active_frame || FREE_FRAME_ID}
          size={moderateScale(45)}
          username={username}
        />
      </View>

      {/* Username with NameTag */}
      <UserDisplayName
        username={username}
        nametagId={active_nametag}
        titleId={active_title}
        size="mini"
        containerStyle={{
          flex: 1,
          alignItems: 'flex-start',
          minWidth: undefined,
        }}
      />

      {/* Score */}
      <Text style={{
        color: accentColor,
        fontSize: moderateScale(14),
        fontWeight: '800'
      }}>
        {score}
      </Text>
    </TouchableOpacity>
  );
};
