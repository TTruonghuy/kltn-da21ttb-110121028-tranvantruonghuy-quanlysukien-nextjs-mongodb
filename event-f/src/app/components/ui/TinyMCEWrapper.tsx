"use client";
import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";

interface TinyMCEWrapperProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function TinyMCEWrapper({ value, onChange, className }: TinyMCEWrapperProps) {
  const editorRef = useRef<any>(null);

  return (
    <div className={`border border-gray-300 rounded-lg ${className}`}>
      <Editor
        apiKey="5vjbwdij2qggkdb7hse7seskfxwqv2au2phwhcok663bvuvw" // Thay thế bằng API key của bạn
        onInit={(evt, editor) => (editorRef.current = editor)}
        value={value}
        onEditorChange={onChange}
        
        init={{
          height: 300,
          menubar: false,
          //statusbar: false,
          branding: false,
          plugins: [
            "advlist autolink lists link image charmap print preview anchor",
            "searchreplace visualblocks code fullscreen",
            "insertdatetime media table paste code help wordcount",
          ],
          toolbar:
            "undo redo | formatselect | bold italic backcolor | \
            alignleft aligncenter alignright alignjustify | \
            bullist numlist outdent indent | removeformat | help",
        }}
      />
    </div>
  );
}
