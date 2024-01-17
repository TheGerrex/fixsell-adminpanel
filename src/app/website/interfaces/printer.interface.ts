export interface Printer {
    id: string;
    brand: string;
    model: string;
    category: string;
    color: boolean;
    rentable: boolean;
    duplexUnit: boolean;
    powerConsumption: string;
    dimensions: string;
    printVelocity: Number;
    maxPrintSize: string;
    maxPaperWeight: string;
    paperSizes: string;
    price: Number;
    applicableOS: string;
    description: string;
    img_url: string;
    datasheetUrl: string;
    maxPrintSizeSimple: string;
    printerFunctions: string;

}
