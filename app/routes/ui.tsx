import { MoonIcon, SunIcon } from "lucide-react";
import { redirect, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { Theme, useTheme } from "remix-themes";
import Loader from "~/components/common/feedback/Loader";
import { Button } from "~/components/ui/button";
import { Toggle } from "~/components/ui/toggle";
import { Avatar, AvatarGroup, Icons } from "~/lib/helpers";
import { createClient } from "~/lib/database/supabase";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const [
    { data: partners },
    { data: people },
    { data: categories },
    { data: states },
    { data: priorities },
  ] = await Promise.all([
    supabase
      .from("partners")
      .select("*")
      .contains("users_ids", [user.id])
      .order("title", { ascending: true }),
    supabase
      .from("people")
      .select("*")
      .match({ visible: true })
      .order("name", { ascending: true }),
    supabase.from("categories").select("*").order("order", { ascending: true }),
    supabase.from("states").select("*").order("order", { ascending: true }),
    supabase.from("priorities").select("*").order("order", { ascending: true }),
  ]);

  // const person = people?.find((person) => person.user_id === user.id) as Person;

  return {
    partners,
    people,
    categories,
    user,
    states,
    priorities,
  };
}

export default function UI() {
  const { categories, states } = useLoaderData<{
    categories: Category[];
    states: State[];
  }>();

  const [theme, setTheme] = useTheme();

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex justify-between">
        <h1 className="text-5xl font-bold">UI</h1>
        <div>
          <Toggle
            onPressedChange={() => {
              if (theme === Theme.LIGHT) {
                setTheme(Theme.DARK);
              } else {
                setTheme(Theme.LIGHT);
              }
            }}
          >
            {theme === Theme.LIGHT ? (
              <SunIcon className="size-4 opacity-50" />
            ) : (
              <MoonIcon className="size-4 opacity-50" />
            )}
          </Toggle>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-sm">
        <div className="flex w-[110%] -translate-y-8 blur-xl">
          {states.map((state) => (
            <div
              key={state.id}
              className={`h-20 grow -translate-x-8`}
              style={{ backgroundColor: state.color }}
            ></div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h1 className="mb-4 text-3xl font-bold">Loaders</h1>
          <div className="flex justify-between">
            <div>
              <Loader size="sm" />
            </div>
            <div>
              <Loader size="md" />
            </div>
            <div>
              <Loader size="lg" />
            </div>
          </div>
        </div>

        <div>
          <h1 className="mb-4 text-3xl font-bold">Focus Ring</h1>
          <Button>Focus Ring on use</Button>
        </div>
      </div>
      <div>
        <h1 className="text-3xl font-bold">Buttons</h1>
      </div>
      <div className="flex gap-4 *:w-full">
        <Button variant={"default"}>Default</Button>
        <Button variant={"secondary"}>Secondary</Button>
        <Button variant={"destructive"}>Destructive</Button>
        <Button variant={"ghost"}>Ghost</Button>
        <Button variant={"link"}>Link</Button>
        <Button variant={"outline"}>Outline</Button>
      </div>
      <div>
        <h1 className="text-3xl font-bold">Cores</h1>
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-3">
          {[
            {
              bg: "bg-background",
              fg: "text-foreground",
              title: "Base",
            },
            {
              bg: "bg-card",
              fg: "text-card-foreground",
              title: "Card",
            },
            {
              bg: "bg-popover",
              fg: "text-popover-foreground",
              title: "Popover",
            },
            {
              bg: "bg-primary",
              fg: "text-primary-foreground",
              title: "Primary",
            },
            {
              bg: "bg-secondary",
              fg: "text-secondary-foreground",
              title: "Secondary",
            },
            {
              bg: "bg-accent",
              fg: "text-accent-foreground",
              title: "Accent",
            },
            {
              bg: "bg-muted",
              fg: "text-muted-foreground",
              title: "Muted",
            },
            {
              bg: "bg-input",
              fg: "text-input-foreground",
              title: "Input",
            },
            {
              bg: "bg-destructive",
              fg: "text-destructive-foreground",
              title: "Destructive",
            },
          ].map((item, i) => (
            <div key={i} className={`${item.bg} ${item.fg} p-8`}>
              <div className="text-xl font-medium">{item.title}</div>
              <div className="text-sm">
                <div>{item.fg}</div>
                <div>{item.bg}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        {["upperCase", "lowerCase"].map((c) => {
          return (
            <div key={c}>
              <h1 className="text-3xl font-bold">Avatar {c}</h1>
              <h2 className="mt-4 mb-2 text-xl">Size: xs</h2>
              <div className="flex gap-2">
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "cnvt" }}
                  size="xs"
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "brenda" }}
                  size="xs"
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "arc" }}
                  size="xs"
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "smart" }}
                  size="xs"
                />
                <AvatarGroup
                  isLowerCase={c === "lowerCase"}
                  avatars={[
                    { item: { title: "cnvt", short: "cnvt" } },
                    { item: { title: "brenda", short: "brenda" } },
                    { item: { title: "arc", short: "arc" } },
                    { item: { title: "smart", short: "smart" } },
                  ]}
                  size="xs"
                />
              </div>

              <h2 className="mt-4 mb-2 text-xl">Size: sm</h2>
              <div className="flex gap-2">
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "cnvt" }}
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "brenda" }}
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "arc" }}
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "smart" }}
                />
                <AvatarGroup
                  isLowerCase={c === "lowerCase"}
                  avatars={[
                    { item: { title: "cnvt", short: "cnvt" } },
                    { item: { title: "brenda", short: "brenda" } },
                    { item: { title: "arc", short: "arc" } },
                    { item: { title: "smart", short: "smart" } },
                  ]}
                />
              </div>

              <h2 className="mt-4 mb-2 text-xl">Size: md</h2>
              <div className="flex gap-2">
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "cnvt" }}
                  size="md"
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "brenda" }}
                  size="md"
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "arc" }}
                  size="md"
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "smart" }}
                  size="md"
                />
                <AvatarGroup
                  isLowerCase={c === "lowerCase"}
                  avatars={[
                    { item: { title: "cnvt", short: "cnvt" } },
                    { item: { title: "brenda", short: "brenda" } },
                    { item: { title: "arc", short: "arc" } },
                    { item: { title: "smart", short: "smart" } },
                  ]}
                  size="md"
                />
              </div>

              <h2 className="mt-4 mb-2 text-xl">Size: lg</h2>
              <div className="flex gap-2">
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "cnvt" }}
                  size="lg"
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "brenda" }}
                  size="lg"
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "arc" }}
                  size="lg"
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "smart" }}
                  size="lg"
                />

                <AvatarGroup
                  isLowerCase={c === "lowerCase"}
                  avatars={[
                    { item: { title: "cnvt", short: "cnvt" } },
                    { item: { title: "brenda", short: "brenda" } },
                    { item: { title: "arc", short: "arc" } },
                    { item: { title: "smart", short: "smart" } },
                  ]}
                  size="lg"
                />
              </div>

              <h2 className="mt-4 mb-2 text-xl">Size: xl</h2>
              <div className="flex gap-2">
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "cnvt" }}
                  size="xl"
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "brenda" }}
                  size="xl"
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "arc" }}
                  size="xl"
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "smart" }}
                  size="xl"
                />

                <AvatarGroup
                  isLowerCase={c === "lowerCase"}
                  avatars={[
                    { item: { title: "cnvt", short: "cnvt" } },
                    { item: { title: "brenda", short: "brenda" } },
                    { item: { title: "arc", short: "arc" } },
                    { item: { title: "smart", short: "smart" } },
                  ]}
                  size="xl"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h1 className="text-3xl font-bold">Categorias</h1>
        <div className="mt-4 grid grid-cols-4 gap-4">
          {categories.map((category) => (
            <div
              key={category.slug}
              className="font-regular flex items-center gap-2 text-lg"
            >
              <Icons className="size-4 opacity-50" id={category.slug} />
              <div>{category.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
