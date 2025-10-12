export interface IElectronAPI {
  openSnippingTool: () => Promise<{
    success: boolean;
    dataUrl?: string;
    error?: string;
  }>;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}
