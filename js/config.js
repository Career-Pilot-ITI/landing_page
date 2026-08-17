const CONFIG = {
  productionUrl: "https://career-pilot-indol.vercel.app",
  apkUrl: "https://drive.google.com/file/d/1s3bEHNOvOh9IGUMnAgCO8QuruOPtWEDV/view?usp=sharing",
  apkDirectUrl: "https://drive.google.com/uc?export=download&id=1s3bEHNOvOh9IGUMnAgCO8QuruOPtWEDV",
  docsUrl: "downloads/Career_Pilot_Documentation.docx",
  docsPageUrl: "docs.html",
  presentationUrl: "downloads/Career_Pilot_Presentation.pptx",
  demoVideoUrl: "assets/demo/career-pilot-demo.mp4",
  defaultTheme: "cloud"
};

if (typeof window !== "undefined") {
  window.CAREER_PILOT_CONFIG = CONFIG;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}
