import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  nfseApi,
  saveCredentials,
  getCredentials,
  clearCredentials,
  type NfseCredentials,
  type NfseListagemItem,
  type NfseDetalhe,
} from "@/lib/nfse-api";

type Tab = "credenciais" | "listar" | "consultar" | "emitir" | "cancelar";

const TABS: { key: Tab; label: string }[] = [
  { key: "credenciais", label: "Credenciais" },
  { key: "listar", label: "Listar" },
  { key: "consultar", label: "Consultar" },
  { key: "emitir", label: "Emitir" },
  { key: "cancelar", label: "Cancelar" },
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    processando: "#f59e0b",
    autorizado: "#10b981",
    cancelado: "#ef4444",
    rejeitado: "#ef4444",
    novo: "#3b82f6",
  };
  const color = colors[status] ?? "#94a3b8";
  return (
    <View style={[styles.badge, { backgroundColor: color + "22" }]}>
      <Text style={[styles.badgeText, { color }]}>{status}</Text>
    </View>
  );
}

export default function NfseScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("credenciais");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const [creds, setCreds] = useState<NfseCredentials>({ clientId: "", clientSecret: "" });
  const [credsSaved, setCredsSaved] = useState(false);

  const [ambiente, setAmbiente] = useState<"homologacao" | "producao">("homologacao");

  const [listCpfCnpj, setListCpfCnpj] = useState("");
  const [listResult, setListResult] = useState<NfseListagemItem[]>([]);

  const [consultId, setConsultId] = useState("");
  const [consultResult, setConsultResult] = useState<NfseDetalhe | null>(null);

  const [emitCnpjPrest, setEmitCnpjPrest] = useState("");
  const [emitCnpjTom, setEmitCnpjTom] = useState("");
  const [emitNomeTom, setEmitNomeTom] = useState("");
  const [emitDescServ, setEmitDescServ] = useState("");
  const [emitValor, setEmitValor] = useState("");
  const [emitCodMun, setEmitCodMun] = useState("");
  const [emitResult, setEmitResult] = useState<{ id: string; status: string; numero: string } | null>(null);

  const [cancelId, setCancelId] = useState("");
  const [cancelResult, setCancelResult] = useState<{ id: string; status: string } | null>(null);

  useEffect(() => {
    (async () => {
      const saved = await getCredentials();
      if (saved) {
        setCreds(saved);
        setCredsSaved(true);
      }
    })();
  }, []);

  const handleSaveCreds = useCallback(async () => {
    if (!creds.clientId || !creds.clientSecret) {
      Alert.alert("Erro", "Preencha Client ID e Client Secret");
      return;
    }
    await saveCredentials(creds);
    setCredsSaved(true);
    Alert.alert("Sucesso", "Credenciais salvas com segurança");
  }, [creds]);

  const handleClearCreds = useCallback(async () => {
    await clearCredentials();
    setCreds({ clientId: "", clientSecret: "" });
    setCredsSaved(false);
    Alert.alert("OK", "Credenciais removidas");
  }, []);

  const handleListar = useCallback(async () => {
    if (!listCpfCnpj) { Alert.alert("Erro", "Informe o CPF/CNPJ"); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await nfseApi.listar(listCpfCnpj, ambiente);
      setListResult(res.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao listar");
    } finally {
      setLoading(false);
    }
  }, [listCpfCnpj, ambiente]);

  const handleConsultar = useCallback(async () => {
    if (!consultId) { Alert.alert("Erro", "Informe o ID da NFS-e"); return; }
    setLoading(true); setError(null); setConsultResult(null); setResult(null);
    try {
      const res = await nfseApi.consultar(consultId, ambiente);
      setConsultResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao consultar");
    } finally {
      setLoading(false);
    }
  }, [consultId, ambiente]);

  const handleEmitir = useCallback(async () => {
    if (!emitCnpjPrest || !emitCnpjTom || !emitNomeTom || !emitDescServ || !emitValor) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios");
      return;
    }
    setLoading(true); setError(null); setEmitResult(null); setResult(null);
    try {
      const res = await nfseApi.emitir({
        provedor: "padrao",
        ambiente,
        infDPS: {
          prest: { CNPJ: emitCnpjPrest },
          toma: {
            CNPJ: emitCnpjTom,
            xNome: emitNomeTom,
          },
          serv: {
            xDiscServico: emitDescServ,
            vServicos: parseFloat(emitValor),
          },
          dCompet: new Date().toISOString().split("T")[0],
        },
      });
      setEmitResult(res);
      setResult(`NFS-e emitida: ${res.numero} (${res.status})`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao emitir");
    } finally {
      setLoading(false);
    }
  }, [emitCnpjPrest, emitCnpjTom, emitNomeTom, emitDescServ, emitValor, ambiente]);

  const handleCancelar = useCallback(async () => {
    if (!cancelId) { Alert.alert("Erro", "Informe o ID da NFS-e"); return; }
    setLoading(true); setError(null); setCancelResult(null); setResult(null);
    try {
      const res = await nfseApi.cancelar(cancelId, ambiente);
      setCancelResult(res);
      setResult(`Cancelamento solicitado: ${res.status}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao cancelar");
    } finally {
      setLoading(false);
    }
  }, [cancelId, ambiente]);

  function renderTabContent() {
    if (error) {
      return (
        <View style={styles.errorBox}>
          <IconSymbol name="exclamationmark.circle" size={20} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    switch (activeTab) {
      case "credenciais":
        return (
          <View>
            <Text style={styles.sectionTitle}>Credenciais ACBr API</Text>
            <Text style={styles.hint}>
              Obtenha suas credenciais no console da ACBr API.
            </Text>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Client ID</Text>
              <TextInput
                style={styles.formInput}
                placeholder="seu-client-id"
                placeholderTextColor="#64748b"
                value={creds.clientId}
                onChangeText={v => setCreds(c => ({ ...c, clientId: v }))}
                autoCapitalize="none"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Client Secret</Text>
              <TextInput
                style={styles.formInput}
                placeholder="seu-client-secret"
                placeholderTextColor="#64748b"
                value={creds.clientSecret}
                onChangeText={v => setCreds(c => ({ ...c, clientSecret: v }))}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            <View style={styles.ambienteRow}>
              <Text style={styles.formLabel}>Ambiente</Text>
              <View style={styles.ambToggle}>
                {(["homologacao", "producao"] as const).map(a => (
                  <TouchableOpacity
                    key={a}
                    style={[styles.ambBtn, ambiente === a && styles.ambBtnActive]}
                    onPress={() => setAmbiente(a)}
                  >
                    <Text style={[styles.ambBtnText, ambiente === a && styles.ambBtnTextActive]}>
                      {a === "homologacao" ? "Homologação" : "Produção"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.credActions}>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleSaveCreds}>
                <Text style={styles.btnText}>Salvar credenciais</Text>
              </TouchableOpacity>
              {credsSaved && (
                <TouchableOpacity style={styles.btnDanger} onPress={handleClearCreds}>
                  <Text style={styles.btnDangerText}>Remover</Text>
                </TouchableOpacity>
              )}
            </View>
            {credsSaved && (
              <View style={styles.successBox}>
                <IconSymbol name="checkmark.circle.fill" size={16} color="#10b981" />
                <Text style={styles.successText}>Credenciais salvas e criptografadas</Text>
              </View>
            )}
          </View>
        );

      case "listar":
        return (
          <View>
            <Text style={styles.sectionTitle}>Listar NFS-e</Text>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>CPF/CNPJ do prestador</Text>
              <TextInput
                style={styles.formInput}
                placeholder="00000000000000"
                placeholderTextColor="#64748b"
                value={listCpfCnpj}
                onChangeText={setListCpfCnpj}
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleListar} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Listar</Text>}
            </TouchableOpacity>
            {listResult.length > 0 && (
              <View style={styles.listContainer}>
                {listResult.map(item => (
                  <View key={item.id} style={styles.listItem}>
                    <View style={styles.listItemHeader}>
                      <Text style={styles.listItemNumero}>Nº {item.numero}</Text>
                      <StatusBadge status={item.status} />
                    </View>
                    <Text style={styles.listItemText}>ID: {item.id}</Text>
                    {item.codigo_verificacao && (
                      <Text style={styles.listItemText}>Código: {item.codigo_verificacao}</Text>
                    )}
                    <Text style={styles.listItemText}>
                      Emissão: {item.data_emissao ? new Date(item.data_emissao).toLocaleString("pt-BR") : "—"}
                    </Text>
                    {item.referencia && <Text style={styles.listItemText}>Ref: {item.referencia}</Text>}
                  </View>
                ))}
              </View>
            )}
          </View>
        );

      case "consultar":
        return (
          <View>
            <Text style={styles.sectionTitle}>Consultar NFS-e</Text>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>ID da NFS-e</Text>
              <TextInput
                style={styles.formInput}
                placeholder="ID da nota"
                placeholderTextColor="#64748b"
                value={consultId}
                onChangeText={setConsultId}
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleConsultar} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Consultar</Text>}
            </TouchableOpacity>
            {consultResult && (
              <View style={styles.detailCard}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Número</Text>
                  <Text style={styles.detailValue}>{consultResult.numero}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <StatusBadge status={consultResult.status} />
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>ID</Text>
                  <Text style={styles.detailValue}>{consultResult.id}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Código verificação</Text>
                  <Text style={styles.detailValue}>{consultResult.codigo_verificacao}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Link</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>{consultResult.link_url}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Emissão</Text>
                  <Text style={styles.detailValue}>
                    {consultResult.data_emissao ? new Date(consultResult.data_emissao).toLocaleString("pt-BR") : "—"}
                  </Text>
                </View>
              </View>
            )}
          </View>
        );

      case "emitir":
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Emitir NFS-e</Text>
            <Text style={styles.hint}>
              Preencha os dados do prestador e tomador. Use o ambiente de homologação para testes.
            </Text>
            <Text style={styles.formGroupLabel}>Prestador</Text>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>CNPJ</Text>
              <TextInput
                style={styles.formInput}
                placeholder="00000000000000"
                placeholderTextColor="#64748b"
                value={emitCnpjPrest}
                onChangeText={setEmitCnpjPrest}
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.formGroupLabel}>Tomador</Text>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>CNPJ/CPF</Text>
              <TextInput
                style={styles.formInput}
                placeholder="00000000000000"
                placeholderTextColor="#64748b"
                value={emitCnpjTom}
                onChangeText={setEmitCnpjTom}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nome</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Nome do tomador"
                placeholderTextColor="#64748b"
                value={emitNomeTom}
                onChangeText={setEmitNomeTom}
              />
            </View>
            <Text style={styles.formGroupLabel}>Serviço</Text>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Descrição</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Descrição do serviço"
                placeholderTextColor="#64748b"
                value={emitDescServ}
                onChangeText={setEmitDescServ}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Valor (R$)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="100.00"
                placeholderTextColor="#64748b"
                value={emitValor}
                onChangeText={setEmitValor}
                keyboardType="decimal-pad"
              />
            </View>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleEmitir} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Emitir NFS-e</Text>}
            </TouchableOpacity>
            {emitResult && (
              <View style={styles.successBox}>
                <IconSymbol name="checkmark.circle.fill" size={16} color="#10b981" />
                <Text style={styles.successText}>
                  NFS-e emitida! Nº {emitResult.numero} ({emitResult.status})
                </Text>
              </View>
            )}
          </ScrollView>
        );

      case "cancelar":
        return (
          <View>
            <Text style={styles.sectionTitle}>Cancelar NFS-e</Text>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>ID da NFS-e</Text>
              <TextInput
                style={styles.formInput}
                placeholder="ID da nota a cancelar"
                placeholderTextColor="#64748b"
                value={cancelId}
                onChangeText={setCancelId}
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity style={styles.btnDanger} onPress={handleCancelar} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnDangerText}>Cancelar NFS-e</Text>}
            </TouchableOpacity>
            {cancelResult && (
              <View style={styles.successBox}>
                <IconSymbol name="checkmark.circle.fill" size={16} color="#10b981" />
                <Text style={styles.successText}>Cancelamento: {cancelResult.status}</Text>
              </View>
            )}
          </View>
        );
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>NFS-e ACBr</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {!credsSaved && activeTab !== "credenciais" && (
            <View style={styles.warningBox}>
              <IconSymbol name="exclamationmark.circle" size={16} color="#f59e0b" />
              <Text style={styles.warningText}>
                Configure as credenciais da ACBr API na aba Credenciais primeiro.
              </Text>
            </View>
          )}
          {result && (
            <View style={styles.successBox}>
              <IconSymbol name="checkmark.circle.fill" size={16} color="#10b981" />
              <Text style={styles.successText}>{result}</Text>
            </View>
          )}
          {renderTabContent()}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  title: { fontSize: 20, fontWeight: "700", color: "#f1f5f9", paddingVertical: 16 },
  tabRow: { flexDirection: "row", marginBottom: 12 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1e293b",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  tabActive: { backgroundColor: "#3b82f622", borderColor: "#3b82f6" },
  tabText: { fontSize: 13, color: "#94a3b8", fontWeight: "500" },
  tabTextActive: { color: "#3b82f6" },
  content: { flex: 1, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#f1f5f9", marginBottom: 8, marginTop: 4 },
  hint: { fontSize: 12, color: "#64748b", marginBottom: 12, lineHeight: 18 },
  formGroup: { marginBottom: 12 },
  formGroupLabel: { fontSize: 13, fontWeight: "600", color: "#94a3b8", marginBottom: 6, marginTop: 4 },
  formLabel: { fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  formInput: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#f1f5f9",
  },
  ambienteRow: { marginBottom: 12 },
  ambToggle: { flexDirection: "row", gap: 8, marginTop: 4 },
  ambBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#334155",
  },
  ambBtnActive: { borderColor: "#3b82f6", backgroundColor: "#3b82f622" },
  ambBtnText: { fontSize: 13, color: "#94a3b8", fontWeight: "500" },
  ambBtnTextActive: { color: "#3b82f6" },
  credActions: { flexDirection: "row", gap: 8, marginTop: 4 },
  btnPrimary: {
    flex: 1,
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  btnDanger: {
    flex: 1,
    backgroundColor: "#ef444422",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ef444444",
    marginBottom: 8,
  },
  btnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  btnDangerText: { color: "#ef4444", fontSize: 14, fontWeight: "600" },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  errorText: { color: "#ef4444", fontSize: 13, flex: 1 },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(16,185,129,0.1)",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  successText: { color: "#10b981", fontSize: 13, flex: 1 },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(245,158,11,0.1)",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  warningText: { color: "#f59e0b", fontSize: 13, flex: 1 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
  listContainer: { marginTop: 12, gap: 8 },
  listItem: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 4,
  },
  listItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  listItemNumero: { fontSize: 14, fontWeight: "600", color: "#f1f5f9" },
  listItemText: { fontSize: 12, color: "#94a3b8" },
  detailCard: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#334155",
    marginTop: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: { fontSize: 12, color: "#64748b" },
  detailValue: { fontSize: 12, color: "#f1f5f9", fontWeight: "500", flex: 1, textAlign: "right" },
});
