import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useFinanceAuth } from "@/contexts/auth-context";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function LoginScreen() {
  const router = useRouter();
  const { signin, signup, loading, error } = useFinanceAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLocalError(null);
    if (!email || !password) {
      setLocalError("Email e senha são obrigatórios");
      return;
    }
    let success: boolean;
    if (isSignup) {
      success = await signup(email, password, fullName || undefined);
    } else {
      success = await signin(email, password);
    }
    if (success) {
      router.replace("/(tabs)");
    }
  };

  const displayError = localError ?? error;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo / Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <IconSymbol name="wallet.pass" size={40} color="#3b82f6" />
          </View>
          <Text style={styles.title}>Finance Pro</Text>
          <Text style={styles.subtitle}>
            {isSignup ? "Crie sua conta" : "Bem-vindo de volta"}
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {isSignup && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Seu nome"
                placeholderTextColor="#64748b"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="••••••••"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
              >
                <IconSymbol
                  name={showPassword ? "eye.slash" : "eye"}
                  size={20}
                  color="#94a3b8"
                />
              </TouchableOpacity>
            </View>
          </View>

          {displayError ? (
            <View style={styles.errorBox}>
              <IconSymbol name="exclamationmark.circle" size={16} color="#ef4444" />
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>
                {isSignup ? "Criar conta" : "Entrar"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => {
              setIsSignup(!isSignup);
              setLocalError(null);
            }}
          >
            <Text style={styles.toggleText}>
              {isSignup
                ? "Já tem conta? Entrar"
                : "Não tem conta? Criar conta"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f1f5f9",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#94a3b8",
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#f1f5f9",
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  eyeBtn: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: "#334155",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    flex: 1,
  },
  submitBtn: {
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  toggleBtn: {
    alignItems: "center",
    paddingVertical: 4,
  },
  toggleText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "500",
  },
});
