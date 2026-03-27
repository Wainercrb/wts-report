# WTS Report — VS Code Extension

WTS Report is a small VS Code extension that opens a React-based webview to collect and send timesheet-like items to the extension host.

## Development (quick)

1. Build the UI and install dependencies:

```powershell
cd ui
npm install --legacy-peer-deps
npm run build
```

2. Compile the extension and copy the UI bundle into `out/`:

```powershell
cd ..
npm run compile
```

3. Run the extension in the Extension Development Host:

- Open the project in VS Code and press `F5`.
- In the Extension Development Host window open Command Palette and run `WTS Report` (or `extension.startExtension`).

## Packaging (.vsix)

Create a package file and install it into your normal VS Code:

```powershell
cd ui && npm run build
cd ..
npx vsce package
code --install-extension wts-report-0.0.1.vsix
```

## Troubleshooting

- If the webview appears blank, confirm `out/index.html` and `out/main.js` exist (created by `npm run compile`).
- Open Developer Tools in the Extension Host (Help → Toggle Developer Tools) while the webview is focused to inspect console/network errors.
- To update the UI, run `cd ui && npm run build` and then `npm run compile`.

## Useful commands

- Build UI: `cd ui && npm run build`
- Install UI deps: `cd ui && npm install --legacy-peer-deps`
- Compile extension: `npm run compile`
- Package: `npx vsce package`

---

Thank you for using WTS Report.
