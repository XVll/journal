
export enum Unit {
     Currency, RMultiple, Percent
}
export enum PnlType {
    Gross, Net
}
export interface PnLRange{
    min : number | undefined;
    max : number | undefined;
}