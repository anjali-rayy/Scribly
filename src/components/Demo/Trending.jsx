import { Blog } from "../../Context/Context";
import { BsGraphUpArrow } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { readTime } from "../../utils/helper";

const Trending = () => {
  const { postData, allUsers, currentUser } = Blog();
  
  // Debug logs - remove these after fixing
  console.log("Post data:", postData?.slice(0, 2));
  console.log("All users:", allUsers?.slice(0, 2));
  console.log("Current user:", currentUser);
  
  // Merge post data with user data to get complete profile info
  const getTrendingWithUserData = postData?.map(post => {
    // Try multiple ways to match users with posts
    let author = null;
    
    // First try: match by userId field
    if (post.userId) {
      author = allUsers?.find(user => 
        user.userId === post.userId || 
        user.id === post.userId ||
        user.uid === post.userId
      );
    }
    
    // Second try: if post has authorId field
    if (!author && post.authorId) {
      author = allUsers?.find(user => 
        user.userId === post.authorId || 
        user.id === post.authorId ||
        user.uid === post.authorId
      );
    }
    
    // Third try: if the post was created by current user
    if (!author && currentUser && (post.userId === currentUser.uid || post.authorId === currentUser.uid)) {
      author = allUsers?.find(user => user.userId === currentUser.uid);
    }
    
    console.log(`Post "${post.title}" - userId: ${post.userId}, Found author:`, author);
    
    return {
      ...post,
      username: author?.username || author?.displayName || author?.name || post.username || "Anonymous",
      userImg: author?.userImg || author?.photoURL || author?.profileImage || post.userImg || "/profile.jpg",
      authorId: post.userId || post.authorId, // Ensure we have an authorId for navigation
    };
  })?.sort((a, b) => (b.pageViews || 0) - (a.pageViews || 0));
  
  return (
    <section className="border-b border-gray-600">
      <div className="size py-[2rem]">
        <div className="flex items-center gap-3 font-semibold">
          <span>
            <BsGraphUpArrow />
          </span>
          <h2>Trending on Scribly</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {getTrendingWithUserData &&
            getTrendingWithUserData
              .slice(0, 6)
              .map((trend, i) => <Trend trend={trend} key={trend?.id || i} index={i} />)}
        </div>
      </div>
    </section>
  );
};

export default Trending;

const Trend = ({ trend, index }) => {
  const navigate = useNavigate();
  
  const handleProfileClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (trend?.authorId || trend?.userId) {
      navigate(`/profile/${trend?.authorId || trend?.userId}`);
    }
  };

  const handlePostClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (trend?.id) {
      navigate(`/post/${trend?.id}`);
    }
  };

  // Enhanced profile image fallback logic
  const getProfileImage = () => {
    const img = trend?.userImg;
    
    // Check if image exists and is valid
    if (img && 
        img !== "" && 
        img !== "undefined" && 
        img !== "null" && 
        !img.includes("undefined") &&
        !img.includes("null")) {
      return img;
    }
    
    // Return default profile image
    return "/profile.jpg";
  };

  // Generate initials from username if image fails
  const getInitials = (username) => {
    if (!username || username === "Anonymous") return "U";
    
    const words = username.trim().split(' ');
    if (words.length > 1) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return username.charAt(0).toUpperCase();
  };

  // Enhanced username display
  const getDisplayUsername = () => {
    const username = trend?.username;
    if (!username || username === "Anonymous") {
      return "Anonymous";
    }
    return username;
  };

  return (
    <article className="flex flex-col gap-4 cursor-pointer hover:opacity-75 transition-opacity">
      {/* Post number - styled like Medium */}
      <div className="flex items-start gap-4">
        <span className="text-gray-300 text-3xl font-bold leading-none mt-1">
          {String(index + 1).padStart(2, '0')}
        </span>
        
        <div className="flex-1 flex flex-col gap-3">
          {/* Author info section - Medium style */}
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-75"
            onClick={handleProfileClick}
          >
            {/* Profile image with enhanced fallback */}
            <div className="relative w-6 h-6">
              <img
                className="w-full h-full object-cover rounded-full border"
                src={getProfileImage()}
                alt={getDisplayUsername()}
                onError={(e) => {
                  // If image fails to load, hide it and show initials
                  e.target.style.display = 'none';
                  const fallback = e.target.nextElementSibling;
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
                onLoad={(e) => {
                  // If image loads successfully, hide the fallback
                  const fallback = e.target.nextElementSibling;
                  if (fallback) {
                    fallback.style.display = 'none';
                  }
                }}
              />
              {/* Enhanced fallback initials circle */}
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xs font-medium absolute top-0 left-0">
                {getInitials(getDisplayUsername())}
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-sm">
              <span className="font-medium text-gray-900 capitalize hover:underline">
                {getDisplayUsername()}
              </span>
            </div>
          </div>

          {/* Post content */}
          <div onClick={handlePostClick}>
            <h3 className="font-bold text-lg leading-tight line-clamp-2 text-gray-900 mb-2 hover:underline">
              {trend?.title || "Untitled Post"}
            </h3>
            
            {/* Post meta info */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <time dateTime={trend?.created}>
                {trend?.created ? moment(trend.created).format("MMM D") : ""}
              </time>
              {trend?.desc && (
                <>
                  <span>·</span>
                  <span>{readTime(trend.desc)} min read</span>
                </>
              )}
              {trend?.pageViews && (
                <>
                  <span>·</span>
                  <span>{trend.pageViews} views</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};