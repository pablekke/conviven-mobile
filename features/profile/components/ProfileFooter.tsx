import { Image, StyleSheet, View } from "react-native";

export const ProfileFooter: React.FC = () => {
  return (
    <View style={styles.footerContainer}>
      <Image
        source={require("../../../assets/images/profile-footer-illustration.png")}
        style={styles.footerImage}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 15,
  },
  footerImage: {
    width: "100%",
    height: 160,
  },
});
