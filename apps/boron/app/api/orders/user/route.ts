import prismaClient from "@repo/db/client";

export async function GET() {
  try {
    const orders = await prismaClient.subscription.findMany({
      where: {
        userId: "12", // TODO: change this
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return new Response(JSON.stringify(orders), { status: 200 });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
