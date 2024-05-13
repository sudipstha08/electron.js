const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");
const resizeImg = require("resize-img");

const isMac = process.platform === "darwin";
const isDev = process.env.NODE_ENV !== "development";

let mainWindow;

// create the main window
function createMainWindow() {
	mainWindow = new BrowserWindow({
		title: "Image Resizer",
		width: isDev ? 1000 : 600,
		height: 500,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: true,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	/**
	 * Open devtools if in dev env
	 */
	if (isDev) {
		mainWindow.webContents.openDevTools();
	}
	mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
}

//create about window
function createAboutWindow() {
	const aboutWindow = new BrowserWindow({
		title: "About Image Resizer",
		width: 300,
		height: 500,
	});

	aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}

// App is ready
app.whenReady().then(() => {
	createMainWindow();

	const mainMenu = Menu.buildFromTemplate(menu);
	Menu.setApplicationMenu(mainMenu);

	// remove main window from memory on close
	mainWindow.on("close", () => (mainWindow = null));

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
							click: createAboutWindow,
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
							click: createAboutWindow,
						},
					],
				},
		  ]
		: []),
];

// Respond to ipc renderer resize
ipcMain.on("image:resize", (e, options) => {
	options.dest = path.join(os.homedir(), "imageresizer");
	resizeImage(options);
	console.log(options);
});

async function resizeImage({ imgPath, width, height, dest }) {
	try {
		console.log("fsdfsdf", { imgPath });
		if (!imgPath) {
			return;
		}
		const newPath = await resizeImg(fs.readFileSync(imgPath), {
			width: +width,
			height: +height,
		});

		// create filename
		const filename = path.basename(imgPath);

		// create dest folder if not exists
		if (!fs.existsSync(dest)) {
			fs.mkdirSync(dest);
		}

		console.log("dest", dest)
		console.log("filename", filename)
		console.log("newPath", newPath)

		if(!newPath) {
			return
		}

		// wrtei file to dest folder
		fs.writeFileSync(path.join(dest, filename), newPath);

		// send success to renderer
		mainWindow.webContents.send("image:done");

		// opne dest folder
		shell.openPath(dest);
	} catch (error) {
		console.log(error);
	}
}

app.on("window-all-closed", () => {
	if (!isMac) {
		app.quit();
	}
});
