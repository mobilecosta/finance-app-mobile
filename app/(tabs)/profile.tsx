import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useFinanceAuth } from "@/contexts/auth-context";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function ProfileScreen() {
  const { user, signout } = useFinanceAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Sair", "Deseja encerrar sua sessão?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await signout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const userName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Usuário";
  const initials = userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <ScreenContainer>
      <View style={styles.container}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{user?.email ?? ""}</Text>
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <IconSymbol name="person.fill" size={18} color="#94a3b8" />
            <View style={styles.cardInfo}>
              <Text style={styles.cardLabel}>Nome</Text>
              <Text style={styles.cardValue}>{userName}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardRow}>
            <IconSymbol name="paperplane.fill" size={18} color="#94a3b8" />
            <View style={styles.cardInfo}>
              <Text style={styles.cardLabel}>Email</Text>
              <Text style={styles.cardValue}>{user?.email ?? "—"}</Text>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <IconSymbol name="wallet.pass" size={18} color="#3b82f6" />
            <View style={styles.cardInfo}>
              <Text style={styles.cardLabel}>Aplicativo</Text>
              <Text style={styles.cardValue}>Finance Pro</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardRow}>
            <IconSymbol name="checkmark.circle.fill" size={18} color="#10b981" />
            <View style={styles.cardInfo}>
              <Text style={styles.cardLabel}>Versão</Text>
              <Text style={styles.cardValue}>1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <IconSymbol name="arrow.right.square" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Encerrar sessão</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  avatarSection: { alignItems: "center", paddingVertical: 24, gap: 8 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#3b82f622", borderWidth: 2, borderColor: "#3b82f6",
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 28, fontWeight: "700", color: "#3b82f6" },
  userName: { fontSize: 20, fontWeight: "700", color: "#f1f5f9" },
  userEmail: { fontSize: 14, color: "#94a3b8" },
  card: {
    backgroundColor: "#1e293b", borderRadius: 12,
    borderWidth: 1, borderColor: "#334155", marginBottom: 12,
  },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  cardInfo: { flex: 1 },
  cardLabel: { fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 },
  cardValue: { fontSize: 14, color: "#f1f5f9", fontWeight: "500", marginTop: 2 },
  divider: { height: 1, backgroundColor: "#334155", marginHorizontal: 14 },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: "#ef444422", borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: "#ef444444", marginTop: 8,
  },
  logoutText: { fontSize: 16, fontWeight: "600", color: "#ef4444" },
});
