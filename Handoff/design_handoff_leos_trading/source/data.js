// Real inventory data extracted from client-supplied stock spreadsheets (Kohler/Iveco/Kobelco).
// Curated sample below (~20 of 2,256 total SKUs) for demo purposes — sku, description and stock counts are real; no part numbers or quantities invented.
const LEOS_PARTS=[
{sku:"KH330560633",name:"Oil Filter",brand:"Kohler",category:"Generator Parts",sub:"Filters",stock:86,img:"assets/kohler-diesel-filter.png"},
{sku:"KH2405013-S",name:"Fuel Filter",brand:"Kohler",category:"Generator Parts",sub:"Filters",stock:34,img:null},
{sku:"GM80009",name:"Gasket Set",brand:"Kohler",category:"Generator Parts",sub:"Gaskets & Seals",stock:22,img:null},
{sku:"KH253107",name:"Element, Air Cleaner",brand:"Kohler",category:"Generator Parts",sub:"Filters",stock:15,img:null},
{sku:"KHED0021752630-S",name:"Fuel Filter",brand:"Kohler",category:"Generator Parts",sub:"Filters",stock:26,img:null},
{sku:"GM16252",name:"Transformer Current 200A",brand:"Kohler",category:"Generator Parts",sub:"Electrical",stock:26,img:null},
{sku:"KH267373",name:"Sea Water Pump",brand:"Kohler",category:"Generator Parts",sub:"Pumps",stock:1,img:"assets/kohler-sea-water-pump.png"},
{sku:"42127244",name:"Wheel Pin",brand:"Iveco",category:"Truck Parts",sub:"Undercarriage",stock:1540,img:null},
{sku:"1907570",name:"Oil Filter Cartridge",brand:"Iveco",category:"Truck Parts",sub:"Filters",stock:254,img:null},
{sku:"500308780",name:"Flat Gasket Engine",brand:"Iveco",category:"Truck Parts",sub:"Gaskets & Seals",stock:202,img:null},
{sku:"1901605",name:"Fuel Filter Element",brand:"Iveco",category:"Truck Parts",sub:"Filters",stock:194,img:null},
{sku:"2994057",name:"Oil Filter Cartridge",brand:"Iveco",category:"Truck Parts",sub:"Filters",stock:153,img:null},
{sku:"2995965",name:"Anti Pollen Filter",brand:"Iveco",category:"Truck Parts",sub:"Filters",stock:116,img:null},
{sku:"8169109",name:"Parabolic Spring",brand:"Iveco",category:"Truck Parts",sub:"Brake & Suspension",stock:1,img:null},
{sku:"KOYN24E00016S005",name:"Fuse",brand:"Kobelco",category:"Construction Equipment Parts",sub:"Electrical",stock:58,img:null},
{sku:"KOLC12B01761P1",name:"Bushing",brand:"Kobelco",category:"Construction Equipment Parts",sub:"Bearings & Bushings",stock:56,img:null},
{sku:"KOYN24S00010P1",name:"Relay",brand:"Kobelco",category:"Construction Equipment Parts",sub:"Electrical",stock:51,img:null},
{sku:"KOPY02P00001-1A",name:"Element, Oil",brand:"Kobelco",category:"Construction Equipment Parts",sub:"Filters",stock:33,img:null},
{sku:"KOPS11P00003S001",name:"Element, Filter",brand:"Kobelco",category:"Construction Equipment Parts",sub:"Filters",stock:29,img:null},
{sku:"KO2405P482",name:"Bush",brand:"Kobelco",category:"Construction Equipment Parts",sub:"Bearings & Bushings",stock:10,img:null},
{sku:"90915-YZZD2",name:"Oil Filter",brand:"Toyota",category:"Vehicle Parts",sub:"Filters",stock:24,img:null}
];
const LEOS_CATEGORIES=[
{name:"Truck Parts",brands:"Iveco",status:"live",skuCount:1614,img:null},
{name:"Construction Equipment Parts",brands:"Kobelco",status:"live",skuCount:313,img:null},
{name:"Generator Parts",brands:"Kohler",status:"live",skuCount:329,img:"assets/kohler-command-pro.png"},
{name:"Mining & Industrial Parts",brands:"Multi-brand sourcing network",status:"sourcing",skuCount:0,img:null},
{name:"Marine Parts",brands:"Multi-brand sourcing network",status:"sourcing",skuCount:0,img:null},
{name:"Tyres, Batteries & Accessories",brands:"Multi-brand sourcing network",status:"sourcing",skuCount:0,img:null},
{name:"Vehicle Parts",brands:"Toyota (newly onboarded)",status:"live",skuCount:1,img:null}
];
const LEOS_BRANDS={
"Truck Parts":["Iveco","MAN","Scania","Hino","Isuzu","Mitsubishi Fuso"],
"Construction Equipment":["Kobelco","Komatsu","JCB","Doosan","Case","Bobcat"],
"Generator Parts":["Kohler","Perkins","Cummins","Deutz","Volvo Penta"],
"Marine & Industrial":["Volvo Penta","Yanmar","Caterpillar"]
};
const STATUS_LABEL={instock:"In Stock",limited:"Limited Stock",onrequest:"Availability On Request"};
const LEOS_STATS={totalSkus:2256,totalUnits:20012,brandsLive:3};
function stockStatus(stock){return stock<=2?"limited":"instock";}
