import { View, ScrollView } from "react-native";
import { SectionTitle } from "./SectionTitle";
import type { Profile } from "./types";
import { Flag } from "./utils";
import { Chip } from "./Chip";
import { Row } from "./Row";
import React from "react";

interface PerfilSectionProps {
  profile: Profile;
}

export const PerfilSection: React.FC<PerfilSectionProps> = ({ profile }) => {
  const hasProfileInfo =
    profile.occupation ||
    profile.education ||
    (profile.languages && profile.languages.length > 0) ||
    (profile.interests && profile.interests.length > 0);

  if (!hasProfileInfo) return null;

  return (
    <>
      <SectionTitle>Perfil</SectionTitle>
      <View>
        <Row label="Ocupación" value={profile.occupation} />
        <Row label="Educación" value={profile.education} />
        <Row
          label="Intereses"
          value={
            profile.interests?.length ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {profile.interests.map((it, i) => (
                  <Chip key={String(i)} label={it} subtle />
                ))}
              </ScrollView>
            ) : null
          }
        />
      </View>
        <Row
          label="Idiomas"
          value={
            profile.languages?.length ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {profile.languages.map((lng, i) => (
                  <Chip key={String(i)} label={`${Flag(lng)} ${lng}`} />
                ))}
              </ScrollView>
            ) : null
          }
        />
        
    </>
  );
};

