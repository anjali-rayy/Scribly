import Loading from "../../../Loading/Loading";
import PostsCard from "../../../Common/Posts/PostsCard";
import { Blog } from "../../../../Context/Context";

const ProfileHome = ({ getUserData }) => {
  const { postData, postLoading } = Blog();
  
  // Safe filtering with proper null checks
  const userPost = postData?.filter((post) => post?.userId === getUserData?.userId) || [];

  console.log("ProfileHome Debug:");
  console.log("postData:", postData);
  console.log("postLoading:", postLoading);
  console.log("getUserData:", getUserData);
  console.log("userPost:", userPost);

  // Handle loading state
  if (postLoading === true) {
    return (
      <div className="flex flex-col gap-5 mb-[4rem]">
        <Loading />
      </div>
    );
  }

  // Handle when postData is not loaded yet
  if (postData === undefined || postData === null) {
    return (
      <div className="flex flex-col gap-5 mb-[4rem]">
        <p className="text-gray-500">Loading posts...</p>
      </div>
    );
  }

  // Handle empty posts
  if (userPost.length === 0) {
    return (
      <div className="flex flex-col gap-5 mb-[4rem]">
        <p className="text-gray-500">
          <span className="capitalize">{getUserData?.username}</span> has no posts
        </p>
      </div>
    );
  }

  // Render posts
  return (
    <div className="flex flex-col gap-5 mb-[4rem]">
      {userPost.map((post, i) => (
        <PostsCard post={post} key={post.id || i} />
      ))}
    </div>
  );
};

export default ProfileHome;