export const startEngine = async (): Promise<void> => { console.log('autoTradeEngine.start called'); };
export const stopEngine = async (): Promise<void> => { console.log('autoTradeEngine.stop called'); };
export const pauseEngine = async (): Promise<void> => { console.log('autoTradeEngine.pause called'); };
export const killAllPositions = async (): Promise<void> => { console.log('autoTradeEngine.killAll called'); };
export const runScan = async (_config: any): Promise<any> => { console.log('autoTradeEngine.scan called'); return null; };
