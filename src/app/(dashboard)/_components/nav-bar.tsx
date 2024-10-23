import { SidebarTrigger } from "@/components/ui/sidebar";

export const NavBar = () => {
    return (
        <div className="mx-auto flex w-full rounded-xl border p-2">
            <SidebarTrigger />
        </div>
    );
}