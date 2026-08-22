import { useState } from "react";
import clsx from "clsx";
import {
  LifeBuoy,
  ChevronDown,
  ExternalLink,
  Bug,
  Download,
  FileVideo,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { styles } from "./Help.styles";
import { GITHUB_ISSUES, GITHUB_REPOSITORY } from "../constants";

type Issue = {
  icon: LucideIcon;
  title: string;
  explanation: string;
};

const commonIssues: Issue[] = [
  {
    icon: Download,
    title: "Download fails",
    explanation:
      "The download did not complete. Check the error message shown in the app and the logs if available. A quick restart can help. If it keeps failing, try analyzing the link again or pick a different format or quality.",
  },
  {
    icon: FileVideo,
    title: "Unsupported or problematic video format",
    explanation:
      "Some formats or codecs may not work on your system. Try a different format (MP4, MP3) or quality level. For MP4 downloads you can also switch the video compatibility option.",
  },
  {
    icon: Loader2,
    title: "Download gets stuck",
    explanation:
      "The download is not progressing. Check your network connection and that the source is reachable. Restarting the application resets the download queue.",
  },
];

type IssueAccordionProps = {
  issue: Issue;
  isOpen: boolean;
  onToggle: () => void;
};

function IssueAccordion({ issue, isOpen, onToggle }: IssueAccordionProps) {
  const Icon = issue.icon;
  return (
    <div className={styles.accordionItem}>
      <button
        type="button"
        className={styles.accordionHeader}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className={styles.accordionTitle}>
          <Icon className="w-4 h-4 shrink-0" />
          {issue.title}
        </span>
        <ChevronDown
          className={clsx(styles.accordionChevron, isOpen && "rotate-180")}
        />
      </button>
      <div
        className={clsx(
          styles.accordionContent,
          isOpen
            ? styles.accordionContentOpen
            : styles.accordionContentClosed
        )}
      >
        {issue.explanation}
      </div>
    </div>
  );
}

export default function Help() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const openExternal = async (url: string) => {
    await window.electronAPI.openExternalLink(url);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>
        <LifeBuoy className="w-5 h-5" />
        Help
      </h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Troubleshooting</h2>
        <p className={styles.intro}>
          Something not working? Try these quick checks first before reporting
          a problem.
        </p>
        <ol className={styles.list}>
          <li className={styles.listItem}>
            Make sure you are using the latest version of the application.
          </li>
          <li className={styles.listItem}>
            Try analyzing or downloading the link again.
          </li>
          <li className={styles.listItem}>
            Check whether the URL is valid and publicly accessible.
          </li>
          <li className={styles.listItem}>
            If a download fails, check the error message and logs for details.
          </li>
          <li className={styles.listItem}>
            Restart the application if something behaves unexpectedly.
          </li>
        </ol>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Common Issues</h2>
        <p className={styles.bodyText}>
          Expand an issue below for guidance.
        </p>
        <div className={styles.accordion}>
          {commonIssues.map((issue) => (
            <IssueAccordion
              key={issue.title}
              issue={issue}
              isOpen={openId === issue.title}
              onToggle={() => toggle(issue.title)}
            />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Report a Problem</h2>
        <p className={styles.intro}>
          If you cannot solve the issue, help us fix it by filing a bug report:
        </p>
        <ol className={styles.list}>
          <li className={styles.listItem}>
            Check existing GitHub Issues to see if the problem was already
            reported.
          </li>
          <li className={styles.listItem}>
            If it has not, create a new issue.
          </li>
          <li className={styles.listItem}>
            Include: what you were trying to do, what happened, what you
            expected, the error message, relevant logs, and the application
            version.
          </li>
        </ol>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() => openExternal(GITHUB_ISSUES)}
        >
          <Bug className="w-4 h-4" />
          Report a Problem
        </button>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>GitHub</h2>
        <div className={styles.githubCard}>
          <h3 className={styles.githubTitle}>GitHub Repository</h3>
          <p className={styles.githubHint}>
            Source, releases and contribution info live on GitHub.
          </p>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => openExternal(GITHUB_REPOSITORY)}
          >
            <ExternalLink className="w-4 h-4" />
            Open GitHub
          </button>
        </div>
      </section>
    </div>
  );
}
