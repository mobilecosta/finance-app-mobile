import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useFinanceAuth } from "@/contexts/auth-context";
import { dashboardApi, transactionsApi, type DashboardMetrics, type Transaction } from "@/lib/finance-api";
import { IconSymbol } from "@/components/ui/icon-symbol";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function MetricCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: React.ComponentProps<typeof IconSymbol>["name"];
}) {
  return (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={[styles.metricIcon, { backgroundColor: color + "22" }]}>
        <IconSymbol name={icon} size={20} color={color} />
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  );
}

function TransactionItem({ item }: { item: Transaction }) {
  const isIncome = item.type === "income";
  const color = isIncome ? "#10b981" : "#ef4444";
  const sign = isIncome ? "+" : "-";
  return (
    <View style={styles.txItem}>
      <View style={[styles.txIcon, { backgroundColor: (item.categories?.color ?? "#3b82f6") + "22" }]}>
        <IconSymbol name="tag.fill" size={16} color={item.categories?.color ?? "#3b82f6"} />
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txDesc} numberOfLines={1}>
          {item.description ?? item.categories?.name ?? "Transação"}
        </Text>
        <Text style={styles.txDate}>{formatDate(item.date)}</Text>
      </View>
      <Text style={[styles.txAmount, { color }]}>
        {sign}{formatCurrency(parseFloat(item.amount))}
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { user } = useFinanceAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const startDate = `${y}-${m}-01`;
      const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
      const endDate = `${y}-${m}-${String(lastDay).padStart(2, "0")}`;

      const [metricsData, txData] = await Promise.all([
        dashboardApi.getMetrics("month"),
        transactionsApi.getAll(),
      ]);

      setMetrics(metricsData);
      setRecentTx(Array.isArray(txData) ? txData.slice(0, 5) : []);
    } catch (e) {
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const userName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Usuário";

  return (
    <ScreenContainer>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {userName} 👋</Text>
            <Text style={styles.headerSub}>Resumo do mês atual</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color="#3b82f6" style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={styles.errorBox}>
            <IconSymbol name="exclamationmark.circle" size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            {/* Balance Card */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Saldo do Mês</Text>
              <Text style={[
                styles.balanceValue,
                { color: (metrics?.balance ?? 0) >= 0 ? "#10b981" : "#ef4444" }
              ]}>
                {formatCurrency(metrics?.balance ?? 0)}
              </Text>
            </View>

            {/* Metric Cards */}
            <View style={styles.metricsGrid}>
              <MetricCard
                label="Receitas"
                value={formatCurrency(metrics?.totalIncome ?? 0)}
                color="#10b981"
                icon="arrow.up.circle.fill"
              />
              <MetricCard
                label="Despesas"
                value={formatCurrency(metrics?.totalExpense ?? 0)}
                color="#ef4444"
                icon="arrow.down.circle.fill"
              />
              <MetricCard
                label="Transações"
                value={String(metrics?.transactionCount ?? 0)}
                color="#3b82f6"
                icon="list.bullet"
              />
              <MetricCard
                label="Saldo"
                value={formatCurrency(metrics?.balance ?? 0)}
                color="#f59e0b"
                icon="wallet.pass"
              />
            </View>

            {/* Recent Transactions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Transações Recentes</Text>
              {recentTx.length === 0 ? (
                <View style={styles.emptyBox}>
                  <IconSymbol name="list.bullet" size={32} color="#334155" />
                  <Text style={styles.emptyText}>Nenhuma transação este mês</Text>
                </View>
              ) : (
                <View style={styles.txList}>
                  {recentTx.map(item => (
                    <TransactionItem key={item.id} item={item} />
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { fontSize: 22, fontWeight: "700", color: "#f1f5f9" },
  headerSub: { fontSize: 13, color: "#94a3b8", marginTop: 2 },
  balanceCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  balanceLabel: { fontSize: 13, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  balanceValue: { fontSize: 32, fontWeight: "700" },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 6,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  metricLabel: { fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 },
  metricValue: { fontSize: 16, fontWeight: "700" },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#f1f5f9", marginBottom: 12 },
  txList: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    overflow: "hidden",
  },
  txItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    gap: 12,
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 14, fontWeight: "500", color: "#f1f5f9" },
  txDate: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: "600" },
  emptyBox: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyText: { color: "#64748b", fontSize: 14 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderRadius: 8,
    padding: 12,
    margin: 16,
  },
  errorText: { color: "#ef4444", fontSize: 13 },
});
