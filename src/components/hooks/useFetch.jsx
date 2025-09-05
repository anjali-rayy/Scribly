import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebase/firebase";

const useFetch = (collectionName) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe = null;
    
    // Check if user is authenticated first
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is authenticated, now fetch data
        getDatas();
      } else {
        // User is not authenticated
        setError("User not authenticated");
        setLoading(false);
      }
    });

    const getDatas = async () => {
      try {
        setError(null);
        const postRef = query(
          collection(db, collectionName),
          orderBy("created", "desc")
        );

        unsubscribe = onSnapshot(
          postRef, 
          async (snapshot) => {
            try {
              const postData = await Promise.all(
                snapshot.docs.map(async (docs) => {
                  const postItems = { ...docs.data(), id: docs.id };
                  
                  // Check if userId exists before trying to fetch user data
                  if (postItems?.userId) {
                    const userRef = doc(db, "users", postItems.userId);
                    const getUser = await getDoc(userRef);

                    if (getUser.exists()) {
                      const { created, ...rest } = getUser.data();
                      return { ...postItems, ...rest };
                    }
                  }
                  
                  // Return the post data even if user data is not available
                  return postItems;
                })
              );
              
              // Filter out any undefined values
              const filteredData = postData.filter(item => item !== undefined);
              setData(filteredData);
              setLoading(false);
            } catch (err) {
              console.error("Error processing snapshot data:", err);
              setError(err.message);
              setLoading(false);
            }
          },
          (err) => {
            // Handle snapshot errors
            console.error("Firestore snapshot error:", err);
            setError(err.message);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Error setting up snapshot listener:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (authUnsubscribe) {
        authUnsubscribe();
      }
    };
  }, [collectionName]);

  return {
    data,
    loading,
    error,
  };
};

export default useFetch;