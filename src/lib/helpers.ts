export const Currency = (input:number | string | undefined | null) => {
    if (input === undefined || input === null) return "";

    if (typeof input === "string") {
        input = Number(input);
    }
    console.log(input)
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(Number(input));
}