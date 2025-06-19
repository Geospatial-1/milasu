// Firebase Config (Replace with your own)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_BUCKET.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Show Registration Form
function showForm(userType) {
    document.getElementById('registrationForm').style.display = 'block';
    document.getElementById('userType').value = userType;
    document.getElementById('formTitle').innerText = userType === 'employer' ? 'Homeowner Sign Up' : 'Helper Sign Up';
}

// Handle Form Submission
document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;

    // Create user in Firebase Auth
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // Save additional data to Firestore
            return db.collection(userType + 's').doc(user.uid).set({
                name: name,
                email: email,
                phone: phone,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            alert('Registration successful!');
            window.location.href = userType === 'employer' ? 'employer-dashboard.html' : 'helper-dashboard.html';
        })
        .catch((error) => {
            alert('Error: ' + error.message);
        });
});
