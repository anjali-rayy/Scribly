import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import { toast } from "react-toastify";
import Loading from "../../Loading/Loading";
import { Blog } from "../../../Context/Context";
import FollowBtn from "../../Home/UserToFollow/FollowBtn";
import { readTime } from "../../../utils/helper";
import moment from "moment/moment";
import Actions from "../Posts/Actions/Actions";
import Like from "./Actions/Like";
import Comment from "./Actions/Comment";
import SharePost from "./Actions/SharePost";
import SavedPost from "../Posts/Actions/SavedPost";
import Recommended from "./Recommended";
import Comments from "../Comments/Comments";

const SinglePost = () => {
  // ALL HOOKS MUST BE CALLED AT THE TOP, UNCONDITIONALLY
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = Blog();
  const hasIncrementedView = useRef(false);
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // TEMPORARILY DISABLED - Page view increment
  /*
  useEffect(() => {
    const incrementPageView = async () => {
      if (!hasIncrementedView.current && postId) {
        try {
          const ref = doc(db, "posts", postId);
          await updateDoc(ref, {
            pageViews: increment(1),
          });
          hasIncrementedView.current = true;
        } catch (error) {
          console.error("Error incrementing page views:", error);
        }
      }
    };

    incrementPageView();
  }, [postId]);
  */

  // Fetch post effect
  useEffect(() => {
    if (!postId) {
      setError("No post ID provided");
      return;
    }

    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const postRef = doc(db, "posts", postId);
        const postSnapshot = await getDoc(postRef);

        if (!postSnapshot.exists()) {
          setError("Post not found");
          setLoading(false);
          return;
        }

        const postData = postSnapshot.data();
        
        if (!postData?.userId) {
          setPost({ ...postData, id: postId });
          setLoading(false);
          return;
        }

        // Fetch user data
        try {
          const userRef = doc(db, "users", postData.userId);
          const userSnapshot = await getDoc(userRef);

          if (userSnapshot.exists()) {
            const { created: userCreated, ...userData } = userSnapshot.data();
            setPost({ 
              ...postData, 
              ...userData, 
              id: postId,
              userCreated
            });
          } else {
            console.warn(`User ${postData.userId} not found`);
            setPost({ ...postData, id: postId });
          }
        } catch (userError) {
          console.error("Error fetching user data:", userError);
          setPost({ ...postData, id: postId });
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching post:", error);
        setError(error.message);
        setLoading(false);
        
        if (error.code === 'permission-denied') {
          toast.error("Permission denied. Please check your access rights.");
        } else {
          toast.error(`Error loading post: ${error.message}`);
        }
      }
    };

    fetchPost();
  }, [postId]);

  // CONDITIONAL RENDERING AFTER ALL HOOKS
  if (error) {
    return (
      <div className="w-[90%] md:w-[80%] lg:w-[60%] mx-auto py-[3rem]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }

  if (!post) {
    return (
      <div className="w-[90%] md:w-[80%] lg:w-[60%] mx-auto py-[3rem]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600">Post not found</h2>
        </div>
      </div>
    );
  }

  const { title, desc, postImg, username, created, userImg, userId } = post;

  return (
    <>
      <section className="w-[90%] md:w-[80%] lg:w-[60%] mx-auto py-[3rem]">
        <h2 className="text-4xl font-extrabold capitalize">{title}</h2>
        <div className="flex items-center gap-2 py-[2rem]">
          {userImg && (
            <img
              onClick={() => userId && navigate(`/profile/${userId}`)}
              className="w-[3rem] h-[3rem] object-cover rounded-full cursor-pointer"
              src={userImg}
              alt="user-img"
            />
          )}
          <div>
            <div className="capitalize">
              {username && <span>{username} .</span>}
              {currentUser && currentUser?.uid !== userId && userId && (
                <FollowBtn userId={userId} />
              )}
            </div>
            <p className="text-sm text-gray-500">
              {desc && `${readTime({ __html: desc })} min read`}
              {created && (
                <>
                  <span className="mx-1">.</span>
                  <span>{moment(created).fromNow()}</span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between border-b border-t border-gray-200 py-[0.5rem]">
          <div className="flex items-center gap-5">
            <Like postId={postId} />
            <Comment />
          </div>
          <div className="flex items-center pt-2 gap-5">
            <SavedPost post={post} />
            <SharePost />
            {currentUser && currentUser?.uid === post?.userId && (
              <Actions postId={postId} title={title} desc={desc} />
            )}
          </div>
        </div>
        <div className="mt-[3rem]">
          {postImg && (
            <img
              className="w-full h-[400px] object-cover"
              src={postImg}
              alt="post-img"
            />
          )}
          {desc && (
            <div
              className="mt-6"
              dangerouslySetInnerHTML={{ __html: desc }}
            />
          )}
        </div>
      </section>
      <Recommended post={post} />
      <Comments postId={postId} />
    </>
  );
};

export default SinglePost;