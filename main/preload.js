const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  on: (channel, callback) => {
    ipcRenderer.on(channel, callback);
  },
  send: (channel, args) => {
    ipcRenderer.send(channel, args);
  },
});

contextBridge.exposeInMainWorld("electron", {
  openSnippingTool: () => ipcRenderer.invoke("open-snipping-tool"),
});
