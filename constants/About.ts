import { Href } from "expo-router";

export interface AboutAppItem {
  title: string;
  detail: string;
  externalLink?: Href & string;
  externalTitle?: string;
}

const ABOUT_APP : AboutAppItem[] = [
  {
    title: "Privacy First",
    detail: "Your contacts are stored only on your device. We never share or upload them to any server.",
  },
  {
    title: "Backup & Restore",
    detail: "Easily back up your contacts and restore them anytime, even if you change or reset your phone.",
  },
  {
    title: "Offline Usage",
    detail: "The app works fully offline. No internet connection is required for contact backup.",
  },
  {
    title: "Open Source",
    detail: "This project is open source. You can review the code and contribute to improvements.",
    externalLink: "https://github.com/your-repo", // 🔗 replace with your repo link
    externalTitle: "View on GitHub",
  },
  {
    title: "Terms & Conditions",
    detail: "By using this app, you agree that you are responsible for managing and safeguarding your backup files.",
    externalLink: "https://your-terms-link.com", // 🔗 replace with your terms page
    externalTitle: "Read Terms",
  },
];


export default ABOUT_APP