import Papa, {ParseStepResult} from "papaparse";
import {TradeMapper} from "@/helpers/Parsing/das-schema";
import {Execution} from "@prisma/client";

export const TradeParser = {
    parse<T>(data: string, mapper: TradeMapper<T>): Promise<Execution[]> {
        const executions: Execution[] = [];
        return new Promise((resolve, reject) => {
                Papa.parse<T>(data, {
                    worker: true,
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    step(results: ParseStepResult<T>) {
                        if (results.data) {
                            const execution = mapper(results.data);
                            executions.push(execution);
                        }
                    },
                    complete: function () {
                        resolve(executions);
                    },
                    error: function (error: Error) {
                        reject(error);
                    }
                });
            }
        )
    }
}
