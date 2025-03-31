import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { Spinner } from "@material-tailwind/react";
import axios from "axios";

const GEO_API = import.meta.env.VITE_GEO_API;

const ResumeUpload = ({ onResponse }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState(""); // Job description state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [state, setState] = useState("");

  const fetchGeoDetails = async () => {
    try {
      const response = await axios.get("https://ipinfo.io/json?token=dcdc6e84ebbdd9");
      setState(response?.data?.region || "");
    } catch (error) {
      console.error("Error fetching geo details:", error);
    }
  };

  useEffect(() => {
    fetchGeoDetails();
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: ".pdf, .docx, .txt",
    onDrop: (acceptedFiles) => {
      setSelectedFile(acceptedFiles[0]);
      setError("");
    },
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please upload a resume.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("resume", selectedFile);
    formData.append("jobDescription", jobDescription); // Include job description
    formData.append("state", state); // Include state

    try {
      const response = await axios.post(`/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onResponse(response.data); // Pass API response to parent

      // ✅ Clear state after successful upload
      setSelectedFile(null);
      setJobDescription("");
      document.querySelector('input[type="file"]').value = null; // Reset file input
    } catch (err) {
      setError("Failed to analyze resume. Try again.");
      console.error("Upload Error:", err);
    }

    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-lg rounded-lg p-6 mt-6"
    >
      {/* Upload Box */}
      <div
        {...getRootProps()}
        className="border-dashed border-2 border-gray-400 p-10 rounded-lg text-center cursor-pointer"
      >
        <input {...getInputProps()} />
        <AiOutlineCloudUpload size={50} className="mx-auto text-gray-600" />
        <p className="text-gray-600 mt-2">
          Drag & drop your resume here or click to browse
        </p>
        <p className="text-sm text-gray-400">(Accepted: PDF, DOCX, TXT)</p>
      </div>

      {/* Show Selected File */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-4 text-center"
        >
          <p className="text-gray-700 font-semibold">{selectedFile.name}</p>
        </motion.div>
      )}

      {/* Job Description Input */}
      <textarea
        placeholder="Enter job description to compare it with your resume (optional)"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        className="min-h-28 w-full border border-gray-300 p-3 rounded-lg mt-4 focus:outline-none focus:ring-2 focus:ring-pink-400"
        rows="4"
      />

      {/* Analyze Button */}
      <button
        onClick={handleUpload}
        disabled={loading}
        className="mt-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-md shadow-md hover:opacity-90 transition-all flex items-center justify-center mx-auto"
      >
        {loading ? (
          <>
            <Spinner className="w-5 h-5 mr-2" /> Analyzing...
          </>
        ) : (
          "Analyze Resume"
        )}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </motion.div>
  );
};

export default ResumeUpload;
