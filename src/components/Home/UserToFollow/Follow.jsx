import React, { useState } from "react";
import { Blog } from "../../../Context/Context";
import FollowBtn from "./FollowBtn";
import { useNavigate } from "react-router-dom";

const Follow = () => {
  const { currentUser, allUsers, userLoading } = Blog();
  const [count, setCount] = useState(5);
  
  const users =
    allUsers &&
    allUsers
      ?.slice(0, count)
      .filter((user) => user.id !== currentUser?.uid);

  const navigate = useNavigate();

  // Show loading state
  if (userLoading) {
    return <div className="text-gray-500">Loading users...</div>;
  }

  // Show if no users to follow (all filtered out or only current user exists)
  if (!users || users.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        {allUsers?.length <= 1 ? "No other users available" : "No users to follow"}
      </div>
    );
  }

  return (
    <>
      {users?.map((user, i) => {
        const { username, bio, userImg, id } = user;
        
        return (
          <div key={i} className="flex items-start gap-2 my-4">
            <div
              onClick={() => navigate("/profile" + "/" + id)}
              className="flex-1 flex items-center gap-2 cursor-pointer">
              <img
                className="w-[3rem] h-[3rem] object-cover rounded-full"
                src={userImg || "/profile.jpg"}
                alt="userImg"
              />
              <div className="flex flex-col gap-1">
                <h2 className="font-bold capitalize">{username || "Unknown User"}</h2>
                <span className="leading-4 text-gray-500 text-sm line-clamp-2">
                  {bio || "This user has no bio"}
                </span>
              </div>
            </div>
            <FollowBtn userId={id} />
          </div>
        );
      })}
      {allUsers?.length > 5 && (
        <button
          onClick={() =>
            setCount((prev) => users.length < allUsers?.length && prev + 3)
          }
          className="mb-3 text-green-900 text-sm hover:underline">
          Load more users
        </button>
      )}
    </>
  );
};

export default Follow;