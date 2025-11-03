// wwwroot/unityHost.js
const hosts = new Map(); // divId -> { host, instance }

export async function startUnity(divId) {
    const host = document.getElementById(divId);
    if (!host) return;

    let mount = host.querySelector("#unityMount");
    if (!mount) { mount = document.createElement("div"); mount.id = "unityMount"; host.appendChild(mount); }
    mount.textContent = "";

    const box = document.createElement("div");
    box.id = "unity-container";
    Object.assign(box.style, {
        position: "relative", width: "90vw", height: "90vh", margin: "auto",
        background: "#000", overflow: "hidden", borderRadius: "15px",
        display: "flex", alignItems: "center", justifyContent: "center"
    });

    const canvas = document.createElement("canvas");
    canvas.id = "unity-canvas";
    Object.assign(canvas.style, { width: "100%", height: "100%", display: "block" });
    box.appendChild(canvas);

    // Loader overlay
    const loader = document.createElement("div");
    loader.id = "unity-loader";
    loader.innerHTML = `
      <div class="wrap">
        <div class="spinner"></div>
        <div class="bar"><span></span></div>
        <div class="pct">0%</div>
      </div>`;
    Object.assign(loader.style, {
        position: "absolute", inset: "0", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,.35)", zIndex: "20"
    });
    box.appendChild(loader);

    // Close button
    const close = document.createElement("img");
    close.id = "unity-close";
    close.src = "images/back_btn.png";
    close.alt = "Close";
    Object.assign(close.style, {
        position: "absolute", top: "10px", left: "10px",
        width: "150px", height: "150px", cursor: "pointer", zIndex: "30", opacity: "0.9"
    });
    close.addEventListener("click", () => hideUnity(divId));
    box.appendChild(close);

    mount.appendChild(box);

    const cfg = {
        dataUrl: "PharmaCoreDev_Chatbot/Build/PharmaCoreDev_Chatbot.data.unityweb",
        frameworkUrl: "PharmaCoreDev_Chatbot/Build/PharmaCoreDev_Chatbot.framework.js.unityweb",
        codeUrl: "PharmaCoreDev_Chatbot/Build/PharmaCoreDev_Chatbot.wasm.unityweb",
        matchWebGLToCanvasSize: true,
        devicePixelRatio: 1
    };

    const onProgress = (p) => {
        const v = Math.round(p * 100);
        loader.querySelector(".bar > span").style.width = v + "%";
        loader.querySelector(".pct").textContent = v + "%";
    };

    const load = () => createUnityInstance(canvas, cfg, onProgress)
        .then(inst => { box.removeChild(loader); hosts.set(divId, { host, instance: inst }); })
        .catch(err => { loader.querySelector(".pct").textContent = "Error"; console.error(err); });

    if (!document.getElementById("unity-loader-added")) {
        const s = document.createElement("script");
        s.id = "unity-loader-added";
        s.src = "PharmaCoreDev_Chatbot/Build/PharmaCoreDev_Chatbot.loader.js";
        s.onload = load;
        document.body.appendChild(s);
    } else {
        load();
    }

    host.style.display = "flex";
}

export function hideUnity(divId) {
    const entry = hosts.get(divId);
    if (!entry) return;
    entry.host.style.display = "none"; // hide only (do NOT unload)

    if (window.DotNet) {
        DotNet.invokeMethodAsync("BlazorAppWasm", "HideAIChat");
    }
}

export function showUnity(divId) {
    if (window.DotNet) {
        DotNet.invokeMethodAsync("BlazorAppWasm", "ShowAIChat");
    }
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


