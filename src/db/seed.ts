import 'dotenv/config';
import { Execution, Prisma, PrismaClient, TradeAction, TradeDirection} from '@prisma/client';

const prisma = new PrismaClient();

const createTrade = async () : Promise<Execution> => {
    return await prisma.execution.create({
        data: {
            action: TradeAction.Buy,
            date: new Date(),
            price: 100,
            quantity: 100,
            addLiquidity: true,
            ticker: "AAPL",
            amount: 10000,
            tradePosition: 100,
            avgPrice: 100,
            commission: 0,
            fees: 0,
            pnl: 0,
            scalingAction: "ScaleIn",
        },
    });
}
async function main(){
    console.log('Start seeding...')
    await createTrade()
}

main()
.then(async () => {
    console.log('Seeding finished.')
    await prisma.$disconnect()
})
.catch(async (e) => {
    console.error('Seeding failed.',e)
    process.exit(1)
}
)