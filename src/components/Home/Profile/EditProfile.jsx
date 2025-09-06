import { useEffect, useRef, useState } from "react";
import Modal from "../../../utils/Modal";
import { LiaTimesSolid } from "react-icons/lia";
import { toast } from "react-toastify";
import { db } from "../../../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";

const EditProfile = ({ editModal, setEditModal, getUserData }) => {
  const imgRef = useRef(null);
  const [imgUrl, setImgUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    userImg: "",
    bio: "",
  });

  // Cloudinary configuration
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "your_cloud_name_here";
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ml_default";
  const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const btn = "border border-green-600 py-2 px-5 rounded-full text-green-600";
  
  const openFile = () => {
    imgRef.current.click();
  };

  useEffect(() => {
    if (getUserData) {
      setForm(getUserData);
    } else {
      setForm({ username: "", bio: "", userImg: "" });
    }
  }, [getUserData]);

  // Enhanced file validation
  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPG, PNG, or GIF)");
      return false;
    }

    if (file.size > maxSize) {
      toast.error("Image size should be less than 10MB");
      return false;
    }

    return true;
  };

  // Upload to Cloudinary - Try multiple presets if one fails
  const uploadToCloudinary = async (file) => {
    const presetsToTry = [
      CLOUDINARY_UPLOAD_PRESET,
      'ml_default', // Fallback to default preset
      'profile_images' // Your current preset
    ];

    for (const preset of presetsToTry) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", preset);
        
        console.log(`Trying upload preset: ${preset}`);

        const response = await fetch(CLOUDINARY_URL, {
          method: "POST",
          body: formData,
        });
        
        const data = await response.json();
        
        if (response.ok) {
          console.log('Upload successful with preset:', preset, data.secure_url);
          return data.secure_url;
        } else {
          console.warn(`Preset ${preset} failed:`, data.error);
          // Continue to next preset
          continue;
        }
      } catch (error) {
        console.warn(`Preset ${preset} error:`, error.message);
        // Continue to next preset
        continue;
      }
    }
    
    // If all presets failed
    throw new Error('All upload presets failed. Please check your Cloudinary configuration.');
  };

  // Handle file selection with immediate upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateFile(file)) {
      e.target.value = '';
      return;
    }

    setUploading(true);
    
    try {
      // Show preview immediately
      const previewUrl = URL.createObjectURL(file);
      setImgUrl(previewUrl);
      
      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(file);
      
      // Update form with the Cloudinary URL
      setForm(prev => ({ ...prev, userImg: cloudinaryUrl }));
      
      // Clean up preview URL and set final URL
      URL.revokeObjectURL(previewUrl);
      setImgUrl(cloudinaryUrl);
      
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message);
      
      // Reset on error
      setImgUrl("");
      setForm(prev => ({ ...prev, userImg: "" }));
      e.target.value = '';
    } finally {
      setUploading(false);
    }
  };

  // Save form (now much simpler since image is already uploaded)
  const saveForm = async () => {
    if (!form.username.trim()) {
      toast.error("Username is required!");
      return;
    }

    if (!form.bio.trim()) {
      toast.error("Bio is required!");
      return;
    }

    if (!form.userImg) {
      toast.error("Please upload a profile image");
      return;
    }

    setLoading(true);

    try {
      // Update Firestore document
      const docRef = doc(db, "users", getUserData?.userId);
      await updateDoc(docRef, {
        bio: form.bio.trim(),
        username: form.username.trim(),
        userImg: form.userImg,
        userId: getUserData?.userId,
        updatedAt: new Date().toISOString(),
      });
      
      toast.success("Profile has been updated successfully!");
      setEditModal(false);
      
      // Clean up
      if (imgUrl && imgUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imgUrl);
        setImgUrl("");
      }
      
    } catch (error) {
      console.error("Save error:", error);
      toast.error(`Error updating profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Remove image function
  const removeImage = () => {
    if (imgUrl && imgUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imgUrl);
    }
    setImgUrl("");
    setForm(prev => ({ ...prev, userImg: "" }));
    if (imgRef.current) {
      imgRef.current.value = '';
    }
  };

  // Handle modal close with cleanup
  const handleModalClose = () => {
    if (imgUrl && imgUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imgUrl);
    }
    setEditModal(false);
  };

  return (
    <Modal modal={editModal} setModal={setEditModal}>
      <div className="center w-[95%] md:w-[45rem] bg-white mx-auto shadows my-[1rem] z-20 mb-[3rem] p-[2rem]">
        {/* head  */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-xl">Profile information</h2>
          <button onClick={handleModalClose} className="text-xl">
            <LiaTimesSolid />
          </button>
        </div>
        
        {/* body  */}
        <section className="mt-6">
          <p className="pb-3 text-sm text-gray-500">Photo</p>
          <div className="flex gap-[2rem]">
            <div className="w-[5rem] relative">
              <img
                className="min-h-[5rem] min-w-[5rem] object-cover border border-gray-400 rounded-full"
                src={imgUrl || form.userImg || "/profile.jpg"}
                alt="profile-img"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
              <input
                onChange={handleFileChange}
                accept="image/jpeg,image/jpg,image/png,image/gif"
                ref={imgRef}
                type="file"
                hidden
                disabled={uploading}
              />
            </div>
            <div>
              <div className="flex gap-4 text-sm">
                <button 
                  onClick={openFile} 
                  className="text-green-600 disabled:opacity-50"
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Update"}
                </button>
                <button 
                  onClick={removeImage} 
                  className="text-red-600 disabled:opacity-50"
                  disabled={uploading}
                >
                  Remove
                </button>
              </div>
              <p className="w-full sm:w-[20rem] text-gray-500 text-sm pt-2">
                Recommended: Square JPG, PNG, or GIF, at least 1,000 pixels per
                side. Max size: 10MB
              </p>
              {uploading && (
                <p className="text-blue-600 text-sm pt-1">
                  Uploading image... Please wait.
                </p>
              )}
            </div>
          </div>
        </section>
        
        {/* Profile edit form  */}
        <section className="pt-[1rem] text-sm">
          <label className="pb-3 block" htmlFor="username">
            Name*
          </label>
          <input
            id="username"
            onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
            value={form.username}
            type="text"
            placeholder="Enter your username..."
            className="p-1 border-b border-black w-full outline-none"
            maxLength={50}
            disabled={loading || uploading}
          />
          <p className="text-sm text-gray-600 pt-2">
            Appears on your Profile page, as your byline, and in your responses.
            {form.username.length}/50
          </p>
          
          <section className="pt-[1rem] text-sm">
            <label className="pb-3 block" htmlFor="bio">
              Bio*
            </label>
            <input
              id="bio"
              onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))}
              value={form.bio}
              type="text"
              placeholder="Tell us about yourself..."
              className="p-1 border-b border-black w-full outline-none"
              maxLength={160}
              disabled={loading || uploading}
            />
            <p className="text-sm text-gray-600 pt-2">
              Appears on your Profile and next to your stories.{" "}
              {form.bio.length}/160
            </p>
          </section>
        </section>
        
        {/* foot  */}
        <div className="flex items-center justify-end gap-4 pt-[2rem]">
          <button 
            onClick={handleModalClose} 
            className={`${btn} disabled:opacity-50`}
            disabled={loading || uploading}
          >
            Cancel
          </button>
          <button
            onClick={saveForm}
            disabled={loading || uploading || !form.userImg || !form.username.trim() || !form.bio.trim()}
            className={`${btn} bg-green-800 text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? "Saving..." : uploading ? "Uploading..." : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditProfile;