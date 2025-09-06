import React, { useState } from "react";
import Input from "../../../utils/Input";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const SignUp = ({ setSignReq, setModal }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    rePassword: "",
  });

  const createUserDocument = async (user, retryCount = 0) => {
    const maxRetries = 3;
    const userRef = doc(db, "users", user.uid);
    
    try {
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        const userData = {
          userId: user.uid,
          username: form.username.trim(),
          email: form.email.trim(),
          userImg: "",
          bio: "",
          created: serverTimestamp(),
          lastLogin: serverTimestamp(),
        };

        console.log("Creating user document...");
        await setDoc(userRef, userData);
        console.log("User document created successfully");
        return true;
      }
      return true;
    } catch (error) {
      console.error(`Firestore error (attempt ${retryCount + 1}):`, error);
      
      if (error.code === "permission-denied" && retryCount < maxRetries) {
        // Wait a bit longer and retry
        console.log(`Retrying in ${(retryCount + 1) * 500}ms...`);
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 500));
        return createUserDocument(user, retryCount + 1);
      }
      
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.username || !form.email || !form.password || !form.rePassword) {
      toast.error("All fields are required");
      return;
    }
    
    if (form.username.length < 2) {
      toast.error("Username should be at least 2 characters");
      return;
    }
    
    if (form.password.length < 6) {
      toast.error("Password should be at least 6 characters");
      return;
    }
    
    if (form.password !== form.rePassword) {
      toast.error("Your passwords are not matching!!");
      return;
    }
    
    setLoading(true);
    
    try {
      // Create user account
      const { user } = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      console.log("User created:", user.uid);

      // Wait for auth state to be fully set
      await new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
          if (authUser && authUser.uid === user.uid) {
            unsubscribe();
            resolve();
          }
        });
        
        // Fallback timeout
        setTimeout(() => {
          unsubscribe();
          resolve();
        }, 2000);
      });

      // Now try to create the user document
      try {
        await createUserDocument(user);
        toast.success("Account created successfully!");
        setModal(false);
        setTimeout(() => {
          navigate("/");
        }, 100);
        
      } catch (firestoreError) {
        console.error("Firestore error:", firestoreError);
        // Even if Firestore fails, the user is created in Auth
        toast.warning("Account created but profile setup incomplete. Please try logging in.");
        setModal(false);
      }

    } catch (error) {
      console.error("Sign up error:", error);
      
      // Handle specific Firebase Auth errors
      switch (error.code) {
        case "auth/email-already-in-use":
          toast.error("This email is already registered");
          break;
        case "auth/weak-password":
          toast.error("Password should be at least 6 characters");
          break;
        case "auth/invalid-email":
          toast.error("Please enter a valid email address");
          break;
        case "auth/operation-not-allowed":
          toast.error("Email/password accounts are not enabled. Please contact support.");
          break;
        case "auth/network-request-failed":
          toast.error("Network error. Please check your connection and try again.");
          break;
        default:
          toast.error("Failed to create account. Please try again.");
          console.error("Unhandled error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="size mt-[6rem] text-center">
      <h2 className="text-3xl">Sign up with email</h2>
      <p className="w-full sm:w-[25rem] mx-auto py-[3rem]">
        Enter your details to create a new account.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input 
          form={form} 
          setForm={setForm} 
          type="text" 
          title="username"
          placeholder="Enter your username"
        />
        <Input 
          form={form} 
          setForm={setForm} 
          type="email" 
          title="email"
          placeholder="Enter your email"
        />
        <Input 
          form={form} 
          setForm={setForm} 
          type="password" 
          title="password"
          placeholder="Enter password (min 6 characters)"
        />
        <Input
          form={form}
          setForm={setForm}
          type="password"
          title="rePassword"
          placeholder="Confirm your password"
        />
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 text-sm rounded-full bg-green-700
        hover:bg-green-800 text-white w-fit mx-auto transition-all duration-200
        ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>
      <button
        onClick={() => setSignReq("")}
        className="mt-5 text-sm text-green-600 hover:text-green-700
      flex items-center mx-auto">
        <MdKeyboardArrowLeft />
        All sign Up Options
      </button>
    </div>
  );
};

export default SignUp;