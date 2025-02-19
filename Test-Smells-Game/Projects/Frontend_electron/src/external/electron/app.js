const {app, BrowserWindow, ipcMain, Menu, dialog} = require('electron')
const url = require("url");
const path = require("path");
const utils = require('./utils')
const refactoring_service = require('./refactoring-service')
const repo = require('./repository-service')
const {RefactoringGameExerciseConfiguration, CheckGameExerciseConfig} = require("./models");
const fs = require("fs");

utils.configEnvironment("PRODUCTION");

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
      devTools: true
    }
  })



  mainWindow.loadURL(
    url.format({
      pathname: path.join(process.env.ROOT_PATH, `/dist/dariotintore_frontend/index.html`),
      protocol: "file:",
      slashes: true
    })
  );
  // Open the DevTools.
//mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}


function showJavaMessage(){
  const options = {
    type: 'error',
    buttons: ['Ok'],
    defaultId: 1,
    title: 'Java',
    message: 'Do you have installed java?',
    detail: 'The software may not work if you haven\'t installed java',
  };
  dialog.showMessageBox(null,options);
}

function showMavenMessage(){
  const options = {
    type: 'error',
    buttons: ['Ok'],
    defaultId: 1,
    title: 'Maven',
    message: 'Do you have installed Maven?',
    detail: 'The software may not work if you haven\'t installed maven',
  };
  dialog.showMessageBox(null,options);
}



app.on('ready', async function () {
  createWindow()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})

ipcMain.on('compile',async (event, data) => {
  let result = await refactoring_service.doCompile(data)
  result.testResult = utils.cleanSuccessResponse(result.testResult)
  console.log(result)
  if(result.success)
    result.smellResult = utils.removeIgnoredSmells(result.smellResult, data[1]);
  console.log(result);

  const parsedResult = {
    testResult: result.testResult,
    similarityResponse: result.similarityResponse,
    smellResult: result.smellResult,
    success: result.success,
    originalCoverage: result.originalCoverage,
    refactoredCoverage: result.refactoredCoverage
  }

  console.log("--------------------------------------------------------")
  console.log(parsedResult);
  mainWindow.webContents.send('refactoring-exercise-response', parsedResult);
})

ipcMain.on('getFilesFromRemote', async (event, data, type) => {
  console.log("clone repo data: ", data);
  console.log("type exercises: ", type);
  await repo.cloneRepository(data)

  let directory;
  let result;
  switch (type) {
    case "check-smell":
      directory = process.env.LOCAL_EXERCISE_FOLDER + "\\ExerciseDB\\CheckSmellGame\\";
      result = repo.getAllJsonFilesInDirectory(directory, "CheckGameExerciseConfig");
      mainWindow.webContents.send('getCheckSmellExercisesFromLocal', result);
      break;
    case "refactoring":
      directory = process.env.LOCAL_EXERCISE_FOLDER + "\\ExerciseDB\\RefactoringGame\\";
      result = repo.getAllJsonFilesInDirectory(directory, "RefactoringGameExerciseConfiguration");
      mainWindow.webContents.send('getRefactoringExercisesFromLocal', result);
      break;
  }
});

ipcMain.on('getCheckGameFilesFromRemote', async (event, data) => {
  await repo.cloneRepository(data)
  let directory = process.env.LOCAL_EXERCISE_FOLDER + "\\ExerciseDB\\CheckSmellGame\\";
  let result = repo.getAllJsonFilesInDirectory(directory, CheckGameExerciseConfig);
  mainWindow.webContents.send('getCheckGameExerciseFilesFromLocal', result)
})

ipcMain.on('getProductionClassFromLocal', async(event,data, type)=> {
  let result = await repo.getRefactoringExerciseFile(data, type);
  console.log("Production code to frontend: ", result)
  mainWindow.webContents.send('receiveProductionClassFromLocal', result)
})

ipcMain.on('getTestingClassFromLocal', async(event,data, type)=> {
  let result = await repo.getRefactoringExerciseFile(data, type);
  mainWindow.webContents.send('receiveTestingClassFromLocal', result)
})

ipcMain.on('getRefactoringExerciseConfigFromLocal', async(event,data, type)=> {
  let result = await repo.getRefactoringExerciseFile(data, type);
  mainWindow.webContents.send('receiveRefactoringGameConfigFromLocal', result)
})

ipcMain.on('getCheckGameExerciseConfigFromLocal', async(event,data, type)=> {
  let result = await repo.getJsonFileById(data, type);
  mainWindow.webContents.send('receiveCheckGameConfigFromLocal', result)
})


ipcMain.on('checkDependencies', async(event,data)=> {
  await utils.checkMaven().then(result => {
    if (result[0] !== true) {
      showMavenMessage()
      result.maven = true;
    }
    if (result[1] !== true) {
      showJavaMessage();
      result.java = true;
    }
    mainWindow.webContents.send('receiveDependenciesCheck', result)
  })
})

