const hosts = new Map(); // divId -> { host, instance, off }

export async function startUnity(divId) {

    // Reset scene scale before showing Unity
    document.documentElement.style.setProperty("--scene-scale", "1");
    document.documentElement.style.setProperty("--scene-offset-y", "0px");

    const base = document.baseURI || "/";
    const host = document.getElementById(divId);
    if (!host) return;

    let mount = host.querySelector("#unityMount") ?? Object.assign(document.createElement("div"), { id: "unityMount" });
    if (!mount.parentNode) host.appendChild(mount);
    mount.textContent = "";

    const box = Object.assign(document.createElement("div"), { id: "unity-container" });
    Object.assign(box.style, {
        position: "relative", width: "90vw", height: "90vh", margin: "auto", background: "#000",
        overflow: "hidden", borderRadius: "15px", display: "flex", alignItems: "center", justifyContent: "center"
    });

    const canvas = Object.assign(document.createElement("canvas"), { id: "unity-canvas" });
    Object.assign(canvas.style, { width: "100%", height: "100%", display: "block" });
    box.appendChild(canvas);

    const loader = Object.assign(document.createElement("div"), { id: "unity-loader" });
    loader.innerHTML = `<div class="wrap"><div class="spinner"></div><div class="bar"><span></span></div><div class="pct">0%</div></div>`;
    Object.assign(loader.style, {
        position: "absolute", inset: "0", display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,.35)", zIndex: "20"
    });
    box.appendChild(loader);

    const close = Object.assign(document.createElement("img"), { id: "unity-close", alt: "Close" });
    close.src = base + "images/back_btn_3.png";
    Object.assign(close.style, { position: "absolute", top: "10px", left: "10px", width: "60px", height: "60px", cursor: "pointer", zIndex: "30", opacity: "0.9", userSelect: "none" });
    close.addEventListener("click", () => hideUnity(divId));
    box.appendChild(close);

    mount.appendChild(box);

    const sectionConfig =
        await DotNet.invokeMethodAsync("BlazorAppWasm", "GetWhichSegmentInside");
    console.log("======>" + sectionConfig + "<===========");

    const cfg = {        
        dataUrl: base + `PharmaCoreDev_Chatbot${sectionConfig}/Build/PharmaCoreDev_Chatbot.data.unityweb`,
        frameworkUrl: base + `PharmaCoreDev_Chatbot${sectionConfig}/Build/PharmaCoreDev_Chatbot.framework.js.unityweb`,
        codeUrl: base + `PharmaCoreDev_Chatbot${sectionConfig}/Build/PharmaCoreDev_Chatbot.wasm.unityweb`,
        matchWebGLToCanvasSize: true,
        devicePixelRatio: window.devicePixelRatio
    };



    const onProgress = p => {
        const v = Math.round((p ?? 0) * 100);
        loader.querySelector(".bar>span")?.style.setProperty("width", v + "%");
        const pct = loader.querySelector(".pct"); if (pct) pct.textContent = v + "%";
    };

    const load = () => createUnityInstance(canvas, cfg, onProgress).then(inst => {
        loader.remove?.();
        // initial DPR size
        const ratio = window.devicePixelRatio || 1;
        inst.Module?.setCanvasSize?.(canvas.clientWidth * ratio, canvas.clientHeight * ratio);

        // prevent multiple listeners
        hosts.get(divId)?.off?.();
        const onResize = () => {
            const r = window.devicePixelRatio || 1;
            inst.Module?.setCanvasSize?.(canvas.clientWidth * r, canvas.clientHeight * r);
        };
        window.addEventListener("resize", onResize);
        window.addEventListener("orientationchange", onResize);
        const off = () => {
            window.removeEventListener("resize", onResize);
            window.removeEventListener("orientationchange", onResize);
        };
        hosts.set(divId, { host, instance: inst, off });
    }).catch(err => {
        const pct = loader.querySelector(".pct"); if (pct) pct.textContent = "Error";
        console.error(err);
    });

    if (!document.getElementById("unity-loader-added")) {
        const s = document.createElement("script");
        s.id = "unity-loader-added";
        s.src = base + `PharmaCoreDev_Chatbot${sectionConfig}/Build/PharmaCoreDev_Chatbot.loader.js`;
        s.onload = load; document.body.appendChild(s);
    } else load();

    host.style.display = "flex";
}

export function hideUnity(divId) {
    const entry = hosts.get(divId);
    if (!entry) return;
    entry.host.style.display = "none";
    window.DotNet?.invokeMethodAsync("BlazorAppWasm", "HideAIChat");
}

export function showUnity(divId) {
    window.DotNet?.invokeMethodAsync("BlazorAppWasm", "ShowAIChat");
    const entry = hosts.get(divId);
    if (!entry) { startUnity(divId); return; }
    entry.host.style.display = "flex";
    // force repaint
    const canvas = entry.host.querySelector("#unity-canvas");
    const r = window.devicePixelRatio || 1;
    if (canvas) entry.instance?.Module?.setCanvasSize?.(canvas.clientWidth * r, canvas.clientHeight * r);
}
