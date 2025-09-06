import React, { useState } from "react";
import { readTime } from "../../../utils/helper";
import moment from "moment/moment";
import SavedPost from "./Actions/SavedPost";
import { Blog } from "../../../Context/Context";
import Actions from "./Actions/Actions";
import { useNavigate } from "react-router-dom";

const PostsCard = ({ post }) => {
  const { title, desc, created, postImg, id: postId, userId, username } = post;
  const { currentUser } = Blog();
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  const navigate = useNavigate();

  const handleImageError = () => {
    console.log("Image failed to load:", postImg);
    setImgError(true);
    setImgLoading(false);
  };

  const handleImageLoad = () => {
    setImgLoading(false);
    setImgError(false);
  };

  return (
    <section>
      <div
        onClick={() => navigate(`/post/${postId}`)}
        className="flex flex-col sm:flex-row gap-4 cursor-pointer">
        <div className="flex-[2.5]">
          <p className="pb-2 font-semibold capitalize">{username}</p>
          <h2 className="text-xl font-bold line-clamp-2 leading-6 capitalize">
            {title}
          </h2>
          <div
            className="py-1 text-gray-500 line-clamp-2 leading-5"
            dangerouslySetInnerHTML={{ __html: desc }}
          />
        </div>
        {postImg && !imgError && (
          <div className="flex-[1]">
            {imgLoading && (
              <div className="w-[53rem] h-[8rem] bg-gray-200 animate-pulse rounded flex items-center justify-center">
                <span className="text-gray-400 text-sm">Loading...</span>
              </div>
            )}
            <img
              src={postImg}
              alt="postImg"
              className={`w-[53rem] h-[8rem] object-cover rounded ${imgLoading ? 'hidden' : 'block'}`}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          </div>
        )}
        {postImg && imgError && (
          <div className="flex-[1]">
            <div className="w-[53rem] h-[8rem] bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
              <div className="text-center text-gray-400">
                <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">Image not available</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between w-full md:w-[70%] mt-[2rem] md:mt-0">
        <p className="text-xs text-gray-600">
          {readTime({ __html: desc })} min read .
          {moment(created).format("MMM DD")}
        </p>
        <div className="flex items-center gap-3">
          <SavedPost post={post} />
          {currentUser?.uid === userId && (
            <Actions postId={postId} title={title} desc={desc} />
          )}
        </div>
      </div>
    </section>
  );
};

export default PostsCard;