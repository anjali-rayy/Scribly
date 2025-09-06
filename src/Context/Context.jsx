import { onAuthStateChanged } from "firebase/auth";
import { useContext, useEffect } from "react";
import { useState } from "react";
import { createContext } from "react";
import { auth, db } from "../firebase/firebase";
import Loading from "../components/Loading/Loading";
import { collection, onSnapshot, query } from "firebase/firestore";

const BlogContext = createContext();

const Context = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [postLoading, setPostLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [postData, setPostData] = useState([]);
  const [showComment, setShowComment] = useState(false);
  const [commentLength, setCommentLength] = useState(0);
  const [authModel, setAuthModel] = useState(false);

  const [updateData, setUpdateData] = useState({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publish, setPublish] = useState(false);

  // Enhanced error boundary for Firestore internal errors
  useEffect(() => {
    const handleFirestoreErrors = (event) => {
      if (event.reason?.message?.includes('FIRESTORE') && 
          event.reason?.message?.includes('INTERNAL ASSERTION FAILED')) {
        console.warn('Firestore internal error caught and prevented crash:', event.reason.message);
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('unhandledrejection', handleFirestoreErrors);
    return () => window.removeEventListener('unhandledrejection', handleFirestoreErrors);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? `User ${user.uid}` : "No user");
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Retry mechanism for Firestore operations
  const retryFirestoreOperation = async (operation, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (error.message?.includes('INTERNAL ASSERTION FAILED') && i < maxRetries - 1) {
          console.warn(`Firestore retry ${i + 1}/${maxRetries} for operation`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }
        throw error;
      }
    }
  };

  // Load users with better error handling
  useEffect(() => {
    let unsubscribe = null;
    let retryTimeout = null;

    const getUsers = async () => {
      console.log("Starting to load users...");
      
      try {
        const usersRef = collection(db, "users");
        
        const setupListener = () => {
          return onSnapshot(
            usersRef, 
            (snapshot) => {
              const users = snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
              }));
              console.log(`Successfully loaded ${users.length} users`);
              setAllUsers(users);
              setUserLoading(false);
            },
            (error) => {
              console.error("Users snapshot error:", error.code, error.message);
              setUserLoading(false);
              
              // Handle specific error cases
              switch (error.code) {
                case 'permission-denied':
                  console.log("Permission denied for users collection. Check Firestore rules.");
                  // Set empty array instead of failing
                  setAllUsers([]);
                  break;
                case 'unavailable':
                  console.log("Firestore temporarily unavailable. Retrying in 5 seconds...");
                  // Retry after 5 seconds
                  retryTimeout = setTimeout(() => {
                    console.log("Retrying users connection...");
                    getUsers();
                  }, 5000);
                  break;
                default:
                  console.log("Unexpected Firestore error:", error.code);
                  setAllUsers([]);
              }
            }
          );
        };

        // Use retry mechanism for initial setup
        unsubscribe = await retryFirestoreOperation(setupListener);
        
      } catch (error) {
        console.error("Error setting up users listener:", error);
        setUserLoading(false);
        setAllUsers([]);
      }
    };

    // Start loading after auth state is determined
    if (!loading) {
      getUsers();
    }

    return () => {
      if (unsubscribe) {
        console.log("Cleaning up users listener");
        unsubscribe();
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [loading]);

  // Load posts with better error handling
  useEffect(() => {
    let unsubscribe = null;
    let retryTimeout = null;

    const getPosts = async () => {
      console.log("Starting to load posts...");
      
      try {
        const postsRef = collection(db, "posts");
        
        const setupListener = () => {
          return onSnapshot(
            postsRef,
            (snapshot) => {
              const posts = snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
              }));
              console.log(`Successfully loaded ${posts.length} posts`);
              setPostData(posts);
              setPostLoading(false);
            },
            (error) => {
              console.error("Posts snapshot error:", error.code, error.message);
              setPostLoading(false);
              
              // Handle specific error cases
              switch (error.code) {
                case 'permission-denied':
                  console.log("Permission denied for posts collection. Check Firestore rules.");
                  setPostData([]);
                  break;
                case 'unavailable':
                  console.log("Firestore temporarily unavailable. Retrying in 5 seconds...");
                  retryTimeout = setTimeout(() => {
                    console.log("Retrying posts connection...");
                    getPosts();
                  }, 5000);
                  break;
                default:
                  console.log("Unexpected Firestore error:", error.code);
                  setPostData([]);
              }
            }
          );
        };

        // Use retry mechanism for initial setup
        unsubscribe = await retryFirestoreOperation(setupListener);
        
      } catch (error) {
        console.error("Error setting up posts listener:", error);
        setPostLoading(false);
        setPostData([]);
      }
    };

    // Start loading after auth state is determined
    if (!loading) {
      getPosts();
    }

    return () => {
      if (unsubscribe) {
        console.log("Cleaning up posts listener");
        unsubscribe();
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [loading]);

  return (
    <BlogContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        allUsers,
        userLoading,
        postData,
        postLoading,
        publish,
        setPublish,
        showComment,
        setShowComment,
        commentLength,
        setCommentLength,
        updateData,
        setUpdateData,
        title,
        setTitle,
        description,
        setDescription,
        authModel,
        setAuthModel,
        loading,
      }}>
      {loading ? <Loading /> : children}
    </BlogContext.Provider>
  );
};

export default Context;

export const Blog = () => useContext(BlogContext);