import React from "react";
import Link from "next/link";
import { Bell, Building2, MessageSquare, PenLine, Users, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: Users,
    title: "Real-time collaboration",
    description: "Edit documents together and see your teammates' changes as they happen.",
  },
  {
    icon: PenLine,
    title: "Rich block editor",
    description: "Headings, lists, checklists, tables, code, alerts and images in one editor.",
  },
  {
    icon: MessageSquare,
    title: "Comments & @mentions",
    description: "Discuss ideas in threads right next to the document and mention teammates.",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "An inbox keeps you up to date with new comments and mentions.",
  },
  {
    icon: Building2,
    title: "Organizations",
    description: "Switch between personal and team workspaces with organization support.",
  },
  {
    icon: Zap,
    title: "Autosave",
    description: "Every change is saved automatically to the cloud.",
  },
];

const STEPS = [
  { title: "Sign in", description: "Create an account or sign in with your preferred provider." },
  { title: "Create a workspace", description: "Pick a name, emoji and cover for your team space." },
  { title: "Write together", description: "Add documents, invite your team and start collaborating." },
];

function Hero() {
  return (
    <div className="relative overflow-hidden" id="home">
      <div aria-hidden="true" className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40">
        <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-purple-400"></div>
        <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-400 to-sky-300"></div>
      </div>

      <section className="relative px-4 pt-16 pb-12 mx-auto text-center sm:pt-28 lg:w-2/3">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl xl:text-7xl">
          Document Planner is where <span className="text-primary">work happens, in sync.</span>
        </h1>
        <p className="mt-6 text-base text-gray-700 sm:mt-8 sm:text-lg">
          Document Planner is a collaborative workspace that lets teams create, share and work
          together on documents in real time. Organize your ideas in workspaces, write with a
          powerful block editor and keep the conversation going with comments and mentions.
        </p>
        <div className="flex flex-col justify-center gap-4 mt-10 sm:flex-row sm:mt-14">
          <Link
            href="/dashboard"
            className="flex items-center justify-center px-6 font-semibold text-white transition rounded-full h-11 bg-primary hover:opacity-90"
          >
            Get started
          </Link>
          <a
            href="#features"
            className="flex items-center justify-center px-6 font-semibold transition rounded-full h-11 bg-primary/10 text-primary hover:bg-primary/20"
          >
            Learn more
          </a>
        </div>
      </section>

      <section id="features" className="relative px-4 py-12 mx-auto max-w-6xl sm:px-8 scroll-mt-4">
        <h2 className="text-2xl font-bold text-center sm:text-3xl">Everything your team needs</h2>
        <div className="grid grid-cols-1 gap-6 mt-10 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="p-6 bg-white border shadow-sm rounded-2xl">
              <Icon className="w-8 h-8 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="relative px-4 py-12 mx-auto max-w-5xl sm:px-8 scroll-mt-4">
        <h2 className="text-2xl font-bold text-center sm:text-3xl">How it works</h2>
        <ol className="grid grid-cols-1 gap-6 mt-10 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="p-6 text-center">
              <span className="inline-flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-primary">
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-gray-600">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="relative py-8 text-sm text-center text-gray-500 border-t">
        © {new Date().getFullYear()} Document Planner
      </footer>
    </div>
  );
}

export default Hero;
