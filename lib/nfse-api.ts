import * as SecureStore from "expo-secure-store";

const ACBR_AUTH_URL = "https://auth.acbr.api.br/realms/ACBrAPI/protocol/openid-connect/token";
const ACBR_HOM_URL = "https://hom.acbr.api.br";
const ACBR_PROD_URL = "https://prod.acbr.api.br";
const TOKEN_KEY = "acbr_token";
const TOKEN_EXPIRES_KEY = "acbr_token_expires";
const CLIENT_ID_KEY = "acbr_client_id";
const CLIENT_SECRET_KEY = "acbr_client_secret";

export interface NfseCredentials {
  clientId: string;
  clientSecret: string;
}

export interface NfseListagemItem {
  id: string;
  created_at: string;
  status: string;
  numero: string;
  codigo_verificacao: string;
  link_url: string;
  data_emissao: string;
  ambiente: string;
  referencia: string;
  DPS?: { serie: string; nDPS: string };
}

export interface NfseDetalhe {
  id: string;
  created_at: string;
  status: string;
  numero: string;
  codigo_verificacao: string;
  link_url: string;
  data_emissao: string;
  ambiente: string;
  referencia: string;
  DPS?: { serie: string; nDPS: string };
  declaracao_prestacao_servico?: Record<string, unknown>;
  cancelamento?: Record<string, unknown>;
}

export interface NfseEmitirPayload {
  provedor?: string;
  ambiente: "homologacao" | "producao";
  referencia?: string;
  infDPS: {
    prest: {
      CNPJ?: string;
      CPF?: string;
    };
    toma: {
      CNPJ?: string;
      CPF?: string;
      xNome: string;
      end?: {
        xLgr?: string;
        nro?: string;
        xBairro?: string;
        endNac?: { cMun: string; CEP?: string; xCidade?: string; UF?: string };
      };
    };
    serv?: {
      xDiscServico: string;
      cServTribMun?: string;
      vAliquota?: number;
      vBC?: number;
      vISS?: number;
      vServicos: number;
    };
    dCompet?: string;
  };
}

export async function saveCredentials(creds: NfseCredentials): Promise<void> {
  await SecureStore.setItemAsync(CLIENT_ID_KEY, creds.clientId);
  await SecureStore.setItemAsync(CLIENT_SECRET_KEY, creds.clientSecret);
}

export async function getCredentials(): Promise<NfseCredentials | null> {
  const clientId = await SecureStore.getItemAsync(CLIENT_ID_KEY);
  const clientSecret = await SecureStore.getItemAsync(CLIENT_SECRET_KEY);
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export async function clearCredentials(): Promise<void> {
  await SecureStore.deleteItemAsync(CLIENT_ID_KEY);
  await SecureStore.deleteItemAsync(CLIENT_SECRET_KEY);
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(TOKEN_EXPIRES_KEY);
}

async function getAccessToken(): Promise<string> {
  const creds = await getCredentials();
  if (!creds) throw new Error("Credenciais ACBr API não configuradas");

  const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
  const storedExpires = await SecureStore.getItemAsync(TOKEN_EXPIRES_KEY);
  if (storedToken && storedExpires) {
    const expiresAt = parseInt(storedExpires, 10);
    if (Date.now() < expiresAt - 60000) return storedToken;
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    scope: "nfse",
  }).toString();

  const res = await fetch(ACBR_AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Falha na autenticação ACBr: ${text}`);
  }

  const data = await res.json();
  await SecureStore.setItemAsync(TOKEN_KEY, data.access_token);
  const expiresAt = Date.now() + (data.expires_in || 3600) * 1000;
  await SecureStore.setItemAsync(TOKEN_EXPIRES_KEY, String(expiresAt));
  return data.access_token;
}

async function request<T>(
  path: string,
  options?: { method?: string; body?: unknown; query?: Record<string, string>; environment?: string }
): Promise<T> {
  const token = await getAccessToken();
  const baseUrl =
    options?.environment === "producao" ? ACBR_PROD_URL : ACBR_HOM_URL;
  let url = `${baseUrl}${path}`;
  if (options?.query) {
    const qs = new URLSearchParams(options.query).toString();
    url += `?${qs}`;
  }

  const res = await fetch(url, {
    method: options?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    let msg = text;
    try {
      const json = JSON.parse(text);
      msg = json.message || json.error || text;
    } catch {}
    throw new Error(msg);
  }

  const ct = res.headers.get("content-type");
  if (ct?.includes("application/json")) return res.json() as Promise<T>;
  return res.text() as unknown as Promise<T>;
}

export const nfseApi = {
  getToken: getAccessToken,

  listar: (cpfCnpj: string, ambiente = "homologacao", top = 10, skip = 0) =>
    request<{ "@count"?: number; data: NfseListagemItem[] }>("/nfse", {
      query: { cpf_cnpj: cpfCnpj, ambiente, $top: String(top), $skip: String(skip) },
      environment: ambiente,
    }),

  consultar: (id: string, ambiente = "homologacao") =>
    request<NfseDetalhe>(`/nfse/${id}`, { environment: ambiente }),

  emitir: (payload: NfseEmitirPayload) =>
    request<{ id: string; status: string; numero: string; data_emissao: string }>("/nfse/dps", {
      method: "POST",
      body: payload,
      environment: payload.ambiente,
    }),

  cancelar: (id: string, ambiente = "homologacao", motivo?: string) =>
    request<{ id: string; status: string }>(`/nfse/${id}/cancelamento`, {
      method: "POST",
      body: { motivo: motivo || "Cancelamento solicitado pelo emitente" },
      environment: ambiente,
    }),

  consultarCancelamento: (id: string, ambiente = "homologacao") =>
    request<Record<string, unknown>>(`/nfse/${id}/cancelamento`, { environment: ambiente }),

  sincronizar: (id: string, ambiente = "homologacao") =>
    request<Record<string, unknown>>(`/nfse/${id}/sincronizar`, {
      method: "POST",
      environment: ambiente,
    }),

  cidadesAtendidas: () =>
    request<{ "@count"?: number; data: Array<{ codigo_ibge: string; cidade: string; uf: string }> }>("/nfse/cidades"),

  metadados: (codigoIbge: string) =>
    request<Record<string, unknown>>(`/nfse/cidades/${codigoIbge}`),
};
