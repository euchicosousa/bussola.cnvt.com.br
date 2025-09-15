import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import Color from "color";
import { Input } from "~/components/ui/input";
import { CheckIcon } from "lucide-react";

export default function ColorPicker({
  color: currentColor,
  onChange,
  name,
}: {
  color: string;
  onChange?: (color: string) => void;
  name?: string;
}) {
  const [color, setColor] = useState(currentColor);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (onChange) onChange(color);
  }, [color]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="size-8 rounded-full p-0">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            hidden
            name={name}
          />
          <div
            className="size-6 rounded-full border"
            style={{ backgroundColor: color }}
          ></div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-content grid w-auto grid-cols-11 gap-0 overflow-hidden p-0">
        {sexyColors.map((c) => (
          <div
            key={c}
            className={`hover:ring-primary z-0 size-6 cursor-pointer hover:z-10 hover:ring-2`}
            style={{ backgroundColor: c }}
            title={c}
            onClick={() => {
              setColor(c);
              setOpen(false);
            }}
          ></div>
        ))}
        <div className="col-span-11 flex items-center gap-2 p-2">
          <Input
            type="text"
            value={color}
            onChange={(e) => {
              let color = e.target.value;
              if (!/^#.*/.test(color)) {
                color = "#" + color;
              }
              setColor(color);
            }}
          />
          <Button
            size={"icon"}
            onClick={() => setOpen(false)}
            className="shrink-0"
          >
            <CheckIcon />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const sexyColors = [
  // Red
  "#fef2f2", // red-50 (original)
  "#fecaca", // red-300 (original)
  "#f87171", // red-400 (original)
  "#dc2626", // red-600 (original)
  "#991b1b", // red-800 (original)
  "#450a0a", // red-950 no centro
  "#b85555", // Pastel mais suave do red-900
  "#d88888", // Pastel mais suave do red-700
  "#f5a0a0", // Pastel mais suave do red-500
  "#fddddd", // Pastel mais suave do red-200
  "#fef7f7", // Pastel mais suave do red-100

  // Orange
  "#fff7ed", // orange-50 (original)
  "#fed7aa", // orange-300 (original)
  "#fb923c", // orange-400 (original)
  "#ea580c", // orange-600 (original)
  "#9a3412", // orange-800 (original)
  "#431407", // orange-950 no centro
  "#b8552a", // Pastel mais suave do orange-900
  "#d8885a", // Pastel mais suave do orange-700
  "#f5a085", // Pastel mais suave do orange-500
  "#fdddcc", // Pastel mais suave do orange-200
  "#fef7f0", // Pastel mais suave do orange-100

  // Amber
  "#fffbeb", // amber-50 (original)
  "#fde68a", // amber-300 (original)
  "#fbbf24", // amber-400 (original)
  "#d97706", // amber-600 (original)
  "#92400e", // amber-800 (original)
  "#451a03", // amber-950 no centro
  "#b85520", // Pastel mais suave do amber-900
  "#d88840", // Pastel mais suave do amber-700
  "#f5a055", // Pastel mais suave do amber-500
  "#fddd88", // Pastel mais suave do amber-200
  "#fef7c8", // Pastel mais suave do amber-100

  // Yellow
  "#fefce8", // yellow-50 (original)
  "#fef08a", // yellow-300 (original)
  "#facc15", // yellow-400 (original)
  "#ca8a04", // yellow-600 (original)
  "#854d0e", // yellow-800 (original)
  "#422006", // yellow-950 no centro
  "#b8803a", // Pastel mais suave do yellow-900
  "#d8aa55", // Pastel mais suave do yellow-700
  "#f5cc70", // Pastel mais suave do yellow-500
  "#fddd99", // Pastel mais suave do yellow-200
  "#fef7c8", // Pastel mais suave do yellow-100

  // Lime
  "#f7fee7", // lime-50 (original)
  "#d9f99d", // lime-300 (original)
  "#a3e635", // lime-400 (original)
  "#65a30d", // lime-600 (original)
  "#365314", // lime-800 (original)
  "#0a0f02", // lime-950 no centro
  "#558844", // Pastel mais suave do lime-900
  "#77aa55", // Pastel mais suave do lime-700
  "#99cc66", // Pastel mais suave do lime-500
  "#ccddaa", // Pastel mais suave do lime-200
  "#eef7cc", // Pastel mais suave do lime-100

  // Green
  "#f0fdf4", // green-50 (original)
  "#bbf7d0", // green-300 (original)
  "#4ade80", // green-400 (original)
  "#16a34a", // green-600 (original)
  "#166534", // green-800 (original)
  "#052e16", // green-950 no centro
  "#449955", // Pastel mais suave do green-900
  "#66aa77", // Pastel mais suave do green-700
  "#88cc99", // Pastel mais suave do green-500
  "#aaddbb", // Pastel mais suave do green-200
  "#cceecc", // Pastel mais suave do green-100

  // Emerald
  "#ecfdf5", // emerald-50 (original)
  "#a7f3d0", // emerald-300 (original)
  "#34d399", // emerald-400 (original)
  "#059669", // emerald-600 (original)
  "#065f46", // emerald-800 (original)
  "#022c22", // emerald-950 no centro
  "#449966", // Pastel mais suave do emerald-900
  "#66aa88", // Pastel mais suave do emerald-700
  "#88ccaa", // Pastel mais suave do emerald-500
  "#aaddcc", // Pastel mais suave do emerald-200
  "#cceecc", // Pastel mais suave do emerald-100

  // Teal
  "#f0fdfa", // teal-50 (original)
  "#99f6e4", // teal-300 (original)
  "#2dd4bf", // teal-400 (original)
  "#0d9488", // teal-600 (original)
  "#115e59", // teal-800 (original)
  "#042f2e", // teal-950 no centro
  "#447777", // Pastel mais suave do teal-900
  "#669999", // Pastel mais suave do teal-700
  "#88bbbb", // Pastel mais suave do teal-500
  "#aacccc", // Pastel mais suave do teal-200
  "#cceeee", // Pastel mais suave do teal-100

  // Cyan
  "#ecfeff", // cyan-50 (original)
  "#a5f3fc", // cyan-300 (original)
  "#22d3ee", // cyan-400 (original)
  "#0891b2", // cyan-600 (original)
  "#155e75", // cyan-800 (original)
  "#083344", // cyan-950 no centro
  "#4477aa", // Pastel mais suave do cyan-900
  "#6699bb", // Pastel mais suave do cyan-700
  "#88bbcc", // Pastel mais suave do cyan-500
  "#aaccdd", // Pastel mais suave do cyan-200
  "#ccddee", // Pastel mais suave do cyan-100

  // Sky
  "#f0f9ff", // sky-50 (original)
  "#bae6fd", // sky-300 (original)
  "#38bdf8", // sky-400 (original)
  "#0284c7", // sky-600 (original)
  "#075985", // sky-800 (original)
  "#082f49", // sky-950 no centro
  "#4477bb", // Pastel mais suave do sky-900
  "#6699cc", // Pastel mais suave do sky-700
  "#88bbdd", // Pastel mais suave do sky-500
  "#aaccee", // Pastel mais suave do sky-200
  "#ccddff", // Pastel mais suave do sky-100

  // Blue
  "#eff6ff", // blue-50 (original)
  "#bfdbfe", // blue-300 (original)
  "#60a5fa", // blue-400 (original)
  "#2563eb", // blue-600 (original)
  "#1e40af", // blue-800 (original)
  "#172554", // blue-950 no centro
  "#4466bb", // Pastel mais suave do blue-900
  "#6688cc", // Pastel mais suave do blue-700
  "#88aadd", // Pastel mais suave do blue-500
  "#aaccee", // Pastel mais suave do blue-200
  "#ccddff", // Pastel mais suave do blue-100

  // Indigo
  "#eef2ff", // indigo-50 (original)
  "#c7d2fe", // indigo-300 (original)
  "#818cf8", // indigo-400 (original)
  "#4f46e5", // indigo-600 (original)
  "#3730a3", // indigo-800 (original)
  "#1e1b4b", // indigo-950 no centro
  "#5555bb", // Pastel mais suave do indigo-900
  "#7777cc", // Pastel mais suave do indigo-700
  "#9999dd", // Pastel mais suave do indigo-500
  "#bbbbee", // Pastel mais suave do indigo-200
  "#ddddff", // Pastel mais suave do indigo-100

  // Violet
  "#f5f3ff", // violet-50 (original)
  "#ddd6fe", // violet-300 (original)
  "#a78bfa", // violet-400 (original)
  "#7c3aed", // violet-600 (original)
  "#5b21b6", // violet-800 (original)
  "#2d1b69", // violet-950 no centro
  "#7755bb", // Pastel mais suave do violet-900
  "#9977cc", // Pastel mais suave do violet-700
  "#bb99dd", // Pastel mais suave do violet-500
  "#ddbbee", // Pastel mais suave do violet-200
  "#eeddff", // Pastel mais suave do violet-100

  // Purple
  "#faf5ff", // purple-50 (original)
  "#e9d5ff", // purple-300 (original)
  "#c084fc", // purple-400 (original)
  "#9333ea", // purple-600 (original)
  "#6b21a8", // purple-800 (original)
  "#3b0764", // purple-950 no centro
  "#8855bb", // Pastel mais suave do purple-900
  "#aa77cc", // Pastel mais suave do purple-700
  "#cc99dd", // Pastel mais suave do purple-500
  "#ddbbee", // Pastel mais suave do purple-200
  "#eeddff", // Pastel mais suave do purple-100

  // Fuchsia
  "#fdf4ff", // fuchsia-50 (original)
  "#f5d0fe", // fuchsia-300 (original)
  "#e879f9", // fuchsia-400 (original)
  "#c026d3", // fuchsia-600 (original)
  "#86198f", // fuchsia-800 (original)
  "#4a044e", // fuchsia-950 no centro
  "#aa55bb", // Pastel mais suave do fuchsia-900
  "#cc77cc", // Pastel mais suave do fuchsia-700
  "#dd99dd", // Pastel mais suave do fuchsia-500
  "#eebbee", // Pastel mais suave do fuchsia-200
  "#ffddff", // Pastel mais suave do fuchsia-100

  // Pink
  "#fdf2f8", // pink-50 (original)
  "#fbcfe8", // pink-300 (original)
  "#f472b6", // pink-400 (original)
  "#db2777", // pink-600 (original)
  "#9d174d", // pink-800 (original)
  "#500724", // pink-950 no centro
  "#bb5588", // Pastel mais suave do pink-900
  "#cc7799", // Pastel mais suave do pink-700
  "#dd99aa", // Pastel mais suave do pink-500
  "#eebbcc", // Pastel mais suave do pink-200
  "#ffddee", // Pastel mais suave do pink-100

  // Rose
  "#fff1f2", // rose-50 (original)
  "#fecdd3", // rose-300 (original)
  "#fb7185", // rose-400 (original)
  "#e11d48", // rose-600 (original)
  "#9f1239", // rose-800 (original)
  "#4c0519", // rose-950 no centro
  "#bb5577", // Pastel mais suave do rose-900
  "#cc7788", // Pastel mais suave do rose-700
  "#dd9999", // Pastel mais suave do rose-500
  "#eebbbb", // Pastel mais suave do rose-200
  "#ffdddd", // Pastel mais suave do rose-100

  // Slate (5 cores: índices pares 2,4,6,8,10 invertidos com #000000 no meio)
  "#ffffff",
  "#e2e8f0", // slate-200 (original)
  "#94a3b8", // slate-400 (original)
  "#475569", // slate-600 (original)
  "#1e293b", // slate-800 (original)
  "#000000", // black no centro
  "#333333", // Pastel mais suave
  "#666666", // Pastel mais suave
  "#999999", // Pastel mais suave
  "#bbbbbb", // Pastel mais suave
  "#eeeeee", // neutral-200 (original)
];

function isValidHexColor(color: string) {
  const regex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return regex.test(color);
}
