const BASE_URL = 'https://apiconnect.angelone.in';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-UserType': 'USER',
  'X-SourceID': 'WEB',
  'X-ClientLocalIP': '127.0.0.1',
  'X-ClientPublicIP': '127.0.0.1',
  'X-MACAddress': '00:00:00:00:00:00',
  'X-PrivateKey': localStorage.getItem('ao_apikey') || '',
  'Authorization': `Bearer ${localStorage.getItem('ao_access_token') || ''}`,
});

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = BASE_URL + endpoint;
  const corsProxy = localStorage.getItem('st_cors');
  let proxy = 'direct';
  try { if (corsProxy) proxy = JSON.parse(corsProxy).proxy || 'direct'; } catch {}

  const headers = { ...getHeaders(), ...(options.headers as Record<string, string> || {}) };
  const fetchOpts = { ...options, headers };

  const getProxiedUrl = (targetUrl: string) => {
    if (proxy === 'corsproxy.io') return `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    if (proxy === 'allorigins.win') return `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
    if (proxy === 'custom') {
      try { const c = JSON.parse(corsProxy || '{}').custom || ''; return c + encodeURIComponent(targetUrl); } catch { return targetUrl; }
    }
    return targetUrl;
  };

  try {
    const finalUrl = getProxiedUrl(url);
    const res = await fetch(finalUrl, fetchOpts);
    if (res.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        fetchOpts.headers = { ...getHeaders(), ...(options.headers as Record<string, string> || {}) };
        const retryRes = await fetch(getProxiedUrl(url), fetchOpts);
        return retryRes.json();
      }
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (e: any) {
    if (proxy === 'direct' && (e.message?.includes('fetch') || e.name === 'TypeError')) {
      console.log('CORS error, trying corsproxy.io fallback');
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl, fetchOpts);
      return res.json();
    }
    throw e;
  }
}

function parseResponse(res: any) {
  if (res?.status === false || res?.message === 'INVALID TOKEN') throw new Error(res?.message || 'API Error');
  return res?.data;
}

// Login with API Key + Client ID + MPIN only (no TOTP)
export const generateSession = async (clientCode: string, password: string, totp: string): Promise<any> => {
  const res = await apiFetch('/rest/auth/angelbroking/user/v1/loginByPassword', {
    method: 'POST',
    body: JSON.stringify({ clientcode: clientCode, password, totp }),
  });
  console.log('generateSession response:', res);
  const data = parseResponse(res);
  if (data?.jwtToken) {
    localStorage.setItem('ao_access_token', data.jwtToken);
    localStorage.setItem('ao_refresh_token', data.refreshToken || '');
    localStorage.setItem('ao_feed_token', data.feedToken || '');
  }
  return data;
};

export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refreshToken = localStorage.getItem('ao_refresh_token');
    if (!refreshToken) return false;
    const res = await fetch(`${BASE_URL}/rest/auth/angelbroking/jwt/v1/generateTokens`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json();
    if (data?.data?.jwtToken) {
      localStorage.setItem('ao_access_token', data.data.jwtToken);
      return true;
    }
    return false;
  } catch { return false; }
};

export const getProfile = async (): Promise<any> => {
  const res = await apiFetch('/rest/secure/angelbroking/user/v1/getProfile', { method: 'GET' });
  console.log('getProfile:', res);
  return parseResponse(res);
};

export const getFunds = async (): Promise<any> => {
  const res = await apiFetch('/rest/secure/angelbroking/user/v1/getRMS', { method: 'GET' });
  console.log('getFunds:', res);
  return parseResponse(res);
};

export const getHoldings = async (): Promise<any[]> => {
  const res = await apiFetch('/rest/secure/angelbroking/portfolio/v1/getHolding', { method: 'GET' });
  console.log('getHoldings:', res);
  return parseResponse(res) || [];
};

