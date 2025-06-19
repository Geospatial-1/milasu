// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_BUCKET.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// ========== AUTHENTICATION ========== //
function registerUser(userType, userData) {
    return auth.createUserWithEmailAndPassword(userData.email, userData.password)
        .then((userCredential) => {
            return db.collection(userType + 's').doc(userCredential.user.uid).set({
                ...userData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'active'
            });
        });
}

function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
}

function logout() {
    return auth.signOut();
}

// ========== JOB MANAGEMENT ========== //
function postJob(jobData) {
    return db.collection('jobs').add({
        ...jobData,
        postedBy: auth.currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'open'
    });
}

function searchJobs(filters = {}) {
    let query = db.collection('jobs').where('status', '==', 'open');
    
    if (filters.location) query = query.where('location', '==', filters.location);
    if (filters.skills) query = query.where('skills', 'array-contains', filters.skills);
    
    return query.get();
}

// ========== DISPUTE SYSTEM ========== //
function fileDispute(disputeData) {
    return db.collection('disputes').add({
        ...disputeData,
        status: 'open',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

function getDisputes(status = 'open') {
    return db.collection('disputes')
        .where('status', '==', status)
        .orderBy('createdAt', 'desc')
        .get();
}

// ========== UTILITIES ========== //
function uploadFile(file, path) {
    const storageRef = storage.ref(path + '/' + Date.now() + '_' + file.name);
    return storageRef.put(file).then(snapshot => snapshot.ref.getDownloadURL());
}

function collectFormData(formElement) {
    const formData = new FormData(formElement);
    return Object.fromEntries(formData.entries());
}

// Initialize auth state listener
auth.onAuthStateChanged(user => {
    if (user) {
        // Check user type and redirect
        db.collection('admins').doc(user.uid).get()
            .then(doc => {
                if (doc.exists) window.location.href = 'admin.html';
            });
        
        db.collection('helpers').doc(user.uid).get()
            .then(doc => {
                if (doc.exists) window.location.href = 'helper-dash.html';
            });
        
        db.collection('employers').doc(user.uid).get()
            .then(doc => {
                if (doc.exists) window.location.href = 'employer-dash.html';
            });
    }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(err => console.log('SW registration failed'));
    });
}
