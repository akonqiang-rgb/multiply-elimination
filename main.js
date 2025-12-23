
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 850,
    title: "乘法消消乐 - 3D 桌面版",
    backgroundColor: '#e5e7eb',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    // 设置为窗口居中
    center: true,
    // 允许调整大小
    resizable: true
  });

  // 加载本地 index.html
  mainWindow.loadFile('index.html');

  // 隐藏顶部默认菜单栏，使其更像一个纯净的桌面应用
  Menu.setApplicationMenu(null);
  
  // 如果需要调试，可以取消下面这行的注释
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