export const getPositions = async (): Promise<any[]> => {
  const res = await apiFetch('/rest/secure/angelbroking/order/v1/getPosition', { method: 'GET' });
  console.log('getPositions:', res);
  return parseResponse(res) || [];
};

export const getOrders = async (): Promise<any[]> => {
  const res = await apiFetch('/rest/secure/angelbroking/order/v1/getOrderBook', { method: 'GET' });
  console.log('getOrders:', res);
  return parseResponse(res) || [];
};

export const getTrades = async (): Promise<any[]> => {
  const res = await apiFetch('/rest/secure/angelbroking/order/v1/getTradeBook', { method: 'GET' });
  console.log('getTrades:', res);
  return parseResponse(res) || [];
};

export const getLTP = async (exchange: string, symbol: string, symbolToken: string): Promise<any> => {
  const res = await apiFetch('/rest/secure/angelbroking/order/v1/getLtpData', {
    method: 'POST',
    body: JSON.stringify({ exchange, tradingsymbol: symbol, symboltoken: symbolToken }),
  });
  return parseResponse(res);
};

export const getCandleData = async (params: { exchange: string; symboltoken: string; interval: string; fromdate: string; todate: string }): Promise<any[]> => {
  const res = await apiFetch('/rest/secure/angelbroking/candle/v2/getCandle', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  console.log('getCandleData:', res);
  return parseResponse(res) || [];
};

export const searchScrip = async (query: string, exchange = ''): Promise<any[]> => {
  const res = await apiFetch('/rest/secure/angelbroking/order/v1/searchScrip', {
    method: 'POST',
    body: JSON.stringify({ exchange, searchscrip: query }),
  });
  return parseResponse(res) || [];
};

export const placeOrder = async (params: any): Promise<any> => {
  const res = await apiFetch('/rest/secure/angelbroking/order/v1/placeOrder', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  console.log('placeOrder:', res);
  return parseResponse(res);
};

export const modifyOrder = async (params: any): Promise<any> => {
  const res = await apiFetch('/rest/secure/angelbroking/order/v1/modifyOrder', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return parseResponse(res);
};

export const cancelOrder = async (variety: string, orderId: string): Promise<any> => {
  const res = await apiFetch('/rest/secure/angelbroking/order/v1/cancelOrder', {
    method: 'POST',
    body: JSON.stringify({ variety, orderid: orderId }),
  });
  return parseResponse(res);
};

export const logout = async (): Promise<void> => {
  try {
    const clientCode = localStorage.getItem('ao_client_id');
    await apiFetch('/rest/secure/angelbroking/user/v1/logout', {
      method: 'POST',
      body: JSON.stringify({ clientcode: clientCode }),
    });
  } catch (e) { console.log('logout error:', e); }
};

export const searchAllExchanges = async (query: string): Promise<any[]> => {
  const exchanges = ['NSE', 'BSE', 'NFO', 'MCX'];
  const results: any[] = [];
  const settled = await Promise.allSettled(exchanges.map(ex => searchScrip(query, ex)));
  settled.forEach((r, i) => {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      results.push(...r.value.map((item: any) => ({
        ...item,
        exchange: exchanges[i],
        isEquity: ['NSE', 'BSE'].includes(exchanges[i]),
        isFnO: exchanges[i] === 'NFO',
        isCommodity: exchanges[i] === 'MCX',
      })));
    }
  });
  return results;
};

export const syncAllData = async () => {
  const [profile, funds, holdings, positions, orders, trades] = await Promise.allSettled([
    getProfile(), getFunds(), getHoldings(), getPositions(), getOrders(), getTrades(),
  ]);
  return {
    profile: profile.status === 'fulfilled' ? profile.value : null,
    funds: funds.status === 'fulfilled' ? funds.value : null,
    holdings: holdings.status === 'fulfilled' ? holdings.value : null,
    positions: positions.status === 'fulfilled' ? positions.value : null,
    orders: orders.status === 'fulfilled' ? orders.value : null,
    trades: trades.status === 'fulfilled' ? trades.value : null,
  };
};
