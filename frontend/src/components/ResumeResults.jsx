import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import remarkGfm from "remark-gfm";
import { useEffect, useRef } from "react";

const ResumeResults = ({ analysisData }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (analysisData) {
      containerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [analysisData]);

  if (!analysisData)
    return <p className="text-gray-500">Upload a resume to see results.</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
      ref={containerRef}
    >
      <div className="mk-ai prose prose-lg max-w-full leading-relaxed text-gray-800">
        <ReactMarkdown
          children={analysisData?.aiAnalysis}
          remarkPlugins={[remarkGfm]}
        />
      </div>

      {/* Real-Time Job Matches */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-8"
      >
        <Typography variant="h5" className="mb-4 font-semibold">
          🚀 Jobs Matching Your Resume
        </Typography>

        {analysisData?.realTimeJobs?.length > 0 ? (
          analysisData.realTimeJobs.map((jobCategory, roleIndex) => (
            <div key={roleIndex} className="space-y-4">
              {/* 🏷 Job Role Title */}
              <Typography variant="h5" className="font-bold text-gray-900 mt-2">
                ✅ {jobCategory.role}
              </Typography>

              {/* 🔥 Grid Layout for Jobs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {jobCategory.jobs.length > 0 ? (
                  jobCategory.jobs.map((job, jobIndex) => (
                    <Card
                      key={`${jobCategory.role}-${jobIndex}`}
                      className="shadow-lg border border-gray-200 flex flex-col items-start space-y-3 transition-all duration-300 hover:ring-2 hover:ring-pink-500"
                    >
                      <CardBody>
                        <Typography
                          variant="h6"
                          className="font-semibold text-gray-900"
                        >
                          {job.title}
                        </Typography>
                        <Typography
                          variant="small"
                          className="mt-1 text-gray-600"
                        >
                          {job.company} - {job.location}
                        </Typography>
                        <Typography
                          variant="small"
                          className="mt-1 text-green-600 font-semibold"
                        >
                          Posted: {job.posted}
                        </Typography>
                        <motion.button
                          className="mt-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-md shadow-md hover:opacity-90 transition-all"
                          whileHover={{ scale: 1.05 }} 
                          onClick={() => window.open(job?.url, "_blank")}
                        >
                          View Job
                        </motion.button>
                      </CardBody>
                    </Card>
                    // </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-full">
                    No jobs found for this role.
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No job matches found.</p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ResumeResults;
