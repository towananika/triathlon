// Googleログイン（Firebase Authentication）。どのページからも読み込める。
// ログイン中の人は window.TRI_USER に入り、変わるたびに 'tri-user' イベントを出す。
// ここは「だれか」を知るためだけに使う。ページの中身を隠す鍵には使わない（AGENTS.md）。
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, OAuthProvider, signInWithPopup, signInWithRedirect, signOut } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

// 公開してよい値（Firebaseのウェブ用設定）
const app = initializeApp({
  apiKey: 'AIzaSyAYoAEw3r1FZv2_ueTEHyWobyejscM0uJM',
  authDomain: 'triathlon-dcb18.firebaseapp.com',
  projectId: 'triathlon-dcb18',
  storageBucket: 'triathlon-dcb18.firebasestorage.app',
  messagingSenderId: '223801624179',
  appId: '1:223801624179:web:ab1f94ab31cbf01c904c06'
});
const auth = getAuth(app);
auth.languageCode = 'ja';

onAuthStateChanged(auth, (u) => {
  window.TRI_USER = u ? { name: u.displayName || 'ユーザー', photo: u.photoURL || '', email: u.email || '' } : null;
  document.dispatchEvent(new CustomEvent('tri-user', { detail: window.TRI_USER }));
});

// kind: 'google'（ふつう）か 'apple'
window.triLogin = async (kind) => {
  let p;
  if (kind === 'apple') { p = new OAuthProvider('apple.com'); p.addScope('name'); p.setCustomParameters({ locale: 'ja' }); }
  else { p = new GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' }); }
  try { await signInWithPopup(auth, p); }
  catch (e) {
    if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) return signInWithRedirect(auth, p);
    if (e && e.code === 'auth/popup-closed-by-user') return;
    throw e;
  }
};
window.triLogout = () => signOut(auth);
