import { collection, onSnapshot, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";

const useSingleFetch = (collectionName, id, subCol) => {
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id || !collectionName || !subCol) {
      setLoading(false);
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);

    // Enhanced error boundary for internal Firestore errors
    const handleFirestoreErrors = (event) => {
      if (event.reason?.message?.includes('FIRESTORE') && 
          event.reason?.message?.includes('INTERNAL ASSERTION FAILED')) {
        console.warn('Firestore internal error caught in useSingleFetch:', event.reason.message);
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('unhandledrejection', handleFirestoreErrors);

    // Retry mechanism for Firestore operations
    const retryFirestoreOperation = async (operation, maxRetries = 3) => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await operation();
        } catch (error) {
          if (error.message?.includes('INTERNAL ASSERTION FAILED') && i < maxRetries - 1) {
            console.warn(`Firestore retry ${i + 1}/${maxRetries} for useSingleFetch`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            continue;
          }
          throw error;
        }
      }
    };

    let unsubscribe = null;
    let retryTimeout = null;

    const setupListener = async () => {
      try {
        console.log(`Setting up listener for: ${collectionName}/${id}/${subCol}`);
        
        const postRef = query(collection(db, collectionName, id, subCol));
        
        const createSnapshot = () => {
          return onSnapshot(
            postRef,
            (snapshot) => {
              try {
                const fetchedData = snapshot.docs.map((doc) => ({
                  ...doc.data(),
                  id: doc.id,
                }));
                console.log(`Successfully fetched ${fetchedData.length} items from ${collectionName}/${id}/${subCol}`);
                setData(fetchedData);
                setError(null);
                setLoading(false);
              } catch (err) {
                console.error("Error processing snapshot data:", err);
                setError(err.message);
                setLoading(false);
              }
            },
            (error) => {
              console.error(`Firestore snapshot error for ${collectionName}/${id}/${subCol}:`, error.code, error.message);
              setLoading(false);
              
              // Handle specific error cases
              switch (error.code) {
                case 'permission-denied':
                  console.log(`Permission denied for ${collectionName}/${id}/${subCol}. Check Firestore security rules.`);
                  setError(`Permission denied. Please check Firestore security rules for ${collectionName}/${id}/${subCol}`);
                  setData([]);
                  break;
                  
                case 'not-found':
                  console.log(`Collection ${collectionName}/${id}/${subCol} not found.`);
                  setError(`Collection not found: ${collectionName}/${id}/${subCol}`);
                  setData([]);
                  break;
                  
                case 'unavailable':
                  console.log(`Firestore temporarily unavailable for ${collectionName}/${id}/${subCol}. Retrying...`);
                  setError('Connection temporarily unavailable. Retrying...');
                  // Retry after 3 seconds
                  retryTimeout = setTimeout(() => {
                    console.log(`Retrying connection for ${collectionName}/${id}/${subCol}...`);
                    setupListener();
                  }, 3000);
                  break;
                  
                case 'failed-precondition':
                  console.log(`Failed precondition for ${collectionName}/${id}/${subCol}. The operation was rejected.`);
                  setError('Operation rejected. Please try again.');
                  setData([]);
                  break;
                  
                default:
                  console.log(`Unexpected Firestore error for ${collectionName}/${id}/${subCol}:`, error.code);
                  setError(`Firestore error: ${error.message}`);
                  setData([]);
              }
            }
          );
        };

        // Use retry mechanism for initial setup
        unsubscribe = await retryFirestoreOperation(createSnapshot);
        
      } catch (error) {
        console.error(`Error setting up listener for ${collectionName}/${id}/${subCol}:`, error);
        setError(error.message);
        setLoading(false);
        setData([]);
      }
    };

    setupListener();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        console.log(`Cleaning up listener for ${collectionName}/${id}/${subCol}`);
        unsubscribe();
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      window.removeEventListener('unhandledrejection', handleFirestoreErrors);
    };
  }, [collectionName, id, subCol]);

  return {
    data,
    loading,
    error,
  };
};

export default useSingleFetch;