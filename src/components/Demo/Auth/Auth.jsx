import React, { useState } from "react";
import Modal from "../../../utils/Modal";
import { LiaTimesSolid } from "react-icons/lia";
import { FcGoogle } from "react-icons/fc";
import { MdFacebook } from "react-icons/md";
import { AiOutlineMail } from "react-icons/ai";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import { signInWithPopup } from "firebase/auth";
import { auth, db, provider } from "../../../firebase/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Auth = ({ modal, setModal }) => {
  const [createUser, setCreateUser] = useState(false);
  const [signReq, setSignReq] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const googleAuth = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("Google auth successful:", user.uid);

      const userRef = doc(db, "users", user.uid);
      
      try {
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          const userData = {
            userId: user.uid,
            username: user.displayName || "Anonymous User",
            email: user.email,
            userImg: user.photoURL || "",
            bio: "",
            created: serverTimestamp(),
            lastLogin: serverTimestamp(),
          };

          await setDoc(userRef, userData);
          console.log("New Google user document created");
          toast.success("Welcome! Account created successfully");
        } else {
          // Update last login for existing users
          await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
          toast.success("Welcome back!");
        }

        setModal(false);
        // Add small delay before navigation to ensure auth state is properly set
        setTimeout(() => {
          navigate("/");
        }, 100);
        
      } catch (firestoreError) {
        console.error("Firestore error in Google auth:", firestoreError);
        toast.warning("Signed in successfully, but profile sync failed. Please try refreshing.");
        setModal(false);
        setTimeout(() => {
          navigate("/");
        }, 100);
      }

    } catch (error) {
      console.error("Google auth error:", error);
      
      if (error.code === "auth/popup-closed-by-user") {
        toast.info("Sign in cancelled");
      } else if (error.code === "auth/popup-blocked") {
        toast.error("Popup blocked. Please allow popups for this site");
      } else if (error.code === "auth/network-request-failed") {
        toast.error("Network error. Please check your connection");
      } else {
        toast.error("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal modal={modal} setModal={setModal}>
      <section
        className={`z-50 fixed top-0 bottom-0 left-0 md:left-[10rem]
        overflow-auto right-0 md:right-[10rem] bg-white shadows transition-all duration-500
        ${modal ? "visible opacity-100" : "invisible opacity-0"}`}>
        <button
          onClick={() => setModal(false)}
          className="absolute top-8 right-8 text-2xl hover:opacity-50">
          <LiaTimesSolid />
        </button>
        <div className="flex flex-col justify-center items-center gap-[3rem]">
          {signReq === "" ? (
            <>
              <h2 className="text-2xl pt-[5rem]">
                {createUser ? "Join Scribly" : "Welcome Back"}
              </h2>
              <div className="flex flex-col gap-2 w-fit mx-auto">
                <Button
                  click={googleAuth}
                  disabled={loading}
                  icon={<FcGoogle className="text-xl" />}
                  text={`${createUser ? "Sign Up" : "Sign In"} With Google`}
                  loading={loading}
                />
                <Button
                  icon={<MdFacebook className="text-xl text-blue-600" />}
                  text={`${createUser ? "Sign Up" : "Sign In"} With Facebook`}
                  disabled={true} // Disable if not implemented
                />
                <Button
                  click={() => setSignReq(createUser ? "sign-up" : "sign-in")}
                  icon={<AiOutlineMail className="text-xl" />}
                  text={`${createUser ? "Sign Up" : "Sign In"} With Email`}
                />
              </div>
              <p>
                {createUser ? "Already have an account" : "No Account"}
                <button
                  onClick={() => setCreateUser(!createUser)}
                  className="text-green-600 hover:text-green-700 font-bold ml-1">
                  {createUser ? "Sign In" : "Create one"}
                </button>
              </p>
            </>
          ) : signReq === "sign-in" ? (
            <SignIn setModal={setModal} setSignReq={setSignReq} />
          ) : signReq === "sign-up" ? (
            <SignUp setModal={setModal} setSignReq={setSignReq} />
          ) : null}
          <p className="md:w-[30rem] mx-auto text-center text-sm mb-[3rem]">
            Click "Sign In" to agree to Scribly's Terms of Service and
            acknowledge that Scribly's Privacy Policy applies to you.
          </p>
        </div>
      </section>
    </Modal>
  );
};

export default Auth;

const Button = ({ icon, text, click, disabled = false, loading = false }) => {
  return (
    <button
      onClick={click}
      disabled={disabled || loading}
      className={`flex items-center gap-10 sm:w-[20rem] border border-black
        px-3 py-2 rounded-full transition-all duration-200
        ${disabled || loading ? 
          'opacity-50 cursor-not-allowed' : 
          'hover:bg-gray-50 hover:scale-105'
        }`}>
      {icon} {loading ? "Loading..." : text}
    </button>
  );
};