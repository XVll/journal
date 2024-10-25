
export enum Unit {
     Currency, RMultiple
}
export enum PnlType {
    Gross, Net
}
export interface PnLRange{
    min : number | undefined;
    max : number | undefined;
}
export interface DateRange{
    start : Date | undefined;
    end : Date | undefined;

}