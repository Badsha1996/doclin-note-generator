import { createFileRoute } from "@tanstack/react-router";
import { Apple } from "lucide-react";

export const Route = createFileRoute("/about/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div
      className=" flex flex-col justify-center items-center
      text-white/80 
      "
    >
      <div
        className="h-[30svh] w-11/12 items-center flex relative top-24
         bg-[rgba(0,0,0,0.4)]"
      >
        <div className="relative bottom-9 p-3">
          <div className="font-extralight text-xs">WHAT WE OFFER</div>
          <div className=" font-semibold text-2xl ">Our Services</div>
        </div>
      </div>
      <div
        className=" relative  w-3/4 flex items-center flex-col
        bg-white/20 gap-y-4 p-4 mb-4 "
      >
        <div className="grid grid-cols-1 lg:grid-cols-[25%_65%] gap-x-[10%]  pt-4 mb-10 w-9/12 px-5">
          <div className=" p-2">
            <h3 className="text-xs">our services</h3>
            <h1 className="font-bold">take our services</h1>
          </div>
          <p className="text-sm p-2 break-words">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Similique
            ipsum repellendus officia minima aliquid culpa sint dolorum,
            perspiciatis, optio reiciendis ratione fuga. Illum deserunt suscipit
            aperiam dolorem alias deleniti perspiciatis. Lorem ipsum dolor, sit
            amet consectetur adipisicing elit. Delectus impedit amet tempora
            nostrum nulla. Numquam similique vero veritatis officiis ab ipsum
            expedita earum, in enim saepe nihil non necessitatibus magni! Lorem
            ipsum dolor sit amet consectetur adipisicing elit.
          </p>
        </div>

        <div
          className=" w-9/12 grid [&>*]:grid   lg:grid-cols-3
          place-items-center md:grid-cols-2 [&>*]:place-items-center
           [&>*]:bg-white/30 [&>*]:h-65 [&>*]:w-5/6 gap-y-16
          [&>*]:shadow-md [&>*]:shadow-white/45 "
        >
          <div className=" ">
            <image>
              <Apple className="w-20 h-20" />
            </image>
            <div className="font-semibold">gfhgh</div>
            <p className="p-4 text-xs">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Soluta,
              laborum. Aliquam dolor ducimus quo
            </p>
          </div>
          <div className=" ">
            <image>
              <Apple className="w-20 h-20" />
            </image>
            <div className="font-semibold">gfhgh</div>
            <p className="p-4 text-xs">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Soluta,
              laborum. Aliquam dolor ducimus quo
            </p>
          </div>
          <div className="  ">
            <image>
              <Apple className="w-20 h-20" />
            </image>
            <div className="font-semibold">gfhgh</div>
            <p className="p-4 text-xs">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Soluta,
              laborum. Aliquam dolor ducimus quo
            </p>
          </div>
          <div className="  ">
            <image>
              <Apple className="w-20 h-20" />
            </image>
            <div className="font-semibold">gfhgh</div>
            <p className="p-4 text-xs">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Soluta,
              laborum. Aliquam dolor ducimus quo
            </p>
          </div>
          <div className="  ">
            <image>
              <Apple className="w-20 h-20" />
            </image>
            <div className="font-semibold">gfhgh</div>

            <p className="p-4 text-xs">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Soluta,
              laborum. Aliquam dolor ducimus quo
            </p>
          </div>
          <div className=" ">
            <image>
              <Apple className="w-20 h-20" />
            </image>
            <div className="font-semibold">gfhgh</div>
            <p className="p-4 text-xs">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Soluta,
              laborum. Aliquam dolor ducimus quo
            </p>
          </div>
        </div>
      </div>
    
    </div>
  );
}
