const { app, BrowserWindow, shell, ipcMain, clipboard } = require("electron");
const path = require("path");
const { exec } = require("child_process");

let win;
let appServe;

// Only require and setup electron-serve if packaged
if (app.isPackaged) {
  const serve = require("electron-serve").default;
  appServe = serve({
    directory: path.join(__dirname, "../out"),
  });
}

const createWindow = () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Prevent new windows from opening
  win.webContents.setWindowOpenHandler(({ url }) => {
    // Open external links in default browser
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Handle navigation attempts
  win.webContents.on("will-navigate", (event, url) => {
    // Get the current URL
    const currentUrl = win.webContents.getURL();

    // Allow navigation within the app
    if (app.isPackaged) {
      // In production, allow app:// protocol
      if (!url.startsWith("app://")) {
        event.preventDefault();
        shell.openExternal(url);
      }
    } else {
      // In development, allow localhost
      if (!url.startsWith("http://localhost:3000")) {
        event.preventDefault();
        shell.openExternal(url);
      }
    }
  });

  if (app.isPackaged) {
    appServe(win).then(() => {
      win.loadURL("app://-");
    });
  } else {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
    win.webContents.on("did-fail-load", (e, code, desc) => {
      win.webContents.reloadIgnoringCache();
    });
  }
};

ipcMain.handle("open-snipping-tool", async () => {
  try {
    const platform = process.platform;

    if (win && !win.isDestroyed()) {
      win.minimize();
    }

    if (platform === "win32") {
      // Windows 10/11 - use modern Snipping Tool
      exec("start ms-screenclip:");

      await new Promise((resolve) => setTimeout(resolve, 3000));
    } else if (platform === "darwin") {
      // macOS - use screenshot utility
      exec("screencapture -i -c");

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (win && !win.isDestroyed()) {
      win.restore();
      win.focus();
    }
    const image = clipboard.readImage();
    if (image.isEmpty()) {
      return { success: false, error: "No image in clipboard" };
    }

    return { success: true, dataUrl: image.toDataURL() };
  } catch (error) {
    console.error("Error opening snipping tool:", error);
    return { success: false, error: error.message };
  }
});

app.on("ready", () => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
