import { onAuthStateChanged } from "firebase/auth";
import { useContext, useEffect } from "react";
import { useState } from "react";
import { createContext } from "react";
import { auth, db } from "../firebase/firebase";
import Loading from "../components/Loading/Loading";
import { collection, onSnapshot, query } from "firebase/firestore";
import useFetch from "../components/hooks/useFetch";

const BlogContext = createContext();

const Context = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [showComment, setShowComment] = useState(false);
  const [commentLength, setCommentLength] = useState(0);
  const [authModel, setAuthModel] = useState(false);

  const [updateData, setUpdateData] = useState({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [publish, setPublish] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Remove currentUser from dependency array to prevent infinite loops

  // get users - only after authentication is confirmed
  useEffect(() => {
    let unsubscribe = null;

    const getUsers = () => {
      // Only fetch users if user is authenticated
      if (!currentUser) {
        setAllUsers([]);
        setUserLoading(false);
        return;
      }

      try {
        const postRef = query(collection(db, "users"));
        unsubscribe = onSnapshot(
          postRef, 
          (snapshot) => {
            setAllUsers(
              snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
              }))
            );
            setUserLoading(false);
          },
          (error) => {
            console.error("Error fetching users:", error);
            setUserLoading(false);
            // If error is due to permissions, show auth modal
            if (error.code === 'permission-denied') {
              setAuthModel(true);
            }
          }
        );
      } catch (error) {
        console.error("Error setting up users listener:", error);
        setUserLoading(false);
      }
    };

    // Only run getUsers when authentication state is determined
    if (!loading) {
      getUsers();
    }

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser, loading]); // Dependencies: run when auth state changes or loading completes

  const { data: postData, loading: postLoading } = useFetch("posts");

  return (
    <BlogContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        allUsers,
        userLoading,
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
        postData,
        postLoading,
        authModel,
        setAuthModel,
      }}>
      {loading ? <Loading /> : children}
    </BlogContext.Provider>
  );
};

export default Context;

export const Blog = () => useContext(BlogContext);