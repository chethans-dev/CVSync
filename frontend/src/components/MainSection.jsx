import { useState } from "react";
import ResumeUpload from "./ResumeUpload";
import ResumeResults from "./ResumeResults";

const MainSection = () => {
  const [analysisData, setAnalysisData] = useState(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 p-6">
      {/* Left Panel - Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col h-[86vh]">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Upload Your Resume
        </h2>
        <ResumeUpload onResponse={setAnalysisData} />
      </div>

      {/* Right Panel - Scrollable Display Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col h-[86vh] overflow-y-auto">
        <ResumeResults analysisData={analysisData} />
      </div>
    </div>
  );
};

export default MainSection;
