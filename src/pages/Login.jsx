import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { BookOpen, Calendar, Calculator, CloudLightning, ArrowRight, ShieldCheck, MailCheck, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Login() {
 const { login } = useAuth();
 
 const [isSignUp, setIsSignUp] = useState(false);
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [fullName, setFullName] = useState('');
 const [university, setUniversity] = useState('');
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const [showModal, setShowModal] = useState(false);
 const [verificationSent, setVerificationSent] = useState(false);

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!email.trim() || !password.trim()) return;
 
 setLoading(true);
 setError('');

 try {
 if (isSignUp) {
 if (!fullName.trim() || !university.trim()) {
 setError('Please fill in all professional details.');
 setLoading(false);
 return;
 }
 
 // 1. Create account
 const userCredential = await createUserWithEmailAndPassword(auth, email, password);
 
 // 2. Update profile name
 await updateProfile(userCredential.user, { displayName: fullName });
 
 // 3. Send email verification (non-blocking)
 sendEmailVerification(userCredential.user).catch(console.error);
 
 // 4. Save professional details to Cloud Database (non-blocking)
 setDoc(doc(db, 'users', userCredential.user.uid), {
 profile: {
 fullName,
 university,
 email,
 createdAt: new Date().toISOString()
 }
 }, { merge: true }).catch(console.error);
 
 setVerificationSent(true);
 setLoading(false);
 return; // Let them read the verification message!
 } else {
 const userCredential = await signInWithEmailAndPassword(auth, email, password);
 login({ 
 id: userCredential.user.uid, 
 email: userCredential.user.email,
 name: userCredential.user.displayName
 });
 }
 } catch (err) {
 console.error(err);
 setError(err.message.replace('Firebase: ', ''));
 } finally {
 setLoading(false);
 }
 };

 const features = [
 { icon: <BookOpen size={24} className="text-indigo-500" />, title: 'Smart Notes', desc: 'Auto-sync Drive folders directly into your courses.' },
 { icon: <Calendar size={24} className="text-emerald-500" />, title: 'Attendance Tracker', desc: 'Never fall below 75%. Track every class easily.' },
 { icon: <Calculator size={24} className="text-amber-500" />, title: 'CGPA Calculator', desc: 'Real-time grade estimations based on your targets.' },
 { icon: <CloudLightning size={24} className="text-blue-500" />, title: 'Cloud Sync', desc: 'Access your study materials from any device instantly.' },
 ];

 return (
 <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 relative bg-[rgb(var(--bg-main))] overflow-y-auto">
 
 {/* Background Ambience */}
 <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
 <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[100px] rounded-full animate-blob"></div>
 <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[100px] rounded-full animate-blob animation-delay-2000"></div>
 </div>

 {/* Hero Section */}
 <div className="w-full max-w-4xl mx-auto text-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-16 pt-8">
 <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight mb-4 lg:mb-6">
 Master your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-emerald-500">Studies.</span>
 </h1>
 <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
 The ultimate student companion app. Manage your courses, track attendance, calculate CGPA, and organize your study notes effortlessly.
 </p>

 <button onClick={() => setShowModal(true)} className="btn-primary text-lg h-14 px-8 shadow-xl shadow-indigo-500/20 group mx-auto mb-16 rounded-xl hover:scale-105 transition-all duration-300">
 Get Started Now
 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
 </button>

 {/* Features Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 text-left">
 {features.map((f, i) => (
 <div key={i} className="flex flex-col items-start gap-4 p-5 rounded-2xl bg-white/50 dark:bg-[#111]/50 border border-slate-200/50 dark:border-slate-800/50 hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-md">
 <div className="p-3 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
 {f.icon}
 </div>
 <div>
 <h3 className="font-bold text-slate-900 dark:text-white mb-1">{f.title}</h3>
 <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Login Modal */}
 {showModal && (
 <div className="fixed inset-0 bg-slate-900/20 dark:bg-black/40 z-50 flex items-center justify-center p-4">
 <div className="w-full max-w-sm p-8 bg-white dark:bg-[#111] rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-200">
 
 <button 
 onClick={() => { setShowModal(false); setError(''); }}
 className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
 >
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
 </button>

 <div className="text-center mb-8">
 <div className="w-16 h-16 bg-slate-900 dark:bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl rotate-3">
 <BookOpen size={32} className="text-white dark:text-slate-900" />
 </div>
 <h2 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">
 {isSignUp ? 'Create an account' : 'Welcome back'}
 </h2>
 <p className="text-slate-500 text-xs font-medium">
 {isSignUp ? 'Sign up to securely sync your data.' : 'Log in to access your dashboard.'}
 </p>
 </div>

 {verificationSent ? (
 <div className="text-center py-6 animate-in zoom-in">
 <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center mb-4">
 <MailCheck size={32} />
 </div>
 <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Verify Your Email</h3>
 <p className="text-sm text-slate-500 mb-6 leading-relaxed">
 We've sent a professional verification link to <strong>{email}</strong>. Please check your inbox to activate your account.
 </p>
 <button onClick={() => { setVerificationSent(false); setIsSignUp(false); }} className="btn-secondary w-full">
 Return to Login
 </button>
 </div>
 ) : (
 <form onSubmit={handleSubmit} className="space-y-4">
 {error && (
 <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100 dark:border-red-900/50">
 {error}
 </div>
 )}
 
 {isSignUp && (
 <>
 <div className="space-y-1">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
 <input 
 required 
 type="text" 
 value={fullName} 
 onChange={e => setFullName(e.target.value)} 
 className="input-field h-11" 
 placeholder="e.g. John Doe" 
 />
 </div>
 <div className="space-y-1">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">University / Institution</label>
 <input 
 required 
 type="text" 
 value={university} 
 onChange={e => setUniversity(e.target.value)} 
 className="input-field h-11" 
 placeholder="e.g. Dhaka University" 
 />
 </div>
 </>
 )}

 <div className="space-y-1">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
 <input 
 required 
 type="email" 
 value={email} 
 onChange={e => setEmail(e.target.value)} 
 className="input-field h-11" 
 placeholder="you@example.com" 
 />
 </div>

 <div className="space-y-1">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
 <input 
 required 
 type="password" 
 value={password} 
 onChange={e => setPassword(e.target.value)} 
 className="input-field h-11" 
 placeholder="••••••••" 
 />
 </div>

 <button type="submit" disabled={loading} className="btn-primary w-full mt-4 h-11 text-sm font-bold">
 {loading ? (
 <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
 ) : (
 isSignUp ? 'Create Professional Account' : 'Log In'
 )}
 </button>
 </form>
 )}

 {!verificationSent && (
 <div className="mt-6 text-center">
 <p className="text-xs text-slate-500">
 {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
 <button 
 onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
 className="font-bold text-slate-900 dark:text-white hover:underline transition-all decoration-2 underline-offset-4"
 >
 {isSignUp ? 'Log in' : "Sign up"}
 </button>
 </p>
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 );
}
