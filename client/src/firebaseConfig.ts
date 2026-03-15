// ── Firebase Client SDK ───────────────────────────────────────────────────
// Initialised once (module-level singleton) to avoid the re-render cascade
// that triggers auth/popup-closed-by-user.

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  Auth,
} from 'firebase/auth';

// ── Env var validation ────────────────────────────────────────────────────
const REQUIRED_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

export const isFirebaseConfigured: boolean = REQUIRED_VARS.every(
  key => !!import.meta.env[key] && import.meta.env[key] !== 'YOUR_API_KEY'
);

if (!isFirebaseConfigured) {
  console.warn(
    '[Firebase] Not configured — Google login will run in demo mode.\n' +
    'Set these env vars on Render:\n' +
    REQUIRED_VARS.map(k => `  ${k}`).join('\n')
  );
}

// ── Singleton init (safe to call multiple times) ───────────────────────────
let _app:      FirebaseApp | null = null;
let _auth:     Auth | null = null;
let _provider: GoogleAuthProvider | null = null;

function getFirebase() {
  if (!isFirebaseConfigured) return { auth: null, provider: null };

  if (!_app) {
    // getApps() check prevents "duplicate app" error on HMR in dev
    _app = getApps().length > 0
      ? getApps()[0]
      : initializeApp({
          apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId:             import.meta.env.VITE_FIREBASE_APP_ID,
        });

    _auth     = getAuth(_app);
    _provider = new GoogleAuthProvider();
    _provider.addScope('email');
    _provider.addScope('profile');
    // Force account selection every time
    _provider.setCustomParameters({ prompt: 'select_account' });
  }

  return { auth: _auth!, provider: _provider! };
}

// Export auth for any direct usage
export const auth = (() => {
  try { return isFirebaseConfigured ? getFirebase().auth : null; } catch { return null; }
})();

// ── Mobile / restricted env detection ─────────────────────────────────────
function isMobileOrRestricted(): boolean {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// ── signInWithGoogle ───────────────────────────────────────────────────────
// Returns:
//   string      — Firebase ID token (send to /api/auth/google-login)
//   null        — Firebase not configured (demo mode)
//   "__redirect__" — redirect flow initiated on mobile (page will reload)
export async function signInWithGoogle(): Promise<string | null> {
  const { auth, provider } = getFirebase();

  // Demo mode — Firebase not configured
  if (!auth || !provider) {
    console.warn('[Firebase] Demo mode — returning mock token');
    return null;
  }

  try {
    if (isMobileOrRestricted()) {
      // Redirect flow: page will reload, checkGoogleRedirectResult() handles completion
      await signInWithRedirect(auth, provider);
      return '__redirect__';
    }

    // Desktop popup flow
    const result = await signInWithPopup(auth, provider);
    return await result.user.getIdToken();
  } catch (err: any) {
    switch (err.code) {
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        // User dismissed — not an error, just return null
        return null;

      case 'auth/popup-blocked':
        // Browser blocked popup — fall back to redirect
        await signInWithRedirect(auth, provider);
        return '__redirect__';

      case 'auth/unauthorized-domain': {
        const domain = window.location.hostname;
        throw new Error(
          `"${domain}" is not an authorised domain.\n` +
          `Add it in Firebase Console → Authentication → Settings → Authorized Domains.`
        );
      }

      default:
        console.error('[Firebase] signInWithPopup error:', err.code, err.message);
        throw err;
    }
  }
}

// ── checkGoogleRedirectResult ──────────────────────────────────────────────
// Call once on Profile page mount to pick up pending redirect sign-ins.
export async function checkGoogleRedirectResult(): Promise<string | null> {
  const { auth } = getFirebase();
  if (!auth) return null;
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      return await result.user.getIdToken();
    }
  } catch (err: any) {
    if (err.code === 'auth/unauthorized-domain') {
      const domain = window.location.hostname;
      throw new Error(
        `"${domain}" is not authorised in Firebase. ` +
        `Add it under Authentication → Authorized Domains.`
      );
    }
    // Other redirect errors are non-fatal (e.g. no pending redirect)
    if (err.code !== 'auth/no-auth-event') {
      console.warn('[Firebase] getRedirectResult:', err.code);
    }
  }
  return null;
}
