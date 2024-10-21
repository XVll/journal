import Papa, {ParseStepResult} from "papaparse";
import {TradeMapper} from "@/helpers/Parsing/das-schema";
import { ExecutionInput } from "../../db/types";

export const TradeParser = {
    parse<T>(data: string, mapper: TradeMapper<T>, year: number, month: number, day: number): Promise<ExecutionInput[]> {
        const executionInputs: ExecutionInput[] = [];

        return new Promise((resolve, reject) => {
                Papa.parse<T>(data, {
                    worker: true,
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    step(results: ParseStepResult<T>) {
                        if (results.data) {
                            const execution = mapper(results.data, year, month, day);
                            executionInputs.push(execution);
                        }
                    },
                    complete: function () {
                        resolve(executionInputs);
                    },
                    error: function (error: Error) {
                        reject(error);
                    }
                });
            }
        )
    }
}
