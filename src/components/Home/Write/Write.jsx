import React, { useState, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css"; // Import Quill styles
import Preview from "./Preview";
import { Blog } from "../../../Context/Context";

const Write = () => {
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const quillRef = useRef(null);
  const { publish, setPublish } = Blog();

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
      [{size: []}],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, 
       {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
  ];

  return (
    <section className="w-[90%] md:w-[90%] lg:w-[60%] mx-auto py-[3rem]">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        type="text"
        placeholder="Title"
        className="text-4xl outline-none w-full"
      />
      <ReactQuill
        ref={quillRef}
        theme="bubble"
        value={description}
        onChange={setDescription}
        placeholder="Tell Your Story..."
        className="write my-5"
        modules={modules}
        formats={formats}
      />
      <div
        className={`${
          publish ? "visible opacity-100" : "invisible opacity-0"
        } transition-all duration-200`}>
        <Preview
          setPublish={setPublish}
          description={description}
          title={title}
        />
      </div>
    </section>
  );
};

export default Write;