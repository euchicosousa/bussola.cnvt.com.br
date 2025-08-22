import { useGSAP } from "@gsap/react";
import { ArrowRightIcon } from "lucide-react";
import { Link, useNavigate, type MetaFunction } from "react-router";
import type { Route } from "./+types/home";
import { gsap } from "gsap";

gsap.registerPlugin(useGSAP);

export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: `ʙússoʟa` },
    {
      name: "description",
      content:
        "Aplicativo de Gestão de Projetos Criado e Mantido pela Agência CNVT®. ",
    },
  ];
};
export function loader({ context }: Route.LoaderArgs) {
  return { message: context.VALUE_FROM_VERCEL };
}

export default function Home() {
  useGSAP(() => {
    gsap.from(".header", {
      y: -100,
      opacity: 0,
    });
    gsap.from(".home-link", {
      y: 100,
      opacity: 0,
      stagger: 0.1,
      delay: 0.2,
    });
    gsap.from(".footer", {
      opacity: 0,
      delay: 0.5,
    });
    gsap.from(".line", {
      scaleX: 0,
      delay: 0.4,
      stagger: 0.2,
    });
  }, []);

  function mouseOver(element: HTMLElement, reversed = false) {
    if (reversed) {
      gsap.to(element.querySelector(".home-link__info"), {
        x: -100,
        opacity: 0,
      });
      gsap.to(element.querySelector(".home-link__name"), {
        right: "auto",
      });
      return;
    }
    gsap.to(element.querySelector(".home-link__info"), {
      x: 40,
      opacity: 1,
    });
    gsap.to(element.querySelector(".home-link__name"), {
      right: 0,
    });
  }

  return (
    <div className="relative container mx-auto flex h-dvh flex-col justify-between overflow-hidden p-8">
      <div className="header relative pb-8 text-xl font-medium tracking-tighter">
        Escolha qual app quer acessar
        <div className="line bg-border absolute bottom-0 h-[1px] w-full origin-left"></div>
      </div>

      <div className="flex flex-col text-[12vw] font-light tracking-tighter *:flex *:items-center *:py-6 md:text-[10vh]">
        {[
          {
            title: "BÚSSOLA",
            description: "App de gestão da Agência CNVT®",
            href: "/dashboard",
          },
          {
            title: "CNVT.LINK",
            description:
              "Sistema de Links exclusivo de quem é parceiro da Agência CNVT®",
            href: "https://cnvt.link",
          },
          {
            title: "CNVT",
            description: "Site oficial da Agência CNVT®",
            href: "https://cnvt.com.br",
          },
        ].map((item, i) => (
          <Link
            key={i}
            className="home-link hover:bg-foreground hover:text-background relative flex h-[20vh] items-center justify-between transition-colors md:h-[20vh]"
            to={item.href}
            onMouseEnter={(e) => mouseOver(e.currentTarget)}
            onMouseLeave={(e) => mouseOver(e.currentTarget, true)}
          >
            <span className="home-link__info flex -translate-x-[100px] items-center gap-4 opacity-0">
              <ArrowRightIcon className="size-16" />
              <span className="hidden w-1/2 text-xl font-medium tracking-normal lg:block">
                {item.title}
                <br />
                {item.description}
              </span>
            </span>
            <span className="home-link__name absolute pr-16">{item.title}</span>
            <div className="line bg-border absolute bottom-0 h-[1px] w-full"></div>
          </Link>
        ))}
      </div>
      <div className="footer relative pt-8 text-right font-medium">
        <div className="line bg-border absolute top-0 h-[1px] w-full origin-right"></div>
        CNVT®
      </div>
    </div>
  );
}
