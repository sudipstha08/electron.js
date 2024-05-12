const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

const isMac = process.platform === "darwin";
const isDev = process.env.NODE_ENV === "development";

console.log(process.env.NODE_ENV, "0000");

// create the main window
function createMainWindow() {
	const mainWindow = new BrowserWindow({
		title: "Image Resizer",
		width: isDev ? 1000 : 600,
		height: 500,
	});

	/**
	 * Open devtools if in dev env
	 */
	if (isDev) {
		mainWindow.webContents.openDevTools();
	}
	mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
}

// App is ready
app.whenReady().then(() => {
	createMainWindow();

	const mainMenu = Menu.buildFromTemplate(menu);
	Menu.setApplicationMenu(mainMenu);

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createMainWindow();
		}
	});
});

// Menu Template
const menu = [
	...(isMac
		? [
				{
					label: app.name,
					submenu: [
						{
							label: "About",
						},
					],
				},
		  ]
		: []),
	{
		role: "fileMenu",
		// label: "File",
		// submenu: [
		// 	{
		// 		label: "Quit",
		// 		click: () => app.quit(),
		// 		accelerator: 'CmdOrCtrl+W'
		// 	},
		// ],
	},
	...(!isMac
		? [
				{
					label: "Help",
					submenu: [
						{
							label: "About",
						},
					],
				},
		  ]
		: []),
];

app.on("window-all-closed", () => {
	if (!isMac) {
		app.quit();
	}
});
