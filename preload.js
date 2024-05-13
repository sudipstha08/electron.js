const { contextBridge, ipcRenderer } = require("electron");
const os = require("os");
const path = require("path");

contextBridge.exposeInMainWorld("versions", {
	node: () => process.versions.node,
	chrome: () => process.versions.chrome,
	electron: () => process.versions.electron,
	// we can also expose variables, not just functions
});

contextBridge.exposeInMainWorld("os", {
	homedir: () => os.homedir(),
});

contextBridge.exposeInMainWorld("path", {
	join: (...args) => path.join(...args),
});

contextBridge.exposeInMainWorld("Toastify", {
	toast: (options) => Toastify(options).showToast(),
});

contextBridge.exposeInMainWorld("ipcRenderer", {
	send: (channel, data) => ipcRenderer.send(channel, data),
	on: (channel, func) =>
		ipcRenderer.on(channel, (event, ...args) => func(...args)),
});
