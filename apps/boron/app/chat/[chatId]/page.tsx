import { AppSidebar } from "../../../components/app-sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
} from "../../../components/index";
import { Separator } from "../../../components/index";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "../../../components/index";
import ChatPage from "../../../components/screen/ChatScreen";

type Props = {
    params: Promise<{ chatId: string }>
}

export default async function ChatPageScreen({ params }: Props) {
    const { chatId } = await params;

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "19rem",
                } as React.CSSProperties
            }
        >
            <AppSidebar />
            <SidebarInset className="bg-[#272725]">
                <header className="flex h-16 shrink-0 items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1 bg-white border-none" />
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink
                                    href="#"
                                    className="text-white hover:text-white"
                                >
                                    Building Your Application
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <ChatPage />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
