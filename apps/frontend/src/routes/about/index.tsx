import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import PageHeader from "@/components/common/PageHeader";
import { VscGithubInverted } from "react-icons/vsc";
import { HiOutlineMail } from "react-icons/hi";
import { FaLinkedin } from "react-icons/fa";
import { motion } from "framer-motion";

export const Route = createFileRoute("/about/")({
  component: RouteComponent,
});

interface LeadContributorInfo {
  id: number;
  name: string;
  role: string;
  description: string;
  avatar: string;
  linkedin?: string;
  github?: string;
  email?: string;
}

function RouteComponent() {
  const leadInfos: LeadContributorInfo[] = [
    {
      id: 1,
      name: "Anirudha Pradhan",
      role: "Lead Fullstack Engineer",
      description:
        "blah blah guysss khud ki tareef khud kare aur meri bhi kar de please",
      avatar: "/images/anirudha.webp",
      linkedin: "https://www.linkedin.com/in/anirudha-pradhan-346388240/",
      github: "https://github.com/Anirudha0702",
      email: "mailto:anirudhapradhan403@gmail.com",
    },
    {
      id: 2,
      name: "Badsha Laskar",
      role: "Project Owner & Technical Lead",
      description:
        "blah blah guysss khud ki tareef khud kare aur meri bhi kar de please",
      avatar: "/images/badsha.jpg",
      linkedin: "https://www.linkedin.com/in/badsha-laskar/",
      github: "https://github.com/Badsha1996",
      email: "mailto:badshalaskar0@gmail.com",
    },
    {
      id: 3,
      name: "Sanya Garg",
      role: "Lead Frontend Engineer",
      description:
        "blah blah guysss khud ki tareef khud kare aur meri bhi kar de please",
      avatar: "/images/sanya.jpg",
      linkedin: "https://www.linkedin.com/in/sanya-garg-7a45bb195/",
      github: "https://github.com/sanyagarg15",
      email: "mailto:sanyagarg1511@gmail.com",
    },
  ];

  const contributors: LeadContributorInfo[] = [
    {
      id: 1,
      name: "Atul Bhartiya",
      role: "Junior Frontend Engineer",
      description:
        "blah blah guysss khud ki tareef khud kare aur meri bhi kar de please",
      avatar: "/images/atul.jpg",
      linkedin:
        "https://www.linkedin.com/in/atul-bhartiya-743838359/?trk=contact-info",
      github: "https://github.com/atul96anand",
      email: "mailto:anandatul509@gmail.com",
    },
  ];
  return (
    <div className="space-y-8 mt-24">
      <PageHeader title="About Us" subTitle="" />
      <div className="max-w-6xl mx-auto">
        <Card className="bg-card/50 backdrop-blur-sm border-border shadow-xl">
          <CardContent className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {leadInfos.map((info) => (
                <motion.div
                  key={info.id}
                  initial={{ y: 0 }}
                  whileHover={{ scale: 1.01, y: -8 }}
                  className="rounded-2xl bg-white/10 backdrop-blur-md border-2 border-transparent bg-clip-padding shadow-lg py-5 transition-all"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={info.avatar} alt={info.name} />
                        <AvatarFallback className="text-xl">
                          {info.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-semibold">{info.name}</h3>
                      <h4 className="text-lg font-medium text-white">
                        {info.role}
                      </h4>
                      <p className="text-sm font-normal text-white">
                        {info.description}
                      </p>
                      <div className="flex space-x-4 pt-4">
                        {info.linkedin && (
                          <a
                            href={info.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="LinkedIn"
                          >
                            <FaLinkedin size={20} />
                          </a>
                        )}
                        {info.github && (
                          <a
                            href={info.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub"
                          >
                            <VscGithubInverted size={20} />
                          </a>
                        )}
                        {info.email && (
                          <a href={info.email} aria-label="Email">
                            <HiOutlineMail size={21} />
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </motion.div>
              ))}
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center">
                Our Contributors
              </h2>
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full max-w-6xl mx-auto"
              >
                <CarouselContent className="justify-center">
                  {contributors.map((contributor) => (
                    <CarouselItem
                      key={contributor.id}
                      className="basis-[260px] md:basis-[310px] lg:basis-[350px]"
                    >
                      <motion.div
                        initial={{ y: 0 }}
                        whileHover={{ scale: 1.01, y: -8 }}
                        className="rounded-2xl bg-white/10 backdrop-blur-md border-2 border-transparent bg-clip-padding shadow-lg py-8 transition-all mt-10"
                      >
                        <CardContent className="flex flex-col items-center space-y-4">
                          <Avatar className="w-24 h-24 border-2 border-primary/20">
                            <AvatarImage
                              src={contributor.avatar}
                              alt={contributor.name}
                            />
                            <AvatarFallback className="text-xl">
                              {contributor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-center space-y-4">
                            <h3 className="text-xl font-semibold">
                              {contributor.name}
                            </h3>
                            <h4 className="text-lg font-medium text-white">
                              {contributor.role}
                            </h4>
                            <p className="text-sm font-normal text-white">
                              {contributor.description}
                            </p>
                          </div>
                          <div className="flex space-x-4 pt-2">
                            {contributor.linkedin && (
                              <a
                                href={contributor.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn"
                              >
                                <FaLinkedin size={20} />
                              </a>
                            )}
                            {contributor.github && (
                              <a
                                href={contributor.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="GitHub"
                              >
                                <VscGithubInverted size={20} />
                              </a>
                            )}
                            {contributor.email && (
                              <a href={contributor.email} aria-label="Email">
                                <HiOutlineMail size={21} />
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {contributors.length > 3 && (
                  <>
                    <CarouselPrevious className="absolute left-0 -translate-y-1/2 top-1/2" />
                    <CarouselNext className="absolute right-0 -translate-y-1/2 top-1/2" />
                  </>
                )}
              </Carousel>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
