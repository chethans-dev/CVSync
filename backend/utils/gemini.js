import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
config({ path: "backend/config/config.env" });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Function to analyze resume using Gemini AI
export const analyzeResumeWithGemini = async (resumeText, jobDescription) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = `
        Analyze this resume and provide:
        
        🎯 **Resume Analysis Report** 🎯
  
        📌 **Job Roles:** Suggest the best job roles based on the resume.  
        💰 **Expected Salary:** Provide an estimated salary range.  
        🔍 **Areas of Improvement:** Highlight resume weaknesses & tips to improve.  
        🛠 **Required Skills:** List the essential skills for these job roles.  
        🌍 **Industry Trends:** Mention key trends relevant to the candidate's field.  
        🏆 **ATS Optimization:**  
           - Extract **important keywords** for ATS ranking.  
           - Identify **missing keywords** to improve ranking.  
           - Calculate an **ATS score** (in percentage) based on matched keywords.
  
        All the above 5 points should be with respect to the year ${new Date().getFullYear()}
  
        Additionally, return a **structured JSON format** for job roles at the end, without extra heading above for the json:
        {
          "jobRoles": ["Role 1", "Role 2", "Role 3", ....]
        }
  
  
        You can also add emojis to make it more engaging.
      `;
    if (jobDescription) {
      prompt += `\n\n💼 
          🔍 **Job Description Comparison**  
          Compare this resume with the provided job description.  
          - **Match Percentage:** Provide a match score (0-100%).  
          - **Missing Skills:** List skills from the job description that are missing in the resume.  
          - **Suggestions to Improve Match:** Provide actionable recommendations to improve the resume for this job.
  
          📄 **Resume Content:**  
          ${resumeText}
          
          📌 **Job Description:**  
          ${jobDescription}
        `;
    } else {
      prompt += `\n\n📄 **Resume Content:**  
          ${resumeText}`;
    }

    const response = await model.generateContent(prompt);

    return response.response.text(); // Extract response
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw new Error("AI analysis failed.");
  }
};
