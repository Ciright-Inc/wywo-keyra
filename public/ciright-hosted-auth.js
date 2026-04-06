/**
 * Ciright hosted passwordless sign-in — minimal browser integration.
 * @see POST /hosted-login/start on the auth backend
 * Popup mode resolves with { access_token, state, redirect_uri }.
 */
(function (global) {
  function normalizeBase(url) {
    var s = String(url || "").trim().replace(/\/+$/, "");
    if (!s) return "";
    if (/^https?:\/\//i.test(s)) return s;
    var host = s.split("/")[0] || "";
    if (/^localhost(:\d+)?$/i.test(host) || /^127\.0\.0\.1(:\d+)?$/i.test(host)) return "http://" + s;
    return "https://" + s;
  }

  function randomVerifier() {
    var arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    var bin = "";
    for (var i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }

  function sha256Base64Url(verifier) {
    var enc = new TextEncoder();
    return crypto.subtle.digest("SHA-256", enc.encode(verifier)).then(function (buf) {
      var bytes = new Uint8Array(buf);
      var bin = "";
      for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    });
  }

  /**
   * @param {object} options
   * @param {string} options.authBackendUrl - e.g. https://auth.example.com
   * @param {string} options.clientId - publishable key client id (pk_ / cp_ …)
   * @param {string} options.redirectUri - must match project callback_url or hostedRedirectUris
   * @param {boolean} [options.usePkce=true]
   * @param {boolean} [options.usePopup=false] - if true, expects postMessage from hosted window
   */
  async function signIn(options) {
    var authBackendUrl = normalizeBase(options.authBackendUrl);
    var clientId = String(options.clientId || "").trim();
    var redirectUri = String(options.redirectUri || "").trim();
    var usePkce = options.usePkce !== false;
    var usePopup = options.usePopup === true;

    if (!authBackendUrl || !clientId || !redirectUri) {
      throw new Error("authBackendUrl, clientId, and redirectUri are required");
    }

    var state = randomVerifier() + randomVerifier();
    var body = { clientId: clientId, redirectUri: redirectUri, state: state };

    var popupRef = null;
    if (usePopup) {
      popupRef = window.open("about:blank", "ciright-hosted-auth", "width=480,height=640");
      if (!popupRef) {
        throw new Error("Popup blocked — allow popups for this site, then try again.");
      }
      try {
        popupRef.document.title = "Signing in…";
        popupRef.document.body.innerHTML =
          "<p style=\"font-family:system-ui;padding:1rem\">Starting hosted sign-in…</p>";
      } catch (e) {
        /* ignore */
      }
    }

    if (usePkce) {
      var verifier = randomVerifier();
      body.codeChallenge = await sha256Base64Url(verifier);
      body.codeChallengeMethod = "S256";
      sessionStorage.setItem("ciright_hosted_pkce_" + state, verifier);
    }

    var startRes;
    var startJson;
    try {
      startRes = await fetch(authBackendUrl + "/hosted-login/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      startJson = await startRes.json().catch(function () {
        return {};
      });
    } catch (err) {
      if (popupRef) popupRef.close();
      throw err;
    }
    if (!startRes.ok) {
      if (popupRef) popupRef.close();
      throw new Error(
        startJson.error_description || startJson.error || "hosted-login/start failed (" + startRes.status + ")",
      );
    }

    var hostedUrl = startJson.hostedUrl;
    if (!hostedUrl) {
      if (popupRef) popupRef.close();
      throw new Error("Missing hostedUrl from server");
    }

    if (usePkce) {
      var v = sessionStorage.getItem("ciright_hosted_pkce_" + state);
      hostedUrl += (hostedUrl.indexOf("#") >= 0 ? "&" : "#") + "cv=" + encodeURIComponent(v || "");
    }

    if (usePopup) {
      popupRef.location.href = hostedUrl;
      return new Promise(function (resolve, reject) {
        function onMsg(ev) {
          var d = ev.data;
          if (!d || d.source !== "ciright-hosted-auth") return;
          if (d.state !== state) return;
          window.removeEventListener("message", onMsg);
          if (usePkce) sessionStorage.removeItem("ciright_hosted_pkce_" + state);
          var tok = d.access_token || d.id_token;
          resolve({ access_token: tok, state: d.state, redirect_uri: d.redirect_uri });
        }
        window.addEventListener("message", onMsg);
      });
    }

    window.location.assign(hostedUrl);
    return new Promise(function () {});
  }

  global.CirightHostedAuth = { signIn: signIn, normalizeBase: normalizeBase };
})(typeof window !== "undefined" ? window : self);
