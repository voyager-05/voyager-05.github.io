//let _loaderAdded = false, _unity = null;

//export async function startUnity(divId) {
//    const host = document.getElementById(divId);
//    host.innerHTML = "";

//    const container = document.createElement("div");
//    container.id = "unity-container";
//    container.style.width = "85%";
//    container.style.height = "85%";

//    const canvas = document.createElement("canvas");
//    canvas.id = "unity-canvas";
//    canvas.style.width = "90%";
//    canvas.style.height = "90%";
//    host.appendChild(container); container.appendChild(canvas);

//    const config = {
//        dataUrl: "PharmaCoreDev_Chatbot/Build/PharmaCoreDev_Chatbot.data.unityweb",
//        frameworkUrl: "PharmaCoreDev_Chatbot/Build/PharmaCoreDev_Chatbot.framework.js.unityweb",
//        codeUrl: "PharmaCoreDev_Chatbot/Build/PharmaCoreDev_Chatbot.wasm.unityweb",
//        streamingAssetsUrl: "StreamingAssets",
//        matchWebGLToCanvasSize: true,
//        devicePixelRatio: 1
//    };

//    function fit() {
//        canvas.width = container.clientWidth;
//        canvas.height = container.clientHeight;
//        _unity?.Module?.setCanvasSize?.(canvas.width, canvas.height);
//    }

//    const load = () => createUnityInstance(canvas, config)
//        .then(u => { _unity = u; fit(); window.addEventListener("resize", fit); })
//        .catch(console.error);

//    if (!_loaderAdded) {
//        const s = document.createElement("script");
//        s.src = "PharmaCoreDev_Chatbot/Build/PharmaCoreDev_Chatbot.loader.js";
//        s.onload = load; document.body.appendChild(s); _loaderAdded = true;
//    } else { load(); }
//}

//// Keep reference to Unity overlay visibility
//const activeHosts = new Map();
//let loaderAdded = false;

//export async function startUnity(divId) {
//    const host = document.getElementById(divId);
//    host.innerHTML = "";

//    // single container (85% box)
//    const container = document.createElement("div");
//    container.id = "unity-container";
//    Object.assign(container.style, {
//        position: "relative",
//        width: "90vw",
//        height: "90vh",
//        margin: "auto",
//        background: "#000",
//        borderRadius: "12px",
//        overflow: "hidden",
//        display: "block"
//    });
//    host.appendChild(container);

//    // canvas fills container
//    const canvas = document.createElement("canvas");
//    canvas.id = "unity-canvas";
//    Object.assign(canvas.style, { width: "85%", height: "85%", display: "block" });
//    container.appendChild(canvas);

//    // close button inside same container
//    const close = document.createElement("img");
//    close.id = "unity-close";
//    close.src = "images/back_btn.png";
//    Object.assign(close.style, {
//        position: "absolute", top: "10px", left: "10px",
//        width: "72px", height: "72px", cursor: "pointer", zIndex: "10", opacity: "0.9"
//    });
//    close.onclick = () => hideUnity(divId);
//    container.appendChild(close);

//    const config = {
//        dataUrl: "PharmaCoreDev_Chatbot/Build/PharmaCoreDev_Chatbot.data.unityweb",
//        frameworkUrl: "PharmaCoreDev_Chatbot/Build/PharmaCoreDev_Chatbot.framework.js.unityweb",
//        codeUrl: "PharmaCoreDev_Chatbot/Build/PharmaCoreDev_Chatbot.wasm.unityweb",
//        streamingAssetsUrl: "StreamingAssets",
//        matchWebGLToCanvasSize: true,
//        devicePixelRatio: 1
//    };

//    const load = () =>
//        createUnityInstance(canvas, config)
//            .then(inst => activeHosts.set(divId, { host, inst }))
//            .catch(console.error);

//    if (!loaderAdded) {
//        const s = document.createElement("script");
//        s.src = "PharmaCoreDev_Chatbot/Build/PharmaCoreDev_Chatbot.loader.js";
//        s.onload = load;
//        document.body.appendChild(s);
//        loaderAdded = true;
//    } else { load(); }
//}
//export function hideUnity(divId) {
//    const entry = activeHosts.get(divId);
//    if (!entry) return;
//    entry.host.style.display = "none"; // hide only (don’t unload)
//}

