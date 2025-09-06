import { addDoc, collection } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { LiaTimesSolid } from "react-icons/lia";
import ReactQuill from "react-quill";
import { toast } from "react-toastify";
import { db } from "../../../firebase/firebase";
import { Blog } from "../../../Context/Context";
import { useNavigate } from "react-router-dom";

// Custom Tags Input Component
const CustomTagsInput = ({ value, onChange, placeholder = "Add a tag" }) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      const newTags = [...value];
      newTags.pop();
      onChange(newTags);
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !value.includes(trimmedValue) && value.length < 5) {
      onChange([...value, trimmedValue]);
      setInputValue("");
    }
  };

  const removeTag = (indexToRemove) => {
    const newTags = value.filter((_, index) => index !== indexToRemove);
    onChange(newTags);
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      addTag();
    }
  };

  return (
    <div className="tags-input-container">
      <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-md min-h-[40px] focus-within:border-blue-500">
        {value.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 text-green-600 hover:text-green-800 focus:outline-none"
            >
              ×
            </button>
          </span>
        ))}
        {value.length < 5 && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            placeholder={value.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
          />
        )}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {value.length}/5 tags • Press Enter or comma to add tags
      </div>
    </div>
  );
};

const Preview = ({ setPublish, description, title }) => {
  const imageRef = useRef(null);
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState([]);
  const [desc, setDesc] = useState("");
  const { currentUser } = Blog();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [preview, setPreview] = useState({
    title: "",
    photo: null,
  });

  useEffect(() => {
    if (title || description) {
      setPreview({ ...preview, title: title });
      setDesc(description);
    } else {
      setPreview({ ...preview, title: "" });
      setDesc("");
    }
  }, [title, description]);

  const handleClick = () => {
    imageRef.current.click();
  };

  // Cloudinary upload function
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'profile_images'); // Use your preset

    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dhgob6vzf/image/upload', // Your cloud name
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!currentUser) {
        toast.error("You must be logged in to publish a post!");
        return;
      }

      if (preview.title === "" || desc === "" || tags.length === 0) {
        toast.error("All fields are required!!!");
        return;
      }

      if (preview.title.length < 15) {
        toast.error("Title must be at least 15 letters");
        return;
      }

      const collections = collection(db, "posts");

      let url = "";
      if (preview.photo) {
        url = await uploadToCloudinary(preview.photo); // Upload to Cloudinary
      }

      await addDoc(collections, {
        userId: currentUser?.uid,
        title: preview.title,
        desc,
        tags,
        postImg: url,
        created: Date.now(),
        pageViews: 0,
      });

      toast.success("Post has been added");
      navigate("/");
      setPublish(false);
      setPreview({ title: "", photo: null });
      setImageUrl("");
      setTags([]);
      setDesc("");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="absolute inset-0 bg-white z-30">
      <div className="size my-[2rem]">
        <span
          onClick={() => setPublish(false)}
          className="absolute right-[1rem] md:right-[5rem] top-[3rem] text-2xl cursor-pointer">
          <LiaTimesSolid />
        </span>
        <div className="mt-[8rem] flex flex-col md:flex-row gap-10">
          <div className="flex-[1]">
            <h3>Story Preview</h3>
            <div
              style={{ backgroundImage: `url(${imageUrl})` }}
              onClick={handleClick}
              className="w-full h-[200px] object-cover bg-gray-100 my-3 grid 
                place-items-center cursor-pointer bg-cover bg-no-repeat">
              {!imageUrl && "Add Image"}
            </div>
            <input
              onChange={(e) => {
                setImageUrl(URL.createObjectURL(e.target.files[0]));
                setPreview({ ...preview, photo: e.target.files[0] });
              }}
              ref={imageRef}
              type="file"
              hidden
            />
            <input
              type="text"
              placeholder="Title"
              className="outline-none w-full border-b border-gray-300 py-2"
              value={preview.title}
              onChange={(e) =>
                setPreview({ ...preview, title: e.target.value })
              }
            />
            <ReactQuill
              theme="bubble"
              value={desc}
              onChange={setDesc}
              placeholder="Tell Your Story..."
              className="py-3 border-b border-gray-300"
            />
            <p className="text-gray-500 pt-4 text-sm">
              <span className="font-bold">Note:</span> Changes here will affect
              how your story appears in public places like Scribly's homepage and
              in subscribers' inboxes — not the contents of the story itself.
            </p>
          </div>
          <div className="flex-[1] flex flex-col gap-4 mb-5 md:mb-0">
            <h3 className="text-2xl">
              Publishing to:
              <span className="font-bold capitalize"> Anjali Ray</span>
            </h3>
            <p>
              Add or change topics up to 5 so readers know what your story is
              about
            </p>
            <CustomTagsInput 
              value={tags} 
              onChange={setTags}
              placeholder="Add a tag" 
            />
            <button
              onClick={handleSubmit}
              className="btn !bg-green-800 !w-fit !text-white !rounded-full">
              {loading ? "Submitting..." : "Publish Now"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Preview;