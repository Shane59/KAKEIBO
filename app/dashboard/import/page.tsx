
import UploadFile from "@/app/ui/dashboard/uploadfile";

export default function Page() {

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl font-bold">
                    Import
                </h1>
            </div>
            <div>
                <UploadFile />
            </div>
        </div>
    )
}