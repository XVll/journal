import { SidebarTrigger } from "@/components/ui/sidebar";
import Filter from "@/features/filter/components/filter";

export const NavBar = () => {
    return (
        <div className="mx-auto flex w-full rounded-xl border p-2 items-center">
            <SidebarTrigger />
            <Filter/>
        </div>
    );
}