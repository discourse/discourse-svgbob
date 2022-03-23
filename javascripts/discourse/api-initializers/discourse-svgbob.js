import loadScript from "discourse/lib/load-script";
import { apiInitializer } from "discourse/lib/api";
import { later } from "@ember/runloop";

let wasm = undefined;

async function applySvgbob(element, key = "composer") {
  const svgbobs = element.querySelectorAll("pre[data-code-wrap=svgbob]");

  if (!svgbobs.length) {
    return;
  }

  let importObject = {
    env: {
      abort: () => console.log("abort")
    }
  };

  svgbobs.forEach((svgbob) => {
    if (svgbob.dataset.processed) {
      return;
    }

    const spinner = document.createElement("div");
    spinner.classList.add("spinner");

    if (svgbob.dataset.codeHeight && key !== "composer") {
      svgbob.style.height = `${svgbob.dataset.codeHeight}px`;
    }

    later(() => {
      if (!svgbob.dataset.rendered) {
        svgbob.append(spinner);
      }
    }, 2000);
  });

  if (!wasm) {
    let response = await WebAssembly.instantiateStreaming(
      fetch("https://unpkg.com/svgbob-wasm@0.4.1/svgbob_wasm_bg.wasm"),
      importObject
    );

    wasm = response.instance.exports;
  }

  svgbobs.forEach((svgbob, index) => {
    const code = svgbob.querySelector("code");

    svgbob.dataset.rendered = "true";

    if (!code) {
      return;
    }

    svgbob.innerHTML = stripStyle(convert_string(code.innerText));

    if (key === "composer") {
      later(() => updateMarkdownHeight(svgbob, index), 1000);
    }
  });
}

function stripStyle(svg) {
  return svg.replace(/<style.*<\/style>/s, "");
}

function updateMarkdownHeight(svgbob, index) {
  let height = parseInt(svgbob.getBoundingClientRect().height);
  let calculatedHeight = parseInt(svgbob.dataset.calculatedHeight);

  if (height === 0) {
    return;
  }

  if (height !== calculatedHeight) {
    svgbob.dataset.calculatedHeight = height;
    // TODO: need to use API here
    let composer = document.getElementsByClassName('d-editor-input')[0];
    let old = composer.value;

    let split = old.split("\n");

    let n = 0;
    for (let i=0; i<split.length; i++) {
      if (split[i].match(/```svgbob/)) {
        if (n === index) {
          split[i] = "```svgbob height=" + height;
        }
        n += 1;
      }
    }

    let restorePosStart = composer.selectionStart;
    let restorePosEnd = composer.selectionEnd;

    composer.value = split.join("\n")

    if (restorePosStart) {
      composer.selectionStart = restorePosStart;
      composer.selectionEnd = restorePosEnd;
    }
  }
}

export default apiInitializer("0.11.1", (api) => {
  api.addToolbarPopupMenuOptionsCallback(() => {
    return {
      action: "insertSvgbobSample",
      icon: "project-diagram",
      label: themePrefix("insert_svgbob_sample"),
    };
  });

  // this is a hack as applySurround expects a top level
  // composer key, not possible from a theme
  window.I18n.translations[
    window.I18n.locale
  ].js.composer.svgbob_sample = `
    *-------------*
    | hello world |
    *-------------*
  `;

  api.modifyClass("controller:composer", {
    pluginId: "discourse-svgbob",
    actions: {
      insertSvgbobSample() {
        this.toolbarEvent.applySurround(
          "\n```svgbob\n",
          "\n```\n",
          "svgbob_sample",
          { multiline: false }
        );
      },
    },
  });

  if (api.decorateChatMessage) {
    api.decorateChatMessage((element) => {
      applySvgbob(element, `chat_message_${element.id}`);
    });
  }

  api.decorateCookedElement(
    async (elem, helper) => {
      const id = helper ? `post_${helper.getModel().id}` : "composer";
      applySvgbob(elem, id);
    },
    { id: "discourse-svgbob" }
  );
});


// direct copy from svgbob-wasm source (auto generated)

let WASM_VECTOR_LEN = 0;

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}
/**
* @param {string} data
* @returns {string}
*/
function convert_string(data) {
    try {
        const retptr = wasm.__wbindgen_export_0.value - 16;
        wasm.__wbindgen_export_0.value = retptr;
        var ptr0 = passStringToWasm0(data, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.convert_string(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_export_0.value += 16;
        wasm.__wbindgen_free(r0, r1);
    }
}

