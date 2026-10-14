export function splitNarration(text:string){return text.trim().split(/(?<=[.!?])\s+/u).filter(Boolean);}
const spokenUnits:Record<string,[string,string]>={km:["kilometer","kilometers"],cm:["centimeter","centimeters"],mm:["millimeter","millimeters"],ml:["milliliter","milliliters"],m:["meter","meters"],kg:["kilogram","kilograms"],g:["gram","grams"],l:["liter","liters"]};
export function speechText(sentence:string){
 return sentence
  .replace(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*(km|cm|mm|m)\/(h|s)\b/giu,(_,value:string,unit:string,timeUnit:string)=>`${value} ${spokenUnits[unit.toLowerCase()][1]} per ${timeUnit.toLowerCase()==="h"?"hour":"second"}`)
  .replace(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*(km|cm|mm|mL|kg|m|g|L)([²³]?)(?![\p{L}\p{N}])/giu,(_,value:string,unit:string,power:string)=>{
   const [singular,plural]=spokenUnits[unit.toLowerCase()];
   if(power==="²")return `${value} square ${Number(value.replace(/,/g,""))===1?singular:plural}`;
   if(power==="³")return `${value} cubic ${Number(value.replace(/,/g,""))===1?singular:plural}`;
   return `${value} ${Number(value.replace(/,/g,""))===1?singular:plural}`;
  })
  .replace(/\b(km|cm|mm|mL|kg|m|g|L)([²³]?)(?![\p{L}\p{N}])/giu,(_,unit:string,power:string)=>{
   const [,plural]=spokenUnits[unit.toLowerCase()];
   const unitName=plural;
   if(power==="²")return `square ${unitName}`;
   if(power==="³")return `cubic ${unitName}`;
   return unitName;
  })
  .replace(/π/g," pi ")
  .replace(/²/g," squared ")
  .replace(/³/g," cubed ")
  .replace(/×/g," times ")
  .replace(/÷/g," divided by ")
  .replace(/=/g," equals ")
  .replace(/\+/g," plus ")
  .replace(/[−–]/g," minus ")
  .replace(/≈/g," approximately ")
  .replace(/°/g," degrees ")
  .replace(/√/g," square root of ")
  .replace(/\//g," divided by ")
  .replace(/\s+([.,!?;:])/g,"$1")
  .replace(/\s+/g," ")
  .trim();
}
