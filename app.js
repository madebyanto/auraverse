// app.js - Community Chat completo (avatar da ROOT, niente Firebase Storage)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  increment,
  where
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// ============================================
// FILTRO PAROLACCE
// ============================================
const badWords = ["merda", "cazzo", "stronzo", "vaffanculo", "bastardo"];
const containsBadWords = text => badWords.some(w => text.toLowerCase().includes(w));

// ============================================
// FIREBASE CONFIG
// ============================================
const firebaseConfig = {
  apiKey: "AIzaSyDsrHAtIh5bsYDHa1wz0LMcmciChAoRikU",
  authDomain: "myauraid-f03c6.firebaseapp.com",
  projectId: "myauraid-f03c6",
  messagingSenderId: "190478237725",
  appId: "1:190478237725:web:0d39907473f511b85a06f4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

let currentUser;
let currentChannel = null;
let userFlagCount = 0;

// ============================================
// DOM
// ============================================
let loginDiv, communityDiv, sidebar, channelsList, messagesDiv, warningDiv;
let emailInput, passwordInput, msgInput, channelNameEl, channelDescEl;
let userAvatar, userName, userEmail;

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  loginDiv = document.getElementById('login');
  communityDiv = document.getElementById('community');
  sidebar = document.getElementById('sidebar');
  channelsList = document.getElementById('channelsList');
  messagesDiv = document.getElementById('messages');
  warningDiv = document.getElementById('warning');
  emailInput = document.getElementById('email');
  passwordInput = document.getElementById('password');
  msgInput = document.getElementById('msg');
  channelNameEl = document.getElementById('channelName');
  channelDescEl = document.getElementById('channelDesc');
  userAvatar = document.getElementById('userAvatar');
  userName = document.getElementById('userName');
  userEmail = document.getElementById('userEmail');

  document.getElementById('loginBtn')?.addEventListener('click', login);
  document.getElementById('sendBtn')?.addEventListener('click', sendMessage);
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  document.getElementById('toggleSidebar')?.addEventListener('click', toggleSidebar);
  document.getElementById('closeSidebar')?.addEventListener('click', toggleSidebar);

  msgInput?.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
  });
});

// ============================================
// UI
// ============================================
function toggleSidebar() {
  sidebar?.classList.toggle('closed');
}

// ============================================
// AUTH
// ============================================
async function login() {
  try {
    await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
  } catch (e) {
    alert(e.message);
  }
}

async function logout() {
  await auth.signOut();
}

onAuthStateChanged(auth, async user => {
  if (!user) {
    loginDiv.classList.remove('hidden');
    communityDiv.classList.add('hidden');
    return;
  }

  currentUser = user;
  loginDiv.classList.add('hidden');
  communityDiv.classList.remove('hidden');

  await loadUserProfile(user);
  await loadChannels();
});

// ============================================
// PROFILO UTENTE (ROOT IMAGE)
// ============================================
function loadUserProfile(user) {
  const imgPath = `/users/${user.uid}/profileImage.jpg`;

  userAvatar.src = imgPath;
  userAvatar.onerror = () => {
    userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=ff1493&color=fff&size=128`;
  };

  userName.textContent = user.displayName || user.email.split('@')[0];
  userEmail.textContent = user.email;
}

// ============================================
// CANALI
// ============================================
async function loadChannels() {
  const channels = [
    { id: 'general', name: 'Chat1', desc: 'bjfewbufv' },
    { id: 'chat2', name: 'Chat2', desc: 'maremma maiala' },
    { id: 'random', name: 'Test Aura Chat', desc: 'Google' }
  ];

  channelsList.innerHTML = '';

  channels.forEach(c => {
    const el = document.createElement('div');
    el.className = 'channel-item';
    el.innerHTML = `<strong>${c.name}</strong><div>${c.desc}</div>`;
    el.onclick = () => selectChannel(c);
    channelsList.appendChild(el);
  });
}

function selectChannel(channel) {
  currentChannel = channel.id;
  channelNameEl.textContent = channel.name;
  loadChannelMessages(channel.id);
}

function loadChannelMessages(channelId) {
  messagesDiv.innerHTML = '';

  const q = query(
    collection(db, 'messages'),
    where('channel', '==', channelId),
    orderBy('timestamp')
  );

  onSnapshot(q, snap => {
    snap.docChanges().forEach(c => {
      if (c.type === 'added') displayMessage(c.doc.data());
    });
  });
}

// ============================================
// MESSAGGI
// ============================================
async function sendMessage() {
  const text = msgInput.value.trim();
  if (!text || !currentChannel) return;

  const flagged = containsBadWords(text);

  await addDoc(collection(db, 'messages'), {
    uid: currentUser.uid,
    username: currentUser.email.split('@')[0],
    text,
    channel: currentChannel,
    flagged,
    timestamp: serverTimestamp()
  });

  msgInput.value = '';
}

function displayMessage(data) {
  const el = document.createElement('div');
  el.className = 'message';

  const avatar = `/users/${data.uid}/profileImage.jpg`;

  el.innerHTML = `
    <img class="message-avatar"
         src="${avatar}"
         onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(data.username)}&background=667eea&color=fff&size=128'">
    <div>
      <strong>${data.username}</strong><br>
      ${data.flagged ? '<em>Messaggio rimosso</em>' : data.text}
    </div>
  `;

  messagesDiv.appendChild(el);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