//export function showUnity(divId) {
//    const entry = activeHosts.get(divId);
//    if (entry) {
//        entry.host.style.display = "flex"; // show overlay again

//        // force Unity canvas to redraw & resize
//        const canvas = entry.host.querySelector("#unity-canvas");
//        if (canvas) {
//            canvas.style.display = "block";
//            const container = entry.host.querySelector("#unity-container");
//            const w = container?.clientWidth || window.innerWidth * 0.85;
//            const h = container?.clientHeight || window.innerHeight * 0.85;
//            canvas.width = w;
//            canvas.height = h;

//            // optional: tell Unity to resize if method exists
//            const inst = entry.instance;
//            inst?.Module?.setCanvasSize?.(w, h);
//        }
//        return;
//    }

//    startUnity(divId);
//}


// wwwroot/unityHost.js
const hosts = new Map(); // divId -> { host, instance }

export async function startUnity(divId) {
    const host = document.getElementById(divId);
    if (!host) return;

    // ensure mount exists (Razor renders <div id="unityHost"><div id="unityMount"></div></div>)
    let mount = host.querySelector("#unityMount");
    if (!mount) { mount = document.createElement("div"); mount.id = "unityMount"; host.appendChild(mount); }

    // clear only the mount area (keep overlay)
    mount.textContent = "";

    // 85% box + canvas
    const box = document.createElement("div");
    box.id = "unity-container";
    Object.assign(box.style, {
        position: "relative", width: "90vw", height: "90vh", margin: "auto",
        background: "#000", overflow: "hidden", borderRadius: "15px",
        display: "flex",              // center children horizontally + vertically
        alignItems: "center",
        justifyContent: "center"

    });

    const canvas = document.createElement("canvas");
    canvas.id = "unity-canvas";
    Object.assign(canvas.style, { width: "100%", height: "100%", display: "block" });
    box.appendChild(canvas);

    // close button (created in JS)
    const close = document.createElement("img");
    close.id = "unity-close";
    close.src = "images/back_btn.png";
    close.alt = "Close";
    Object.assign(close.style, {
        position: "absolute", top: "10px", left: "10px",
        width: "150px", height: "150px", cursor: "pointer", zIndex: "10", opacity: "0.9"
    });
    close.addEventListener("click", () => hideUnity(divId));
    box.appendChild(close);

    mount.appendChild(box);

    const cfg = {
        dataUrl: "PharmaCoreDev_Chatbot/Build/PharmaCoreDev_Chatbot.data.unityweb",
        frameworkUrl: "PharmaCoreDev_Chatbot/Build/PharmaCoreDev_Chatbot.framework.js.unityweb",
        codeUrl: "PharmaCoreDev_Chatbot/Build/PharmaCoreDev_Chatbot.wasm.unityweb",
        matchWebGLToCanvasSize: true, devicePixelRatio: 1
    };

    const load = () => createUnityInstance(canvas, cfg)
        .then(inst => { hosts.set(divId, { host, instance: inst }); })
        .catch(console.error);

    // load Unity loader once per page
    if (!document.getElementById("unity-loader-added")) {
        const s = document.createElement("script");
        s.id = "unity-loader-added";
        s.src = "PharmaCoreDev_Chatbot/Build/PharmaCoreDev_Chatbot.loader.js";
        s.onload = load;
        document.body.appendChild(s);
    } else {
        load();
    }

    // show overlay
    host.style.display = "flex";
}

export function hideUnity(divId) {
    const entry = hosts.get(divId);
    if (!entry) return;
    entry.host.style.display = "none"; // hide only (do NOT unload)
}

export function showUnity(divId) {
    const entry = hosts.get(divId);
    if (!entry) { startUnity(divId); return; }
    entry.host.style.display = "flex";
    // force resize so canvas repaints after being hidden
    const box = entry.host.querySelector("#unity-container");
    const canvas = entry.host.querySelector("#unity-canvas");
    const w = box?.clientWidth || window.innerWidth * 0.85;
    const h = box?.clientHeight || window.innerHeight * 0.85;
    if (canvas) { canvas.width = w; canvas.height = h; }
    entry.instance?.Module?.setCanvasSize?.(w, h);
}


