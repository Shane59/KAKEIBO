import Link from "next/link";


export default function SideNav() {
    return (
        <div className="flex grow flex-row justify-between px-3 py-4 space-x-2 md:flex-col md:space-x-0 md:space-y-2">
            <Link
                className='flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3'
                href={`/dashboard/stats`}
            >
                Statistics
            </Link>
            <Link
                className='flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3'
                href={`/dashboard/import`}
            >
                Import
            </Link>
            <Link
                className='flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3'
                href={`/dashboard/edit`}
            >
                Edit
            </Link>
        </div>
    )
}