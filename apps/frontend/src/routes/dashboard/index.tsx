import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/")({
  component: Dashboard,
});
const data = [
  "Dashboard",
  "Users",
  "Documents",
  "Model Selection",
  "Templates",
];
function Dashboard() {
  const [selected, setSelected] = useState(0);
  return (
    <div className="m-4 p-2  ">
      <div className="bg-card rounded-xl p-1 h-[calc(100svh-5rem)]">
        <div className="bg-background  rounded-xl w-56 h-full pt-4">
          {data.map((menu_option, idx) => (
            <div onClick={() => setSelected(idx)} className="cursor-pointer">
              <div
                className={`p-2   ml-5 relative rounded-l-3xl ${
                  idx === selected ? "bg-card " : ""
                } `}
              >
                {menu_option}

                {idx === selected && (
                  <>
                    <div className="absolute -top-2  right-0 w-2 h-2  text-card ">
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        <path
                          d="M0,200 A200,200 0 0,0 200,0 L200,200 Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>

                    <div className="absolute -bottom-2 right-0 w-2 h-2 text-card ">
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        <path
                          d="M0,0 A200,200 0 0,1 200,200 L200,0 Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
