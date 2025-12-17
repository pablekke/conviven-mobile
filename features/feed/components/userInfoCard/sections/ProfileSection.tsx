import { View, ScrollView } from "react-native";
import { SectionTitle } from "../components/SectionTitle";
import type { Profile } from "../utils/types";
import { Chip } from "../components/Chip";
import { Row } from "../components/Row";
import React from "react";
import Icon from "react-native-ico-flags";
import { getFlagIconNameForLanguage } from "../../../../../utils/languageFlags";

interface ProfileSectionProps {
  profile: Profile;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ profile }) => {
  const hasProfileInfo =
    profile.occupation ||
    profile.education ||
    (profile.languages && profile.languages.length > 0) ||
    (profile.interests && profile.interests.length > 0);

  if (!hasProfileInfo) return null;

  const getLanguageMeta = (language: string): { label: string } => {
    const isShortCode = /^[a-z]{2,3}$/i.test(language.trim());
    const label = isShortCode ? language.trim().toUpperCase() : language.trim();

    // El icono se resuelve con react-native-ico-flags; aquí solo normalizamos la etiqueta.
    return { label };
  };

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
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {profile.languages.map((lng, i) => (
                <Chip
                  key={String(i)}
                  label={getLanguageMeta(lng).label}
                  leftIcon={<Icon name={getFlagIconNameForLanguage(lng)} width={14} height={14} />}
                />
              ))}
            </ScrollView>
          ) : null
        }
      />
    </>
  );
};

