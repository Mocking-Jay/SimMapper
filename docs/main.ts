import {BrowserWindow, screen} from 'electron';
const appConfig = require('electron-settings');

export default class Main{
    static mainWindow: Electron.BrowserWindow;
    static application: Electron.App;
    static BrowserWindow;

    private static onWindowAllClosed(){
        if(process.platform !== 'darwin'){
            Main.application.quit();
        }
    }

    private static onClose(window: BrowserWindow){
        window = null;
    }

    private static createWindow(options: any, mainWindowStateKeeper: any){
        var nWindow = new Main.BrowserWindow(options);
        nWindow.removeMenu()

        mainWindowStateKeeper.track(nWindow);
        nWindow.on('closed',() => Main.onClose(nWindow));
        return nWindow;
    }

    private static windowSetup(window: BrowserWindow,viewLocation:string){
        window.loadURL('file://'+ __dirname +'/' + viewLocation);
    }


    private static async onReady(){
        var screenSize = screen.getPrimaryDisplay().size;
        var mainWindowStateKeeper = await windowStateKeeper('main');

        Main.mainWindow = Main.createWindow({
            title:"Similarity Mapper",
            x: mainWindowStateKeeper.x,
            y: mainWindowStateKeeper.y,
            width: mainWindowStateKeeper.width,
            height: mainWindowStateKeeper.height,
            webPreferences: {
                nodeIntegration: true,
                defaultFontFamily :"sansSerif"
            }
        }, mainWindowStateKeeper);

        Main.windowSetup(Main.mainWindow,'view/index.html');
    }

    static main(app:Electron.App,browserWindow: typeof BrowserWindow){
        Main.BrowserWindow = browserWindow;
        Main.application = app;
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('ready',Main.onReady);
    }
}


async function windowStateKeeper(windowName) {
    let window, windowState;

    function saveState() {
        if (!windowState.isMaximized) {
            windowState = window.getBounds();
        }
        windowState.isMaximized = window.isMaximized();
        appConfig.set(`windowState.${windowName}`, windowState);
    }

    function track(win) {
        window = win;
        ['resize', 'move', 'close'].forEach(event => {
            win.on(event, saveState);
        });
    }


    // Restore from appConfig
    if (appConfig.has(`windowState.${windowName}`)) {
        let state = await appConfig.get(`windowState.${windowName}`)
        console.log("Restoring window config: " + state);
        windowState = state;
        return({
            x: windowState.x,
            y: windowState.y,
            width: windowState.width,
            height: windowState.height,
            isMaximized: windowState.isMaximized,
            track,
        });
    }

    console.log("Restoring default window config");
    // Default
    return({
        x: undefined,
        y: undefined,
        width: 1400,
        height: 1000,
        isMaximized: false,
        track,
    });

}