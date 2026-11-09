const { app, BrowserWindow } = require('electron');
const path = require('path');
 
function createWindow () {
  // Mengatur ukuran dan tampilan jendela aplikasi Desktop
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    autoHideMenuBar: true, // Menyembunyikan menu bar standar Windows
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
 
  // Memuat antarmuka dari file HTML
  mainWindow.loadFile('index.html');
}
 
app.whenReady().then(() => {
  createWindow();
 
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
 
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});