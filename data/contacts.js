export const siteConfig = {
  name: "Carlos Miguel Ramos",
  role: "Flutter Developer",
  email: "ramos.carlosmiguel56@gmail.com",
  githubUsername: "carlmigz",
  portfolioUrl: "https://carlmigz.github.io",
  // Optional: upload resume.pdf to the repo root and set "./resume.pdf" to show a direct download button.
  resumePdfUrl: "",
  // Optional: paste your Formspree endpoint (e.g. "https://formspree.io/f/xxxxxxx")
  // or Web3Forms endpoint ("https://api.web3forms.com/submit") + access key below.
  // When left empty, the contact form gracefully opens a pre-filled email draft.
  formEndpoint: "",
  web3formsKey: ""
};

export const contacts = [
  {
    label: "Email",
    url: `mailto:${siteConfig.email}`,
    icon: "email"
  },
  {
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/itscarlmigz/",
    icon: "linkedin"
  },
  {
    label: "GitHub",
    url: `https://github.com/${siteConfig.githubUsername}`,
    icon: "github"
  }
];
