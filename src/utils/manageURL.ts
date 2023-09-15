import { MouseEvent } from "react";

export default function manageURL(evt:MouseEvent<HTMLAnchorElement>){
  // if host is current, handle redirect in client instead of opening new tab
  if (location.host === (evt.target as HTMLAnchorElement).host) {
    console.log("this will redirect in client");
    evt.preventDefault();
  }
}
