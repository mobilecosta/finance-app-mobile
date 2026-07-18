import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Alert,
  RefreshControl,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { transactionsApi, categoriesApi, accountsApi, type Transaction, type Category, type Account } from "@/lib/finance-api";
import { IconSymbol } from "@/components/ui/icon-symbol";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

const STATUS_LABELS: Record<string, string> = {
  completed: "Concluído",
  pending: "Pendente",
  cancelled: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  completed: "#10b981",
  pending: "#f59e0b",
  cancelled: "#ef4444",
};

interface FormData {
  type: "income" | "expense";
  amount: string;
  description: string;
  date: string;
  status: "completed" | "pending" | "cancelled";
  categoryId: string;
  accountId: string;
}

const defaultForm: FormData = {
  type: "expense",
  amount: "",
  description: "",
  date: new Date().toISOString().split("T")[0]!,
  status: "completed",
  categoryId: "",
  accountId: "",
};

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [txData, catData, accData] = await Promise.all([
        transactionsApi.getAll(),
        categoriesApi.getAll(),
        accountsApi.getAll(),
      ]);
      setTransactions(Array.isArray(txData) ? txData : []);
      setCategories(Array.isArray(catData) ? catData : []);
      setAccounts(Array.isArray(accData) ? accData : []);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(() => { setRefreshing(true); loadData(); }, [loadData]);

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setModalVisible(true);
  };

  const openEdit = (tx: Transaction) => {
    setEditingId(tx.id);
    setForm({
      type: tx.type,
      amount: tx.amount,
      description: tx.description ?? "",
      date: tx.date,
      status: (["completed", "pending", "cancelled"].includes(tx.status) ? tx.status : "completed") as "completed" | "pending" | "cancelled",
      categoryId: tx.categoryId,
      accountId: tx.accountId,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.amount || !form.date) {
      Alert.alert("Erro", "Valor e data são obrigatórios");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await transactionsApi.update(editingId, {
          amount: form.amount,
          description: form.description,
          status: form.status,
          date: form.date,
        });
      } else {
        await transactionsApi.create({
          type: form.type,
          amount: form.amount,
          description: form.description,
          date: form.date,
          status: form.status,
          categoryId: form.categoryId,
          accountId: form.accountId,
        });
      }
      setModalVisible(false);
      loadData();
    } catch {
      Alert.alert("Erro", "Não foi possível salvar a transação");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Confirmar", "Deseja excluir esta transação?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await transactionsApi.delete(id);
            loadData();
          } catch {
            Alert.alert("Erro", "Não foi possível excluir");
          }
        },
      },
    ]);
  };

  const filtered = transactions.filter(tx => {
    if (filterType !== "all" && tx.type !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      return (tx.description ?? "").toLowerCase().includes(q) ||
        (tx.categories?.name ?? "").toLowerCase().includes(q);
    }
    return true;
  });

  const renderItem = ({ item }: { item: Transaction }) => {
    const isIncome = item.type === "income";
    const amtColor = isIncome ? "#10b981" : "#ef4444";
    const catColor = item.categories?.color ?? "#3b82f6";
    return (
      <View style={styles.txRow}>
        <View style={[styles.txIcon, { backgroundColor: catColor + "22" }]}>
          <IconSymbol name="tag.fill" size={16} color={catColor} />
        </View>
        <View style={styles.txInfo}>
          <Text style={styles.txDesc} numberOfLines={1}>
            {item.description ?? item.categories?.name ?? "Transação"}
          </Text>
          <View style={styles.txMeta}>
            <Text style={styles.txDate}>{formatDate(item.date)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[item.status] ?? "#94a3b8") + "22" }]}>
              <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] ?? "#94a3b8" }]}>
                {STATUS_LABELS[item.status] ?? item.status}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.txRight}>
          <Text style={[styles.txAmount, { color: amtColor }]}>
            {isIncome ? "+" : "-"}{formatCurrency(parseFloat(item.amount))}
          </Text>
          <View style={styles.txActions}>
            <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
              <IconSymbol name="pencil" size={14} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
              <IconSymbol name="trash" size={14} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Transações</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
            <IconSymbol name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <IconSymbol name="magnifyingglass" size={16} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar transações..."
            placeholderTextColor="#64748b"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {(["all", "income", "expense"] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, filterType === f && styles.filterTabActive]}
              onPress={() => setFilterType(f)}
            >
              <Text style={[styles.filterTabText, filterType === f && styles.filterTabTextActive]}>
                {f === "all" ? "Todas" : f === "income" ? "Receitas" : "Despesas"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        {loading ? (
          <ActivityIndicator color="#3b82f6" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
            contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : { paddingBottom: 100 }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <IconSymbol name="list.bullet" size={40} color="#334155" />
                <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Modal Form */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? "Editar Transação" : "Nova Transação"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <IconSymbol name="xmark" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Type Toggle */}
              {!editingId && (
                <View style={styles.typeRow}>
                  <TouchableOpacity
                    style={[styles.typeBtn, form.type === "expense" && styles.typeBtnExpense]}
                    onPress={() => setForm(f => ({ ...f, type: "expense" }))}
                  >
                    <Text style={[styles.typeBtnText, form.type === "expense" && { color: "#ef4444" }]}>
                      Despesa
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeBtn, form.type === "income" && styles.typeBtnIncome]}
                    onPress={() => setForm(f => ({ ...f, type: "income" }))}
                  >
                    <Text style={[styles.typeBtnText, form.type === "income" && { color: "#10b981" }]}>
                      Receita
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Amount */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Valor (R$)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="0,00"
                  placeholderTextColor="#64748b"
                  value={form.amount}
                  onChangeText={v => setForm(f => ({ ...f, amount: v }))}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Descrição</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Descrição da transação"
                  placeholderTextColor="#64748b"
                  value={form.description}
                  onChangeText={v => setForm(f => ({ ...f, description: v }))}
                />
              </View>

              {/* Date */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Data (AAAA-MM-DD)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="2025-01-01"
                  placeholderTextColor="#64748b"
                  value={form.date}
                  onChangeText={v => setForm(f => ({ ...f, date: v }))}
                />
              </View>

              {/* Status */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Status</Text>
                <View style={styles.statusRow}>
                  {["completed", "pending", "cancelled"].map(s => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.statusOption,
                        form.status === s && { borderColor: STATUS_COLORS[s] ?? "#94a3b8", backgroundColor: (STATUS_COLORS[s] ?? "#94a3b8") + "22" },
                      ]}
                      onPress={() => setForm(f => ({ ...f, status: s as "completed" | "pending" | "cancelled" }))}
                    >
                      <Text style={[
                        styles.statusOptionText,
                        form.status === s && { color: STATUS_COLORS[s] ?? "#94a3b8" },
                      ]}>
                        {STATUS_LABELS[s]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Category */}
              {!editingId && categories.length > 0 && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Categoria</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipRow}>
                      {categories.filter(c => c.type === form.type).map(c => (
                        <TouchableOpacity
                          key={c.id}
                          style={[
                            styles.chip,
                            form.categoryId === c.id && { borderColor: c.color, backgroundColor: c.color + "22" },
                          ]}
                          onPress={() => setForm(f => ({ ...f, categoryId: c.id }))}
                        >
                          <Text style={[styles.chipText, form.categoryId === c.id && { color: c.color }]}>
                            {c.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* Account */}
              {!editingId && accounts.length > 0 && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Conta</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipRow}>
                      {accounts.map(a => (
                        <TouchableOpacity
                          key={a.id}
                          style={[
                            styles.chip,
                            form.accountId === a.id && { borderColor: a.color, backgroundColor: a.color + "22" },
                          ]}
                          onPress={() => setForm(f => ({ ...f, accountId: a.id }))}
                        >
                          <Text style={[styles.chipText, form.accountId === a.id && { color: a.color }]}>
                            {a.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>
                  {editingId ? "Salvar alterações" : "Criar transação"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16 },
  title: { fontSize: 22, fontWeight: "700", color: "#f1f5f9" },
  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#3b82f6", alignItems: "center", justifyContent: "center",
  },
  searchRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#1e293b", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: "#334155", marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#f1f5f9" },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  filterTab: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    backgroundColor: "#1e293b", alignItems: "center",
    borderWidth: 1, borderColor: "#334155",
  },
  filterTabActive: { backgroundColor: "#3b82f622", borderColor: "#3b82f6" },
  filterTabText: { fontSize: 13, color: "#94a3b8", fontWeight: "500" },
  filterTabTextActive: { color: "#3b82f6" },
  txRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#1e293b", padding: 14,
    borderWidth: 1, borderColor: "#334155", borderRadius: 12,
  },
  txIcon: { width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 14, fontWeight: "500", color: "#f1f5f9" },
  txMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 3 },
  txDate: { fontSize: 12, color: "#94a3b8" },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: "500" },
  txRight: { alignItems: "flex-end", gap: 4 },
  txAmount: { fontSize: 14, fontWeight: "600" },
  txActions: { flexDirection: "row", gap: 8 },
  actionBtn: { padding: 4 },
  separator: { height: 8 },
  emptyContainer: { flex: 1, justifyContent: "center" },
  emptyBox: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyText: { color: "#64748b", fontSize: 14 },
  // Modal
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" },
  modalSheet: {
    backgroundColor: "#1e293b", borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: "90%", borderWidth: 1, borderColor: "#334155",
  },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 16, borderBottomWidth: 1, borderBottomColor: "#334155",
  },
  modalTitle: { fontSize: 17, fontWeight: "600", color: "#f1f5f9" },
  modalBody: { padding: 16 },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  typeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center",
    backgroundColor: "#0f172a", borderWidth: 1, borderColor: "#334155",
  },
  typeBtnExpense: { borderColor: "#ef4444", backgroundColor: "#ef444422" },
  typeBtnIncome: { borderColor: "#10b981", backgroundColor: "#10b98122" },
  typeBtnText: { fontSize: 14, fontWeight: "600", color: "#94a3b8" },
  formGroup: { marginBottom: 14 },
  formLabel: { fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  formInput: {
    backgroundColor: "#0f172a", borderWidth: 1, borderColor: "#334155",
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: "#f1f5f9",
  },
  statusRow: { flexDirection: "row", gap: 8 },
  statusOption: {
    flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center",
    borderWidth: 1, borderColor: "#334155", backgroundColor: "#0f172a",
  },
  statusOptionText: { fontSize: 12, fontWeight: "500", color: "#94a3b8" },
  chipRow: { flexDirection: "row", gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: "#334155", backgroundColor: "#0f172a",
  },
  chipText: { fontSize: 13, color: "#94a3b8" },
  saveBtn: {
    margin: 16, backgroundColor: "#3b82f6", borderRadius: 10,
    paddingVertical: 14, alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
