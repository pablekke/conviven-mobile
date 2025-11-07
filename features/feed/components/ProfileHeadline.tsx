import { memo } from "react";
import { Text, TextProps } from "react-native";

type ProfileHeadlineProps = TextProps & {
  text: string;
};

function ProfileHeadlineComponent({ text, style, ...rest }: ProfileHeadlineProps) {
  if (!text) return null;

  return (
    <Text
      {...rest}
      numberOfLines={1}
      className="text-white text-[26px] font-light"
      style={style}
    >
      {text}
    </Text>
  );
}

export const ProfileHeadline = memo(ProfileHeadlineComponent);

export default ProfileHeadline;

