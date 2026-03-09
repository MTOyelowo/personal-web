import { type IconType } from "react-icons";
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiJavascript,
  SiNodedotjs,
  SiPython,
  SiRust,
  SiGo,
  SiCplusplus,
  SiC,
  SiSharp,
  SiOpenjdk,
  SiSwift,
  SiKotlin,
  SiDart,
  SiFlutter,
  SiHtml5,
  SiCss3,
  SiSass,
  SiTailwindcss,
  SiBootstrap,
  SiVuedotjs,
  SiAngular,
  SiSvelte,
  SiAstro,
  SiRemix,
  SiVite,
  SiWebpack,
  SiExpress,
  SiFastify,
  SiNestjs,
  SiDjango,
  SiFlask,
  SiFastapi,
  SiRubyonrails,
  SiLaravel,
  SiSpringboot,
  SiDotnet,
  SiPostgresql,
  SiMysql,
  SiMongodb,
  SiRedis,
  SiSqlite,
  SiSupabase,
  SiFirebase,
  SiPrisma,
  SiDrizzle,
  SiGraphql,
  SiApollographql,
  SiDocker,
  SiKubernetes,
  SiAmazonwebservices,
  SiGooglecloud,
  SiVercel,
  SiNetlify,
  SiCloudflare,
  SiHeroku,
  SiDigitalocean,
  SiRailway,
  SiGit,
  SiGithub,
  SiGitlab,
  SiBitbucket,
  SiLinux,
  SiNginx,
  SiApache,
  SiElectron,
  SiExpo,
  SiAndroid,
  SiApple,
  SiJest,
  SiCypress,
  SiVitest,
  SiStorybook,
  SiFigma,
  SiStripe,
  SiAuth0,
  SiOpenai,
  SiThreedotjs,
  SiSocketdotio,
  SiRabbitmq,
  SiApachekafka,
  SiElasticsearch,
  SiTerraform,
  SiGithubactions,
  SiJenkins,
  SiNpm,
  SiPnpm,
  SiYarn,
  SiBun,
  SiDeno,
  SiPhp,
  SiWordpress,
  SiShopify,
  SiContentful,
  SiSanity,
  SiMarkdown,
  SiMdx,
} from "react-icons/si";
import { VscAzureDevops } from "react-icons/vsc";
import { TbDatabase, TbCreditCardPay } from "react-icons/tb";

/* ── Tech Option Entry ───────────────────────────────────── */

export interface TechOption {
  /** Display label, e.g. "React" */
  label: string;
  /** Key stored in DB, e.g. "react" */
  key: string;
  /** react-icons component */
  Icon: IconType;
  /** Search aliases (lowercase) */
  aliases?: string[];
}

/* ── Registry ────────────────────────────────────────────── */

