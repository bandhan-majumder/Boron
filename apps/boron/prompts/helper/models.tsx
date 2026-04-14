// import { ArrowUp, Brain, Plus, Zap, Cpu, ChevronDown } from "lucide-react";

// export const models = [
//   // Claude 4 Models
//   {
//     id: "claude-opus-4-1-20250805",
//     name: "Claude Opus 4.1",
//     icon: <Zap className="h-4 w-4" />,
//     badge: "Latest",
//     badgeColor: "text-green-400",
//   },
//   {
//     id: "claude-opus-4-20250514",
//     name: "Claude Opus 4.0",
//     icon: <Zap className="h-4 w-4" />,
//   },
//   {
//     id: "claude-sonnet-4-20250514",
//     name: "Claude Sonnet 4.0",
//     icon: <Brain className="h-4 w-4" />,
//     badge: "Popular",
//     badgeColor: "text-yellow-400",
//   },
//   // Claude 3.7 Models
//   {
//     id: "claude-3-7-sonnet-20250219",
//     name: "Claude 3.7 Sonnet",
//     icon: <Brain className="h-4 w-4" />,
//   },
//   // Claude 3.5 Models
//   {
//     id: "claude-3-5-haiku-20241022",
//     name: "Claude 3.5 Haiku",
//     icon: <Cpu className="h-4 w-4" />,
//   },
//   {
//     id: "claude-3-5-sonnet-20241022",
//     name: "Claude 3.5 Sonnet",
//     icon: <Brain className="h-4 w-4" />,
//     badge: "Deprecated",
//     badgeColor: "text-red-400",
//   },
//   {
//     id: "claude-3-5-sonnet-latest",
//     name: "Claude 3.5 Sonnet (Latest)",
//     icon: <Brain className="h-4 w-4" />,
//     badge: "Alias",
//     badgeColor: "text-blue-400",
//   },
//   {
//     id: "claude-3-5-sonnet-20240620",
//     name: "Claude 3.5 Sonnet (Previous)",
//     icon: <Brain className="h-4 w-4" />,
//     badge: "Deprecated",
//     badgeColor: "text-red-400",
//   },

//   // Claude 3 Models
//   {
//     id: "claude-3-opus-20240229",
//     name: "Claude 3 Opus",
//     icon: <Zap className="h-4 w-4" />,
//     badge: "Deprecated",
//     badgeColor: "text-red-400",
//   },
//   {
//     id: "claude-3-opus-latest",
//     name: "Claude 3 Opus (Latest)",
//     icon: <Zap className="h-4 w-4" />,
//     badge: "Alias",
//     badgeColor: "text-blue-400",
//   },
//   {
//     id: "claude-3-haiku-20240307",
//     name: "Claude 3 Haiku",
//     icon: <Cpu className="h-4 w-4" />,
//   },
// ];

// export const groupedModels = models.reduce(
//   (acc, model) => {
//     const category = model.id.includes("claude-4")
//       ? "Claude 4"
//       : model.id.includes("claude-3-7")
//         ? "Claude 3.7"
//         : model.id.includes("claude-3-5")
//           ? "Claude 3.5"
//           : "Claude 3";

//     if (!acc[category]) {
//       acc[category] = [];
//     }
//     acc[category].push(model);
//     return acc;
//   },
//   {} as Record<string, typeof models>,
// );
