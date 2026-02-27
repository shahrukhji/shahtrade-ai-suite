export const login = async (_apiKey: string, _clientId: string, _password: string, _totp: string): Promise<any> => {
  console.log('angelOneApi.login called');
  return null;
};

export const getProfile = async (_token: string): Promise<any> => {
  console.log('angelOneApi.getProfile called');
  return null;
};

export const getFunds = async (_token: string): Promise<any> => {
  console.log('angelOneApi.getFunds called');
  return null;
};

export const getHoldings = async (_token: string): Promise<any[]> => {
  console.log('angelOneApi.getHoldings called');
  return [];
};

export const getPositions = async (_token: string): Promise<any[]> => {
  console.log('angelOneApi.getPositions called');
  return [];
};

export const getOrders = async (_token: string): Promise<any[]> => {
  console.log('angelOneApi.getOrders called');
  return [];
};

export const getLTP = async (_token: string, _exchange: string, _symbol: string, _symbolToken: string): Promise<any> => {
  console.log('angelOneApi.getLTP called');
  return null;
};

export const getCandleData = async (_token: string, _params: any): Promise<any[]> => {
  console.log('angelOneApi.getCandleData called');
  return [];
};

export const placeOrder = async (_token: string, _params: any): Promise<any> => {
  console.log('angelOneApi.placeOrder called');
  return null;
};

export const cancelOrder = async (_token: string, _orderId: string): Promise<any> => {
  console.log('angelOneApi.cancelOrder called');
  return null;
};

export const searchScrip = async (_token: string, _query: string): Promise<any[]> => {
  console.log('angelOneApi.searchScrip called');
  return [];
};