export const TECH_OPTIONS: TechOption[] = [
  // Frontend frameworks
  { label: "React", key: "react", Icon: SiReact },
  { label: "Next.js", key: "nextjs", Icon: SiNextdotjs },
  { label: "Vue.js", key: "vuejs", Icon: SiVuedotjs, aliases: ["vue"] },
  { label: "Angular", key: "angular", Icon: SiAngular },
  { label: "Svelte", key: "svelte", Icon: SiSvelte },
  { label: "Astro", key: "astro", Icon: SiAstro },
  { label: "Remix", key: "remix", Icon: SiRemix },

  // Languages
  {
    label: "TypeScript",
    key: "typescript",
    Icon: SiTypescript,
    aliases: ["ts"],
  },
  {
    label: "JavaScript",
    key: "javascript",
    Icon: SiJavascript,
    aliases: ["js"],
  },
  { label: "Python", key: "python", Icon: SiPython },
  { label: "Rust", key: "rust", Icon: SiRust },
  { label: "Go", key: "go", Icon: SiGo, aliases: ["golang"] },
  { label: "C++", key: "cplusplus", Icon: SiCplusplus, aliases: ["cpp"] },
  { label: "C", key: "c", Icon: SiC },
  { label: "C#", key: "csharp", Icon: SiSharp, aliases: ["dotnet"] },
  { label: "Java", key: "java", Icon: SiOpenjdk },
  { label: "Swift", key: "swift", Icon: SiSwift },
  { label: "Kotlin", key: "kotlin", Icon: SiKotlin },
  { label: "Dart", key: "dart", Icon: SiDart },
  { label: "PHP", key: "php", Icon: SiPhp },

  // Styling
  { label: "HTML", key: "html5", Icon: SiHtml5 },
  { label: "CSS", key: "css3", Icon: SiCss3 },
  { label: "Sass", key: "sass", Icon: SiSass, aliases: ["scss"] },
  {
    label: "Tailwind CSS",
    key: "tailwindcss",
    Icon: SiTailwindcss,
    aliases: ["tailwind"],
  },
  { label: "Bootstrap", key: "bootstrap", Icon: SiBootstrap },

  // Build tools
  { label: "Vite", key: "vite", Icon: SiVite },
  { label: "Webpack", key: "webpack", Icon: SiWebpack },

  // Backend frameworks
  { label: "Node.js", key: "nodejs", Icon: SiNodedotjs, aliases: ["node"] },
  { label: "Express", key: "express", Icon: SiExpress, aliases: ["expressjs"] },
  { label: "Fastify", key: "fastify", Icon: SiFastify },
  { label: "NestJS", key: "nestjs", Icon: SiNestjs },
  { label: "Django", key: "django", Icon: SiDjango },
  { label: "Flask", key: "flask", Icon: SiFlask },
  { label: "FastAPI", key: "fastapi", Icon: SiFastapi },
  {
    label: "Ruby on Rails",
    key: "rails",
    Icon: SiRubyonrails,
    aliases: ["ror", "ruby"],
  },
  { label: "Laravel", key: "laravel", Icon: SiLaravel },
  {
    label: "Spring Boot",
    key: "springboot",
    Icon: SiSpringboot,
    aliases: ["spring"],
  },
  { label: ".NET", key: "dotnet", Icon: SiDotnet, aliases: ["aspnet"] },

  // Databases
  {
    label: "PostgreSQL",
    key: "postgresql",
    Icon: SiPostgresql,
    aliases: ["postgres"],
  },
  { label: "MySQL", key: "mysql", Icon: SiMysql },
  { label: "MongoDB", key: "mongodb", Icon: SiMongodb, aliases: ["mongo"] },
  { label: "Redis", key: "redis", Icon: SiRedis },
  { label: "SQLite", key: "sqlite", Icon: SiSqlite },

  // BaaS / DB tools
  { label: "Supabase", key: "supabase", Icon: SiSupabase },
  { label: "Firebase", key: "firebase", Icon: SiFirebase },
  { label: "Prisma", key: "prisma", Icon: SiPrisma },
  { label: "Drizzle", key: "drizzle", Icon: SiDrizzle },
  { label: "GraphQL", key: "graphql", Icon: SiGraphql },
  { label: "Apollo", key: "apollo", Icon: SiApollographql },

  // DevOps / Cloud
  { label: "Docker", key: "docker", Icon: SiDocker },
  {
    label: "Kubernetes",
    key: "kubernetes",
    Icon: SiKubernetes,
    aliases: ["k8s"],
  },
  { label: "AWS", key: "aws", Icon: SiAmazonwebservices, aliases: ["amazon"] },
  {
    label: "Google Cloud",
    key: "gcp",
    Icon: SiGooglecloud,
    aliases: ["gcloud"],
  },
  { label: "Vercel", key: "vercel", Icon: SiVercel },
  { label: "Netlify", key: "netlify", Icon: SiNetlify },
  { label: "Cloudflare", key: "cloudflare", Icon: SiCloudflare },
  { label: "Heroku", key: "heroku", Icon: SiHeroku },
  { label: "DigitalOcean", key: "digitalocean", Icon: SiDigitalocean },
  { label: "Railway", key: "railway", Icon: SiRailway },
  {
    label: "Azure",
    key: "azure",
    Icon: VscAzureDevops,
    aliases: ["microsoft"],
  },
  {
    label: "Neon",
    key: "neon",
    Icon: TbDatabase,
    aliases: ["neondb", "neon database"],
  },

  // Version control
  { label: "Git", key: "git", Icon: SiGit },
  { label: "GitHub", key: "github", Icon: SiGithub },
  { label: "GitLab", key: "gitlab", Icon: SiGitlab },
  { label: "Bitbucket", key: "bitbucket", Icon: SiBitbucket },

  // Infra / servers
  { label: "Linux", key: "linux", Icon: SiLinux },
  { label: "Nginx", key: "nginx", Icon: SiNginx },
  { label: "Apache", key: "apache", Icon: SiApache },

  // Mobile
  { label: "React Native", key: "reactnative", Icon: SiReact, aliases: ["rn"] },
  { label: "Flutter", key: "flutter", Icon: SiFlutter },
  { label: "Expo", key: "expo", Icon: SiExpo },
  { label: "Android", key: "android", Icon: SiAndroid },
  { label: "iOS", key: "ios", Icon: SiApple, aliases: ["apple"] },

  // Desktop
  { label: "Electron", key: "electron", Icon: SiElectron },

  // Testing
  { label: "Jest", key: "jest", Icon: SiJest },
  { label: "Cypress", key: "cypress", Icon: SiCypress },
  { label: "Vitest", key: "vitest", Icon: SiVitest },

  // Design / tools
  { label: "Storybook", key: "storybook", Icon: SiStorybook },
  { label: "Figma", key: "figma", Icon: SiFigma },

  // Services
  { label: "Stripe", key: "stripe", Icon: SiStripe },
  { label: "Paystack", key: "paystack", Icon: TbCreditCardPay },
  { label: "Auth0", key: "auth0", Icon: SiAuth0 },
  { label: "OpenAI", key: "openai", Icon: SiOpenai },

  // Real-time / messaging
  { label: "Socket.io", key: "socketio", Icon: SiSocketdotio },
  { label: "RabbitMQ", key: "rabbitmq", Icon: SiRabbitmq },
  { label: "Kafka", key: "kafka", Icon: SiApachekafka },

  // Search
  { label: "Elasticsearch", key: "elasticsearch", Icon: SiElasticsearch },

  // CI/CD
  { label: "Terraform", key: "terraform", Icon: SiTerraform },
  { label: "GitHub Actions", key: "githubactions", Icon: SiGithubactions },
  { label: "Jenkins", key: "jenkins", Icon: SiJenkins },

  // Package managers / runtimes
  { label: "npm", key: "npm", Icon: SiNpm },
  { label: "pnpm", key: "pnpm", Icon: SiPnpm },
  { label: "Yarn", key: "yarn", Icon: SiYarn },
  { label: "Bun", key: "bun", Icon: SiBun },
  { label: "Deno", key: "deno", Icon: SiDeno },

  // CMS / Content
  { label: "WordPress", key: "wordpress", Icon: SiWordpress },
  { label: "Shopify", key: "shopify", Icon: SiShopify },
  { label: "Contentful", key: "contentful", Icon: SiContentful },
  { label: "Sanity", key: "sanity", Icon: SiSanity },
  { label: "Markdown", key: "markdown", Icon: SiMarkdown },
  { label: "MDX", key: "mdx", Icon: SiMdx },

  // 3D / Graphics
  { label: "Three.js", key: "threejs", Icon: SiThreedotjs },
];

/* ── Lookup helpers ──────────────────────────────────────── */

const techByKey = new Map(TECH_OPTIONS.map((t) => [t.key, t]));

/** Look up a TechOption by its key. Returns undefined for custom entries. */
export function getTechOption(key: string): TechOption | undefined {
  return techByKey.get(key);
}

/** Get the Icon component for a tech key, or null if not found. */
export function getTechIcon(key: string): IconType | null {
  return techByKey.get(key)?.Icon ?? null;
}

/**
 * Search tech options by query string.
 * Matches against label, key, and aliases (case-insensitive).
 */
export function searchTechOptions(query: string): TechOption[] {
  if (!query) return TECH_OPTIONS;
  const q = query.toLowerCase();
  return TECH_OPTIONS.filter(
    (t) =>
      t.label.toLowerCase().includes(q) ||
      t.key.includes(q) ||
      t.aliases?.some((a) => a.includes(q)),
  );
}
