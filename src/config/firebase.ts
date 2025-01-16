import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyBcnETyIjkqkGytnPybpATBtgcpOdvaHpI",
  authDomain: "gorevler-996b2.firebaseapp.com",
  projectId: "gorevler-996b2",
  storageBucket: "gorevler-996b2.firebasestorage.app",
  messagingSenderId: "946051767913",
  appId: "1:946051767913:web:5b07223a7546043d1bccf8",
  measurementId: "G-S4GGN98JWD"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const analytics = getAnalytics(app)

export default app 