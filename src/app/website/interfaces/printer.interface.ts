export interface Printer {
    id:                 string;
    brand:              string;
    model:              string;
    datasheet_url:      string;
    img_url:            string[];
    description:        string;
    price:              number;
    category:           string;
    color:              boolean;
    rentable:           boolean;
    sellable:           boolean;
    tags:               string[];
    powerConsumption:   string;
    dimensions:         string;
    printVelocity:      string;
    maxPrintSizeSimple: string;
    maxPrintSize:       string;
    printSize:          string;
    maxPaperWeight:     string;
    duplexUnit:         boolean;
    paperSizes:         string;
    applicableOS:       string;
    printerFunctions:   string;
    barcode:            null;
    deal:               Deal;
}

export interface Deal {
    id:                     number;
    dealEndDate:            Date;
    dealStartDate:          Date;
    dealPrice:              string;
    dealDiscountPercentage: string;
    dealDescription:        string;
}
