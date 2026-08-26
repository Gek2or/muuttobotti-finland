"use client";

import { useEffect } from "react";

export default function CalculatorBridgeV6(){
  useEffect(()=>{
    const select=(index:number)=>{
      const tabs=document.querySelectorAll<HTMLButtonElement>(".bc3-tabs button");
      tabs[index]?.click();
    };

    const onClick=(event:MouseEvent)=>{
      const target=event.target as Element|null;
      const serviceButton=target?.closest(".service-card button");
      if(serviceButton){
        const card=serviceButton.closest(".service-card");
        const cards=Array.from(document.querySelectorAll(".service-card"));
        const index=card?cards.indexOf(card):-1;
        if(index===0)select(0);
        if(index===1)select(2);
        if(index===2)select(1);
      }

      const offer=target?.closest(".hero-v6-price-grid button");
      if(offer){
        const offers=Array.from(document.querySelectorAll(".hero-v6-price-grid button"));
        const index=offers.indexOf(offer);
        select(index===2?1:0);
      }
    };

    document.addEventListener("click",onClick,true);
    return()=>document.removeEventListener("click",onClick,true);
  },[]);
  return null;
}
