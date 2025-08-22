import { format } from "date-fns";
import { CopyIcon } from "lucide-react";
import { useState } from "react"
import { Button } from "~/components/ui/button";


export default function Upper() {
    const [text, setText] = useState("");
    return <div className="flex min-h-screen flex-col justify-between gap-8 p-8">
        <div className="text-3xl text-center font-medium tracking-tighter">
            Uppercase
        </div>
        <div className="flex gap-8 flex-col">
            <div>

                <input value={text} onChange={(e) => setText(e.currentTarget.value)} className="bg-white p-4 text-2xl rounded-xl w-full" placeholder="Digite seu texto aqui..." />
            </div>
            <div className="flex items-center justify-between gap-8">
                <div className="text-3xl font-medium">
                    {text.toUpperCase()}
                </div>
                <div>
                    <Button onMouseDown={() => {
                        navigator.clipboard.writeText(text.toUpperCase())
                    }}>
                        <CopyIcon />
                    </Button>
                </div>
            </div>
        </div>

        <div className="text-sm text-center opacity-50">
            © Agência CNVT {format(Date.now(), "yyyy")}
        </div>
    </div>
}